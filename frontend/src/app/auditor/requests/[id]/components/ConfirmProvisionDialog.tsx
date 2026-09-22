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
          Create Zoho user?
        </h2>

        <dl className="definition-list" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <dt>Employee</dt>
            <dd>{employeeName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{resolvedAccount.corporateEmail}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{resolvedAccount.role}</dd>
          </div>
          <div>
            <dt>Groups</dt>
            <dd>{resolvedAccount.groups.join(', ')}</dd>
          </div>
        </dl>

        <div className="row-between">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create user'}
          </button>
        </div>
      </div>
    </div>
  );
}
