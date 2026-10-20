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
                  {status.connected ? 'Connected' : status.mode === 'live' ? 'Live' : 'Simulated'}
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
          {!status.setupReady && (
            <div className="notice notice-info">
              Add the Zoho OAuth client details, organization ID, callback URL, and token encryption key to the API environment first.
            </div>
          )}
          <p className="text-sm text-muted">
            {status.connected
              ? 'Zoho Mail authorization is saved. Provisioning calls use this connection.'
              : 'Connect the authorized Zoho organization account to enable live mailbox provisioning.'}
          </p>
          {status.setupReady ? (
            <a className="btn btn-primary" href="/api/admin/zoho/connect">
              {status.connected ? 'Reconnect Zoho Mail' : 'Connect Zoho Mail'}
            </a>
          ) : (
            <button type="button" className="btn btn-primary" disabled>
              Connect Zoho Mail
            </button>
          )}
        </>
      )}
    </section>
  );
}
