# Auditor-Owned Configuration Design

## Goal

Move organization-controlled fields out of the employee onboarding form and into the auditor review workflow. The auditor supplies, saves, and owns the final provisioning configuration for Team, Team Lead / Manager email, Request type, Requested work email, and Sub-team.

## Ownership model

Employee `submission` data contains only:

- Name and surname
- Personal email
- Country
- Department
- Job position
- GitHub profile and repositories when Department is Development/Dev

The onboarding request receives a separate `auditorConfiguration` object containing:

- `team`
- `managerEmail`
- `requestType`
- `emailAddress`
- `subTeam`

This separation retains the original employee input and makes the organization-controlled provision configuration explicit and auditable.

## API and persistence

New requests initialise `auditorConfiguration` as an object with all five string values empty. Existing records without this property are serialised with the same empty default so the auditor UI can operate against old data safely.

`PATCH /api/onboarding-requests/:id/configuration` accepts only the five configuration values. It trims all values, requires every value, validates Manager email and Requested work email syntax, updates `auditorConfiguration`, and appends an `AUDITOR_CONFIGURATION_SAVED` audit event. Invalid input returns HTTP 422 with field-level errors and makes no persistence change.

`POST /api/onboarding-requests/:id/provision` refuses a request with incomplete or invalid saved configuration. On success, the generated simulated account record includes the saved requested work email as its corporate email, and provisioning events continue to be append-only.

The list endpoint remains unchanged and privacy-safe. The detail endpoint exposes `auditorConfiguration` only after a request is selected.

## Employee UI

The onboarding wizard removes Team, Team Lead / Manager email, Request type, Requested work email, and Sub-team from its Work details and Review steps. Its validation and submission payload therefore contain only employee-owned fields. Development-specific GitHub fields retain their existing conditional validation.

## Auditor UI

The request review panel adds an Account setup form before the proposed-account card. It displays the five auditor-owned fields, prefilled from saved configuration. Auditors select **Save configuration** to persist them. Inline errors appear next to invalid fields while the entered values remain intact.

Until valid configuration is saved, **Create Zoho user** is disabled and explanatory copy directs the auditor to save the account setup first. The confirmation dialog shows the saved requested work email. A post-save refresh retains the review panel and displays the new audit event.

## Verification

- Backend tests cover employee payload validation, configuration validation, persistence, audit event creation, and provisioning refusal before configuration exists.
- Frontend linting, TypeScript checks, and production build must pass.
- Manual verification covers removing employee fields, saving invalid and valid audit configuration, reloading saved configuration, and provisioning after a successful save.

## Non-goals

This change does not add authentication, role-based authorization, real Zoho provisioning, email delivery, invitation tokens, or broader administration screens.
