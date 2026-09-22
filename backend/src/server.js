import { createApp } from './app.js';
import { env } from './config/env.js';

const app = await createApp(env);

app.listen(env.PORT, () => {
  console.log(`[server] Onboarding API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  console.log(`[server] Zoho mode: ${env.ZOHO_MODE} | Mail mode: ${env.MAIL_MODE}`);
});
