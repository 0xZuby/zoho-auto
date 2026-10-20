'use client';

import type { ResolvedAccount } from '@/lib/types';

interface ConfirmProvisionDialogProps {
  employeeName: string;
  resolvedAccount: ResolvedAccount;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ConfirmProvisionDialog({ employeeName, resolvedAccount, onCancel, onConfirm, isSubmitting }: ConfirmProvisionDialogProps) {
  const includesZoho = resolvedAccount.accountType !== 'INSIDEMAPS';
  const includesInsideMaps = resolvedAccount.accountType !== 'ZOHO';
  const title = includesZoho
    ? includesInsideMaps
      ? 'Create Zoho Mail + InsideMaps?'
      : 'Create Zoho Mail account?'
    : 'Create InsideMaps account?';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-provision-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 20, 25, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 50,
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel();
      }}
    >
      <div className="card card-padded stack gap-20" style={{ maxWidth: 420, width: '100%' }}>
        <h2 id="confirm-provision-title" style={{ fontSize: 18 }}>
          {title}
        </h2>

        {includesZoho && (
          <p className="text-muted text-sm">
            The mailbox is created immediately (no invitation). A temporary password is emailed to the employee&apos;s
            private address.
          </p>
        )}

        <dl className="definition-list" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <dt>Employee</dt>
            <dd>{employeeName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{resolvedAccount.corporateEmail}</dd>
          </div>
          {includesInsideMaps && (
            <div>
              <dt>InsideMaps roles</dt>
              <dd>{(resolvedAccount.insideMapsRoles ?? []).join(', ') || '—'}</dd>
            </div>
          )}
        </dl>

        <div className="row-between">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
