'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createAuditor, listAuditors } from '@/lib/admin-api';
import type { AuthUser, UserRole } from '@/lib/types';
import { ApiError } from '@/lib/api-client';

export function AuditorsCard() {
  const [auditors, setAuditors] = useState<AuthUser[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('AUDITOR');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function refresh() {
    listAuditors()
      .then(setAuditors)
      .catch(() => setLoadError('Could not load auditor accounts.'));
  }

  useEffect(refresh, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);
    try {
      await createAuditor({ name, email, password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole('AUDITOR');
      refresh();
    } catch (error) {
      if (error instanceof ApiError && error.payload.errors) {
        setFormErrors(error.payload.errors);
      } else {
        setFormErrors({ _form: error instanceof ApiError ? error.message : 'Could not create the account.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card card-padded stack gap-20">
      <h2 style={{ fontSize: 15 }}>Auditor & administrator accounts</h2>

      {loadError && <div className="notice notice-error">{loadError}</div>}

      {auditors ? (
        <ul className="stack gap-8" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {auditors.map((auditor) => (
            <li key={auditor.id} className="row-between text-sm" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span>
                {auditor.name} <span className="text-faint">— {auditor.email}</span>
              </span>
              <span className="chip chip-neutral">{auditor.role}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="skeleton" style={{ height: 60 }} />
      )}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label" htmlFor="new-auditor-name">
            Name
          </label>
          <input id="new-auditor-name" className={`input${formErrors.name ? ' has-error' : ''}`} value={name} onChange={(event) => setName(event.target.value)} required />
          {formErrors.name && <span className="field-error">{formErrors.name}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="new-auditor-email">
            Email
          </label>
          <input id="new-auditor-email" className={`input${formErrors.email ? ' has-error' : ''}`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          {formErrors.email && <span className="field-error">{formErrors.email}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="new-auditor-password">
            Temporary password
          </label>
          <input
            id="new-auditor-password"
            className={`input${formErrors.password ? ' has-error' : ''}`}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          {formErrors.password && <span className="field-error">{formErrors.password}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="new-auditor-role">
            Role
          </label>
          <select id="new-auditor-role" className="select" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            <option value="AUDITOR">Auditor</option>
            <option value="ADMINISTRATOR">Administrator</option>
          </select>
        </div>

        {formErrors._form && (
          <div className="notice notice-error span-2">{formErrors._form}</div>
        )}

        <div className="span-2">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </form>
    </section>
  );
}
