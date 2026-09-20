# Auditor Employee Workspace Design

## Goal

Expand the auditor experience beyond the privacy-safe request queue with an employee-management workspace. Auditors can inspect complete onboarding responses, update permitted employee and auditor-controlled information, and provision through a right-side slide-over drawer.

## Navigation

The auditor sidebar gains **All employees**, which expands to:

- **Onboarding:** functional default view of every onboarding response and its complete data.
- **Offboarding:** intentionally non-functional Coming soon view.
- **Employee Database:** a functional, broader employee-oriented table backed by the same records.

The existing Requests dashboard stays in place and retains its privacy-safe projection: request ID, status, and submission timestamp only.

## Employee Workspace

Onboarding and Employee Database offer search and status filtering. Selecting a row opens a focusable right-side drawer with:

1. Employee-submitted fields, editable by the auditor.
2. Auditor account configuration fields.
3. Provisioning state and audit history.

The drawer closes with its close button, Escape, or the backdrop. Saving refreshes the active table while preserving the selected view.

## API

The backend adds an auditor-only list endpoint that returns full onboarding records for the employee-workspace tables. The existing summary endpoint remains unchanged.

A dedicated PATCH endpoint updates allowed employee-submission and auditor-configuration fields. It validates the two groups independently, persists only approved fields, and appends an `AUDITOR_RECORD_UPDATED` audit event. Provisioning remains blocked until auditor configuration is valid.

## Errors and Verification

The drawer exposes field-level validation errors and preserves edits on failed saves. Successful saves are visibly confirmed and reflected in the audit trail.

Tests cover full auditor listing, record-edit validation/persistence, and audit event creation. Frontend linting, TypeScript checks, and a production build verify the user interface.

## Out of Scope

Offboarding workflows, employee deletion, authentication, pagination, and real Zoho provisioning.
