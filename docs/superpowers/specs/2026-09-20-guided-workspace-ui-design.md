# Guided Workspace UI Redesign

## Goal

Replace the prototype's dense static form and cramped auditor split panel with a polished, task-oriented employee onboarding wizard and an auditor workspace. Preserve the existing API contract and the dashboard privacy boundary.

## Onboarding Wizard

The public onboarding page is a responsive guided flow with three conceptual steps:

1. **About you:** name, private email, country.
2. **Work setup:** department, team, manager email, request type, requested email address, sub-team, and job position.
3. **Developer access:** GitHub profile and repositories. This appears only when the selected department is Development/Dev.

The stepper displays progress and concise step labels. A step must validate before progressing, but Back never discards entered data. A final review screen lets employees verify entries before submitting. Existing server-side validation remains authoritative.

## Mascot and Motion

A friendly abstract CSS-drawn mascot accompanies the wizard on larger screens. It uses small floating and blinking animations to create warmth without requiring an image asset or network download. Animation is disabled for users who prefer reduced motion. The mascot becomes a compact decorative element on small screens so form completion remains the priority.

## Auditor Workspace

The auditor interface uses a fixed desktop sidebar with brand identity, request navigation, a shortcut to the onboarding form, and a concise testing-context footer. The content area contains:

- Page heading, request totals, search, and status filters.
- A spacious, keyboard-operable request queue.
- A full-width request review workspace once an item is selected, with employee information, proposed account configuration, action controls, and audit timeline.

The queue continues to reveal **only** request ID, workflow status, and timestamp of submission. Full submitted data becomes available only inside the selected request review workspace.

## Components

- `OnboardingWizard`: owns step state, local input data, step validation, review, and submission states.
- `Mascot`: presentational CSS component with reduced-motion support.
- `AuditorSidebar`: stable application navigation and contextual shortcuts.
- `RequestQueue`: search/filterable representation of API-safe summaries.
- `RequestWorkspace`: selected request's full review and simulated provisioning action.

## Error Handling and Verification

Client validation errors are displayed at the relevant current step. API errors stay visible without losing data. Existing backend tests remain valid, while frontend lint, type checking, and production build verify the component redesign.

## Out of Scope

Authentication, additional navigation destinations, image downloads, backend/API changes, and real Zoho provisioning.
