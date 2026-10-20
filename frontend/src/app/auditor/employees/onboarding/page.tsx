'use client';

import { useEffect, useMemo, useState } from 'react';
import { batchProvisionRequests, listRequests } from '@/lib/auditor-api';
import { ApiError } from '@/lib/api-client';
import type { RequestSummary } from '@/lib/types';
import { RequestQueueTable } from '../../components/RequestQueueTable';
import { Placeholder } from '../../components/Placeholder';

export default function OnboardingRequestsPage() {
  const [requests, setRequests] = useState<RequestSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  async function refresh() {
    try {
      const result = await listRequests();
      const supersededIds = new Set(result.map((r) => r.previousRequestId).filter(Boolean));
      const ONBOARDED_OR_CLOSED = new Set([
        'COMPLETED',
        'NOTIFICATION_SENT',
        'ACCOUNT_CREATED',
        'REJECTED',
        'CANCELLED',
        'ACCESS_REVOKED',
      ]);
      setRequests(
        result.filter(
          (request) =>
            !supersededIds.has(request.id)
            && request.requestType === 'NEW_HIRE'
            && !ONBOARDED_OR_CLOSED.has(request.status),
        ),
      );
    } catch {
      setLoadError('Could not load onboarding requests. Refresh the page to try again.');
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const readyRequests = useMemo(
    () => (requests ?? []).filter((r) => r.status === 'APPROVED' || r.status === 'PROVISIONING_FAILED' || r.status === 'PARTIALLY_PROVISIONED'),
    [requests],
  );

  function toggleSelection(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function selectAllReady() {
    if (selectedIds.length === readyRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(readyRequests.map((r) => r.id));
    }
  }

  async function handleRunBatch() {
    if (selectedIds.length === 0) return;
    setIsBatchRunning(true);
    setBatchMessage(null);
    setLoadError(null);
    try {
      const response = await batchProvisionRequests(selectedIds);
      const succeeded = response.results.filter((r) => r.ok && !r.failure).length;
      const failed = response.results.length - succeeded;
      setBatchMessage(
        `Processed ${response.processed} request(s): ${succeeded} succeeded${failed > 0 ? `, ${failed} stopped in Exception Queue` : ''}.`,
      );
      setSelectedIds([]);
      await refresh();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Batch provisioning failed.');
    } finally {
      setIsBatchRunning(false);
    }
  }

  return (
    <main className="ops-main">
      <div className="ops-intro">
        <div>
          <h1>Onboarding</h1>
          <p>New hires waiting on account setup, in the order HR submitted them.</p>
        </div>
      </div>

      {loadError && <div className="notice notice-error">{loadError}</div>}
      {batchMessage && <div className="notice notice-success">{batchMessage}</div>}

      {readyRequests.length > 0 && (
        <section className="card card-padded stack gap-12">
          <div className="row-between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div className="stack gap-4">
              <h2 style={{ fontSize: 15, margin: 0 }}>Batch provisioning (Epic 3)</h2>
              <p className="text-muted text-sm" style={{ margin: 0 }}>
                Process one or 20+ approved requests without building CSVs. Each request runs its own Zoho Mail /
                InsideMaps API lifecycle steps and error handling.
              </p>
            </div>
            <div className="row-between" style={{ gap: 8 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={selectAllReady}>
                {selectedIds.length === readyRequests.length ? 'Clear selection' : `Select all ready (${readyRequests.length})`}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={selectedIds.length === 0 || isBatchRunning}
                onClick={handleRunBatch}
              >
                {isBatchRunning ? 'Running batch…' : `Provision selected (${selectedIds.length})`}
              </button>
            </div>
          </div>

          <div className="chip-list">
            {readyRequests.map((req) => {
              const checked = selectedIds.includes(req.id);
              return (
                <label
                  key={req.id}
                  className={`chip-check${checked ? ' selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelection(req.id)}
                  />
                  <span>
                    {req.nameAndSurname} ({req.requestCode} · {req.accountType || 'ZOHO'})
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {requests ? (
        <RequestQueueTable
          requests={requests}
          title="New hire requests"
          emptyMessage="No new hire requests right now."
        />
      ) : (
        <Placeholder height={300} label="Loading queue" />
      )}
    </main>
  );
}
