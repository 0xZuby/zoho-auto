'use client';

import type { EmployeeDirectoryEntry } from '@/lib/types';

interface OffboardingReviewStageProps {
  employee: EmployeeDirectoryEntry;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  NEW_HIRE: 'New hire',
  LEAVING_COMPANY: 'Leaving company',
  UPDATE_EMPLOYEE_INFO: 'Update employee info',
};

/**
 * Read-only confirmation shown before HR sends an offboarding request to
 * the Auditor (PRD: "the HR searches the employee ... select the employee
 * then sends it to the Auditor"). No fields are editable here — the
 * Auditor reviews and winds down the existing Zoho account.
 */
export function OffboardingReviewStage({ employee }: OffboardingReviewStageProps) {
  return (
    <div className="stack gap-24">
      <div className="stack gap-4">
        <h2 style={{ fontSize: 19 }}>Confirm offboarding</h2>
        <p className="text-muted text-sm">
          This sends an offboarding request to the Auditor for the employee below. No account changes happen until an
          Auditor reviews it.
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
            <dt>Corporate (Zoho) email</dt>
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
      </div>
    </div>
  );
}
