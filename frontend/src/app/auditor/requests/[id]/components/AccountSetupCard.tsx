'use client';

import { useState } from 'react';
import type { OnboardingRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-client';
import { saveResolvedAccount } from '@/lib/auditor-api';

interface AccountSetupCardProps {
  request: OnboardingRequest;
  onSaved: (request: OnboardingRequest) => void;
}

/**
 * The security-boundary UI (PRD section 18): the deterministic proposal from
 * the rules engine is shown as a suggestion, but it is never provisionable
 * on its own. The auditor must explicitly save it (unchanged or edited) as
 * the resolved account before "Create Zoho user" becomes available.
 */
export function AccountSetupCard({ request, onSaved }: AccountSetupCardProps) {
  const isLocked = request.status !== 'PENDING_REVIEW' && request.status !== 'APPROVED';
  const initial = request.resolvedAccount ?? request.proposedAccount;

  const [corporateEmail, setCorporateEmail] = useState(initial.corporateEmail);
  const [role, setRole] = useState(initial.role);
  const [groupsText, setGroupsText] = useState(initial.groups.join(', '));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const isApproved = Boolean(request.resolvedAccount);

  async function handleSave() {
    setErrors({});
    setSaveNotice(null);
    setIsSaving(true);
    try {
      const groups = groupsText
        .split(',')
        .map((group) => group.trim())
        .filter(Boolean);
      const updated = await saveResolvedAccount(request.id, { corporateEmail, role, groups });
      onSaved(updated);
      setSaveNotice('Account configuration saved.');
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
        <h2 style={{ fontSize: 15 }}>Proposed account</h2>
        {request.proposedAccount.needsReview && (
          <span className="chip chip-warning">Rules engine flagged for review</span>
        )}
      </div>
      <p className="card-section-intro">
        This is a rules-based suggestion. Save the final reviewed configuration before any Zoho action can run.
      </p>

      {request.proposedAccount.needsReview && request.proposedAccount.reasons.length > 0 && (
        <div className="notice notice-warning">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {request.proposedAccount.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-grid">
        <div className="field span-2">
          <label className="field-label" htmlFor="corporate-email">
            Corporate email
          </label>
          <input
            id="corporate-email"
            className={`input${errors.corporateEmail ? ' has-error' : ''}`}
            value={corporateEmail}
            onChange={(event) => setCorporateEmail(event.target.value)}
            disabled={isLocked}
          />
          {errors.corporateEmail && <span className="field-error">{errors.corporateEmail}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="account-role">
            Role
          </label>
          <input
            id="account-role"
            className={`input${errors.role ? ' has-error' : ''}`}
            value={role}
            onChange={(event) => setRole(event.target.value)}
            disabled={isLocked}
          />
          {errors.role && <span className="field-error">{errors.role}</span>}
        </div>

        <div className="field span-2">
          <label className="field-label" htmlFor="account-groups">
            Groups
          </label>
          <input
            id="account-groups"
            className={`input${errors.groups ? ' has-error' : ''}`}
            value={groupsText}
            onChange={(event) => setGroupsText(event.target.value)}
            placeholder="All Employees, Operations"
            disabled={isLocked}
          />
          <span className="field-hint">Comma-separated group names.</span>
          {errors.groups && <span className="field-error">{errors.groups}</span>}
        </div>
      </div>

      {errors._form && <div className="notice notice-error">{errors._form}</div>}
      {saveNotice && !errors._form && <div className="notice notice-success">{saveNotice}</div>}

      {isApproved && (
        <div className="notice notice-info">
          Approved by an auditor on {new Date(request.resolvedAccount!.resolvedAt).toLocaleString()}.
        </div>
      )}

      {!isLocked && (
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ alignSelf: 'flex-start' }}>
          {isSaving ? 'Saving…' : isApproved ? 'Update account configuration' : 'Approve account configuration'}
        </button>
      )}
    </section>
  );
}
