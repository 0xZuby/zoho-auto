'use client';

import { useState } from 'react';
import type { AccountType, OnboardingRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-client';
import { saveResolvedAccount } from '@/lib/auditor-api';

interface AccountSetupCardProps {
  request: OnboardingRequest;
  onSaved: (request: OnboardingRequest) => void;
}

const ACCOUNT_TYPE_OPTIONS: Array<{ value: AccountType; title: string; description: string }> = [
  {
    value: 'ZOHO',
    title: 'Zoho account',
    description: 'Provisioned automatically from this page — role and groups below apply.',
  },
  {
    value: 'INSIDEMAPS',
    title: 'InsideMaps account',
    description: 'The employee signs up on the InsideMaps website; no role or groups to set here.',
  },
];

/**
 * The security-boundary UI (PRD section 18): the deterministic proposal from
 * the rules engine is shown as a suggestion, but it is never provisionable
 * on its own. The auditor must explicitly save it (unchanged or edited) as
 * the resolved account before "Create Zoho user" becomes available.
 */
export function AccountSetupCard({ request, onSaved }: AccountSetupCardProps) {
  const isLeavingCompany = request.submission.requestType === 'LEAVING_COMPANY';
  const isLocked = request.status !== 'PENDING_REVIEW' && request.status !== 'APPROVED';
  const initial = request.resolvedAccount ?? request.proposedAccount;

  const [accountType, setAccountType] = useState<AccountType>(initial.accountType ?? 'ZOHO');
  const [corporateEmail, setCorporateEmail] = useState(initial.corporateEmail);
  const [role, setRole] = useState(initial.role);
  const [groupsText, setGroupsText] = useState(initial.groups.join(', '));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const isApproved = Boolean(request.resolvedAccount);
  const isZoho = accountType === 'ZOHO';

  async function handleSave() {
    setErrors({});
    setSaveNotice(null);
    setIsSaving(true);
    try {
      const groups = groupsText
        .split(',')
        .map((group) => group.trim())
        .filter(Boolean);
      const updated = await saveResolvedAccount(request.id, { corporateEmail, role, groups, accountType });
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
        <h2 style={{ fontSize: 15 }}>Account details</h2>
      </div>

      {isLeavingCompany ? (
        <>
          <p className="card-section-intro">
            Offboarding disables both access points in one step — there&apos;s nothing to choose or approve here.
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
        Choose how this employee gets access, review the configuration, then save it before any provisioning action can run.
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

      <div className="field">
        <span className="field-label">Account type</span>
        <div className="radio-group" role="radiogroup" aria-label="Account type">
          {ACCOUNT_TYPE_OPTIONS.map((option) => {
            const selected = accountType === option.value;
            return (
              <label key={option.value} className={`radio-option${selected ? ' selected' : ''}`} style={{ alignItems: 'flex-start' }}>
                <input
                  type="radio"
                  name="accountType"
                  value={option.value}
                  checked={selected}
                  onChange={() => setAccountType(option.value)}
                  disabled={isLocked}
                  style={{ accentColor: 'var(--accent)', marginTop: 3 }}
                />
                <span className="stack gap-2">
                  <span>{option.title}</span>
                  <span className="text-faint text-sm">{option.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

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

        {isZoho && (
          <>
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
          </>
        )}
      </div>

      {!isZoho && (
        <div className="notice notice-info">
          InsideMaps account provisioning isn&apos;t automated yet — saving this only records that the employee should sign
          up on the InsideMaps website with this email.
        </div>
      )}

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
        </>
      )}
    </section>
  );
}
