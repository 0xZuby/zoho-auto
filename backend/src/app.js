import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { createStore } from './lib/store.js';
import { createSessionManager } from './lib/session.js';
import { createRequestRepository } from './domain/requests.js';
import { createRulesRepository } from './domain/rules-repository.js';
import { createUserRepository } from './domain/users.js';
import { seedDefaultAdministrator } from './domain/seed.js';
import { createZohoClient } from './integrations/zoho.js';
import { createInsideMapsClient } from './integrations/insidemaps.js';
import { createMailer } from './integrations/mailer.js';
import { createProvisioningService } from './services/provisioning.js';
import { createNotificationService } from './services/notifications.js';
import { createEmailAvailabilityChecker } from './services/email-availability.js';
import { attachUser } from './middleware/auth.js';
import { errorHandler } from './middleware/error-handler.js';
import { createFormRouter } from './routes/form.js';
import { createWebhookRouter } from './routes/webhooks.js';
import { createAuthRouter } from './routes/auth.js';
import { createAuditorRouter } from './routes/auditor.js';
import { createAdminRouter } from './routes/admin.js';
import { decryptSecret } from './lib/encrypted-secret.js';

/**
 * Builds the Express application and all of its wired dependencies.
 * Kept as a factory (rather than executed at module load) so tests can
 * construct an app against an isolated, temporary data directory.
 */
export async function createApp(config) {
  const store = createStore(config.DATA_DIR);
  const rulesRepository = createRulesRepository(store, { corporateEmailDomain: config.CORPORATE_EMAIL_DOMAIN });
  const requestRepository = createRequestRepository(store, {
    corporateEmailDomain: config.CORPORATE_EMAIL_DOMAIN,
    rulesRepository,
  });
  const userRepository = createUserRepository(store);
  const sessionManager = createSessionManager(config.SESSION_SECRET);

  const zohoCredentials = store.collection('zoho_credentials');
  const zohoClient = {
    mode: config.ZOHO_MODE,
    async call(method, args) {
      const saved = await zohoCredentials.findOne((entry) => entry.key === 'oauth');
      const runtimeConfig = saved
        ? { ...config, ZOHO_MODE: 'live', ZOHO_REFRESH_TOKEN: decryptSecret(saved.encryptedRefreshToken, config.ZOHO_TOKEN_ENCRYPTION_KEY) }
        : config;
      return createZohoClient(runtimeConfig)[method](args);
    },
  };
  for (const method of ['createUser', 'deleteUser', 'verifyConfiguration', 'deactivateUser']) {
    zohoClient[method] = (args) => zohoClient.call(method, args);
  }
  const insideMapsClient = createInsideMapsClient(config);
  const mailer = createMailer(config, config.DATA_DIR);
  const checkEmailAvailability = createEmailAvailabilityChecker(requestRepository);
  const notificationService = createNotificationService({
    requestRepository,
    mailer,
    organizationLoginUrl: `https://accounts.zoho.${config.ZOHO_DC}`,
    supportEmail: `it@${config.CORPORATE_EMAIL_DOMAIN}`,
  });
  const provisioningService = createProvisioningService({
    requestRepository,
    zohoClient,
    insideMapsClient,
    checkEmailAvailability,
    notificationService,
  });

  await seedDefaultAdministrator(userRepository);

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(attachUser(sessionManager, userRepository));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use(
    '/api/webhooks',
    createWebhookRouter({
      requestRepository,
      provisioningService,
      webhookSecret: config.GOOGLE_FORM_WEBHOOK_SECRET,
    }),
  );
  app.use('/api/form', createFormRouter({ requestRepository, provisioningService }));
  app.use('/api/auth', createAuthRouter({ userRepository, sessionManager, isProduction: config.isProduction }));
  app.use('/api/auditor', createAuditorRouter({ requestRepository, provisioningService, notificationService }));
  app.use('/api/admin', createAdminRouter({
    userRepository, rulesRepository, zohoConfig: config, zohoCredentials, sessionSecret: config.SESSION_SECRET,
  }));

  app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
  app.use(errorHandler());

  return app;
}
