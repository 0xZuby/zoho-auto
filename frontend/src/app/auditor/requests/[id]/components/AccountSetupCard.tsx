'use client';

import { useState } from 'react';
import type { AccountType, OnboardingRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-client';
import { provisionRequest, saveResolvedAccount } from '@/lib/auditor-api';

interface AccountSetupCardProps {
  request: OnboardingRequest;
  onSaved: (request: OnboardingRequest) => void;
}

function toAccountType(zoho: boolean, insideMaps: boolean): AccountType {
  if (zoho && insideMaps) return 'ZOHO_AND_INSIDEMAPS';
  return insideMaps ? 'INSIDEMAPS' : 'ZOHO';
}

/**
 * The security-boundary UI (PRD section 18): the deterministic proposal from
 * the rules engine is shown as a suggestion, but it is never provisionable
 * on its own. Clicking "Create" is the explicit auditor action that saves
 * the resolved account (unchanged or edited) and then provisions it.
 */
export function AccountSetupCard({ request, onSaved }: AccountSetupCardProps) {
  const isLeavingCompany = request.submission.requestType === 'LEAVING_COMPANY';
  const isLocked =
    request.status !== 'PENDING_REVIEW' &&
    request.status !== 'APPROVED' &&
    request.status !== 'PROVISIONING_FAILED' &&
    request.status !== 'PARTIALLY_PROVISIONED';
  const hasRun = request.provisioning.steps.length > 0;
  const initial = request.resolvedAccount ?? request.proposedAccount;
  const proposed = request.proposedAccount;

  const [createZoho, setCreateZoho] = useState(initial.accountType !== 'INSIDEMAPS');
  const [addInsideMaps, setAddInsideMaps] = useState(
    initial.accountType === 'INSIDEMAPS' || initial.accountType === 'ZOHO_AND_INSIDEMAPS',
  );
  const [corporateEmail, setCorporateEmail] = useState(initial.corporateEmail);
  const [insideMapsRolesText, setInsideMapsRolesText] = useState(
    (initial.insideMapsRoles?.length ? initial.insideMapsRoles : (proposed.insideMapsRoles ?? [])).join(', '),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const isApproved = Boolean(request.resolvedAccount);
  const accountType = toAccountType(createZoho, addInsideMaps);
  const nothingSelected = !createZoho && !addInsideMaps;
  const canCreate = !isLocked && !hasRun && !nothingSelected;
  const fieldsLocked = isLocked || hasRun;

  // PRD section 9: highlight wherever the auditor's current values differ
  // from the rules engine's proposal.
  const emailOverridden = corporateEmail.trim() !== proposed.corporateEmail.trim();

  async function handleSave(andCreate: boolean) {
    setErrors({});
    setSaveNotice(null);
    setIsSaving(true);
    try {
      const insideMapsRoles = insideMapsRolesText
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
      const updated = await saveResolvedAccount(request.id, {
        corporateEmail,
        insideMapsRoles: addInsideMaps ? insideMapsRoles : [],
        accountType,
      });
      onSaved(updated);
      if (andCreate) {
        const result = await provisionRequest(request.id);
        onSaved(result.request);
        setSaveNotice(
          result.allStepsSucceeded
            ? 'Accounts created.'
            : 'Configuration saved, but a provisioning step failed. See Provisioning below to retry.',
        );
      } else {
        setSaveNotice('Account configuration saved.');
      }
    } catch (error) {
      if (error instanceof ApiError && error.payload.errors) {
        setErrors(error.payload.errors);
      } else {
        setErrors({ _form: error instanceof ApiError ? error.message : 'Could not save the account configuration.' });
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="card card-padded detail-card stack gap-16">
      <div className="row-between">
        <h2 style={{ fontSize: 15 }}>Account details</h2>
      </div>

      {isLeavingCompany ? (
        <>
          <p className="card-section-intro">
            Offboarding disables both access points in one step. There is nothing to choose or approve here.
          </p>
          <div className="notice notice-info stack gap-4">
            <span>
              <strong>Work email:</strong> {initial.corporateEmail || request.submission.privateEmail}
            </span>
            <span>Zoho Mail access is disabled and InsideMaps access is revoked, regardless of the account type this employee had.</span>
          </div>
        </>
      ) : (
        <>
      {request.proposedAccount.needsReview && (
        <span className="chip chip-warning" style={{ alignSelf: 'flex-start' }}>Rules engine flagged for review</span>
      )}
      <p className="card-section-intro">
        Create the Zoho Mail mailbox in one click — no invitation is sent. Optionally add an InsideMaps account with roles.
      </p>

      {request.proposedAccount.collisionAdjusted && (
        <div className="notice notice-warning">
          <strong>Email collision resolved:</strong> Base address{' '}
          <code>{request.proposedAccount.baseEmail}</code> was already in use. Automatically adjusted to next available
          suffix starting at 2: <code>{request.proposedAccount.corporateEmail}</code>.
        </div>
      )}

      {request.proposedAccount.needsReview && request.proposedAccount.reasons.length > 0 && (
        <div className="notice notice-warning">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {request.proposedAccount.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="field">
        <label className="field-label" htmlFor="corporate-email">
          Corporate email
        </label>
        <input
          id="corporate-email"
          className={`input${errors.corporateEmail ? ' has-error' : ''}`}
          value={corporateEmail}
          onChange={(event) => setCorporateEmail(event.target.value)}
          disabled={fieldsLocked}
        />
        {errors.corporateEmail && <span className="field-error">{errors.corporateEmail}</span>}
        {emailOverridden && <OverrideNote proposedValue={proposed.corporateEmail} />}
      </div>

      <div className="stack gap-8">
        <label className={`radio-option${createZoho ? ' selected' : ''}`} style={{ alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            checked={createZoho}
            onChange={(event) => setCreateZoho(event.target.checked)}
            disabled={fieldsLocked}
            style={{ accentColor: 'var(--accent)', marginTop: 3 }}
          />
          <span className="stack gap-2">
            <strong style={{ fontSize: 13.5 }}>Zoho Mail account</strong>
            <span className="text-faint text-sm">
              Creates the mailbox directly. The employee receives a temporary password by email.
            </span>
          </span>
        </label>

        <label className={`radio-option${addInsideMaps ? ' selected' : ''}`} style={{ alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            checked={addInsideMaps}
            onChange={(event) => setAddInsideMaps(event.target.checked)}
            disabled={fieldsLocked}
            style={{ accentColor: 'var(--accent)', marginTop: 3 }}
          />
          <span className="stack gap-2">
            <strong style={{ fontSize: 13.5 }}>Also create an InsideMaps account</strong>
            <span className="text-faint text-sm">
              Creates the user through the InsideMaps API, assigns the roles below and enforces 2SV.
            </span>
          </span>
        </label>
      </div>

      {addInsideMaps && (
        <div className="field">
          <label className="field-label" htmlFor="insidemaps-roles">
            InsideMaps roles (comma-separated)
          </label>
          <input
            id="insidemaps-roles"
            className={`input${errors.insideMapsRoles ? ' has-error' : ''}`}
            value={insideMapsRolesText}
            onChange={(event) => setInsideMapsRolesText(event.target.value)}
            placeholder="IM_DEFAULT_USER"
            disabled={fieldsLocked}
          />
          {errors.insideMapsRoles && <span className="field-error">{errors.insideMapsRoles}</span>}
        </div>
      )}

      {errors._form && <div className="notice notice-error">{errors._form}</div>}
      {errors.accountType && <div className="notice notice-error">{errors.accountType}</div>}
      {saveNotice && !errors._form && <div className="notice notice-success">{saveNotice}</div>}

      {isApproved && (
        <div className="notice notice-info">
          Approved by an auditor on {new Date(request.resolvedAccount!.resolvedAt).toLocaleString()}.
        </div>
      )}

      {!isLocked && !hasRun && (
        <div className="row" style={{ gap: 10 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSave(true)}
            disabled={isSaving || nothingSelected}
          >
            {isSaving ? 'Working…' : 'Create accounts'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSave(false)}
            disabled={isSaving || nothingSelected}
          >
            {isApproved ? 'Update configuration only' : 'Approve without creating'}
          </button>
        </div>
      )}
        </>
      )}
    </section>
  );
}

/** Shown next to a field whose current value differs from the rules
 * engine's proposal, so the override is visible before it's saved. */
function OverrideNote({ proposedValue }: { proposedValue: string }) {
  return (
    <span className="field-hint override-note">
      Overrides rules engine proposal: <strong>{proposedValue}</strong>
    </span>
  );
}
