import type { WorkflowStatus } from '@/lib/types';

/**
 * Semantic tone for a workflow status.
 *
 * `tone` drives the queue's status spine and figure colours, and is
 * deliberately coarser than the status list itself: an auditor scanning the
 * queue needs to know "is this waiting on me / moving / stuck / done",
 * not fourteen distinct colours.
 *
 * `chipClassName` is retained for the request detail header, which still
 * renders the older pill treatment.
 */
export type StatusTone = 'new' | 'progress' | 'alert' | 'done' | 'idle';

interface StatusPresentation {
  label: string;
  tone: StatusTone;
  chipClassName: string;
}

const STATUS_PRESENTATION: Record<WorkflowStatus, StatusPresentation> = {
  INVITED: { label: 'Invited', tone: 'idle', chipClassName: 'chip-neutral' },
  FORM_OPENED: { label: 'Form opened', tone: 'idle', chipClassName: 'chip-neutral' },
  SUBMITTED: { label: 'Submitted', tone: 'new', chipClassName: 'chip-info' },
  PENDING_REVIEW: { label: 'New', tone: 'new', chipClassName: 'chip-info' },
  APPROVED: { label: 'Approved', tone: 'progress', chipClassName: 'chip-info' },
  PROVISIONING: { label: 'Provisioning', tone: 'progress', chipClassName: 'chip-warning' },
  ACCOUNT_CREATED: { label: 'Account created', tone: 'progress', chipClassName: 'chip-success' },
  NOTIFICATION_SENT: { label: 'Notified', tone: 'done', chipClassName: 'chip-success' },
  COMPLETED: { label: 'Completed', tone: 'done', chipClassName: 'chip-success' },
  REJECTED: { label: 'Rejected', tone: 'idle', chipClassName: 'chip-danger' },
  RETURNED: { label: 'Returned', tone: 'alert', chipClassName: 'chip-warning' },
  PROVISIONING_FAILED: { label: 'Failed', tone: 'alert', chipClassName: 'chip-danger' },
  PARTIALLY_PROVISIONED: { label: 'Partial', tone: 'alert', chipClassName: 'chip-danger' },
  CANCELLED: { label: 'Cancelled', tone: 'idle', chipClassName: 'chip-neutral' },
};

export function getStatusPresentation(status: WorkflowStatus): StatusPresentation {
  return STATUS_PRESENTATION[status];
}

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  NEW_HIRE: 'New hire',
  LEAVING_COMPANY: 'Leaving company',
  UPDATE_EMPLOYEE_INFO: 'Info update',
};

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Compact date for dense table rows, e.g. "18 Sep 22:41". */
export function formatCompactDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
