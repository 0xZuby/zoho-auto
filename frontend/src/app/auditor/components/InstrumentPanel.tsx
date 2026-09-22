import type { DashboardMetrics } from '@/lib/types';
import type { StatusTone } from '../statusPresentation';

interface Reading {
  label: string;
  value: number;
  tone: StatusTone;
  caption: string;
}

/**
 * The workspace's primary readout.
 *
 * Rendered as one continuous bordered slab divided by hairlines rather than
 * four free-floating cards, so the four figures read as a single instrument.
 * Each figure carries a share-of-total bar, which gives proportion at a
 * glance without pulling in a charting dependency.
 */
export function InstrumentPanel({ metrics }: { metrics: DashboardMetrics }) {
  const readings: Reading[] = [
    { label: 'Awaiting review', value: metrics.newRequests, tone: 'new', caption: 'Queued for an auditor decision' },
    { label: 'In progress', value: metrics.provisioning, tone: 'progress', caption: 'Approved or mid-provisioning' },
    { label: 'Needs attention', value: metrics.failed, tone: 'alert', caption: 'Failed or partially provisioned' },
    { label: 'Completed', value: metrics.completed, tone: 'done', caption: 'Account created and notified' },
  ];

  const total = readings.reduce((sum, reading) => sum + reading.value, 0);

  return (
    <section className="instrument" aria-label="Request volume by state">
      {readings.map((reading) => {
        const share = total === 0 ? 0 : Math.round((reading.value / total) * 100);
        return (
          <article key={reading.label} className={`instrument-cell tone-${reading.tone}`}>
            <span className="instrument-label">{reading.label}</span>
            <strong className="instrument-figure">{reading.value}</strong>
            <div className="instrument-meta">
              <div
                className="instrument-bar"
                role="img"
                aria-label={`${share}% of ${total} total requests`}
              >
                <span style={{ width: `${share}%` }} />
              </div>
              <span className="instrument-caption">{reading.caption}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
