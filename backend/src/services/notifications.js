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
  async function send(requestId, { actorId, isResend }) {
    const request = await requestRepository.getById(requestId);

    if (request.status !== STATUS.ACCOUNT_CREATED && request.status !== STATUS.COMPLETED) {
      throw badRequest('Account notification can only be sent after the Zoho account has been created.');
    }
    if (!request.resolvedAccount?.corporateEmail) {
      throw badRequest('No resolved corporate email is available for this request.');
    }

    const recipient = request.submission.privateEmail;
    await mailer.sendAccountNotification({
      recipient,
      employeeName: request.submission.nameAndSurname,
      corporateEmail: request.resolvedAccount.corporateEmail,
      organizationLoginUrl,
      supportEmail,
    });

    const sentAt = new Date().toISOString();
    const updated = await requestRepository.applyUpdate(requestId, (entry) => ({
      ...entry,
      status: STATUS.COMPLETED,
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
          action: isResend ? 'ACCOUNT_NOTIFICATION_RESENT' : 'ACCOUNT_NOTIFICATION_SENT',
          detail: `Account information ${isResend ? 're-sent' : 'sent'} to ${recipient}.`,
        },
        ...(isResend ? [] : [{ at: sentAt, actorId: null, actorType: 'SYSTEM', action: 'ONBOARDING_COMPLETED', detail: 'Onboarding completed.' }]),
      ],
    }));

    return updated;
  }

  return { send };
}
