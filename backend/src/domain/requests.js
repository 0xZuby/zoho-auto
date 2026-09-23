import { resolveChoiceValue } from './validation.js';
import { generateRequestCode } from './request-code.js';
import { STATUS } from './statuses.js';
import { proposeAccountConfiguration } from '../config/rules.js';
import { proposeCorporateEmail } from './corporate-email.js';
import { isDevelopmentDepartment } from '../config/catalog.js';
import { notFound, conflict } from '../lib/http-error.js';
import { ACCOUNT_TYPE } from './account-types.js';

/**
 * Onboarding request repository.
 *
 * Security boundary (PRD section 18): everything the employee typed lives
 * under `submission` and is treated as untrusted input for authorization
 * purposes. It is never read directly when provisioning a Zoho account.
 * Instead, `proposedAccount` is a deterministic, rules-engine suggestion
 * computed from the submission, and `resolvedAccount` is the auditor's
 * explicit, reviewed decision. Only `resolvedAccount` (set exclusively by an
 * auditor/admin action) is ever used to create the Zoho user.
 */
export function createRequestRepository(store, { corporateEmailDomain }) {
  const collection = store.collection('onboarding-requests');

  function trimmedFields(input, fields) {
    const output = {};
    for (const field of fields) {
      const value = input[field];
      output[field] = typeof value === 'string' ? value.trim() : value ?? '';
    }
    return output;
  }

  function buildSubmission(input) {
    const submission = trimmedFields(input, [
      'requesterEmail',
      'requestType',
      'nameAndSurname',
      'privateEmail',
      'country',
      'countryOther',
      'department',
      'departmentOther',
      'team',
      'teamOther',
      'subTeam',
      'subTeamOther',
      'jobPosition',
      'jobPositionOther',
      'managerEmail',
      'githubProfile',
      'githubRepositories',
    ]);

    return {
      ...submission,
      resolvedCountry: resolveChoiceValue(submission.country, submission.countryOther),
      resolvedDepartment: resolveChoiceValue(submission.department, submission.departmentOther),
      resolvedTeam: resolveChoiceValue(submission.team, submission.teamOther),
      resolvedSubTeam: resolveChoiceValue(submission.subTeam, submission.subTeamOther),
      resolvedJobPosition: resolveChoiceValue(submission.jobPosition, submission.jobPositionOther),
      isDevelopmentRequest: isDevelopmentDepartment(
        resolveChoiceValue(submission.department, submission.departmentOther),
      ),
    };
  }

  async function collectExistingCorporateEmails() {
    const documents = await collection.find(() => true);
    return documents
      .map((document) => document.resolvedAccount?.corporateEmail || document.proposedAccount?.corporateEmail)
      .filter(Boolean);
  }

  async function create(input, options = {}) {
    const submission = buildSubmission(input);
    const submittedAt = new Date().toISOString();

    let proposedAccount;
    if (options.accountOverride) {
      // Used by initiateOffboarding: the offboarding request must target the
      // employee's existing Zoho account, never a freshly generated email.
      proposedAccount = {
        corporateEmail: options.accountOverride.corporateEmail,
        role: options.accountOverride.role,
        groups: options.accountOverride.groups,
        accountType: options.accountOverride.accountType ?? ACCOUNT_TYPE.ZOHO,
        needsReview: false,
        reasons: [],
      };
    } else {
      const existingEmails = await collectExistingCorporateEmails();
      const proposal = proposeAccountConfiguration({
        department: submission.resolvedDepartment,
        team: submission.resolvedTeam,
        subTeam: submission.resolvedSubTeam,
        jobPosition: submission.resolvedJobPosition,
      });
      proposedAccount = {
        corporateEmail: proposeCorporateEmail(submission.nameAndSurname, corporateEmailDomain, existingEmails),
        role: proposal.role,
        groups: proposal.groups,
        // The rules engine only proposes a Zoho role/groups; account type
        // (Zoho vs InsideMaps) is always an explicit auditor choice, never
        // inferred from the submission.
        accountType: ACCOUNT_TYPE.ZOHO,
        needsReview: proposal.needsReview,
        reasons: proposal.reasons,
      };
    }

    const document = {
      requestCode: generateRequestCode(new Date(submittedAt)),
      submission,
      proposedAccount,
      resolvedAccount: null,
      // Points at the request this one supersedes for the same employee
      // (e.g. offboarding supersedes the onboarding request it was started
      // from). Lets the "All employees" directory show one row per person.
      previousRequestId: options.previousRequestId ?? null,
      status: STATUS.PENDING_REVIEW,
      submittedAt,
      reviewedAt: null,
      reviewedBy: null,
      provisioning: {
        steps: [],
        startedAt: null,
        completedAt: null,
        failureReason: null,
      },
      notification: {
        sent: false,
        sentAt: null,
        recipient: null,
        history: [],
      },
      auditTrail: [
        {
          at: submittedAt,
          actorId: options.actorId ?? null,
          actorType: options.actorType ?? 'EMPLOYEE',
          action: options.action ?? 'FORM_SUBMITTED',
          detail: options.initialAuditDetail ?? 'Onboarding form submitted.',
        },
      ],
    };

    return collection.insertOne(document);
  }

  async function listSummaries() {
    const documents = await collection.find(() => true);
    return documents
      .map((document) => ({
        id: document.id,
        requestCode: document.requestCode,
        // Privacy-safe queue fields only (PRD "Auditor Dashboard"): no
        // private email, manager email, or GitHub details leak into the list.
        nameAndSurname: document.submission.nameAndSurname,
        requestType: document.submission.requestType,
        jobPosition: document.submission.resolvedJobPosition,
        department: document.submission.resolvedDepartment,
        status: document.status,
        submittedAt: document.submittedAt,
        needsReview: document.proposedAccount?.needsReview ?? false,
        previousRequestId: document.previousRequestId ?? null,
      }))
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  async function getMetrics() {
    const documents = await collection.find(() => true);
    const count = (predicate) => documents.filter(predicate).length;
    const countByType = (requestType, predicate) => documents.filter(
      (document) => document.submission.requestType === requestType && predicate(document),
    ).length;

    const typeBreakdown = (requestType) => ({
      pending: countByType(requestType, (document) => document.status === STATUS.PENDING_REVIEW),
      provisioning: countByType(requestType, (document) => document.status === STATUS.PROVISIONING || document.status === STATUS.APPROVED),
      failed: countByType(requestType, (document) => document.status === STATUS.PROVISIONING_FAILED || document.status === STATUS.PARTIALLY_PROVISIONED),
      completed: countByType(requestType, (document) => document.status === STATUS.COMPLETED),
      total: countByType(requestType, () => true),
    });

    return {
      newRequests: count((document) => document.status === STATUS.PENDING_REVIEW),
      provisioning: count((document) => document.status === STATUS.PROVISIONING || document.status === STATUS.APPROVED),
      failed: count((document) => document.status === STATUS.PROVISIONING_FAILED || document.status === STATUS.PARTIALLY_PROVISIONED),
      completed: count((document) => document.status === STATUS.COMPLETED),
      byType: {
        NEW_HIRE: typeBreakdown('NEW_HIRE'),
        LEAVING_COMPANY: typeBreakdown('LEAVING_COMPANY'),
        UPDATE_EMPLOYEE_INFO: typeBreakdown('UPDATE_EMPLOYEE_INFO'),
      },
    };
  }

  async function getById(id) {
    const document = await collection.findOne((entry) => entry.id === id);
    if (!document) throw notFound('Onboarding request not found.');
    const supersededBy = await collection.findOne((entry) => entry.previousRequestId === id);
    return { ...document, supersededByRequestId: supersededBy?.id ?? null, supersededByRequestCode: supersededBy?.requestCode ?? null };
  }

  /**
   * The current, non-superseded requests — one per real-world employee.
   * A request is "current" unless some other request lists it as its
   * `previousRequestId` (i.e. an offboarding or later edit has replaced it).
   * This is the same directory concept the "All employees" auditor view
   * uses, reused here so HR can find an existing employee by email when
   * starting an offboarding or an information update.
   */
  async function listCurrentEmployees() {
    const documents = await collection.find(() => true);
    const supersededIds = new Set(documents.map((document) => document.previousRequestId).filter(Boolean));
    return documents.filter((document) => !supersededIds.has(document.id));
  }

  /** Finds current employees whose private or corporate email contains `query` (case-insensitive). */
  async function searchEmployeeDirectory(query) {
    const needle = String(query ?? '').trim().toLowerCase();
    const documents = await listCurrentEmployees();
    const matches = needle
      ? documents.filter((document) => {
        const account = document.resolvedAccount ?? document.proposedAccount;
        return document.submission.privateEmail.toLowerCase().includes(needle)
          || (account?.corporateEmail ?? '').toLowerCase().includes(needle)
          || document.submission.nameAndSurname.toLowerCase().includes(needle);
      })
      : documents;

    return matches
      .map((document) => {
        const account = document.resolvedAccount ?? document.proposedAccount;
        return {
          id: document.id,
          requestCode: document.requestCode,
          nameAndSurname: document.submission.nameAndSurname,
          privateEmail: document.submission.privateEmail,
          corporateEmail: account?.corporateEmail ?? null,
          department: document.submission.resolvedDepartment,
          requestType: document.submission.requestType,
          status: document.status,
        };
      })
      .sort((a, b) => a.nameAndSurname.localeCompare(b.nameAndSurname));
  }

  /** Employee-facing (HR) view of a request: just the submission fields needed to prefill a form, no internal account/audit data. */
  async function getEmployeeSubmission(id) {
    const document = await getById(id);
    return {
      id: document.id,
      requestCode: document.requestCode,
      submission: document.submission,
      status: document.status,
    };
  }

  async function appendAuditEvent(id, event) {
    const updated = await collection.updateOne(
      (entry) => entry.id === id,
      (entry) => ({
        ...entry,
        auditTrail: [...entry.auditTrail, { at: new Date().toISOString(), ...event }],
      }),
    );
    if (!updated) throw notFound('Onboarding request not found.');
    return updated;
  }

  /**
   * The one and only place where employee-submitted data crosses into a
   * privileged, provisionable decision, and it requires an explicit auditor
   * action. `resolvedAccount` is never derived automatically from the
   * submission; it is always either copied verbatim (with acknowledgement)
   * or edited by the reviewing auditor.
   */
  async function saveResolvedAccount(id, { actorId, corporateEmail, role, groups, accountType }) {
    const document = await getById(id);
    if (document.status !== STATUS.PENDING_REVIEW && document.status !== STATUS.APPROVED) {
      throw conflict(`Cannot edit account configuration while request is ${document.status}.`);
    }

    const resolvedAccountType = accountType ?? ACCOUNT_TYPE.ZOHO;
    const isZoho = resolvedAccountType === ACCOUNT_TYPE.ZOHO;

    const resolvedAccount = {
      corporateEmail: String(corporateEmail).trim(),
      // Role/groups are Zoho-specific; an InsideMaps account has neither,
      // so they're stored empty rather than carrying over a stale Zoho
      // proposal the auditor never reviewed for this account type.
      role: isZoho ? String(role ?? '').trim() : '',
      groups: isZoho && Array.isArray(groups) ? groups.map((group) => String(group).trim()).filter(Boolean) : [],
      accountType: resolvedAccountType,
      resolvedBy: actorId,
      resolvedAt: new Date().toISOString(),
    };

    const detail = isZoho
      ? `Account configuration approved: ${resolvedAccount.corporateEmail} / ${resolvedAccount.role} / [${resolvedAccount.groups.join(', ')}]`
      : `Account configuration approved: ${resolvedAccount.corporateEmail} / InsideMaps account (employee signs up on the InsideMaps website)`;

    const nowIso = new Date().toISOString();
    const updated = await collection.updateOne(
      (entry) => entry.id === id,
      (entry) => ({
        ...entry,
        resolvedAccount,
        status: STATUS.APPROVED,
        reviewedAt: entry.reviewedAt ?? nowIso,
        reviewedBy: entry.reviewedBy ?? actorId,
        auditTrail: [
          ...entry.auditTrail,
          {
            at: nowIso,
            actorId,
            actorType: 'AUDITOR',
            action: 'ACCOUNT_CONFIGURATION_APPROVED',
            detail,
          },
        ],
      }),
    );
    if (!updated) throw notFound('Onboarding request not found.');
    return updated;
  }

  async function applyUpdate(id, updater) {
    const updated = await collection.updateOne((entry) => entry.id === id, updater);
    if (!updated) throw notFound('Onboarding request not found.');
    return updated;
  }

  const EDITABLE_SUBMISSION_FIELDS = [
    'nameAndSurname',
    'privateEmail',
    'country',
    'countryOther',
    'department',
    'departmentOther',
    'team',
    'teamOther',
    'subTeam',
    'subTeamOther',
    'jobPosition',
    'jobPositionOther',
    'managerEmail',
    'githubProfile',
    'githubRepositories',
  ];

  const AUDITED_FIELD_LABELS = {
    nameAndSurname: 'Name',
    privateEmail: 'Personal email',
    resolvedCountry: 'Country',
    resolvedDepartment: 'Department',
    resolvedTeam: 'Team',
    resolvedSubTeam: 'Sub team',
    resolvedJobPosition: 'Job position',
    managerEmail: 'Manager email',
    githubProfile: 'GitHub profile',
    githubRepositories: 'GitHub repositories',
  };

  /**
   * Lets an auditor correct employee-submitted details after the fact
   * (name typos, a placement change, etc). Every change is diffed against
   * the previous submission and appended to the audit trail field-by-field,
   * so there is always a readable record of who changed what and when.
   */
  async function updateSubmission(id, { actorId, actorType = 'AUDITOR', actorLabel, patch }) {
    const document = await getById(id);
    if (document.supersededByRequestId) {
      throw conflict('This request has been superseded by a newer request for this employee and can no longer be edited.');
    }
    if (document.status === STATUS.PROVISIONING) {
      throw conflict('Cannot edit employee information while provisioning is in progress.');
    }
    if (document.status === STATUS.REJECTED || document.status === STATUS.CANCELLED) {
      throw conflict(`Cannot edit employee information while request is ${document.status}.`);
    }

    const merged = { ...document.submission };
    for (const field of EDITABLE_SUBMISSION_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(patch, field)) {
        merged[field] = typeof patch[field] === 'string' ? patch[field].trim() : patch[field] ?? '';
      }
    }

    const nextSubmission = {
      ...merged,
      resolvedCountry: resolveChoiceValue(merged.country, merged.countryOther),
      resolvedDepartment: resolveChoiceValue(merged.department, merged.departmentOther),
      resolvedTeam: resolveChoiceValue(merged.team, merged.teamOther),
      resolvedSubTeam: resolveChoiceValue(merged.subTeam, merged.subTeamOther),
      resolvedJobPosition: resolveChoiceValue(merged.jobPosition, merged.jobPositionOther),
      isDevelopmentRequest: isDevelopmentDepartment(resolveChoiceValue(merged.department, merged.departmentOther)),
    };

    const changes = [];
    for (const field of Object.keys(AUDITED_FIELD_LABELS)) {
      if (document.submission[field] !== nextSubmission[field]) {
        const label = AUDITED_FIELD_LABELS[field];
        changes.push(`${label}: "${document.submission[field] || '—'}" → "${nextSubmission[field] || '—'}"`);
      }
    }

    if (changes.length === 0) return document;

    const nowIso = new Date().toISOString();
    const detailPrefix = actorLabel ? `${actorLabel} updated employee information` : 'Updated employee information';
    const updated = await collection.updateOne(
      (entry) => entry.id === id,
      (entry) => ({
        ...entry,
        submission: nextSubmission,
        auditTrail: [
          ...entry.auditTrail,
          {
            at: nowIso,
            actorId,
            actorType,
            action: 'EMPLOYEE_INFO_UPDATED',
            detail: `${detailPrefix} — ${changes.join('; ')}`,
          },
        ],
      }),
    );
    if (!updated) throw notFound('Onboarding request not found.');
    return updated;
  }

  /**
   * Starts an offboarding workflow for an existing employee directly from
   * their request record, instead of waiting for HR to submit a new
   * "Leaving company" form. Creates a fresh LEAVING_COMPANY request that
   * targets the employee's existing Zoho account (never a newly generated
   * email), and cross-links both records in their audit trails.
   */
  async function initiateOffboarding(sourceId, { actorId, actorEmail, actorType = 'AUDITOR', actorLabel }) {
    const source = await getById(sourceId);
    if (source.submission.requestType === 'LEAVING_COMPANY') {
      throw conflict('This request is already an offboarding request.');
    }
    if (source.supersededByRequestId) {
      throw conflict('This request has been superseded by a newer request for this employee.');
    }

    const account = source.resolvedAccount ?? source.proposedAccount;
    if (!account?.corporateEmail) {
      throw conflict('This employee has no corporate account on record to offboard.');
    }

    const existingOffboarding = (await collection.find((entry) => entry.submission.requestType === 'LEAVING_COMPANY'
      && entry.submission.privateEmail === source.submission.privateEmail
      && entry.status !== STATUS.REJECTED
      && entry.status !== STATUS.CANCELLED));
    if (existingOffboarding.length > 0) {
      throw conflict('An offboarding request already exists for this employee.');
    }

    const initiatedBy = actorLabel ? `${actorLabel} (${actorType === 'HR' ? 'HR' : 'an auditor'})` : (actorType === 'HR' ? 'HR' : 'an auditor');
    const offboardingRequest = await create(
      { ...source.submission, requestType: 'LEAVING_COMPANY', requesterEmail: actorEmail || source.submission.requesterEmail },
      {
        actorId,
        actorType,
        action: 'OFFBOARDING_INITIATED',
        initialAuditDetail: `Offboarding initiated by ${initiatedBy} from onboarding request ${source.requestCode}.`,
        accountOverride: { corporateEmail: account.corporateEmail, role: account.role, groups: account.groups, accountType: account.accountType },
        previousRequestId: source.id,
      },
    );

    await appendAuditEvent(sourceId, {
      actorId,
      actorType,
      action: 'OFFBOARDING_INITIATED',
      detail: `Offboarding request ${offboardingRequest.requestCode} was created for this employee${actorLabel ? ` by ${actorLabel}` : ''}.`,
    });

    return offboardingRequest;
  }

  return {
    create,
    listSummaries,
    getMetrics,
    getById,
    appendAuditEvent,
    saveResolvedAccount,
    applyUpdate,
    updateSubmission,
    initiateOffboarding,
    listCurrentEmployees,
    searchEmployeeDirectory,
    getEmployeeSubmission,
  };
}
