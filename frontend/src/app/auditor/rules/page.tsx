'use client';

import { useEffect, useState } from 'react';
import {
  createAuditor,
  getAdminCatalog,
  getProvisioningRules,
  getZohoIntegrationStatus,
  listAuditors,
  updateProvisioningRules,
  type ZohoIntegrationStatus,
} from '@/lib/admin-api';
import { ApiError } from '@/lib/api-client';
import type {
  AccountType,
  AuthUser,
  FormCatalog,
  PositionMappingRule,
  ProvisioningRulesConfig,
  UserRole,
} from '@/lib/types';

export default function ProvisioningRulesPage() {
  const [rules, setRules] = useState<ProvisioningRulesConfig | null>(null);
  const [catalog, setCatalog] = useState<FormCatalog | null>(null);
  const [integration, setIntegration] = useState<ZohoIntegrationStatus | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [savingRules, setSavingRules] = useState(false);

  // Editable rules state
  const [defaultDomain, setDefaultDomain] = useState('insidemaps.com');
  const [operationsDomain, setOperationsDomain] = useState('services.insidemaps.com');
  const [operationsTeamsInput, setOperationsTeamsInput] = useState('Operations');
  const [mappings, setMappings] = useState<PositionMappingRule[]>([]);

  // New position mapping inputs
  const [newPosition, setNewPosition] = useState('');
  const [newAccountType, setNewAccountType] = useState<AccountType>('ZOHO');
  const [newRole, setNewRole] = useState('Member');
  const [newImRoles, setNewImRoles] = useState('IM_DEFAULT_USER');

  // New user form
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('HR');
  const [creatingUser, setCreatingUser] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [rulesData, catalogData, integrationData, usersData] = await Promise.all([
        getProvisioningRules(),
        getAdminCatalog(),
        getZohoIntegrationStatus(),
        listAuditors().catch(() => [] as AuthUser[]),
      ]);
      setRules(rulesData);
      setCatalog(catalogData);
      setIntegration(integrationData);
      setUsers(usersData);

      setDefaultDomain(rulesData.domainRule.defaultDomain);
      setOperationsDomain(rulesData.domainRule.operationsDomain);
      setOperationsTeamsInput(rulesData.domainRule.operationsTeams.join(', '));
      setMappings(rulesData.positionMappings);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load provisioning rules.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function updateMapping(index: number, patch: Partial<PositionMappingRule>) {
    setMappings((current) => current.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
    setSavedNotice(null);
  }

  function handleAddMapping() {
    const trimmed = newPosition.trim();
    if (!trimmed) return;
    if (mappings.some((m) => m.position.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Position "${trimmed}" already has a mapping.`);
      return;
    }
    setMappings((current) => [
      ...current,
      {
        position: trimmed,
        accountType: newAccountType,
        role: newRole.trim() || 'Member',
        insideMapsRoles: newImRoles
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        active: true,
      },
    ]);
    setNewPosition('');
    setSavedNotice(null);
  }

  async function handleSaveRules() {
    setSavingRules(true);
    setError(null);
    setSavedNotice(null);
    try {
      const updated = await updateProvisioningRules({
        domainRule: {
          defaultDomain: defaultDomain.trim() || 'insidemaps.com',
          operationsDomain: operationsDomain.trim() || 'services.insidemaps.com',
          operationsTeams: operationsTeamsInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
        positionMappings: mappings,
      });
      setRules(updated);
      setMappings(updated.positionMappings);
      setSavedNotice(`Saved rules v${updated.version}. Future intake requests will use these mappings.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save rules. Administrator role is required.');
    } finally {
      setSavingRules(false);
    }
  }

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    setCreatingUser(true);
    setError(null);
    try {
      const created = await createAuditor({
        name: userName,
        email: userEmail,
        password: userPassword,
        role: userRole,
      });
      setUsers((current) => [...current, created]);
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setSavedNotice(`Created ${created.role} account for ${created.email}.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create user.');
    } finally {
      setCreatingUser(false);
    }
  }

  if (loading) {
    return (
      <div className="ops-page stack gap-24">
        <div className="card card-padded text-muted">Loading provisioning rules…</div>
      </div>
    );
  }

  return (
    <div className="ops-page stack gap-24">
      <header className="ops-page-header">
        <div>
          <p className="ops-eyebrow">Centrally managed rules (Epic 2)</p>
          <h1>Provisioning rules &amp; integrations</h1>
        </div>
        <p className="ops-page-meta">
          Configure company email domain rules, approved position → account-type mappings (Zoho Mail vs InsideMaps API),
          and authorized portal submitters/admins.
        </p>
      </header>

      {savedNotice && <div className="notice notice-success">{savedNotice}</div>}
      {error && <div className="notice notice-error">{error}</div>}

      {/* 1. Email domain rules */}
      <section className="card card-padded stack gap-16">
        <div className="row-between">
          <div className="stack gap-4">
            <h2 style={{ fontSize: 16 }}>Company email domain rule</h2>
            <p className="text-muted text-sm">
              Normalized <code>first.last@domain</code> addresses are generated automatically. Collisions append the next
              available number starting at <code>2</code> (e.g. <code>first.last2@domain</code>).
            </p>
          </div>
          {rules && <span className="chip chip-info">Rules v{rules.version}</span>}
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="default-domain">
              Default corporate domain
            </label>
            <input
              id="default-domain"
              className="input"
              value={defaultDomain}
              onChange={(e) => setDefaultDomain(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ops-domain">
              Operations team domain
            </label>
            <input
              id="ops-domain"
              className="input"
              value={operationsDomain}
              onChange={(e) => setOperationsDomain(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="ops-teams">
            Teams routed to Operations domain (comma-separated)
          </label>
          <input
            id="ops-teams"
            className="input"
            value={operationsTeamsInput}
            onChange={(e) => setOperationsTeamsInput(e.target.value)}
          />
          <span className="field-hint">
            Requests whose department or team matches this list receive <code>@{operationsDomain}</code>; all others
            receive <code>@{defaultDomain}</code>.
          </span>
        </div>
      </section>

      {/* 2. Position -> Account Type Mappings */}
      <section className="card card-padded stack gap-16">
        <div className="stack gap-4">
          <h2 style={{ fontSize: 16 }}>Position → Account type &amp; role mappings</h2>
          <p className="text-muted text-sm">
            Every active position maps to either a Zoho Mail account or an InsideMaps account (provisioned via InsideMaps
            APIs). Unknown or inactive positions are flagged and routed to the Exception Queue.
          </p>
        </div>

        <div className="ops-table-wrap">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Job position</th>
                <th>Account type</th>
                <th>Zoho Directory role</th>
                <th>Default InsideMaps API roles</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping, idx) => (
                <tr key={mapping.position}>
                  <td style={{ fontWeight: 600 }}>{mapping.position}</td>
                  <td>
                    <select
                      className="select"
                      value={mapping.accountType}
                      onChange={(e) => updateMapping(idx, { accountType: e.target.value as AccountType })}
                    >
                      <option value="ZOHO">ZOHO (Zoho Mail)</option>
                      <option value="INSIDEMAPS">INSIDEMAPS (InsideMaps API)</option>
                      <option value="ZOHO_AND_INSIDEMAPS">ZOHO_AND_INSIDEMAPS (Mail + InsideMaps)</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="select"
                      value={mapping.role}
                      onChange={(e) => updateMapping(idx, { role: e.target.value })}
                    >
                      {(catalog?.roles ?? ['Member', 'Team Lead', 'Manager', 'Directory Admin']).map((roleOption) => (
                        <option key={roleOption} value={roleOption}>
                          {roleOption}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="input"
                      value={(mapping.insideMapsRoles ?? []).join(', ')}
                      onChange={(e) =>
                        updateMapping(idx, {
                          insideMapsRoles: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="IM_DEFAULT_USER"
                    />
                  </td>
                  <td>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={mapping.active !== false}
                        onChange={(e) => updateMapping(idx, { active: e.target.checked })}
                      />
                      {mapping.active !== false ? 'Active' : 'Blocked'}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card card-padded stack gap-12" style={{ background: '#fbfaf9' }}>
          <h3 style={{ fontSize: 14, margin: 0 }}>Add approved position mapping</h3>
          <div className="field-row">
            <input
              className="input"
              placeholder="Job position title (e.g. Data Analyst)"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
            />
            <select
              className="select"
              value={newAccountType}
              onChange={(e) => setNewAccountType(e.target.value as AccountType)}
            >
              <option value="ZOHO">ZOHO (Zoho Mail)</option>
              <option value="INSIDEMAPS">INSIDEMAPS (InsideMaps API)</option>
              <option value="ZOHO_AND_INSIDEMAPS">ZOHO_AND_INSIDEMAPS (Mail + InsideMaps)</option>
            </select>
            <input
              className="input"
              placeholder="InsideMaps roles (comma-separated)"
              value={newImRoles}
              onChange={(e) => setNewImRoles(e.target.value)}
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddMapping}>
              Add position
            </button>
          </div>
        </div>

        <div className="row-between">
          <span className="text-xs text-muted">
            {rules?.updatedAt ? `Last updated ${new Date(rules.updatedAt).toLocaleString()}` : 'Using default rules'}
          </span>
          <button type="button" className="btn btn-primary" onClick={handleSaveRules} disabled={savingRules}>
            {savingRules ? 'Saving rules…' : 'Save provisioning rules'}
          </button>
        </div>
      </section>

      {/* 3. Integration status */}
      {integration && (
        <section className="card card-padded stack gap-12">
          <h2 style={{ fontSize: 16 }}>Integration status (Zoho Directory &amp; InsideMaps API)</h2>
          <div className="field-row">
            <div className="card card-padded stack gap-4">
              <div className="row-between">
                <strong>Zoho Directory / Mail</strong>
                <span className={`chip ${integration.mode === 'live' ? 'chip-success' : 'chip-info'}`}>
                  {integration.mode.toUpperCase()} MODE
                </span>
              </div>
              <span className="text-sm text-muted">
                Data center: <code>zoho.{integration.dataCenter}</code> · Credentials configured:{' '}
                {integration.organizationConfigured ? 'Yes' : 'Simulated adapter'}
              </span>
            </div>
            <div className="card card-padded stack gap-4">
              <div className="row-between">
                <strong>InsideMaps API</strong>
                <span className={`chip ${integration.insideMapsMode === 'live' ? 'chip-success' : 'chip-info'}`}>
                  {(integration.insideMapsMode ?? 'simulated').toUpperCase()} MODE
                </span>
              </div>
              <span className="text-sm text-muted">
                Operations: <code>createUser</code>, <code>assignRole</code>, <code>enforceSecurityPolicy</code>,{' '}
                <code>removeRoles</code>, <code>deleteUser</code>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 4. Authorized Submitters & Portal Accounts */}
      <section className="card card-padded stack gap-16">
        <div className="stack gap-4">
          <h2 style={{ fontSize: 16 }}>Authorized HR submitters, Auditors &amp; Administrators</h2>
          <p className="text-muted text-sm">
            Phase 1 requires authenticated submitters and admins. Manage allowlisted HR, Auditor, and Administrator
            accounts below.
          </p>
        </div>

        {users.length > 0 && (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="chip chip-info">{u.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="stack gap-12">
          <h3 style={{ fontSize: 14, margin: 0 }}>Add authorized portal user</h3>
          <div className="field-row">
            <input
              className="input"
              placeholder="Full name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Initial password (min 8 chars)"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
            />
            <select className="select" value={userRole} onChange={(e) => setUserRole(e.target.value as UserRole)}>
              <option value="HR">HR Submitter</option>
              <option value="AUDITOR">Auditor</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
            <button type="submit" className="btn btn-secondary" disabled={creatingUser}>
              {creatingUser ? 'Adding…' : 'Add user'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
