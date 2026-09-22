'use client';

import { useState } from 'react';
import { searchEmployees } from '@/lib/form-api';
import { ApiError } from '@/lib/api-client';
import type { EmployeeDirectoryEntry } from '@/lib/types';

interface EmployeeSearchStageProps {
  title: string;
  description: string;
  selected: EmployeeDirectoryEntry | null;
  onSelect: (employee: EmployeeDirectoryEntry) => void;
}

/**
 * Shared "find the existing employee" step for Leaving company and Update
 * employee info requests (PRD: HR searches by private/work email, selects
 * the employee). Reused by both flows since the search behavior is
 * identical; only what happens after selection differs.
 */
export function EmployeeSearchStage({ title, description, selected, onSelect }: EmployeeSearchStageProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EmployeeDirectoryEntry[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function runSearch() {
    setIsSearching(true);
    setSearchError(null);
    try {
      const found = await searchEmployees(query);
      setResults(found);
    } catch (error) {
      setSearchError(error instanceof ApiError ? error.message : 'Could not search employees. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="stack gap-24">
      <div className="stack gap-4">
        <h2 style={{ fontSize: 19 }}>{title}</h2>
        <p className="text-muted text-sm">{description}</p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="employee-search-query">
          Private email or work (Zoho) email
        </label>
        <div className="row-between" style={{ gap: 8 }}>
          <input
            id="employee-search-query"
            className="input"
            placeholder="jane.doe@gmail.com or jane.doe@insidemaps.com"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
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

      {results && (
        <div className="card card-padded stack gap-8">
          <h3 style={{ fontSize: 14 }}>{results.length === 0 ? 'No employees found' : `${results.length} employee${results.length === 1 ? '' : 's'} found`}</h3>
          {results.map((employee) => {
            const isSelected = selected?.id === employee.id;
            return (
              <button
                type="button"
                key={employee.id}
                className={`radio-option${isSelected ? ' selected' : ''}`}
                style={{ width: '100%', justifyContent: 'space-between', textAlign: 'left' }}
                onClick={() => onSelect(employee)}
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
        <div className="notice notice-info">
          Selected: <strong>{selected.nameAndSurname}</strong> ({selected.privateEmail})
        </div>
      )}
    </div>
  );
}
