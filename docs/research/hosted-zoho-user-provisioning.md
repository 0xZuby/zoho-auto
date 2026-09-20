# Hosted no-code Zoho-user provisioning from a form/sheet

## Conclusion

The closest fit is **Zoho Flow**, hosted by Zoho, using its Google Sheets connector as the trigger and its **Zoho Directory** actions to create the person and put them in pre-defined groups. It is a non-AI, no-local-runtime configuration.

There is one material constraint: Zoho Flow's documented native Google Sheets trigger is **Row added**, not row changed. Its documented recipe for a row-update trigger installs Google Apps Script which posts to a Flow webhook. That route violates the stated "no local script / no Google APIs" restriction. Therefore, make the row complete when it is created, or introduce a separate no-code approval/ready event; do not treat arbitrary sheet edits as a reliable native trigger.

"Zoho user" must be resolved before build-out. A Zoho Directory / Zoho One organization user, a Zoho CRM seat, and a portal user are distinct things with different role models.

## What the constraints mean in practice

* No code maintained or run by the team: feasible. Flow is hosted and offers native Google Sheets and Zoho Directory connectors.
* No Google API project/key or custom integration: feasible, **if** third-party OAuth access is allowed. The Google Sheets connector is authorized by signing in to Google and granting Flow access; it necessarily accesses Google through Google's service interfaces, but the team does not build or operate an API integration. [Zoho Flow: Google Sheets connection](https://help.zoho.com/portal/en/kb/flow/user-guide/app-specific-documentation/articles/google-sheets-help)
* No Google access of any kind (including OAuth consent to Zoho): not feasible for a hosted service to observe a private Google Sheet. Use Zoho Forms / Zoho Tables as the intake or obtain an approved integration.
* Google Workspace governance may be a prerequisite. Zoho documents that its current Google Workspace integrations require a Workspace customer and an admin allow-list/third-party OAuth verification flow for Google app access. Validate the Sheets connector with the Workspace administrator before committing. [Zoho Flow: Google Drive for Workspace prerequisites](https://help.zoho.com/portal/en/kb/flow/user-guide/app-specific-documentation/articles/google-drive-for-workspace)

## Recommended design: complete-on-insert queue

Use the Google Form response tab as an **append-only provisioning queue**, with each response already containing all mandatory identity and entitlement inputs. Google Forms can save responses directly to a new or existing Google Sheet. [Google: choose a response destination](https://support.google.com/docs/answer/2917686)

Suggested columns:

| Column | Purpose |
| --- | --- |
| Request ID | Form response ID or immutable unique request key; duplicate guard |
| First name, last name, work email | Directory identity inputs |
| Worker type / department / location | Rule inputs |
| Access package | A controlled dropdown, e.g. `Sales-standard`, `HR-manager` |
| Provisioning status | `Pending`, `Provisioned`, `Needs review`, `Failed` |
| Directory user ID / result / processed time | Audit and recovery |

Flow topology:

```text
Google Form -> response row added in Google Sheet
            -> Zoho Flow: validate required fields + Pending state
            -> decision branches by Access package
            -> Zoho Directory: Create user
            -> Zoho Directory: Add user to one or more groups
            -> update queue status + send approver/error notification
```

Zoho documents the native Sheets **Row added** trigger and documents its empty-row behavior: it records the last row and will not trigger for a later row beyond a gap until intervening rows are filled. Headers also must be complete, in row one, with no gaps; merged cells are unsupported. These requirements make an append-only, unmerged queue important. [Zoho Flow: Google Sheets triggers and limits](https://help.zoho.com/portal/en/kb/flow/user-guide/app-specific-documentation/articles/google-sheets-help)

For each controlled access package, branch in Flow and call **Create a user**, then **Add a user to group** for the necessary pre-created entitlement groups. Zoho Directory explicitly provides both actions in Flow and says its group action takes the group role `Member`, `Moderator`, or `Follower`. A Flow connection must be made by an Organization Owner, Organization Admin, or an appropriately permitted custom role. [Zoho Directory: Flow actions and required privileges](https://help.zoho.com/portal/en/kb/directory/admin-guide/other-integrations-and-automations/integration/articles/create-workflows-between-zoho-directory-and-other-apps-using-zoho-flow-7-11-2025)

This design is deterministic: the rules are fixed dropdown values and Flow decision branches—not an AI decision.

## If fields are added after the Form row exists

This is the difficult case. Zoho's published “row updated” solution uses an Apps Script `onEdit` trigger and a webhook request to Flow. It also requires inserting script code and granting it permission. That is incompatible with the requested operating constraints. [Zoho Flow: row-update recipe](https://help.zoho.com/portal/en/kb/flow/community-learning-series/articles/how-to-trigger-a-flow-when-a-row-is-updated-in-your-google-sheets-spreadsheet)

Choose one of these operating changes instead:

1. **Best:** make all fields required in the Google Form and provision on `Row added`.
2. **Approval gate:** keep intake as a form, but have HR submit a final, complete provisioning form after reviewing the row. That final form creates the queue row; it avoids arbitrary edit watching.
3. **Move the intake to Zoho Forms:** Flow has a native `New form entry` trigger, and Zoho's own Directory guide demonstrates Zoho Forms -> Create User. This removes the Google integration and preserves a fully hosted no-code workflow. [Zoho Forms connector](https://help.zoho.com/portal/en/kb/flow/user-guide/app-specific-documentation/articles/zoho-forms-help), [Zoho Directory guide example](https://help.zoho.com/portal/en/kb/directory/admin-guide/other-integrations-and-automations/integration/articles/create-workflows-between-zoho-directory-and-other-apps-using-zoho-flow-7-11-2025)
4. **Scheduled review is not a proven native alternative:** the cited Sheets connector documentation does not document a “row updated” event apart from the Apps Script recipe. Do not assume that a scheduled Flow can safely enumerate changed rows and provide exactly-once provisioning without testing it, a durable processed marker, and duplicate checks.

## Role model: decide which Zoho product is intended

### If this means Zoho Directory / Zoho One organization users (most likely for employee onboarding)

Use **Directory user + Directory groups** for automated entitlements. Directory's Flow connector explicitly supports create user, fetch/update user, activate/deactivate, and add user to group. Its documented group member role is not the same as an administrator custom role. [Zoho Directory Flow actions](https://help.zoho.com/portal/en/kb/directory/admin-guide/other-integrations-and-automations/integration/articles/create-workflows-between-zoho-directory-and-other-apps-using-zoho-flow-7-11-2025)

If “roles” means privileged Directory **custom admin roles**, the official assignment instructions are an Admin Panel procedure (Admins -> Roles -> Assign Users) and require Organization Owner or Organization Admin. The published Flow action list does not include “assign custom admin role.” Treat automatic assignment of privileged Directory roles as **unsupported by the documented no-code Flow actions** until Zoho confirms an API/action for the specific plan. Keep privileged roles manual, or use least-privilege groups/application assignment where that satisfies the requirement. [Zoho Directory: assigning custom roles](https://help.zoho.com/portal/en/kb/directory/admin-guide/admins/articles/assign-users-to-roles)

### If this means Zoho CRM users/seats

CRM's user creation model requires a CRM **role ID** and a **profile ID**; the profile controls CRM-data access. The official API also says CRM Plus users cannot be added by API and must be added in the UI. This is a materially different solution from Directory provisioning and could make a pure no-code Flow path unavailable for the needed entitlement mapping. [Zoho CRM: Add User API](https://www.zoho.com/crm/developer/docs/api/v8/add-user.html)

Confirm the desired target is one of: (a) organization user in Zoho Directory/Zoho One, (b) CRM user license, (c) a user of another Zoho application, or (d) a CRM portal user. Also supply an approved mapping table of `worker attributes -> access package -> directory groups` (or CRM role/profile IDs).

## Controls required before enabling production

* Restrict the form's access and use a work-email field; do not let free text choose privileged access. Google Forms can limit a form to one response, though that requires the respondent to sign in. [Google Forms settings](https://support.google.com/docs/answer/2839588)
* Use fixed choice lists and a least-privilege default. Send unrecognized combinations to `Needs review`, not to a privileged group.
* Store a request ID and only mark `Provisioned` after every Directory action succeeds. On retry, first fetch/search the user by email so a transient failure cannot mint duplicates.
* Keep Flow execution history, status, result, and error message in the queue; Zoho Flow exposes execution input/output and supports resume/restart after failures. [Zoho Directory Flow guide](https://help.zoho.com/portal/en/kb/directory/admin-guide/other-integrations-and-automations/integration/articles/create-workflows-between-zoho-directory-and-other-apps-using-zoho-flow-7-11-2025)
* Test in a non-production organization or with a non-privileged test group; license limits and duplicate email errors are documented for CRM and should be treated as expected operational conditions when validating any user-provisioning design. [Zoho CRM: user creation errors](https://www.zoho.com/crm/developer/docs/api/v8/add-user.html)

## Decision to make next

Proceed with `Google Form (all required fields) -> Google Sheet Row added -> Zoho Flow -> Zoho Directory groups` **only** if Google Workspace allows the Zoho OAuth connection and “role” really means group-based entitlement. If either condition is false, the strongest fully hosted no-code design is `Zoho Forms -> Zoho Flow -> Zoho Directory`, while Directory custom administrator roles and CRM seat provisioning require separate product-specific confirmation.
