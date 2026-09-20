# PRD-Aligned Panel Redesign

## Objective

Rework the employee onboarding and auditor panels into one coherent internal-product interface. The redesign improves hierarchy, accessibility, responsive behavior, and operational clarity while preserving the existing routes, API contract, workflow semantics, field validation, and privacy boundary.

## Design Read

This is a trust-first internal operations product used by employees completing a short request and auditors making provisioning decisions. The visual language is calm and precise rather than promotional.

Design dials: variance 4, motion 3, density 6.

## Shared System

- Use a cool neutral canvas, white surfaces, charcoal text, and one emerald accent.
- Replace decorative serif display treatment and remote font imports with the system UI sans stack.
- Use a consistent 12px radius for cards, inputs, and controls. Status chips remain pill-shaped to communicate state.
- Keep focus rings, inline errors, form labels, and control contrast accessible in light and dark system themes.
- Retain lightweight hover and active feedback only. All animations respect reduced-motion preferences.

## Employee Onboarding

- Keep the current conditional form sequence and server-authoritative validation.
- Present progress as a concise numbered rail with a clear active state, then show the current step title, short explanation, and fields.
- Group input controls in an intentionally compact two-column desktop grid and single-column mobile flow.
- Replace the current mascot-heavy panel with a restrained informational aside on wide screens. It contains the step count and explains the review process, then moves below or disappears on smaller screens.
- Make the review screen a scannable definition list with an explicit edit affordance for each group.
- Make confirmation clear and focused on the request identifier and next expected action.

## Auditor Workspace

- Preserve Requests, All employees, Onboarding, Offboarding, and Employee Database views.
- Keep the request queue privacy-safe. Full employee information stays behind the selected-record drawer.
- Recompose the desktop shell around a compact dark sidebar, a focused workspace header, a small metric row, and table surfaces with stronger column hierarchy.
- Use semantic status chips and contextual notice surfaces. Do not introduce decorative status indicators.
- Make toolbar actions and search controls consistent and provide explicit mobile table column reduction.
- Rework the record drawer into clearly separated response, account setup, provisioning, and audit-history sections. Keep Save and Create Zoho user visually distinct to prevent accidental provisioning.
- Preserve Escape and backdrop close behavior, existing API calls, save failures, and provisioning failures.

## Implementation Scope

Primary changes are limited to frontend styling and the panel component markup needed to improve semantics and hierarchy. No routes, backend endpoints, API types, form field keys, security controls, or workflow status values change.

## Verification

- Run frontend lint, TypeScript typecheck, and production build.
- Review onboarding at desktop and mobile sizes, including conditional developer fields, validation, review, submission error, and success state.
- Review auditor request queue privacy, employee search, drawer editing, save failure, provision action, and narrow-layout behavior.
- Check light and dark system preferences, keyboard focus, and reduced motion.

## Prototype Verdict

The throwaway `/prototype?variant=` route explored three structural directions:

- `A` Guided clarity: a process rail paired with employee response and auditor decision panels.
- `B` Operations desk: a compact sidebar, metric row, privacy-safe queue, and selected-request preview.
- `C` Focus mode: a single-request review surface with a persistent audit timeline.

The production implementation combines `A` and `B`. Employee onboarding uses the guided progress model, while the auditor workspace uses the operations-desk queue model. The review drawer borrows the explicit decision separation and confirmation step from `A`/`C`. The prototype is intentionally retained as a clearly labeled visual reference because this workspace has no Git metadata for a throwaway branch.
