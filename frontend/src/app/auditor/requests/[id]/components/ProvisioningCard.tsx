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
  validate_employee: 'Employee validated',
  check_email_availability: 'Email availability checked',
  create_user: 'Zoho user created',
  enable_mail: 'Zoho Mail enabled',
  assign_groups: 'Groups assigned',
  verify_configuration: 'Account configuration verified',
  deactivate_user: 'Zoho account deactivated',
  request_insidemaps_access: 'InsideMaps account requested (employee signup pending)',
  revoke_insidemaps_access: 'InsideMaps account access revoked',
};

export function ProvisioningCard({ request, onUpdated }: ProvisioningCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInsideMaps = request.resolvedAccount?.accountType === 'INSIDEMAPS';
  const isLeavingCompany = request.submission.requestType === 'LEAVING_COMPANY';
  const canCreate = request.status === 'APPROVED' && Boolean(request.resolvedAccount);
  const canRetry = request.status === 'PARTIALLY_PROVISIONED' || request.status === 'PROVISIONING_FAILED';
  const hasRun = request.provisioning.steps.length > 0;
  const createLabel = isLeavingCompany ? 'Disable access' : isInsideMaps ? 'Request InsideMaps account' : 'Create Zoho user';

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
          ? 'Offboarding disables Zoho Mail and revokes InsideMaps access in one step \u2014 both are attempted regardless of the account type this employee had.'
          : isInsideMaps
            ? 'InsideMaps accounts aren\u2019t provisioned automatically yet \u2014 this records that access was requested.'
            : 'Each action is recorded separately so failed steps can be retried without creating a duplicate account.'}
      </p>

      {error && <div className="notice notice-error">{error}</div>}

      {request.provisioning.failureReason && (
        <div className="notice notice-error">
          <strong>Failure:</strong> {request.provisioning.failureReason}
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
      <span className="text-sm">{step.label ?? STEP_LABEL_FALLBACK[step.name] ?? step.name}</span>
      {!isSuccess && step.error && <span className="text-faint text-sm">— {step.error}</span>}
    </li>
  );
}
