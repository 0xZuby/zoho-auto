import type { AuditTrailEntry } from '@/lib/types';
import { formatDateTime } from '../../../statusPresentation';

export function AuditTrailCard({ entries }: { entries: AuditTrailEntry[] }) {
  const ordered = [...entries].reverse();

  return (
    <section className="card card-padded detail-card audit-card stack gap-16">
      <h2 style={{ fontSize: 15 }}>Audit history</h2>
      <p className="card-section-intro">A timestamped record of every review and provisioning action.</p>
      <ol className="stack gap-12" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {ordered.map((entry, index) => (
          <li key={`${entry.at}-${index}`} className="stack gap-2" style={{ paddingBottom: 12, borderBottom: index < ordered.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div className="row-between">
              <span className="text-sm" style={{ fontWeight: 600 }}>
                {entry.detail}
              </span>
              <span className="text-faint text-sm">{formatDateTime(entry.at)}</span>
            </div>
            <span className="text-faint" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {entry.actorType}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
