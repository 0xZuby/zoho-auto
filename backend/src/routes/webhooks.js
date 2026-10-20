import { Router } from 'express';
import { asyncHandler } from '../lib/async-handler.js';
import { unauthorized, unprocessable } from '../lib/http-error.js';
import {
  COUNTRIES,
  DEPARTMENTS,
  JOB_POSITIONS,
  OTHER_VALUE,
  SUB_TEAMS,
  TEAMS,
} from '../config/catalog.js';

/**
 * Normalizes raw Google Form / Google Sheet webhook payloads and determines
 * the lifecycle request type (`NEW_HIRE`, `LEAVING_COMPANY`, or
 * `UPDATE_EMPLOYEE_INFO`) automatically on the backend.
 *
 * Google Forms can send either:
 *   1. `{ namedValues: { "Question Title": ["Answer"] }, respondentEmail: "..." }`
 *      (raw Apps Script `e.namedValues` object)
 *   2. Flat key-value JSON `{ "Name and Surname": "...", "Request Type": "..." }`
 *   3. Already-structured fields `{ nameAndSurname, privateEmail, ... }`
 */

function firstString(value) {
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0] ?? '').trim() : '';
  }
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeKey(key) {
  return String(key ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function buildLookup(body = {}) {
  const merged = { ...(body.namedValues ?? {}), ...(body.values ?? {}), ...body };
  const map = new Map();
  for (const [k, v] of Object.entries(merged)) {
    if (k === 'namedValues' || k === 'values' || typeof v === 'object' && !Array.isArray(v)) continue;
    const str = firstString(v);
    if (str) {
      map.set(normalizeKey(k), str);
    }
  }
  return (...candidates) => {
    for (const candidate of candidates) {
      const exact = map.get(normalizeKey(candidate));
      if (exact) return exact;
    }
    // Partial substring match fallback for long Google Form question titles
    for (const candidate of candidates) {
      const norm = normalizeKey(candidate);
      for (const [key, val] of map.entries()) {
        if (key.includes(norm)) return val;
      }
    }
    return '';
  };
}

function matchCatalogChoice(rawValue, catalogOptions, fallback = OTHER_VALUE) {
  const trimmed = String(rawValue ?? '').trim();
  if (!trimmed) {
    return { choice: fallback, other: fallback === OTHER_VALUE ? 'Unspecified' : '' };
  }
  const found = catalogOptions.find((opt) => opt.toLowerCase() === trimmed.toLowerCase());
  if (found) {
    return { choice: found, other: '' };
  }
  return { choice: OTHER_VALUE, other: trimmed };
}

function normalizeDateString(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return '';
}

/**
 * Backend classifier: inspects the raw Google Form fields + existing employee
 * directory to determine whether the submission is:
 *  - `LEAVING_COMPANY` (explicit offboarding/leaver selection, or has an effective leave date / leaving reason)
 *  - `UPDATE_EMPLOYEE_INFO` (explicit update selection, or matches an existing employee when not leaving)
 *  - `NEW_HIRE` (default for new employees)
 */
export function classifyAndNormalizeGoogleFormPayload(rawBody = {}, existingEmployee = null) {
  const pick = buildLookup(rawBody);

  const rawRequestType = pick('requestType', 'Request Type', 'Type of request', 'Action', 'Workflow');
  const effectiveLeaveDate = normalizeDateString(
    pick('effectiveLeaveDate', 'Effective Leave Date', 'Leave Date', 'Last Working Day', 'Termination Date'),
  );
  const leavingReason = pick('leavingReason', 'Leaving Reason', 'Reason for leaving', 'Offboarding reason');

  let requestType = 'NEW_HIRE';
  const upperType = rawRequestType.toUpperCase();

  if (
    upperType.includes('LEAV') ||
    upperType.includes('OFFBOARD') ||
    upperType.includes('TERMINAT') ||
    upperType.includes('DEACTIVAT') ||
    (!upperType && Boolean(effectiveLeaveDate || leavingReason))
  ) {
    requestType = 'LEAVING_COMPANY';
  } else if (
    upperType.includes('UPDATE') ||
    upperType.includes('CHANGE') ||
    upperType.includes('EDIT') ||
    upperType.includes('MODIFY') ||
    (!upperType && Boolean(existingEmployee))
  ) {
    requestType = 'UPDATE_EMPLOYEE_INFO';
  } else if (upperType.includes('NEW') || upperType.includes('HIRE') || upperType.includes('ONBOARD')) {
    requestType = 'NEW_HIRE';
  }

  const requesterEmail =
    pick('requesterEmail', 'Requester Email', 'Submitted By', 'HR Email', 'Email Address', 'respondentEmail') ||
    'hr@insidemaps.com';
  const nameAndSurname = pick('nameAndSurname', 'Name and Surname', 'Employee Name', 'Full Name', 'Name');
  const privateEmail = pick(
    'privateEmail',
    'Private Email',
    'Personal Email',
    'Employee Email',
    'Work Email',
    'Corporate Email',
  );

  const countryMatch = matchCatalogChoice(pick('country', 'Country', 'Location'), COUNTRIES);
  const departmentMatch = matchCatalogChoice(pick('department', 'Department'), DEPARTMENTS);
  const teamMatch = matchCatalogChoice(pick('team', 'Team'), TEAMS);
  const subTeamMatch = matchCatalogChoice(pick('subTeam', 'Sub Team', 'Sub-team', 'Subteam'), SUB_TEAMS);
  const positionMatch = matchCatalogChoice(
    pick('jobPosition', 'Job Position', 'Position', 'Role', 'Title', 'Job Title'),
    JOB_POSITIONS,
  );

  const managerEmail =
    pick('managerEmail', 'Manager Email', 'Team Lead', 'Manager', 'Supervisor Email') || 'manager@insidemaps.com';
  const startDate =
    normalizeDateString(pick('startDate', 'Start Date', 'Joining Date', 'First Day')) ||
    new Date().toISOString().slice(0, 10);
  const effectiveLeaveTimezone = pick('effectiveLeaveTimezone', 'Timezone', 'Leave Timezone') || 'UTC';
  const githubProfile = pick('githubProfile', 'GitHub Profile', 'GitHub Username', 'GitHub');
  const githubRepositories = pick('githubRepositories', 'GitHub Repositories', 'Repositories', 'GitHub Repos');

  return {
    requestType,
    requesterEmail,
    nameAndSurname: nameAndSurname || existingEmployee?.nameAndSurname || '',
    privateEmail: privateEmail || existingEmployee?.privateEmail || '',
    country: pick('countryOther') ? OTHER_VALUE : countryMatch.choice,
    countryOther: pick('countryOther') || countryMatch.other,
    department: pick('departmentOther') ? OTHER_VALUE : departmentMatch.choice,
    departmentOther: pick('departmentOther') || departmentMatch.other,
    team: pick('teamOther') ? OTHER_VALUE : teamMatch.choice,
    teamOther: pick('teamOther') || teamMatch.other,
    subTeam: pick('subTeamOther') ? OTHER_VALUE : subTeamMatch.choice,
    subTeamOther: pick('subTeamOther') || subTeamMatch.other,
    jobPosition: pick('jobPositionOther') ? OTHER_VALUE : positionMatch.choice,
    jobPositionOther: pick('jobPositionOther') || positionMatch.other,
    managerEmail,
    startDate,
    effectiveLeaveDate,
    effectiveLeaveTimezone,
    leavingReason,
    githubProfile: githubProfile || (departmentMatch.choice === 'Development' || departmentMatch.choice === '3D' ? 'pending-github' : ''),
    githubRepositories:
      githubRepositories || (departmentMatch.choice === 'Development' || departmentMatch.choice === '3D' ? 'pending-repo' : ''),
  };
}

export function createWebhookRouter({ requestRepository, provisioningService, webhookSecret }) {
  const router = Router();

  router.post(
    '/google-form',
    asyncHandler(async (req, res) => {
      if (webhookSecret) {
        const providedSecret =
          req.headers['x-webhook-secret'] || req.query.secret || req.body?.secret || '';
        if (providedSecret !== webhookSecret) {
          throw unauthorized('Invalid or missing Google Form webhook secret.');
        }
      }

      const rawBody = req.body ?? {};
      const pick = buildLookup(rawBody);
      const lookupQuery =
        pick('privateEmail', 'Private Email', 'Personal Email', 'Work Email', 'Corporate Email') ||
        pick('nameAndSurname', 'Name and Surname', 'Full Name', 'Employee Name');

      const directoryMatches = lookupQuery
        ? await requestRepository.searchEmployeeDirectory(lookupQuery)
        : [];
      const existingEmployee = directoryMatches[0] ?? null;

      const normalized = classifyAndNormalizeGoogleFormPayload(rawBody, existingEmployee);

      if (!normalized.nameAndSurname && !normalized.privateEmail) {
        throw unprocessable('Webhook payload must include at least Employee Name or Email.', {
          nameAndSurname: 'Missing employee name or email in Google Form submission.',
        });
      }

      // Case 1: LEAVING_COMPANY
      if (normalized.requestType === 'LEAVING_COMPANY') {
        if (existingEmployee) {
          const created = await requestRepository.initiateOffboarding(existingEmployee.id, {
            actorId: null,
            actorEmail: normalized.requesterEmail,
            actorType: 'HR',
            actorLabel: `Google Form (${normalized.requesterEmail})`,
            effectiveLeaveDate: normalized.effectiveLeaveDate,
            effectiveLeaveTimezone: normalized.effectiveLeaveTimezone,
            leavingReason: normalized.leavingReason,
          });

          if (created.status === 'SCHEDULED_OFFBOARDING') {
            res.status(201).json({
              ok: true,
              detectedRequestType: 'LEAVING_COMPANY',
              requestCode: created.requestCode,
              status: created.status,
              scheduledFor: created.offboardingSchedule?.effectiveDate ?? normalized.effectiveLeaveDate,
            });
            return;
          }

          const { request } = await provisioningService.run(created.id);
          res.status(201).json({
            ok: true,
            detectedRequestType: 'LEAVING_COMPANY',
            requestCode: request.requestCode,
            status: request.status,
          });
          return;
        }

        // If employee wasn't in the local directory yet, still record the LEAVING_COMPANY request in the queue
        const created = await requestRepository.create(normalized, {
          actorId: null,
          actorType: 'HR',
          action: 'GOOGLE_FORM_OFFBOARDING_SUBMITTED',
          initialAuditDetail: `Google Form offboarding submitted by ${normalized.requesterEmail}.`,
        });
        res.status(201).json({
          ok: true,
          detectedRequestType: 'LEAVING_COMPANY',
          requestCode: created.requestCode,
          status: created.status,
        });
        return;
      }

      // Case 2: UPDATE_EMPLOYEE_INFO
      if (normalized.requestType === 'UPDATE_EMPLOYEE_INFO') {
        if (existingEmployee) {
          const existingDoc = await requestRepository.getById(existingEmployee.id);
          // Preserve any fields the Google Form left blank during a partial update
          const mergedUpdate = { ...existingDoc.submission };
          for (const [k, v] of Object.entries(normalized)) {
            if (typeof v === 'string' && v.trim() !== '' && v !== 'Other' && v !== 'Unspecified') {
              mergedUpdate[k] = v;
            }
          }
          mergedUpdate.requestType = 'UPDATE_EMPLOYEE_INFO';

          const updated = await requestRepository.updateSubmission(existingEmployee.id, {
            actorId: null,
            actorType: 'HR',
            actorLabel: `Google Form (${normalized.requesterEmail})`,
            patch: { ...mergedUpdate, resubmit: true },
          });
          res.status(200).json({
            ok: true,
            detectedRequestType: 'UPDATE_EMPLOYEE_INFO',
            requestCode: updated.requestCode,
            status: updated.status,
          });
          return;
        }

        const created = await requestRepository.create(
          { ...normalized, requestType: 'UPDATE_EMPLOYEE_INFO' },
          {
            actorId: null,
            actorType: 'HR',
            action: 'GOOGLE_FORM_INFO_UPDATE_SUBMITTED',
            initialAuditDetail: `Google Form employee info update submitted by ${normalized.requesterEmail}.`,
          },
        );
        res.status(201).json({
          ok: true,
          detectedRequestType: 'UPDATE_EMPLOYEE_INFO',
          requestCode: created.requestCode,
          status: created.status,
        });
        return;
      }

      // Case 3: NEW_HIRE (or UPDATE where employee didn't exist yet)
      const created = await requestRepository.create(
        { ...normalized, requestType: 'NEW_HIRE' },
        {
          actorId: null,
          actorType: 'HR',
          action: 'GOOGLE_FORM_SUBMITTED',
          initialAuditDetail: `Google Form new-hire request submitted by ${normalized.requesterEmail}.`,
        },
      );

      res.status(201).json({
        ok: true,
        detectedRequestType: 'NEW_HIRE',
        requestCode: created.requestCode,
        status: created.status,
        proposedCorporateEmail: created.proposedAccount?.corporateEmail,
      });
    }),
  );

  return router;
}
