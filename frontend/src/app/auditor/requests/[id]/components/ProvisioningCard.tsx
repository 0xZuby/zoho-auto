'use client';

import { useState } from 'react';
import type { OnboardingRequest, ProvisioningStep } from '@/lib/types';
import { ApiError } from '@/lib/api-client';
import { provisionRequest, retryProvisioning } from '@/lib/auditor-api';
import { ConfirmProvisionDialog } from './ConfirmProvisionDialog';

interface ProvisioningCardProps {
  request: OnboardingRequest;
  onUpdated: (request: OnboardingRequest) => void;
}

const STEP_LABEL_FALLBACK: Record<string, string> = {
  validate_employee: 'Employee & approved configuration validated',
  check_email_availability: 'Email availability checked',
  create_user: 'Zoho Mail account created',
  create_im_user: 'InsideMaps account created via API',
  assign_im_roles: 'InsideMaps roles assigned via API',
  enforce_security_policy: '2SV & first-login password change policy enforced',
  verify_configuration: 'Account configuration verified',
  deactivate_user: 'Zoho account deactivated & sessions revoked',
  remove_im_roles: 'InsideMaps roles removed via API',
  delete_im_user: 'InsideMaps account deleted via API',
  request_insidemaps_access: 'InsideMaps account requested (employee signup pending)',
  revoke_insidemaps_access: 'InsideMaps account access revoked',
};

export function ProvisioningCard({ request, onUpdated }: ProvisioningCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountType = request.resolvedAccount?.accountType;
  const isInsideMaps = accountType === 'INSIDEMAPS';
  const isLeavingCompany = request.submission.requestType === 'LEAVING_COMPANY';
  const canCreate =
    (request.status === 'APPROVED' || request.status === 'SCHEDULED_OFFBOARDING') && Boolean(request.resolvedAccount);
  const canRetry = request.status === 'PARTIALLY_PROVISIONED' || request.status === 'PROVISIONING_FAILED';
  const hasRun = request.provisioning.steps.length > 0;
  const createLabel = isLeavingCompany
    ? 'Disable access now'
    : isInsideMaps
      ? 'Create InsideMaps account'
      : accountType === 'ZOHO_AND_INSIDEMAPS'
        ? 'Create Zoho Mail + InsideMaps'
        : 'Create Zoho Mail';

  async function handleProvision() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await provisionRequest(request.id);
      onUpdated(result.request);
      setShowConfirm(false);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Provisioning failed to start.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRetry() {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await retryProvisioning(request.id);
      onUpdated(result.request);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Retry failed to start.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hasRun && !canCreate) {
    return null;
  }

  return (
    <section className="card card-padded detail-card stack gap-16">
      <div className="row-between">
        <h2 style={{ fontSize: 15 }}>Provisioning</h2>
        {canCreate && !hasRun && (
          <button type="button" className="btn btn-primary" onClick={() => setShowConfirm(true)}>
            {createLabel}
          </button>
        )}
        {canRetry && (
          <button type="button" className="btn btn-secondary" onClick={handleRetry} disabled={isSubmitting}>
            {isSubmitting ? 'Retrying…' : 'Retry'}
          </button>
        )}
      </div>
      <p className="card-section-intro">
        {isLeavingCompany
          ? 'Offboarding disables Zoho Mail, revokes active sessions/tokens, and removes/deletes InsideMaps access via API.'
          : isInsideMaps
            ? 'Calls InsideMaps APIs to create the user, assign roles, and enforce 2SV & first-login password change.'
              : accountType === 'ZOHO_AND_INSIDEMAPS'
                ? 'Creates the Zoho Mailbox directly, then the InsideMaps user with roles and 2SV. Failed steps can be retried.'
                : 'Creates the Zoho Mail mailbox directly (no invitation). Failed steps can be retried idempotently.'}
      </p>

      {request.status === 'SCHEDULED_OFFBOARDING' && request.offboardingSchedule && (
        <div className="notice notice-info">
          <strong>Scheduled offboarding:</strong> Access is scheduled to be blocked on{' '}
          <strong>{request.offboardingSchedule.effectiveDate}</strong> ({request.offboardingSchedule.timezone}). You can
          also click &ldquo;Disable access now&rdquo; above to execute immediately.
        </div>
      )}

      {request.provisioning.securityPolicy && (
        <div className="notice notice-success">
          <strong>Security policy enforced:</strong> 2-Step Verification (2SV) required:{' '}
          <code>{request.provisioning.securityPolicy.twoStepVerificationRequired ? 'Yes' : 'No'}</code> · Force password
          change on first login:{' '}
          <code>{request.provisioning.securityPolicy.forcePasswordChangeOnFirstLogin ? 'Yes' : 'No'}</code> · 2SV
          enrollment:{' '}
          <code>
            {request.provisioning.securityPolicy.twoStepVerificationEnrolled ? 'Enrolled' : 'Pending first login'}
          </code>
        </div>
      )}

      {error && <div className="notice notice-error">{error}</div>}

      {request.provisioning.failureReason && (
        <div className="notice notice-error">
          <strong>
            Failure ({request.provisioning.failureSystem || 'INTEGRATION'} ·{' '}
            {request.provisioning.failureStep || 'step'}):
          </strong>{' '}
          {request.provisioning.failureReason}
        </div>
      )}

      {hasRun && (
        <ul className="stack gap-8" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {request.provisioning.steps.map((step) => (
            <StepRow key={step.name} step={step} />
          ))}
        </ul>
      )}

      {showConfirm && request.resolvedAccount && (
        <ConfirmProvisionDialog
          employeeName={request.submission.nameAndSurname}
          resolvedAccount={request.resolvedAccount}
          isSubmitting={isSubmitting}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleProvision}
        />
      )}
    </section>
  );
}

function StepRow({ step }: { step: ProvisioningStep }) {
  const isSuccess = step.outcome === 'SUCCESS';
  return (
    <li className="row" style={{ gap: 10 }}>
      <span aria-hidden style={{ color: isSuccess ? 'var(--accent-strong)' : 'var(--danger)', fontWeight: 700 }}>
        {isSuccess ? '✓' : '✗'}
      </span>
      {step.system && (
        <span className="chip chip-neutral" style={{ fontSize: 11, padding: '1px 6px' }}>
          {step.system}
        </span>
      )}
      <span className="text-sm">{step.label ?? STEP_LABEL_FALLBACK[step.name] ?? step.name}</span>
      {!isSuccess && step.error && <span className="text-faint text-sm">- {step.error}</span>}
    </li>
  );
}
