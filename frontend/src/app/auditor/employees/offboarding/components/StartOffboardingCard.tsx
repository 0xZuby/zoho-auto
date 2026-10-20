'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchEmployees, offboardEmployee } from '@/lib/auditor-api';
import { ApiError } from '@/lib/api-client';
import type { EmployeeDirectoryEntry } from '@/lib/types';
import { ConfirmOffboardDialog } from '../../../requests/[id]/components/ConfirmOffboardDialog';

/**
 * The primary way to start offboarding: type the employee's work (or
 * personal) email, pick them from the matches, and confirm. There's no
 * separate "choose an account type / role / groups" review afterward —
 * confirming immediately disables Zoho Mail and revokes InsideMaps access.
 */
export function StartOffboardingCard() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EmployeeDirectoryEntry[] | null>(null);
  const [selected, setSelected] = useState<EmployeeDirectoryEntry | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isOffboarding, setIsOffboarding] = useState(false);
  const [offboardError, setOffboardError] = useState<string | null>(null);
  const [effectiveLeaveDate, setEffectiveLeaveDate] = useState('');
  const [effectiveLeaveTimezone, setEffectiveLeaveTimezone] = useState('UTC');
  const [leavingReason, setLeavingReason] = useState('');

  async function runSearch() {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setSelected(null);
    try {
      const found = await searchEmployees(query);
      setResults(found);
    } catch (error) {
      setSearchError(error instanceof ApiError ? error.message : 'Could not search employees. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleOffboard() {
    if (!selected) return;
    setIsOffboarding(true);
    setOffboardError(null);
    try {
      const offboardingRequest = await offboardEmployee(selected.id, {
        effectiveLeaveDate: effectiveLeaveDate || undefined,
        effectiveLeaveTimezone: effectiveLeaveTimezone || 'UTC',
        leavingReason: leavingReason.trim() || undefined,
      });
      router.push(`/auditor/requests/${offboardingRequest.id}`);
    } catch (error) {
      setOffboardError(error instanceof ApiError ? error.message : 'Could not offboard this employee.');
      setIsOffboarding(false);
      setShowConfirm(false);
    }
  }

  return (
    <section className="card card-padded stack gap-16">
      <div className="stack gap-4">
        <h2 style={{ fontSize: 15 }}>Offboard by work email</h2>
        <p className="card-section-intro">
          Find the employee, then confirm — offboarding immediately disables their Zoho Mail account and revokes their
          InsideMaps access in one step.
        </p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="offboard-search-query">
          Work or personal email
        </label>
        <div className="row-between" style={{ gap: 8 }}>
          <input
            id="offboard-search-query"
            className="input"
            placeholder="jane.doe@insidemaps.com"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelected(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') runSearch();
            }}
          />
          <button type="button" className="btn btn-secondary" onClick={runSearch} disabled={isSearching}>
            {isSearching ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>

      {searchError && <div className="notice notice-error">{searchError}</div>}
      {offboardError && <div className="notice notice-error">{offboardError}</div>}

      {results && (
        <div className="stack gap-8">
          <h3 style={{ fontSize: 13, margin: 0 }} className="text-faint">
            {results.length === 0
              ? 'No matching employees'
              : `${results.length} employee${results.length === 1 ? '' : 's'} found`}
          </h3>
          {results.map((employee) => {
            const isSelected = selected?.id === employee.id;
            return (
              <button
                type="button"
                key={employee.id}
                className={`radio-option${isSelected ? ' selected' : ''}`}
                style={{ width: '100%', justifyContent: 'space-between', textAlign: 'left' }}
                onClick={() => setSelected(employee)}
              >
                <span>
                  <strong>{employee.nameAndSurname}</strong>
                  <br />
                  <span className="text-muted text-sm">
                    {employee.privateEmail}
                    {employee.corporateEmail ? ` · ${employee.corporateEmail}` : ''} · {employee.department}
                  </span>
                </span>
                {isSelected && <span aria-hidden>✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="stack gap-12">
          <div className="field-row">
            <div className="field">
              <label className="field-label" htmlFor="effective-leave-date">
                Effective leave date (leave blank to block access immediately)
              </label>
              <input
                id="effective-leave-date"
                type="date"
                className="input"
                value={effectiveLeaveDate}
                onChange={(e) => setEffectiveLeaveDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="effective-leave-tz">
                Effective timezone
              </label>
              <select
                id="effective-leave-tz"
                className="select"
                value={effectiveLeaveTimezone}
                onChange={(e) => setEffectiveLeaveTimezone(e.target.value)}
              >
                <option value="UTC">UTC (17:00 effective cutoff)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                <option value="America/New_York">America/New_York (ET)</option>
                <option value="Europe/Belgrade">Europe/Belgrade (CET)</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="leaving-reason">
              Reason / handover note (optional)
            </label>
            <input
              id="leaving-reason"
              className="input"
              placeholder="End of contract, voluntary resignation, etc."
              value={leavingReason}
              onChange={(e) => setLeavingReason(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-danger"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => setShowConfirm(true)}
          >
            {effectiveLeaveDate ? `Schedule or run offboarding for ${selected.nameAndSurname}` : `Offboard ${selected.nameAndSurname} now`}
          </button>
        </div>
      )}

      {showConfirm && selected && (
        <ConfirmOffboardDialog
          employeeName={selected.nameAndSurname}
          isSubmitting={isOffboarding}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleOffboard}
        />
      )}
    </section>
  );
}
