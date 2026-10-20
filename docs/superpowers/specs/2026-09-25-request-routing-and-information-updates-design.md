# Request Routing and Pending Information Updates

## Status

Approved design. Ready for implementation planning.

## Goal

Make the auditor experience explicitly route the three request types:

- `NEW_HIRE` requests appear on the Onboarding page.
- `LEAVING_COMPANY` requests appear on the Offboarding page.
- `UPDATE_EMPLOYEE_INFO` requests remain attached to the employee's current row in All Employees and display a visible field-level pending-update flag.

Information updates must not modify the employee's current record until an auditor approves them.

## Existing behavior

The application already stores the three request types and the frontend filters the Onboarding and Offboarding pages by request type. Information updates currently call `updateSubmission` and mutate the existing employee request immediately, adding only an audit event. All Employees currently derives one row per employee by hiding requests superseded through `previousRequestId`.

The existing data model also uses `previousRequestId` for request chains such as offboarding. A pending information update must not use that field because doing so would hide the current employee row before the update is approved.

The worktree contains existing user changes in request-detail UI files and `docs/PRD.txt`. Those changes are outside this design and must be preserved.

## Recommended data model

Create a separate onboarding-request document for every submitted information update. The document has:

```js
{
  requestType: 'UPDATE_EMPLOYEE_INFO',
  status: 'PENDING_REVIEW',
  targetRequestId: '<current employee request id>',
  informationUpdate: {
    currentSnapshot: { /* immutable current employee submission */ },
    proposedSubmission: { /* validated proposed submission */ },
    changes: [
      {
        field: 'jobPosition',
        label: 'Job position',
        currentValue: 'Operator',
        proposedValue: 'Squad lead'
      }
    ]
  },
  auditTrail: [ /* submission, approval/rejection, and application events */ ]
}
```

The update request may carry the target account information for display, but it must not be treated as a Zoho provisioning request. Its `previousRequestId` remains `null` until there is a separate, explicit need to model an employee-record chain.

Only one non-rejected, non-completed pending information update may exist for a target employee. A new request for the same employee must fail with a conflict until the existing request is approved or rejected.

The current employee record remains unchanged while the update request is pending.

## Backend behavior

### HR submission

Replace the current immediate-mutation behavior for the HR information-update flow with:

```text
POST /api/form/employees/:id/information-update
```

The endpoint must:

1. Require an HR or Administrator session.
2. Validate the submitted employee-information fields using the existing server-side validation.
3. Load the current employee record and reject superseded, rejected, or cancelled targets.
4. Build the proposed normalized submission using the existing choice-resolution logic.
5. Compare the current and proposed values using the audited employee fields.
6. Reject a request with no changes.
7. Reject a request when another pending update targets the employee.
8. Store the immutable current snapshot, proposed submission, and field-level changes.
9. Add an HR audit event identifying the requester and changed fields.
10. Return the new update request code and submission timestamp.

The existing `PUT /api/form/employees/:id` endpoint must no longer be used by the HR Information Update wizard for immediate mutation. Auditor-side employee editing remains a separate operation and keeps its current authorization rules.

### Auditor list and detail responses

`listSummaries()` must continue returning all request summaries so the Onboarding and Offboarding pages can filter by request type. It must additionally enrich current employee summaries with:

```ts
pendingInformationUpdate: {
  requestId: string;
  requestCode: string;
  fields: Array<{
    field: string;
    label: string;
  }>;
} | null
```

Update-request documents themselves should expose `targetRequestId`, allowing the frontend to omit them from the one-row-per-employee All Employees view.

`getById()` for a current employee must include the full pending update when one exists:

```ts
pendingInformationUpdate: {
  requestId: string;
  requestCode: string;
  targetRequestId: string;
  status: WorkflowStatus;
  fields: Array<{
    field: string;
    label: string;
    currentValue: string;
    proposedValue: string;
  }>;
} | null
```

The summary response must not expose private email, manager email, GitHub details, or old/new sensitive values. Full before/after values are restricted to the authenticated request-detail response.

### Approval and rejection

Add auditor/admin actions:

```text
POST /api/auditor/requests/:id/information-update/approve
POST /api/auditor/requests/:id/information-update/reject
```

Approval must:

1. Confirm the request is an information update in `PENDING_REVIEW`.
2. Load the target employee.
3. Compare the target's current audited fields with `currentSnapshot`.
4. Return a conflict if the target changed after the update was submitted.
5. Apply `proposedSubmission` to the target employee.
6. Append an auditable approval/application event to the target.
7. Mark the update request `COMPLETED`, set reviewer fields, and append its approval event.
8. Return the updated target employee with no pending update.

Rejection must:

1. Confirm the request is an information update in `PENDING_REVIEW`.
2. Mark only the update request `REJECTED`.
3. Record the reviewer and optional reason.
4. Leave the target employee unchanged.

Both operations must be idempotency-safe: a completed or rejected update cannot be approved or rejected a second time.

Information-update approval must not invoke `provisioningService`, `notificationService`, or any Zoho API.

## Frontend behavior

### Request destinations

Keep the existing page structure and enforce the routing contract:

- `frontend/src/app/auditor/employees/onboarding/page.tsx` filters `NEW_HIRE` only.
- `frontend/src/app/auditor/employees/offboarding/page.tsx` filters `LEAVING_COMPANY` only.
- `frontend/src/app/auditor/employees/all/page.tsx` removes standalone `UPDATE_EMPLOYEE_INFO` rows and enriches the current employee row with pending-update metadata.

### HR confirmation

Update the Information Update wizard confirmation from an immediate-update message to a pending-review message, for example:

```text
Information update sent to the Auditor
The requested changes are waiting for review. The employee record will be updated after approval.
```

### All Employees list

The current employee row must display:

- a visible `Update pending` flag when an update is pending;
- the changed field labels, such as `Job position` and `Manager email`;
- a `Review update` action that opens the current employee detail page.

The update request itself must not create a duplicate employee row.

### Employee detail

Add an information-update comparison panel to the current employee detail view when `pendingInformationUpdate` is present. Each changed field must show:

```text
Job position
Current: Operator
Proposed: Squad lead
```

The proposed value must be visually highlighted. The panel must include Approve and Reject actions, loading states, errors, and success feedback.

While an update is pending, disable the normal employee Edit action to avoid competing mutations. Keep Offboard available, but if offboarding supersedes the target before approval, the approval must fail safely through the backend snapshot conflict check.

For an update-request detail route, if the existing route is used directly, render the update comparison rather than account setup, Zoho provisioning, or notification cards. The preferred navigation path is the current employee detail with the pending update panel.

### Type and API updates

Update `frontend/src/lib/types.ts` with the pending-update summary/detail types and add the corresponding functions to `frontend/src/lib/form-api.ts` and `frontend/src/lib/auditor-api.ts`.

## Files expected to change

### Backend

- `backend/src/domain/requests.js`
- `backend/src/routes/form.js`
- `backend/src/routes/auditor.js`
- `backend/src/domain/statuses.js` only if a new status is required; prefer existing statuses
- backend tests for repository and HTTP behavior

### Frontend

- `frontend/src/lib/types.ts`
- `frontend/src/lib/form-api.ts`
- `frontend/src/lib/auditor-api.ts`
- `frontend/src/app/request-form/page.tsx`
- `frontend/src/app/auditor/employees/all/page.tsx`
- `frontend/src/app/auditor/components/RequestQueueTable.tsx` or a focused employee-row component
- `frontend/src/app/auditor/requests/[id]/page.tsx`
- a new focused information-update comparison component
- existing auditor CSS, preserving current user edits

## Error handling and security

- Validate all HR input on the server; frontend validation is only UX support.
- Never apply employee-submitted values directly to the current record.
- Never let an update request alter a Zoho account automatically.
- Prevent duplicate pending updates per employee.
- Prevent stale updates from overwriting newer auditor or HR changes.
- Return `409 Conflict` for stale targets, duplicate pending updates, and already-resolved requests.
- Keep private data out of list summaries.
- Record requester, reviewer, field names, old values, proposed values, and final outcome in the audit trail.

## Verification plan

### Backend tests

Add tests proving that:

1. HR submission creates a pending update request and does not mutate the target.
2. Field-level changes contain correct old/new values and labels.
3. A no-op update is rejected.
4. A second pending update for the same employee is rejected.
5. All Employees summaries expose pending field labels without private values.
6. Approval applies all proposed values and clears the pending flag.
7. Rejection leaves the target unchanged.
8. Approval fails when the target changed after submission.
9. Repeated approve/reject actions are rejected safely.
10. Update approval never calls the Zoho provisioning client.
11. New Hire and Leaving Company requests remain in their existing queues.

### Frontend verification

Run:

```text
npm test
npm run typecheck
npm run lint
npm run build
```

Manually verify:

1. New Hire appears only in Onboarding.
2. Leaving Company appears only in Offboarding.
3. Information Update leaves the employee's current values unchanged until approval.
4. All Employees shows one row with an update flag and the exact changed fields.
5. The comparison panel highlights proposed values.
6. Approval updates the row and removes the flag.
7. Rejection preserves the original values and removes the flag.
8. A stale update cannot overwrite newer data.

