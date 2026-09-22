import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Account-notification delivery (PRD section 13).
 *
 * `outbox` mode (the default) writes each notification email as a JSON file
 * under backend/data/outbox/ instead of sending it, so the full workflow —
 * including the "Account information sent" audit trail entry and the
 * Resend action — can be exercised locally without any SMTP credentials.
 *
 * `smtp` mode sends over SMTP using Node's built-in TLS socket and a minimal
 * hand-rolled SMTP client, avoiding a nodemailer dependency for this small,
 * single-message-type use case.
 */

function renderNotificationEmail({ employeeName, corporateEmail, organizationLoginUrl, supportEmail }) {
  const subject = `Your new ${corporateEmail.split('@')[1]} account is ready`;
  const text = [
    `Hi ${employeeName},`,
    '',
    'Your corporate account has been created. Here are your account details:',
    '',
    `Corporate email: ${corporateEmail}`,
    `Organization login: ${organizationLoginUrl}`,
    '',
    'Follow the activation instructions sent by Zoho to set your password and sign in for the first time.',
    '',
    `If you have any trouble accessing your account, contact ${supportEmail}.`,
    '',
    'Welcome aboard!',
  ].join('\n');
  return { subject, text };
}

export function createOutboxMailer(dataDir) {
  const outboxDir = join(dataDir, 'outbox');
  return {
    mode: 'outbox',
    async sendAccountNotification({ recipient, employeeName, corporateEmail, organizationLoginUrl, supportEmail }) {
      const { subject, text } = renderNotificationEmail({ employeeName, corporateEmail, organizationLoginUrl, supportEmail });
      await mkdir(outboxDir, { recursive: true });
      const fileName = `${new Date().toISOString().replace(/[:.]/g, '-')}_${randomUUID().slice(0, 8)}.json`;
      await writeFile(
        join(outboxDir, fileName),
        JSON.stringify({ to: recipient, subject, text, sentAt: new Date().toISOString() }, null, 2),
        'utf8',
      );
      return { delivered: true, transport: 'outbox', file: fileName };
    },
  };
}

/**
 * Minimal SMTP client over STARTTLS using only Node built-ins. Supports the
 * common case of an authenticated SMTP relay (Zoho Mail SMTP, SES SMTP,
 * Gmail SMTP relay, etc.) sending a single plain-text message.
 */
export function createSmtpMailer({ host, port, user, pass, from }) {
  return {
    mode: 'smtp',
    async sendAccountNotification({ recipient, employeeName, corporateEmail, organizationLoginUrl, supportEmail }) {
      const { subject, text } = renderNotificationEmail({ employeeName, corporateEmail, organizationLoginUrl, supportEmail });
      const { sendMailOverSmtp } = await import('../lib/smtp-client.js');
      await sendMailOverSmtp({ host, port, user, pass, from, to: recipient, subject, text });
      return { delivered: true, transport: 'smtp' };
    },
  };
}

export function createMailer(config, dataDir) {
  return config.MAIL_MODE === 'smtp'
    ? createSmtpMailer({ host: config.SMTP_HOST, port: config.SMTP_PORT, user: config.SMTP_USER, pass: config.SMTP_PASS, from: config.MAIL_FROM })
    : createOutboxMailer(dataDir);
}
