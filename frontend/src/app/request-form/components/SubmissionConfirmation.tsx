'use client';

import Link from 'next/link';

interface SubmissionConfirmationProps {
  requestCode?: string;
  title?: string;
  message?: string;
}

export function SubmissionConfirmation({
  requestCode,
  title = 'Information submitted',
  message = 'Thank you. Your onboarding information has been successfully submitted. Your account information will be sent to the employee after the request has been processed.',
}: SubmissionConfirmationProps) {
  return (
    <div className="stack gap-20" style={{ textAlign: 'center', alignItems: 'center' }}>
      <div
        aria-hidden
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--accent-soft)',
          color: 'var(--accent-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}
      >
        ✓
      </div>
      <div className="stack gap-6" style={{ alignItems: 'center' }}>
        <h2 style={{ fontSize: 20 }}>{title}</h2>
        <p className="text-muted text-sm" style={{ maxWidth: 360 }}>
          {message}
        </p>
      </div>
      {requestCode && (
        <div className="chip chip-neutral" style={{ fontFamily: 'monospace', fontSize: 13 }}>
          {requestCode}
        </div>
      )}
      <Link href="/" className="btn btn-secondary">
        Return to home
      </Link>
    </div>
  );
}
