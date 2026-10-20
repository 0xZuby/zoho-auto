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

function renderNotificationEmail({ employeeName, corporateEmail, accountType = 'ZOHO', temporaryPassword, organizationLoginUrl, supportEmail }) {
  const domain = corporateEmail.split('@')[1] || 'insidemaps.com';
  const subject = `Your new ${domain} account is ready`;
  const hasZoho = accountType !== 'INSIDEMAPS';
  const hasInsideMaps = accountType === 'INSIDEMAPS' || accountType === 'ZOHO_AND_INSIDEMAPS';
  const accountLabel = [hasZoho ? 'Zoho Mail' : null, hasInsideMaps ? 'InsideMaps' : null].filter(Boolean).join(' + ');
  const lines = [
    `Hi ${employeeName},`,
    '',
    'Your corporate account has been created. Here are your account details:',
    '',
    `Account type: ${accountLabel}`,
    `Corporate email: ${corporateEmail}`,
  ];
  if (hasZoho) {
    lines.push(`Zoho Mail login: ${organizationLoginUrl}`);
    if (temporaryPassword) lines.push(`Temporary password: ${temporaryPassword}`);
  }
  if (hasInsideMaps) lines.push('InsideMaps login: https://app.insidemaps.com');
  lines.push(
    '',
    'First-Login Policy:',
    '• You will be prompted to change your password on first login.',
    ...(hasInsideMaps ? ['• Two-Step Verification (2SV / MFA) is enforced for your InsideMaps account and must be enrolled during setup.'] : []),
    '',
    `If you have any trouble accessing your account, contact ${supportEmail}.`,
    '',
    'Welcome aboard!',
  );
  return { subject, text: lines.join('\n') };
}

function renderOperationalAlertEmail({ requestCode, employeeName, corporateEmail, accountType, outcome, step, system, reason, nextAction }) {
  const subject = `[InsideOps ${outcome}] ${requestCode} — ${employeeName}`;
  const lines = [
    `Lifecycle Run Update — ${requestCode}`,
    '',
    `Request ID: ${requestCode}`,
    `Employee: ${employeeName}`,
    `Affected Account: ${corporateEmail || 'N/A'} (${accountType || 'ZOHO'})`,
    `Outcome: ${outcome}`,
  ];
  if (step) lines.push(`Step / System: ${step} (${system || 'PORTAL'})`);
  if (reason) lines.push(`Reason: ${reason}`);
  lines.push(`Next Action: ${nextAction}`);
  return { subject, text: lines.join('\n') };
}

export function createOutboxMailer(dataDir) {
  const outboxDir = join(dataDir, 'outbox');
  return {
    mode: 'outbox',
    renderNotificationEmail,
    async sendAccountNotification({ recipient, employeeName, corporateEmail, accountType, temporaryPassword, organizationLoginUrl, supportEmail }) {
      const { subject, text } = renderNotificationEmail({ employeeName, corporateEmail, accountType, temporaryPassword, organizationLoginUrl, supportEmail });
      await mkdir(outboxDir, { recursive: true });
      const fileName = `${new Date().toISOString().replace(/[:.]/g, '-')}_${randomUUID().slice(0, 8)}.json`;
      await writeFile(
        join(outboxDir, fileName),
        JSON.stringify({ to: recipient, subject, text, sentAt: new Date().toISOString() }, null, 2),
        'utf8',
      );
      return { delivered: true, transport: 'outbox', file: fileName };
    },
    async sendOperationalAlert({ recipients, requestCode, employeeName, corporateEmail, accountType, outcome, step, system, reason, nextAction }) {
      const { subject, text } = renderOperationalAlertEmail({ requestCode, employeeName, corporateEmail, accountType, outcome, step, system, reason, nextAction });
      await mkdir(outboxDir, { recursive: true });
      const fileName = `alert_${new Date().toISOString().replace(/[:.]/g, '-')}_${randomUUID().slice(0, 8)}.json`;
      await writeFile(
        join(outboxDir, fileName),
        JSON.stringify({ to: recipients, subject, text, sentAt: new Date().toISOString() }, null, 2),
        'utf8',
      );
      return { delivered: true, transport: 'outbox', file: fileName };
    },
  };
}

export function createSmtpMailer({ host, port, user, pass, from }) {
  return {
    mode: 'smtp',
    renderNotificationEmail,
    async sendAccountNotification({ recipient, employeeName, corporateEmail, accountType, temporaryPassword, organizationLoginUrl, supportEmail }) {
      const { subject, text } = renderNotificationEmail({ employeeName, corporateEmail, accountType, temporaryPassword, organizationLoginUrl, supportEmail });
      const { sendMailOverSmtp } = await import('../lib/smtp-client.js');
      await sendMailOverSmtp({ host, port, user, pass, from, to: recipient, subject, text });
      return { delivered: true, transport: 'smtp' };
    },
    async sendOperationalAlert({ recipients, requestCode, employeeName, corporateEmail, accountType, outcome, step, system, reason, nextAction }) {
      const { subject, text } = renderOperationalAlertEmail({ requestCode, employeeName, corporateEmail, accountType, outcome, step, system, reason, nextAction });
      const { sendMailOverSmtp } = await import('../lib/smtp-client.js');
      for (const recipient of recipients) {
        if (!recipient) continue;
        await sendMailOverSmtp({ host, port, user, pass, from, to: recipient, subject, text });
      }
      return { delivered: true, transport: 'smtp' };
    },
  };
}

export function createMailer(config, dataDir) {
  return config.MAIL_MODE === 'smtp'
    ? createSmtpMailer({ host: config.SMTP_HOST, port: config.SMTP_PORT, user: config.SMTP_USER, pass: config.SMTP_PASS, from: config.MAIL_FROM })
    : createOutboxMailer(dataDir);
}
