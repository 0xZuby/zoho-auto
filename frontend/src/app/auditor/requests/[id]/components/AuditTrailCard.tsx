import type { AuditTrailEntry } from '@/lib/types';
import { formatDateTime } from '../../../statusPresentation';

/** Actor tone drives the entry's marker colour — a quick visual scan of who did what. */
const ACTOR_TONE: Record<AuditTrailEntry['actorType'], string> = {
  AUDITOR: 'tone-auditor',
  HR: 'tone-hr',
  EMPLOYEE: 'tone-employee',
  SYSTEM: 'tone-system',
};

export function AuditTrailCard({ entries }: { entries: AuditTrailEntry[] }) {
  const ordered = [...entries].reverse();

  return (
    <section className="card card-padded detail-card audit-card stack gap-16">
      <h2 style={{ fontSize: 15 }}>Audit history</h2>
      <p className="card-section-intro">A timestamped record of every review and provisioning action.</p>
      <ol className="audit-trail">
        {ordered.map((entry, index) => (
          <li key={`${entry.at}-${index}`} className={`audit-entry ${ACTOR_TONE[entry.actorType]}`}>
            <p className="audit-entry-detail">{entry.detail}</p>
            <div className="audit-entry-meta">
              <span className="audit-entry-actor">{entry.actorType}</span>
              <span className="audit-entry-time">{formatDateTime(entry.at)}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
