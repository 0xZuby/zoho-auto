'use client';

import { useEffect, useState } from 'react';
import { getAdminCatalog } from '@/lib/admin-api';
import type { FormCatalog } from '@/lib/types';

/**
 * Read-only view of the deterministic field catalog and rules engine
 * (backend/src/config/catalog.js + rules.js). The MVP treats these as
 * version-controlled configuration files rather than a database-backed
 * admin UI, keeping the "deterministic and auditable by editing a file"
 * property from PRD section 10 intact. This screen makes that configuration
 * visible without adding write endpoints for it yet.
 */
export function CatalogViewerCard() {
  const [catalog, setCatalog] = useState<FormCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminCatalog()
      .then(setCatalog)
      .catch(() => setError('Could not load the field catalog.'));
  }, []);

  if (error) return <div className="notice notice-error">{error}</div>;
  if (!catalog) return <div className="skeleton" style={{ height: 180 }} />;

  const sections: { label: string; options: string[] }[] = [
    { label: 'Countries', options: catalog.countries },
    { label: 'Departments', options: catalog.departments },
    { label: 'Teams', options: catalog.teams },
    { label: 'Sub teams', options: catalog.subTeams },
    { label: 'Job positions', options: catalog.jobPositions },
  ];

  return (
    <section className="card card-padded stack gap-16">
      <div className="stack gap-4">
        <h2 style={{ fontSize: 15 }}>Field catalog</h2>
        <p className="text-muted text-sm">
          Options shown on the onboarding form. Edit <code>backend/src/config/catalog.js</code> to change these lists.
        </p>
      </div>

      <div className="form-grid">
        {sections.map((section) => (
          <div key={section.label} className="stack gap-8">
            <span className="field-label">{section.label}</span>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {section.options.map((option) => (
                <span key={option} className="chip chip-neutral">
                  {option}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
