'use client';

import { useEffect, useState } from 'react';
import { getZohoIntegrationStatus, type ZohoIntegrationStatus } from '@/lib/admin-api';

export function ZohoIntegrationCard() {
  const [status, setStatus] = useState<ZohoIntegrationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getZohoIntegrationStatus()
      .then(setStatus)
      .catch(() => setError('Could not load Zoho integration status.'));
  }, []);

  return (
    <section className="card card-padded stack gap-16">
      <h2 style={{ fontSize: 15 }}>Zoho integration</h2>

      {error && <div className="notice notice-error">{error}</div>}

      {!status && !error && <div className="skeleton" style={{ height: 72 }} />}

      {status && (
        <>
          <dl className="definition-list">
            <div>
              <dt>Mode</dt>
              <dd>
                <span className={`chip ${status.mode === 'live' ? 'chip-success' : 'chip-info'}`}>
                  {status.mode === 'live' ? 'Live' : 'Simulated'}
                </span>
              </dd>
            </div>
            <div>
              <dt>Data center</dt>
              <dd>zoho.{status.dataCenter}</dd>
            </div>
            <div>
              <dt>Organization configured</dt>
              <dd>{status.organizationConfigured ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
          {status.mode === 'simulated' && (
            <div className="notice notice-info">
              Provisioning actions run against a simulated Zoho client. Set ZOHO_MODE=live and the ZOHO_* credentials
              in backend/.env to provision real accounts.
            </div>
          )}
        </>
      )}
    </section>
  );
}
