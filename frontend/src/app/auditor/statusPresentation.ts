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
  ACCESS_REVOKED: { label: 'Access disabled', tone: 'done', chipClassName: 'chip-success' },
  SCHEDULED_OFFBOARDING: { label: 'Scheduled leave', tone: 'progress', chipClassName: 'chip-info' },
  REJECTED: { label: 'Rejected', tone: 'idle', chipClassName: 'chip-danger' },
  RETURNED: { label: 'Returned', tone: 'alert', chipClassName: 'chip-warning' },
  PROVISIONING_FAILED: { label: 'Failed', tone: 'alert', chipClassName: 'chip-danger' },
  PARTIALLY_PROVISIONED: { label: 'Partial', tone: 'alert', chipClassName: 'chip-danger' },
  CANCELLED: { label: 'Cancelled', tone: 'idle', chipClassName: 'chip-neutral' },
};

export function getStatusPresentation(status: WorkflowStatus): StatusPresentation {
  return STATUS_PRESENTATION[status] ?? { label: status, tone: 'idle', chipClassName: 'chip-neutral' };
}

/**
 * Who acts next for a given status (PRD section 16, "Display labels" table).
 * Drives the dashboard queue's "Acts next" column so an auditor can tell at
 * a glance whether a row is waiting on them, on HR, or on the system.
 */
const WHO_ACTS_NEXT: Partial<Record<WorkflowStatus, string>> = {
  PENDING_REVIEW: 'Auditor',
  APPROVED: 'Auditor',
  PROVISIONING: 'System',
  SCHEDULED_OFFBOARDING: 'Scheduled',
  ACCOUNT_CREATED: 'Auditor',
  PARTIALLY_PROVISIONED: 'Auditor',
  PROVISIONING_FAILED: 'Auditor',
  RETURNED: 'HR',
};

export function getWhoActsNext(status: WorkflowStatus): string {
  return WHO_ACTS_NEXT[status] ?? '—';
}

/** Statuses grouped into the dashboard's "Failed" counter/filter (PRD section 8). */
export const FAILED_STATUSES: WorkflowStatus[] = ['PROVISIONING_FAILED', 'PARTIALLY_PROVISIONED'];

/**
 * Statuses that represent active, unfinished work an auditor may need to
 * act on. Backs the Home dashboard's action-first queue, which hides
 * completed/rejected/cancelled requests (those live under "completed this
 * week" instead — PRD section 8).
 */
export const NEEDS_ACTION_STATUSES: WorkflowStatus[] = [
  'PENDING_REVIEW',
  'APPROVED',
  'PROVISIONING',
  'SCHEDULED_OFFBOARDING',
  'PROVISIONING_FAILED',
  'PARTIALLY_PROVISIONED',
  'ACCOUNT_CREATED',
  'RETURNED',
];

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

/** How long a request has been waiting since it was submitted, e.g. "2h", "1d", "3w". */
export function formatWaitingDuration(iso: string): string {
  const elapsedMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(elapsedMs / 60000));
  if (minutes < 60) return `${Math.max(minutes, 1)}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.round(days / 7)}w`;
}

/** Business days (Mon–Fri) between now and a target ISO date, ignoring time of day. */
function businessDaysUntil(iso: string): number {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let businessDays = 0;
  const cursor = new Date(today);
  const direction = target >= today ? 1 : -1;
  while (cursor.getTime() !== target.getTime()) {
    cursor.setDate(cursor.getDate() + direction);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) businessDays += direction;
  }
  return businessDays;
}

/**
 * True when a start date is today or within the next 2 business days (PRD
 * section 8, requirement 4) — drives the ⚑ urgency flag on the dashboard
 * queue. Past-due and unset start dates are not flagged here.
 */
export function isStartDateUrgent(startDate: string): boolean {
  if (!startDate) return false;
  const businessDays = businessDaysUntil(startDate);
  return businessDays >= 0 && businessDays <= 2;
}

/**
 * Urgency ordering for the Home dashboard queue (PRD section 8,
 * requirement 2 + business risk & SLA breach):
 * 1. Active access security risk (offboarded leaver with failed/overdue revocation)
 * 2. Risk score (CRITICAL > HIGH > MEDIUM > LOW + waiting penalty)
 * 3. SLA breach / overdue status
 * 4. Nearest start/leave date, then oldest submitted first
 */
export function compareByUrgency(
  a: {
    status: WorkflowStatus;
    startDate: string;
    submittedAt: string;
    riskScore?: number;
    activeAccessWarning?: boolean;
    isSlaBreached?: boolean;
  },
  b: {
    status: WorkflowStatus;
    startDate: string;
    submittedAt: string;
    riskScore?: number;
    activeAccessWarning?: boolean;
    isSlaBreached?: boolean;
  },
): number {
  if (Boolean(a.activeAccessWarning) !== Boolean(b.activeAccessWarning)) {
    return a.activeAccessWarning ? -1 : 1;
  }

  if (typeof a.riskScore === 'number' && typeof b.riskScore === 'number' && a.riskScore !== b.riskScore) {
    return b.riskScore - a.riskScore;
  }

  if (Boolean(a.isSlaBreached) !== Boolean(b.isSlaBreached)) {
    return a.isSlaBreached ? -1 : 1;
  }

  const rank = (request: { status: WorkflowStatus }): number => {
    if (FAILED_STATUSES.includes(request.status)) return 0;
    if (request.status === 'PENDING_REVIEW') return 1;
    if (request.status === 'APPROVED') return 2;
    return 3;
  };

  const rankDiff = rank(a) - rank(b);
  if (rankDiff !== 0) return rankDiff;

  if (a.status === 'PENDING_REVIEW' && b.status === 'PENDING_REVIEW') {
    if (a.startDate && b.startDate) {
      const startDiff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (startDiff !== 0) return startDiff;
    } else if (a.startDate !== b.startDate) {
      return a.startDate ? -1 : 1;
    }
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  }

  return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
}
