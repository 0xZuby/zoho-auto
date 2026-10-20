'use client';

import type { EmployeeDirectoryEntry } from '@/lib/types';

interface OffboardingReviewStageProps {
  employee: EmployeeDirectoryEntry;
  effectiveLeaveDate: string;
  onEffectiveLeaveDateChange: (value: string) => void;
  effectiveLeaveTimezone: string;
  onEffectiveLeaveTimezoneChange: (value: string) => void;
  leavingReason: string;
  onLeavingReasonChange: (value: string) => void;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  NEW_HIRE: 'New hire',
  LEAVING_COMPANY: 'Leaving company',
  UPDATE_EMPLOYEE_INFO: 'Update employee info',
};

/**
 * Confirmation shown before HR sends an offboarding request to InsideOps.
 * Captures the effective leave date and timezone (Epic 4) so access blocking
 * is scheduled or executed against the agreed effective-time rule.
 */
export function OffboardingReviewStage({
  employee,
  effectiveLeaveDate,
  onEffectiveLeaveDateChange,
  effectiveLeaveTimezone,
  onEffectiveLeaveTimezoneChange,
  leavingReason,
  onLeavingReasonChange,
}: OffboardingReviewStageProps) {
  return (
    <div className="stack gap-24">
      <div className="stack gap-4">
        <h2 style={{ fontSize: 19 }}>Confirm offboarding &amp; effective leave date</h2>
        <p className="text-muted text-sm">
          Record the employee&rsquo;s effective leave date. On the effective date (or immediately when triggered by an
          Admin), Zoho Mail is deactivated, active sessions/tokens are revoked, and InsideMaps roles are removed.
        </p>
      </div>

      <div className="card card-padded stack gap-16">
        <dl className="definition-list">
          <div>
            <dt>Name</dt>
            <dd>{employee.nameAndSurname}</dd>
          </div>
          <div>
            <dt>Private email</dt>
            <dd>{employee.privateEmail}</dd>
          </div>
          <div>
            <dt>Corporate email</dt>
            <dd>{employee.corporateEmail || '—'}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{employee.department}</dd>
          </div>
          <div>
            <dt>Current request type on file</dt>
            <dd>{REQUEST_TYPE_LABELS[employee.requestType] ?? employee.requestType}</dd>
          </div>
        </dl>

        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="hr-effective-leave-date">
              Effective leave date
            </label>
            <input
              id="hr-effective-leave-date"
              type="date"
              className="input"
              value={effectiveLeaveDate}
              onChange={(e) => onEffectiveLeaveDateChange(e.target.value)}
            />
            <span className="field-hint">
              Leave blank for immediate access blocking, or pick a future date to schedule offboarding.
            </span>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="hr-effective-leave-tz">
              Timezone (effective at 17:00)
            </label>
            <select
              id="hr-effective-leave-tz"
              className="select"
              value={effectiveLeaveTimezone}
              onChange={(e) => onEffectiveLeaveTimezoneChange(e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
              <option value="America/New_York">America/New_York (ET)</option>
              <option value="Europe/Belgrade">Europe/Belgrade (CET)</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="hr-leaving-reason">
            Reason / offboarding notes (optional)
          </label>
          <input
            id="hr-leaving-reason"
            className="input"
            placeholder="Voluntary resignation, end of contract, etc."
            value={leavingReason}
            onChange={(e) => onLeavingReasonChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
