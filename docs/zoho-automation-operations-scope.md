# Zoho Automation Scope: Operations and CSS

## Purpose

This document clarifies what the onboarding automation should handle for Operations roles and what should remain a separate manual process for CSS.

## Team-facing summary

We will automate Zoho Mail account provisioning for Operations employees whose corporate accounts use the `service.insidemaps.com` domain.

The onboarding system will:

1. Determine the correct corporate email domain from controlled company rules.
2. Generate and display the proposed email address for auditor approval.
3. Create the Zoho user.
4. Enable Zoho Mail.
5. Assign the approved groups and permissions.
6. Verify the account configuration.
7. Record every step and support retrying failed steps without creating a duplicate account.

Zoho Desk for CSS is not part of this automation. CSS uses a different Zoho workspace/account, so CSS access will be handled directly with the CSS manager, Milos.

## Scope boundary

### Included: Operations / Zoho Mail

- Corporate email creation for Operations accounts.
- `service.insidemaps.com` email domain support.
- Zoho Directory user creation.
- Zoho Mail enablement.
- Operations, department, team, and common employee groups.
- Auditor approval before provisioning.
- Provisioning status, audit trail, error reporting, and retry.

### Excluded: CSS / Zoho Desk

- Creating or managing CSS users in Zoho Desk.
- Assigning CSS Desk roles or permissions.
- Connecting to the separate CSS Zoho workspace.
- Automatically granting CSS access based only on an onboarding form selection.

CSS access should be requested through direct communication with Milos until a separate integration is designed and approved.

## Current system state

The application already has most of the Zoho Mail provisioning flow:

- A deterministic rules engine proposes the role and groups.
- An auditor approves the final account configuration.
- The Zoho adapter creates the user.
- Zoho Mail is enabled.
- Groups are assigned.
- The final configuration is verified.
- Failed or partial provisioning can be retried without creating another user.
- The audit trail records the provisioning steps.

The main limitation is that the corporate email domain is currently configured globally as `insidemaps.com`. The new requirement needs a controlled domain rule so Operations accounts can use `service.insidemaps.com`.

## Required implementation changes

### 1. Add a controlled email-domain rule

Add a company-owned mapping such as:

```text
Team: Operations
Email domain: service.insidemaps.com
Zoho Mail: enabled
Zoho Desk: not managed by this system
```

The domain must be selected from trusted organizational attributes and rules. It must not be selected by the employee in the public onboarding form.

The team must confirm whether this rule applies to:

- only the exact `Operations` team; or
- every role in the broader `Service Delivery` department.

Recommended default: apply it only to the exact `Operations` team until the business mapping is confirmed.

### 2. Make email generation domain-aware

The system should generate the proposed address using the resolved domain:

```text
<first-name>.<last-name>@service.insidemaps.com
```

For other teams, the existing domain policy should continue to apply. Email availability checks must use the complete address, including its domain.

The auditor review screen should show the final proposed address before account creation.

### 3. Preserve auditor approval

The onboarding form may collect department, team, and position, but those values must not directly grant privileged access.

The safe flow is:

```text
Employee information
        |
Controlled company rule
        |
Proposed domain, role, and groups
        |
Auditor review and approval
        |
Zoho Mail provisioning
```

An auditor must be able to correct the proposed email, role, or groups before provisioning.

### 4. Confirm the Zoho-side account configuration

Before enabling live provisioning, the Zoho administrator should confirm:

- `service.insidemaps.com` is added and verified in the correct Zoho organization.
- Required DNS records are configured for the domain.
- The domain can be used for Zoho Directory users and Zoho Mail.
- The correct Zoho Mail licenses are available.
- The OAuth integration has permission to create users, enable Mail, assign groups, and verify users.
- Existing group names exactly match the names configured in the application.
- The `service.insidemaps.com` account is in the intended Zoho organization, not the separate CSS workspace.

The application cannot reliably provision the new domain until these Zoho-side prerequisites are complete.

## Credentials and access required

### Short answer

The app should use Zoho OAuth 2.0, not a permanent Zoho username/password and not a generic API key.

The Zoho administrator needs to create or authorize a dedicated integration identity and provide the app with:

- OAuth Client ID
- OAuth Client Secret
- OAuth Refresh Token
- Zoho data-center code
- Target Zoho organization ID

The refresh token lets the backend obtain short-lived access tokens automatically. The app stores the refresh token securely and uses it to authenticate API requests.

Do not put a Zoho administrator's normal password, MFA code, or an access token in the application configuration. Do not commit any of these secrets to Git.

### Runtime configuration for Zoho provisioning

These are the values the current backend expects when `ZOHO_MODE=live`:

| Configuration | Required | Meaning |
| --- | --- | --- |
| `ZOHO_MODE=live` | Yes | Enables real Zoho API calls. Keep `simulated` for local development. |
| `ZOHO_DC` | Yes | Zoho data center, for example `com`, `eu`, `in`, or another value matching the organization. |
| `ZOHO_ORG_ID` | Yes | ID of the target Zoho Directory organization. It must belong to the Operations/Mail workspace, not the CSS workspace. |
| `ZOHO_CLIENT_ID` | Yes | OAuth client ID created in the Zoho Developer/API console. |
| `ZOHO_CLIENT_SECRET` | Yes | OAuth client secret paired with the client ID. |
| `ZOHO_REFRESH_TOKEN` | Yes | Long-lived OAuth refresh token generated after an authorized Zoho admin grants consent. |

The application uses these credentials to create users, enable or disable Mail, assign groups, and verify the account. The OAuth token must be authorized by an administrator of the target organization, or by a dedicated service account with the required administrative permissions.

### OAuth permissions to request

The exact scopes must match the Zoho API endpoints used by the final adapter. The documented permission families are:

- Zoho Directory users: create, read, and update users.
- Zoho Directory groups: read groups and update group membership.
- Zoho Mail organization accounts: update accounts so Mail can be enabled or disabled.

The Zoho administrator should approve only the scopes required by this application. Zoho documents examples such as `ZohoDirectory.Users.CREATE`, `ZohoDirectory.Users.READ`, `ZohoDirectory.Users.UPDATE`, `ZohoDirectory.Groups.READ`, `ZohoDirectory.Groups.UPDATE`, and `ZohoMail.organization.accounts.UPDATE`. The final list should be checked against the selected API version and endpoints before production.

Important implementation check: the current adapter uses Directory API paths for user creation, group assignment, Mail enablement, verification, and deactivation. Zoho's current Mail documentation describes Mail enable/disable through the Zoho Mail organization accounts API. Before enabling live mode, the development team must verify that the adapter endpoints, organization ID, and OAuth scopes are compatible with the actual Zoho organization. If necessary, separate Directory and Mail organization IDs should be configured.

### One-time setup the Zoho administrator must perform

1. Confirm that `service.insidemaps.com` is verified in the intended Zoho organization.
2. Confirm that Operations users can be created in that organization and receive Zoho Mail licenses.
3. Register the application in the Zoho Developer/API console.
4. Generate an offline OAuth grant/refresh token while signed in as an authorized administrator or dedicated service account.
5. Grant the minimum Directory and Mail scopes required by the final API calls.
6. Confirm that the required groups already exist and that their names or IDs are known to the application.
7. Provide the organization ID, data center, client ID, client secret, and refresh token through the team's secret-management process.

The app team should receive the secret values through a secure channel or secret manager, never through a source-code commit, shared document, or ordinary chat message.

### Credentials for sending the employee notification email

Zoho provisioning and sending the onboarding notification are two separate integrations.

For real delivery to the employee's personal email, the app also needs an authenticated SMTP sender:

| Configuration | Required for real email delivery | Meaning |
| --- | --- | --- |
| `MAIL_MODE=smtp` | Yes | Sends the notification instead of writing it to a local outbox. |
| `MAIL_FROM` | Yes | Approved sender address, for example `IT Provisioning <it@insidemaps.com>`. |
| `SMTP_HOST` | Yes | SMTP relay hostname. |
| `SMTP_PORT` | Yes | Usually the provider's STARTTLS submission port. |
| `SMTP_USER` | Yes | Dedicated sender mailbox or SMTP account. |
| `SMTP_PASS` | Yes | SMTP password or app-specific password, depending on the provider's security policy. |

For local testing, `MAIL_MODE=outbox` is sufficient and no SMTP credentials are needed. Production requires an approved sender account and working SMTP authentication.

### What the team should provide to the app team

The minimum handoff should be:

```text
Target Zoho data center:
Target Zoho Directory/Mail organization ID(s):
Operations email domain: service.insidemaps.com
OAuth client ID: [secure secret]
OAuth client secret: [secure secret]
OAuth refresh token: [secure secret]
Approved OAuth scopes:
Required Zoho groups and IDs:
SMTP sender address:
SMTP host and port:
SMTP username/password or app password: [secure secret]
```

The actual secret values should be entered directly into the deployment secret manager; this checklist is only a handoff format.

### Credential rotation and offboarding

- Store secrets in the deployment platform's secret manager or encrypted environment configuration.
- Restrict access to the app team and Zoho administrators who need it.
- Rotate the client secret or revoke the refresh token if the integration identity is compromised.
- Re-authorize the OAuth client when scopes or the target organization change.
- Use a dedicated integration identity so an employee leaving the company does not break provisioning.

### 5. Test the complete flow

At minimum, test:

1. An Operations employee receives a `service.insidemaps.com` address.
2. A non-Operations employee keeps the correct existing domain.
3. The auditor sees and approves the proposed domain.
4. A duplicate address is rejected safely.
5. Zoho user creation and Mail enablement succeed.
6. Group assignment succeeds.
7. A failed group assignment can be retried without creating a second account.
8. Offboarding deactivates the correct account.
9. CSS onboarding does not create a Zoho Desk account or call the CSS workspace.

## Recommended ownership

| Area | Owner | Responsibility |
| --- | --- | --- |
| Email-domain policy | Operations / management | Confirm which teams and roles use `service.insidemaps.com` |
| Zoho Mail organization | Zoho administrator | Verify domain, licenses, groups, OAuth permissions, and DNS |
| Application changes | Automation development team | Implement domain-aware rules, preview, provisioning, and tests |
| CSS Zoho Desk access | Milos / CSS manager | Handle access in the separate CSS Zoho workspace |

## Official Zoho references

- [Zoho Directory OAuth](https://www.zoho.com/directory/api/v2/oauth/)
- [Zoho Directory Users API](https://www.zoho.com/directory/api/v2/users/)
- [Zoho Mail enable user API](https://www.zoho.com/mail/help/api/put-to-enable-user.html)
- [Zoho Mail Users API](https://www.zoho.com/mail/help/api/users-api.html)

## Suggested message to send the team

> We are going to automate Zoho Mail provisioning for Operations employees. Operations accounts should use the `service.insidemaps.com` domain. The onboarding system will calculate the proposed address, show it to the auditor for approval, create the Zoho user, enable Zoho Mail, assign the approved groups, verify the result, and record the full audit trail.
>
> Zoho Desk access for CSS is separate because CSS uses a different Zoho workspace/account. We will not connect that workspace or create CSS Desk users through this automation. CSS access should continue to be handled directly with Milos.
>
> Before implementation, please confirm whether `service.insidemaps.com` applies only to the exact Operations team or to all roles in Service Delivery. We also need the Zoho administrator to confirm that the domain is verified in the correct organization, that licenses and groups are ready, and that the automation account has the required permissions.

## Definition of done

This work is complete when:

- The business confirms the Operations-to-domain mapping.
- `service.insidemaps.com` is verified in the correct Zoho organization.
- Operations users receive the correct domain automatically.
- Non-Operations users are unaffected.
- Auditors can review and approve the final account configuration.
- Provisioning, retry, offboarding, and audit logging work for the new domain.
- No CSS Zoho Desk user or separate CSS workspace is modified by this automation.
