# Employee Onboarding Prototype Design

## Purpose

Build a testable employee-onboarding prototype that replaces the form-and-spreadsheet handoff with an interactive onboarding form and an auditor review workflow. Zoho provisioning is simulated; no credentials or external Zoho API calls are used.

## Architecture

The system comprises two independently runnable applications:

- `frontend`: a current Next.js App Router application. It owns the employee and auditor user interfaces and talks to the backend through a configurable API base URL.
- `backend`: a Node.js and Express application. It validates requests, persists data in MongoDB, exposes the review workflow API, and performs the deterministic provisioning simulation.

MongoDB stores onboarding requests in an `onboardingRequests` collection. The connection string is supplied through backend environment configuration and is never exposed to the browser.

No authentication is included in this testing prototype. Both the onboarding form and auditor interface are openly accessible.

## User Experience

### Employee onboarding

`/onboarding` presents a responsive, accessible form with these fields:

- Name and Surname
- Private employee email address
- Country
- Department
- Team
- Team Lead / Manager email
- Request type
- Email Address
- Sub team
- Job position
- GitHub profile link/name (Dev only)
- GitHub repositories to add the employee to (Dev only)

GitHub fields appear only when the selected department is Development/Dev. The client offers inline validation; the server remains the source of truth for validation. On a successful submission, the employee sees a confirmation state and receives a request identifier.

### Auditor workflow

`/auditor` is an openly accessible test dashboard. Its request table reveals only:

- Request ID
- Workflow status
- Timestamp of submission

It must not show submitted employee or employment information in the dashboard list. Selecting a request opens an auditor detail view, where the complete submission, proposed simulated Zoho account, status, and audit trail are available.

The auditor can select **Create Zoho User**. A confirmation step makes the simulated account configuration explicit before execution. Successful simulation changes the request to `COMPLETED` and records the generated email and audit events.

## Data Model

Each onboarding request contains:

- a generated public-safe request ID;
- `submission`: all submitted form fields;
- `submittedAt` and `status`;
- `provisioning`: the generated email and whether simulated provisioning completed;
- `auditEvents`: append-only events with timestamp, action, and optional detail.

The initial status is `PENDING_REVIEW`. Timestamps are server-generated.

## API Contract

- `POST /api/onboarding-requests`: validate and create a request.
- `GET /api/onboarding-requests`: return dashboard-safe summaries only (ID, status, submission timestamp).
- `GET /api/onboarding-requests/:id`: return the complete auditor review record.
- `POST /api/onboarding-requests/:id/provision`: perform or return the existing simulated provisioning result.

Failures use consistent JSON error bodies. The frontend retains visible form/detail state and gives the tester a retry path.

## Simulated Provisioning

The backend derives a predictable corporate email from the submitted name and application domain configuration. Provisioning is idempotent: invoking the provisioning endpoint after a successful operation returns the already-created simulated account and does not append a second creation event or produce another identity.

## Validation and Testing

- Validate required fields, personal and manager email syntax, and Development-only GitHub values.
- Test API validation, MongoDB persistence, dashboard field projection, and idempotent provisioning.
- Run frontend linting and type checks.
- Supply seed data or an empty-state prompt so the dashboard is usable immediately; live form submissions appear in the dashboard.

## Out of Scope

- Zoho API calls, credential management, email delivery, authentication, invitation tokens, admin configuration, and production authorization rules.
