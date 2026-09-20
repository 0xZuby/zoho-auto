# Onboardly UI Redesign Design

## Goal

Replace the prototype's dense employee form and sparse auditor page with a guided, accessible onboarding journey and a task-focused auditor workspace. The redesign is frontend-only: the Express API, MongoDB document shape, request privacy projection, validation rules, and simulated provisioning behavior do not change.

## Scope

### Employee onboarding (`/onboarding`)

The current one-page form becomes a four-step wizard:

1. **Welcome**: explains that the process takes a few minutes and introduces the decorative otter mascot.
2. **About you**: name and surname, private email, and country.
3. **Work details**: department, team, manager email, request type, requested email address, sub-team, and job position. When the department is `Dev` or `Development` (case-insensitive), GitHub profile and repository fields appear in this step and are required.
4. **Review**: displays a readable summary with an Edit control for each preceding step, then submits through the existing `api.submit` call.

The user can go back without losing input. Clicking Continue runs client-side required/email validation for the active step. The existing backend response remains the final validation source when submitting. Server errors are mapped to their relevant fields and direct the user to the step containing the first failing field. A successful result replaces the wizard with a confirmation screen displaying the returned request code.

The wizard has an accessible, labelled progress stepper. The Continue/Back controls have clear disabled/loading states. Inputs retain labels, error text is programmatically associated with invalid controls, and the layout collapses to one column on narrow screens.

### Mascot

`Mascot` is an explicitly decorative component (`aria-hidden`) using CSS shapes rather than a network image or new asset. It provides a friendly abstract otter-like character in the employee-side accent palette. It has three states:

- idle: slow bob and blink;
- progressing: small wave when a new step becomes active;
- celebration: brief bounce and confetti-like accent marks after success.

All animation is disabled under `prefers-reduced-motion: reduce`. The mascot does not convey required information; equivalent welcome, progress, and success copy are always visible.

### Auditor workspace (`/auditor`)

The auditor route becomes an application shell rather than a bare page.

- A persistent desktop sidebar provides Overview, Requests, Provisioning, and Audit log. Overview and Requests are active visual navigation to the implemented queue. Provisioning and Audit log are visibly marked `Coming soon` and are not interactive destinations.
- A compact mobile header exposes the active location and a navigation trigger; the side navigation remains usable without horizontal scrolling.
- The main Overview presents total requests, pending-review count, completed count, and a primary request queue. Counts are derived from the data returned by the existing safe list API.
- The request queue adds a client-side search of request codes and a status filter. It never displays employee-provided information in the list, preserving the API's privacy boundary.
- Selecting a queue row fetches the complete record and opens a responsive review panel. The panel contains employee details, request status, proposed/generated account information, audit timeline, and the primary provisioning action.
- Provisioning opens a controlled React confirmation dialog summarising the employee request code and proposed account configuration. Confirming calls the existing `api.provision` endpoint. Loading prevents duplicate confirmation. Success refreshes queue metrics and the selected record; failure keeps the panel open and shows a retryable error message.

No new routes, status transitions, API endpoints, or permission controls are introduced. This remains the openly accessible prototype described by the existing design.

## Visual design

Employee onboarding uses a welcoming lilac/lavender accent, white layered cards, rounded controls, and generous spacing. The mascot is present on large screens beside the wizard and becomes a compact header element on mobile.

The auditor application uses an evergreen sidebar, warm off-white canvas, white content panels, and green/amber/red status treatments that meet legibility requirements. Manrope remains the UI face and DM Mono remains for small labels, identifiers, and status metadata. Status is never differentiated by colour alone.

## Frontend module boundaries

New presentational components live under `frontend/components/`:

- `Mascot.tsx`: decorative mascot and animation state;
- `ProgressStepper.tsx`: step labels and accessible current/progress semantics;
- `OnboardingWizard.tsx`: form state, field grouping, navigation, validation, submission, and result state;
- `AuditorShell.tsx`: responsive navigation shell;
- `RequestQueue.tsx`: summary metrics, local filter state, and privacy-safe list;
- `RequestReview.tsx`: selected-request detail, timeline, and confirmation dialog.

`frontend/app/onboarding/page.tsx` and `frontend/app/auditor/page.tsx` compose the appropriate feature components. `frontend/lib/api.ts` remains the API boundary; its types may be expanded only when needed to describe existing response fields. Shared styling belongs in `frontend/app/globals.css`; component state stays in the owning feature component.

## Error handling

- Employee input remains intact after a failed submit. Field errors display beside their controls and the first relevant step is shown.
- List/detail loading failures produce clear inline messages and retain any previously successful data where possible.
- A failed provision does not clear the selected review, close the dialog prematurely, or change its action to a success state.
- Empty queues receive a direct next action linking to the onboarding form.

## Verification

- Keep the existing backend validation tests unchanged and run them to ensure contract preservation.
- Run frontend `lint` and `typecheck`.
- Manually verify wizard step navigation, Development-only GitHub behaviour, review editing, client/server validation rendering, submission success, dashboard empty/loading/error states, search/filter, request review, provisioning dialog, successful provisioning refresh, and a reduced-motion view.

## Non-goals

This work does not add authentication, invitation tokens, real Zoho integration, real email delivery, administrative configuration, backend filtering, new persistence fields, or changes to the provisioning simulation.
