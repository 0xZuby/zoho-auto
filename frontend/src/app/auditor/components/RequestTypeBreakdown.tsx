import Link from 'next/link';
import type { DashboardMetrics, RequestType } from '@/lib/types';
import { REQUEST_TYPE_LABELS } from '../statusPresentation';

const TYPE_ORDER: RequestType[] = ['NEW_HIRE', 'LEAVING_COMPANY', 'UPDATE_EMPLOYEE_INFO'];

const TYPE_LINKS: Record<RequestType, string> = {
  NEW_HIRE: '/auditor/employees/onboarding',
  LEAVING_COMPANY: '/auditor/employees/offboarding',
  UPDATE_EMPLOYEE_INFO: '/auditor/employees/all',
};

/**
 * Per-request-type breakdown (New hire / Leaving company / Update employee
 * info), driven entirely by `metrics.byType` from GET /api/auditor/metrics.
 * Complements the aggregate InstrumentPanel above it with the split an
 * auditor needs to see which of the three workflows is backing up.
 */
export function RequestTypeBreakdown({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <section className="card card-padded stack gap-16" aria-label="Requests by type">
      <div className="row-between">
        <h3 style={{ fontSize: 15 }}>Requests by type</h3>
      </div>

      <div className="type-breakdown-grid">
        {TYPE_ORDER.map((type) => {
          const typeMetrics = metrics.byType[type];
          return (
            <Link key={type} href={TYPE_LINKS[type]} className="type-breakdown-cell">
              <span className="type-breakdown-label">{REQUEST_TYPE_LABELS[type]}</span>
              <strong className="type-breakdown-total">{typeMetrics.total}</strong>
              <dl className="type-breakdown-stats">
                <div>
                  <dt>New</dt>
                  <dd>{typeMetrics.pending}</dd>
                </div>
                <div>
                  <dt>In progress</dt>
                  <dd>{typeMetrics.provisioning}</dd>
                </div>
                <div>
                  <dt>Failed</dt>
                  <dd>{typeMetrics.failed}</dd>
                </div>
                <div>
                  <dt>Completed</dt>
                  <dd>{typeMetrics.completed}</dd>
                </div>
              </dl>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
