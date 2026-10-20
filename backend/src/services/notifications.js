import { STATUS } from '../domain/statuses.js';
import { badRequest } from '../lib/http-error.js';

/**
 * Account-notification service (PRD sections 13 "Sending the Zoho Account to
 * the Employee" and 14 "Resend Account Information"). Delivery always
 * targets the employee's personal email captured during onboarding, never
 * a corporate address that does not exist yet from the employee's point of
 * view.
 */
export function createNotificationService({ requestRepository, mailer, organizationLoginUrl, supportEmail }) {
  async function preview(requestId) {
    const request = await requestRepository.getById(requestId);
    const corporateEmail = request.resolvedAccount?.corporateEmail || request.proposedAccount?.corporateEmail || '';
    const accountType = request.resolvedAccount?.accountType || request.proposedAccount?.accountType || 'ZOHO';
    const recipient = request.submission.privateEmail;
    const { subject, text } = mailer.renderNotificationEmail({
      employeeName: request.submission.nameAndSurname,
      corporateEmail,
      accountType,
      temporaryPassword: accountType === 'INSIDEMAPS' ? undefined : '(generated when the mailbox is created)',
      organizationLoginUrl,
      supportEmail,
    });
    return {
      recipient,
      managerEmail: request.submission.managerEmail || null,
      requesterEmail: request.submission.requesterEmail || null,
      subject,
      text,
    };
  }

  async function sendOperationalAlert(requestId, { outcome, step, system, reason }) {
    const request = await requestRepository.getById(requestId);
    const recipients = [
      request.submission.requesterEmail,
      request.submission.managerEmail,
      supportEmail,
    ].filter(Boolean);

    const nextAction = outcome === 'FAILED'
      ? 'Open the Exception Queue in InsideOps to inspect the failed step and retry or cancel.'
      : 'No further action needed — lifecycle run is complete.';

    if (typeof mailer.sendOperationalAlert === 'function') {
      await mailer.sendOperationalAlert({
        recipients: [...new Set(recipients)],
        requestCode: request.requestCode,
        employeeName: request.submission.nameAndSurname,
        corporateEmail: request.resolvedAccount?.corporateEmail ?? request.proposedAccount?.corporateEmail,
        accountType: request.resolvedAccount?.accountType ?? request.proposedAccount?.accountType,
        outcome,
        step,
        system,
        reason,
        nextAction,
      });
    }
  }

  async function send(requestId, { actorId, isResend }) {
    const request = await requestRepository.getById(requestId);

    if (request.submission.requestType === 'LEAVING_COMPANY') {
      throw badRequest('Offboarding requests do not send an account notification.');
    }
    if (request.status !== STATUS.ACCOUNT_CREATED && request.status !== STATUS.COMPLETED) {
      throw badRequest('Account notification can only be sent after the corporate account has been created.');
    }
    if (!request.resolvedAccount?.corporateEmail) {
      throw badRequest('No resolved corporate email is available for this request.');
    }

    const recipient = request.submission.privateEmail;
    const createUserStep = request.provisioning.steps.find((step) => step.name === 'create_user');
    await mailer.sendAccountNotification({
      recipient,
      employeeName: request.submission.nameAndSurname,
      corporateEmail: request.resolvedAccount.corporateEmail,
      accountType: request.resolvedAccount.accountType,
      temporaryPassword: createUserStep?.output?.temporaryPassword,
      organizationLoginUrl,
      supportEmail,
    });

    await sendOperationalAlert(requestId, { outcome: 'COMPLETED' }).catch(() => {});

    const sentAt = new Date().toISOString();
    const updated = await requestRepository.applyUpdate(requestId, (entry) => ({
      ...entry,
      status: STATUS.COMPLETED,
      // The one-time password has been delivered; don't keep it at rest.
      provisioning: {
        ...entry.provisioning,
        steps: entry.provisioning.steps.map((step) => {
          if (step.name !== 'create_user' || !step.output?.temporaryPassword) return step;
          const { temporaryPassword: _delivered, ...output } = step.output;
          return { ...step, output };
        }),
      },
      notification: {
        sent: true,
        sentAt,
        recipient,
        history: [...entry.notification.history, { at: sentAt, recipient, isResend: Boolean(isResend) }],
      },
      auditTrail: [
        ...entry.auditTrail,
        {
          at: sentAt,
          actorId,
          actorType: actorId ? 'AUDITOR' : 'SYSTEM',
          system: 'MAILER',
          action: isResend ? 'ACCOUNT_NOTIFICATION_RESENT' : 'ACCOUNT_NOTIFICATION_SENT',
          result: 'DELIVERED',
          detail: `Setup instructions ${isResend ? 're-sent' : 'sent'} to ${recipient}${entry.submission.managerEmail ? ` (manager ${entry.submission.managerEmail} & requester notified)` : ''}.`,
        },
        ...(isResend
          ? []
          : [
              {
                at: sentAt,
                actorId: null,
                actorType: 'SYSTEM',
                system: 'PORTAL',
                action: 'ONBOARDING_COMPLETED',
                result: 'COMPLETED',
                detail: 'Onboarding completed.',
              },
            ]),
      ],
    }));

    return updated;
  }

  return { send, preview, sendOperationalAlert };
}
