import type { DashboardMetrics, WorkflowStatus } from '@/lib/types';
import type { StatusTone } from '../statusPresentation';

interface QueueCounter {
  label: string;
  value: number;
  tone: StatusTone;
  caption: string;
  filterValue: WorkflowStatus | 'FAILED' | 'OVERDUE';
}

interface KpiItem {
  label: string;
  value: string;
  target: string;
  tone: 'good' | 'warn' | 'alert' | 'neutral';
  filterValue?: string;
}

/**
 * Actionable KPIs + Secondary Operational Queue Counters:
 * Top row: Completion rate, Automation rate, Median provisioning time,
 * Overdue requests, and Offboarding SLA compliance.
 * Bottom strip: Secondary operational queue indicators (To review, Failed,
 * Ready to create, Scheduled leave, Completed).
 */
export function InstrumentPanel({
  metrics,
  activeFilter,
  onSelectFilter,
}: {
  metrics: DashboardMetrics;
  activeFilter: string;
  onSelectFilter: (filterValue: string) => void;
}) {
  const kpis = metrics.kpis ?? {
    completionRate: 100,
    automationRate: 100,
    medianProvisioningMinutes: null,
    overdueRequests: 0,
    offboardingSlaRate: 100,
    urgentRevocationCount: 0,
    totalRequests: 0,
  };

  const kpiCards: KpiItem[] = [
    {
      label: 'Completion rate',
      value: `${kpis.completionRate}%`,
      target: `${metrics.completed} of ${kpis.totalRequests} fulfilled`,
      tone: kpis.completionRate >= 80 ? 'good' : kpis.completionRate >= 50 ? 'warn' : 'neutral',
    },
    {
      label: 'Automation rate',
      value: `${kpis.automationRate}%`,
      target: 'Zero-exception rule match',
      tone: kpis.automationRate >= 85 ? 'good' : 'warn',
    },
    {
      label: 'Median provisioning',
      value: kpis.medianProvisioningMinutes !== null ? `${kpis.medianProvisioningMinutes}m` : '< 1m',
      target: 'Target SLA ≤ 15m',
      tone:
        kpis.medianProvisioningMinutes === null || kpis.medianProvisioningMinutes <= 15
          ? 'good'
          : 'alert',
    },
    {
      label: 'Overdue requests',
      value: String(kpis.overdueRequests),
      target: 'Breached 15m / target date',
      tone: kpis.overdueRequests > 0 ? 'alert' : 'good',
      filterValue: 'OVERDUE',
    },
    {
      label: 'Offboarding SLA',
      value: `${kpis.offboardingSlaRate}%`,
      target:
        kpis.urgentRevocationCount > 0
          ? `${kpis.urgentRevocationCount} active access risk`
          : 'Revoked within 15m of leave',
      tone: kpis.urgentRevocationCount > 0 || kpis.offboardingSlaRate < 100 ? 'alert' : 'good',
    },
  ];

  const queueCounters: QueueCounter[] = [
    {
      label: 'To review',
      value: metrics.newRequests,
      tone: 'new',
      caption: 'Awaiting auditor decision',
      filterValue: 'PENDING_REVIEW',
    },
    {
      label: 'Failed / Blocked',
      value: metrics.failed,
      tone: 'alert',
      caption: 'Integration or partial error',
      filterValue: 'FAILED',
    },
    {
      label: 'Ready to create',
      value: metrics.readyToCreate,
      tone: 'progress',
      caption: 'Approved, awaiting API run',
      filterValue: 'APPROVED',
    },
    {
      label: 'Scheduled leave',
      value: metrics.scheduledOffboardings ?? 0,
      tone: 'progress',
      caption: 'Pending effective date',
      filterValue: 'SCHEDULED_OFFBOARDING',
    },
  ];

  return (
    <div className="kpi-overview-stack">
      <section className="kpi-slab" aria-label="System performance KPIs">
        {kpiCards.map((item) => {
          const isInteractive = Boolean(item.filterValue);
          const isActive = item.filterValue ? activeFilter === item.filterValue : false;
          return (
            <div
              key={item.label}
              className={`kpi-cell kpi-tone-${item.tone}${isActive ? ' is-active' : ''}${isInteractive ? ' is-clickable' : ''}`}
              onClick={
                item.filterValue
                  ? () => onSelectFilter(isActive ? 'ALL' : item.filterValue!)
                  : undefined
              }
              role={isInteractive ? 'button' : undefined}
              tabIndex={isInteractive ? 0 : undefined}
            >
              <span className="kpi-label">{item.label}</span>
              <strong className="kpi-figure">{item.value}</strong>
              <span className="kpi-target">{item.target}</span>
            </div>
          );
        })}
      </section>

      <section className="secondary-queue-bar" aria-label="Operational queue counters">
        <span className="secondary-queue-title">Queue status</span>
        <div className="secondary-queue-pills">
          {queueCounters.map((counter) => {
            const isActive = activeFilter === counter.filterValue;
            return (
              <button
                key={counter.label}
                type="button"
                className={`secondary-queue-pill tone-${counter.tone}${isActive ? ' is-active' : ''}`}
                onClick={() => onSelectFilter(isActive ? 'ALL' : counter.filterValue)}
                aria-pressed={isActive}
                title={counter.caption}
              >
                <span className="secondary-pill-dot" />
                <span className="secondary-pill-label">{counter.label}</span>
                <strong className="secondary-pill-count">{counter.value}</strong>
              </button>
            );
          })}
          {activeFilter !== 'ALL' && (
            <button
              type="button"
              className="secondary-queue-reset"
              onClick={() => onSelectFilter('ALL')}
            >
              Reset filter
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

