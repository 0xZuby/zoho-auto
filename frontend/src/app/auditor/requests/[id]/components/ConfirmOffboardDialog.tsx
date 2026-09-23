'use client';

interface ConfirmOffboardDialogProps {
  employeeName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function ConfirmOffboardDialog({ employeeName, onCancel, onConfirm, isSubmitting }: ConfirmOffboardDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-offboard-title"
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
        <h2 id="confirm-offboard-title" style={{ fontSize: 18 }}>
          Offboard {employeeName}?
        </h2>
        <p className="text-muted text-sm">
          This immediately disables {employeeName}&rsquo;s Zoho Mail account and revokes their InsideMaps access.
          There&rsquo;s no separate review step — it takes effect as soon as you confirm.
        </p>

        <div className="row-between">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Offboarding…' : 'Offboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
