'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listEmployeeDirectory } from '@/lib/auditor-api';
import type { EmployeeMasterRow } from '@/lib/types';
import { Placeholder } from '../../components/Placeholder';
import { SearchIcon } from '../../components/icons';

export default function AllEmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeMasterRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    listEmployeeDirectory()
      .then((result) => {
        if (isMounted) setEmployees(result);
      })
      .catch(() => {
        if (isMounted) setLoadError('Could not load employees. Refresh the page to try again.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleEmployees = useMemo(() => {
    if (!employees) return null;
    const needle = query.trim().toLowerCase();
    if (!needle) return employees;
    return employees.filter((emp) => {
      const hay = [
        emp.name,
        emp.emailAddress,
        emp.emailSplit,
        emp.costCenter,
        emp.department,
        emp.team,
        emp.subTeam,
        emp.jobPosition,
        emp.tlManager,
        emp.departmentLead,
        emp.companyEmail,
        emp.github,
        emp.role,
        emp.actualRoles,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [employees, query]);

  return (
    <main className="ops-main">
      <div className="ops-intro">
        <div>
          <h1>All employees</h1>
          <p>Master employee directory showing placement, accounts, and Zoho / InsideMaps roles.</p>
        </div>
      </div>

      {loadError && <div className="notice notice-error">{loadError}</div>}

      {!visibleEmployees ? (
        <Placeholder height={300} label="Loading directory" />
      ) : (
        <section className="queue-panel">
          <header className="queue-heading">
            <div>
              <h2>Master directory</h2>
              <p>
                {visibleEmployees.length === employees?.length
                  ? `${visibleEmployees.length} total`
                  : `${visibleEmployees.length} of ${employees?.length ?? 0}`}
              </p>
            </div>

            {(employees?.length ?? 0) > 0 && (
              <div className="queue-toolbar">
                <div className="queue-search">
                  <SearchIcon />
                  <label className="sr-only" htmlFor="employee-master-search">
                    Search employees
                  </label>
                  <input
                    id="employee-master-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Name, email, department, role…"
                  />
                </div>
              </div>
            )}
          </header>

          {visibleEmployees.length === 0 ? (
            <p className="queue-empty">No employees found.</p>
          ) : (
            <div className="queue-scroll">
              <table className="queue-table master-sheet-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email address</th>
                    <th scope="col">Email split</th>
                    <th scope="col">Cost Center</th>
                    <th scope="col">Department</th>
                    <th scope="col">TEAM</th>
                    <th scope="col">Sub-Team</th>
                    <th scope="col">Job position</th>
                    <th scope="col">TL/Manager</th>
                    <th scope="col">Department lead</th>
                    <th scope="col">Name</th>
                    <th scope="col">company email</th>
                    <th scope="col">github</th>
                    <th scope="col">Active</th>
                    <th scope="col">role</th>
                    <th scope="col">actual roles</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEmployees.map((emp) => {
                    const openRequest = () => router.push(`/auditor/requests/${emp.id}`);
                    return (
                      <tr
                        key={emp.id}
                        onClick={openRequest}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openRequest();
                          }
                        }}
                        tabIndex={0}
                        aria-label={`Open employee record for ${emp.name}`}
                      >
                        <td className="queue-name">{emp.name || '—'}</td>
                        <td className="queue-code">{emp.emailAddress || '—'}</td>
                        <td className="queue-code">{emp.emailSplit || '—'}</td>
                        <td>{emp.costCenter || '—'}</td>
                        <td>{emp.department || '—'}</td>
                        <td>{emp.team || '—'}</td>
                        <td>{emp.subTeam || '—'}</td>
                        <td>{emp.jobPosition || '—'}</td>
                        <td className="queue-code">{emp.tlManager || '—'}</td>
                        <td className="queue-code">{emp.departmentLead || '—'}</td>
                        <td className="queue-name">{emp.name || '—'}</td>
                        <td className="queue-code">{emp.companyEmail || '—'}</td>
                        <td className="queue-code">{emp.github || '—'}</td>
                        <td>{emp.active ? 'Yes' : 'No'}</td>
                        <td>{emp.role || '—'}</td>
                        <td className="queue-code">{emp.actualRoles || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
