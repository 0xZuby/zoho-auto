import type { OnboardingRequest } from '@/lib/types';

type StepState = 'done' | 'current' | 'attention' | 'upcoming';

interface Step {
  label: string;
  state: StepState;
}

const CLOSED_STATUSES = new Set(['REJECTED', 'RETURNED', 'CANCELLED']);

/**
 * 6-stage lifecycle progression:
 * Submitted → Validated → Approved → Zoho → InsideMaps → Verified
 */
function buildSteps(request: OnboardingRequest): Step[] {
  const { status, submission, proposedAccount, resolvedAccount, provisioning } = request;
  const steps = provisioning?.steps ?? [];
  const hasStep = (names: string[], outcome?: 'SUCCESS' | 'FAILED') =>
    steps.some((s) => names.includes(s.name) && (!outcome || s.outcome === outcome));

  const isCompleted =
    status === 'COMPLETED' ||
    status === 'ACCESS_REVOKED' ||
    status === 'NOTIFICATION_SENT' ||
    status === 'ACCOUNT_CREATED';

  const accountType = resolvedAccount?.accountType ?? proposedAccount?.accountType ?? 'ZOHO';
  const hasImRoles = (resolvedAccount?.insideMapsRoles ?? proposedAccount?.insideMapsRoles ?? []).length > 0;

  // 1. Submitted
  const submittedState: StepState = 'done';

  // 2. Validated
  let validatedState: StepState = 'done';
  if (CLOSED_STATUSES.has(status)) {
    validatedState = 'attention';
  } else if (proposedAccount?.needsReview && !resolvedAccount) {
    validatedState = 'attention';
  }

  // 3. Approved
  let approvedState: StepState = 'upcoming';
  if (resolvedAccount || isCompleted || status === 'SCHEDULED_OFFBOARDING') {
    approvedState = 'done';
  } else if (status === 'PENDING_REVIEW') {
    approvedState = validatedState === 'attention' ? 'attention' : 'current';
  }

  // 4. Zoho
  const zohoStepNames = ['create_user', 'update_user', 'enable_mail', 'assign_groups', 'deactivate_user'];
  let zohoState: StepState = 'upcoming';
  if (accountType === 'INSIDEMAPS' && submission.requestType !== 'LEAVING_COMPANY') {
    zohoState = approvedState === 'done' ? 'done' : 'upcoming';
  } else if (hasStep(zohoStepNames, 'FAILED') || provisioning?.failureSystem === 'ZOHO') {
    zohoState = 'attention';
  } else if (hasStep(['create_user', 'update_user', 'deactivate_user'], 'SUCCESS') || isCompleted) {
    zohoState = 'done';
  } else if (status === 'APPROVED' || status === 'PROVISIONING' || status === 'SCHEDULED_OFFBOARDING') {
    zohoState = 'current';
  }

  // 5. InsideMaps
  const imStepNames = ['create_im_user', 'assign_im_roles', 'remove_im_roles', 'delete_im_user'];
  let insideMapsState: StepState = 'upcoming';
  if (accountType === 'ZOHO' && submission.requestType !== 'LEAVING_COMPANY' && !hasImRoles && !hasStep(imStepNames)) {
    insideMapsState = zohoState === 'done' || isCompleted ? 'done' : 'upcoming';
  } else if (hasStep(imStepNames, 'FAILED') || provisioning?.failureSystem === 'INSIDEMAPS') {
    insideMapsState = 'attention';
  } else if (hasStep(imStepNames, 'SUCCESS') || isCompleted) {
    insideMapsState = 'done';
  } else if (zohoState === 'done' || (accountType === 'INSIDEMAPS' && approvedState === 'done')) {
    insideMapsState = 'current';
  }

  // 6. Verified
  const verifyStepNames = ['verify_configuration', 'enforce_security_policy'];
  let verifiedState: StepState = 'upcoming';
  if (hasStep(verifyStepNames, 'FAILED')) {
    verifiedState = 'attention';
  } else if (
    status === 'COMPLETED' ||
    status === 'ACCESS_REVOKED' ||
    status === 'NOTIFICATION_SENT' ||
    hasStep(['verify_configuration'], 'SUCCESS')
  ) {
    verifiedState = 'done';
  } else if (status === 'ACCOUNT_CREATED') {
    verifiedState = 'current';
  }

  return [
    { label: 'Submitted', state: submittedState },
    { label: 'Validated', state: validatedState },
    { label: 'Approved', state: approvedState },
    { label: 'Zoho', state: zohoState },
    { label: 'InsideMaps', state: insideMapsState },
    { label: 'Verified', state: verifiedState },
  ];
}

export function RequestStepTracker({ request }: { request: OnboardingRequest }) {
  const steps = buildSteps(request);

  return (
    <ol className="step-tracker" aria-label="Request progress">
      {steps.map((step, index) => (
        <li key={step.label} className={`step-tracker-item step-${step.state}`}>
          <span className="step-tracker-marker" aria-hidden>
            {step.state === 'done' ? '✓' : step.state === 'attention' ? '!' : index + 1}
          </span>
          <span className="step-tracker-label">{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
