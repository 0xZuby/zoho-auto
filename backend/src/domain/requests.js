import { resolveChoiceValue } from './validation.js';
import { generateRequestCode } from './request-code.js';
import { STATUS } from './statuses.js';
import { proposeAccountConfiguration, resolveCorporateDomain } from '../config/rules.js';
import { proposeCorporateEmailWithCollision } from './corporate-email.js';
import { isDevelopmentDepartment } from '../config/catalog.js';
import { notFound, conflict } from '../lib/http-error.js';
import { ACCOUNT_TYPE, includesInsideMaps, includesZoho } from './account-types.js';

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
export function createRequestRepository(store, { corporateEmailDomain, rulesRepository = null } = {}) {
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
      'startDate',
      'effectiveLeaveDate',
      'effectiveLeaveTimezone',
      'leavingReason',
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

  async function collectExistingCorporateEmails(excludeRequestId = null) {
    const documents = await collection.find(() => true);
    return documents
      .filter((document) => document.id !== excludeRequestId)
      .map((document) => document.resolvedAccount?.corporateEmail || document.proposedAccount?.corporateEmail)
      .filter(Boolean);
  }

  async function computeProposedAccount(submission, excludeRequestId = null) {
    const existingEmails = await collectExistingCorporateEmails(excludeRequestId);
    const rulesConfig = rulesRepository ? await rulesRepository.getRules() : null;
    const proposal = proposeAccountConfiguration(
      {
        department: submission.resolvedDepartment,
        team: submission.resolvedTeam,
        subTeam: submission.resolvedSubTeam,
        jobPosition: submission.resolvedJobPosition,
      },
      rulesConfig,
    );
    const domain = resolveCorporateDomain(
      { team: submission.resolvedTeam, department: submission.resolvedDepartment },
      rulesConfig,
      corporateEmailDomain,
    );
    const emailDerivation = proposeCorporateEmailWithCollision(submission.nameAndSurname, domain, existingEmails);

    return {
      corporateEmail: emailDerivation.corporateEmail,
      baseEmail: emailDerivation.baseEmail,
      collisionAdjusted: emailDerivation.collisionAdjusted,
      collisionSuffix: emailDerivation.collisionSuffix,
      domain,
      role: proposal.role,
      groups: proposal.groups,
      accountType: proposal.accountType ?? ACCOUNT_TYPE.ZOHO,
      insideMapsRoles: proposal.insideMapsRoles ?? [],
      needsReview: proposal.needsReview,
      reasons: proposal.reasons,
      rulesVersion: rulesConfig?.version ?? 1,
    };
  }

  async function create(input, options = {}) {
    const submission = buildSubmission(input);
    const submittedAt = new Date().toISOString();

    let proposedAccount;
    if (options.accountOverride) {
      // Used by initiateOffboarding: the offboarding request must target the
      // employee's existing Zoho/IM account, never a freshly generated email.
      proposedAccount = {
        corporateEmail: options.accountOverride.corporateEmail,
        baseEmail: options.accountOverride.corporateEmail,
        collisionAdjusted: false,
        collisionSuffix: null,
        domain: options.accountOverride.corporateEmail?.split('@')[1] ?? corporateEmailDomain,
        role: options.accountOverride.role,
        groups: options.accountOverride.groups,
        accountType: options.accountOverride.accountType ?? ACCOUNT_TYPE.ZOHO,
        insideMapsRoles: options.accountOverride.insideMapsRoles ?? [],
        needsReview: false,
        reasons: [],
      };
    } else {
      proposedAccount = await computeProposedAccount(submission);
    }

    const auditTrail = [
      {
        at: submittedAt,
        actorId: options.actorId ?? null,
        actorType: options.actorType ?? 'EMPLOYEE',
        system: 'PORTAL',
        action: options.action ?? 'FORM_SUBMITTED',
        result: 'SUCCESS',
        detail: options.initialAuditDetail ?? 'Onboarding form submitted.',
      },
    ];

    if (proposedAccount.collisionAdjusted) {
      auditTrail.push({
        at: submittedAt,
        actorId: null,
        actorType: 'SYSTEM',
        system: 'PORTAL',
        action: 'EMAIL_COLLISION_ADJUSTED',
        result: 'ADJUSTED',
        detail: `Proposed address adjusted for collision: ${proposedAccount.baseEmail} → ${proposedAccount.corporateEmail} (suffix ${proposedAccount.collisionSuffix}).`,
      });
    }

    const document = {
      requestCode: generateRequestCode(new Date(submittedAt)),
      submission,
      previousSubmission: options.previousSubmission ?? null,
      proposedAccount,
      resolvedAccount: null,
      previousRequestId: options.previousRequestId ?? null,
      offboardingSchedule: options.offboardingSchedule ?? null,
      status: STATUS.PENDING_REVIEW,
      submittedAt,
      reviewedAt: null,
      reviewedBy: null,
      provisioning: {
        steps: [],
        startedAt: null,
        completedAt: null,
        failureReason: null,
        failureStep: null,
        failureSystem: null,
        securityPolicy: null,
      },
      notification: {
        sent: false,
        sentAt: null,
        recipient: null,
        history: [],
      },
      auditTrail,
    };

    return collection.insertOne(document);
  }

  function computeLifecycleStages(document) {
    const steps = document.provisioning?.steps ?? [];
    const hasStep = (names, outcome) =>
      steps.some((s) => names.includes(s.name) && (!outcome || s.outcome === outcome));
    const status = document.status;
    const isRejectedOrCancelled = status === STATUS.REJECTED || status === STATUS.CANCELLED;
    const isCompleted =
      status === STATUS.COMPLETED
      || status === STATUS.ACCESS_REVOKED
      || status === STATUS.NOTIFICATION_SENT
      || status === STATUS.ACCOUNT_CREATED;
    const accountType =
      document.resolvedAccount?.accountType
      ?? document.proposedAccount?.accountType
      ?? ACCOUNT_TYPE.ZOHO;

    // 1. Submitted
    const submittedState = 'done';

    // 2. Validated
    let validatedState = 'done';
    if (status === STATUS.RETURNED || isRejectedOrCancelled) {
      validatedState = 'failed';
    } else if (document.proposedAccount?.needsReview && !document.resolvedAccount) {
      validatedState = 'blocked';
    }

    // 3. Approved
    let approvedState = 'pending';
    if (document.resolvedAccount || isCompleted || status === STATUS.SCHEDULED_OFFBOARDING) {
      approvedState = 'done';
    } else if (status === STATUS.PENDING_REVIEW) {
      approvedState = validatedState === 'blocked' ? 'blocked' : 'current';
    } else if (isRejectedOrCancelled) {
      approvedState = 'failed';
    }

    // 4. Zoho
    const zohoStepNames = ['create_user', 'deactivate_user'];
    let zohoState = 'pending';
    if (!includesZoho(accountType) && document.submission.requestType !== 'LEAVING_COMPANY') {
      zohoState = approvedState === 'done' ? 'skipped' : 'pending';
    } else if (hasStep(zohoStepNames, 'FAILED') || document.provisioning?.failureSystem === 'ZOHO') {
      zohoState = 'failed';
    } else if (hasStep(['create_user', 'deactivate_user'], 'SUCCESS') || isCompleted) {
      zohoState = 'done';
    } else if (status === STATUS.APPROVED || status === STATUS.PROVISIONING || status === STATUS.SCHEDULED_OFFBOARDING) {
      zohoState = 'current';
    }

    // 5. InsideMaps
    const imStepNames = ['create_im_user', 'assign_im_roles', 'remove_im_roles', 'delete_im_user'];
    let insideMapsState = 'pending';
    if (
      !includesInsideMaps(accountType)
      && document.submission.requestType !== 'LEAVING_COMPANY'
      && !hasStep(imStepNames)
    ) {
      insideMapsState = zohoState === 'done' || isCompleted ? 'skipped' : 'pending';
    } else if (hasStep(imStepNames, 'FAILED') || document.provisioning?.failureSystem === 'INSIDEMAPS') {
      insideMapsState = 'failed';
    } else if (hasStep(imStepNames, 'SUCCESS') || isCompleted) {
      insideMapsState = 'done';
    } else if (zohoState === 'done' || (!includesZoho(accountType) && approvedState === 'done')) {
      insideMapsState = 'current';
    }

    // 6. Verified
    const verifyStepNames = ['verify_configuration', 'enforce_security_policy'];
    let verifiedState = 'pending';
    if (hasStep(verifyStepNames, 'FAILED')) {
      verifiedState = 'failed';
    } else if (
      status === STATUS.COMPLETED
      || status === STATUS.ACCESS_REVOKED
      || status === STATUS.NOTIFICATION_SENT
      || hasStep(['verify_configuration'], 'SUCCESS')
    ) {
      verifiedState = 'done';
    } else if (status === STATUS.ACCOUNT_CREATED) {
      verifiedState = 'current';
    }

    return [
      { key: 'SUBMITTED', label: 'Submitted', state: submittedState },
      { key: 'VALIDATED', label: 'Validated', state: validatedState },
      { key: 'APPROVED', label: 'Approved', state: approvedState },
      { key: 'ZOHO', label: 'Zoho', state: zohoState },
      { key: 'INSIDEMAPS', label: 'InsideMaps', state: insideMapsState },
      { key: 'VERIFIED', label: 'Verified', state: verifiedState },
    ];
  }

  function evaluateOperationalRisk(document, nowMs = Date.now()) {
    const requestType = document.submission.requestType;
    const status = document.status;
    const isTerminal =
      status === STATUS.COMPLETED
      || status === STATUS.ACCESS_REVOKED
      || status === STATUS.REJECTED
      || status === STATUS.CANCELLED;
    const submittedMs = new Date(document.submittedAt).getTime();
    const elapsedMinutes = Math.max(0, Math.round((nowMs - submittedMs) / 60000));

    // Target deadline: effective leave timestamp for offboarding, startDate for onboarding, or +15m SLA from submission
    let deadlineIso = null;
    if (requestType === 'LEAVING_COMPANY') {
      deadlineIso =
        document.offboardingSchedule?.effectiveAtIso
        || (document.submission.effectiveLeaveDate ? `${document.submission.effectiveLeaveDate}T17:00:00.000Z` : null);
    } else if (document.submission.startDate) {
      deadlineIso = `${document.submission.startDate}T09:00:00.000Z`;
    }
    if (!deadlineIso) {
      deadlineIso = new Date(submittedMs + 15 * 60 * 1000).toISOString();
    }

    const deadlineMs = new Date(deadlineIso).getTime();
    const isPastDeadline = !isTerminal && nowMs > deadlineMs;
    const isSlaBreached = !isTerminal && (elapsedMinutes > 15 || isPastDeadline);

    // Determine blocker & affected system
    let blocker = null;
    let affectedSystem = document.resolvedAccount?.accountType ?? document.proposedAccount?.accountType ?? 'ZOHO';
    let nextAction = 'Monitor';
    let nextActionKey = 'INVESTIGATE';

    if (status === STATUS.PROVISIONING_FAILED || status === STATUS.PARTIALLY_PROVISIONED) {
      blocker = document.provisioning?.failureReason || `Failed at ${document.provisioning?.failureStep || 'provisioning'}`;
      affectedSystem = document.provisioning?.failureSystem || affectedSystem;
      nextAction = requestType === 'LEAVING_COMPANY' ? 'Retry access revocation' : 'Retry failed step';
      nextActionKey = 'RETRY';
    } else if (status === STATUS.PENDING_REVIEW) {
      if (document.proposedAccount?.needsReview) {
        blocker = document.proposedAccount.reasons?.[0] || 'Unmapped position or rule exception';
        affectedSystem = 'RULES';
        nextAction = 'Resolve mapping & approve';
        nextActionKey = 'INVESTIGATE';
      } else {
        blocker = 'Awaiting auditor approval';
        affectedSystem = 'PORTAL';
        nextAction = 'Approve & provision';
        nextActionKey = 'APPROVE';
      }
    } else if (status === STATUS.APPROVED) {
      blocker = 'Approved, waiting for execution';
      nextAction = requestType === 'LEAVING_COMPANY' ? 'Revoke access now' : 'Run provisioning';
      nextActionKey = 'PROVISION';
    } else if (status === STATUS.SCHEDULED_OFFBOARDING) {
      blocker = isPastDeadline ? 'Effective leave time reached — access still active' : 'Scheduled for effective leave date';
      affectedSystem = 'ZOHO + INSIDEMAPS';
      nextAction = isPastDeadline ? 'Execute revocation now' : 'Run offboarding early';
      nextActionKey = 'PROVISION';
    } else if (status === STATUS.ACCOUNT_CREATED) {
      blocker = 'Account created, setup invite not sent';
      affectedSystem = 'MAIL';
      nextAction = 'Send setup invite';
      nextActionKey = 'NOTIFY';
    } else if (status === STATUS.RETURNED) {
      blocker = 'Returned to HR for correction';
      affectedSystem = 'HR';
      nextAction = 'Follow up or escalate';
      nextActionKey = 'ESCALATE';
    }

    // Security & business risk scoring
    let riskLevel = 'LOW';
    let riskScore = 10;
    if (
      requestType === 'LEAVING_COMPANY'
      && !isTerminal
      && (status === STATUS.PROVISIONING_FAILED || status === STATUS.PARTIALLY_PROVISIONED || isPastDeadline)
    ) {
      riskLevel = 'CRITICAL';
      riskScore = 100;
    } else if (status === STATUS.PROVISIONING_FAILED || status === STATUS.PARTIALLY_PROVISIONED) {
      riskLevel = 'HIGH';
      riskScore = 80;
    } else if (requestType === 'LEAVING_COMPANY' && !isTerminal) {
      riskLevel = 'HIGH';
      riskScore = 75;
    } else if (document.proposedAccount?.needsReview || isSlaBreached) {
      riskLevel = 'MEDIUM';
      riskScore = 50;
    } else if (!isTerminal) {
      riskLevel = 'LOW';
      riskScore = 25;
    }

    return {
      riskLevel,
      riskScore: riskScore + Math.min(20, Math.floor(elapsedMinutes / 60)),
      isSlaBreached,
      isOverdue: isPastDeadline || elapsedMinutes > 15,
      deadlineIso,
      blocker,
      affectedSystem,
      nextAction,
      nextActionKey,
      activeAccessWarning:
        requestType === 'LEAVING_COMPANY'
        && status !== STATUS.ACCESS_REVOKED
        && status !== STATUS.COMPLETED
        && status !== STATUS.CANCELLED
        && (status === STATUS.PROVISIONING_FAILED || status === STATUS.PARTIALLY_PROVISIONED || isPastDeadline),
    };
  }

  async function listSummaries() {
    const documents = await collection.find(() => true);
    const nowMs = Date.now();
    return documents
      .map((document) => {
        const risk = evaluateOperationalRisk(document, nowMs);
        return {
          id: document.id,
          requestCode: document.requestCode,
          // Privacy-safe queue fields only (PRD "Auditor Dashboard"): no
          // private email, manager email, or GitHub details leak into the list.
          nameAndSurname: document.submission.nameAndSurname,
          requestType: document.submission.requestType,
          jobPosition: document.submission.resolvedJobPosition,
          department: document.submission.resolvedDepartment,
          team: document.submission.resolvedTeam,
          status: document.status,
          submittedAt: document.submittedAt,
          startDate: document.submission.startDate ?? '',
          effectiveLeaveDate: document.submission.effectiveLeaveDate ?? document.offboardingSchedule?.effectiveDate ?? '',
          effectiveLeaveTimezone: document.submission.effectiveLeaveTimezone ?? document.offboardingSchedule?.timezone ?? 'UTC',
          proposedCorporateEmail: document.resolvedAccount?.corporateEmail ?? document.proposedAccount?.corporateEmail ?? '',
          accountType: document.resolvedAccount?.accountType ?? document.proposedAccount?.accountType ?? ACCOUNT_TYPE.ZOHO,
          collisionAdjusted: document.proposedAccount?.collisionAdjusted ?? false,
          needsReview: document.proposedAccount?.needsReview ?? false,
          reasons: document.proposedAccount?.reasons ?? [],
          failureStep: document.provisioning?.failureStep ?? null,
          failureSystem: document.provisioning?.failureSystem ?? null,
          failureReason: document.provisioning?.failureReason ?? null,
          completedStepsCount: (document.provisioning?.steps ?? []).filter((s) => s.outcome === 'SUCCESS').length,
          previousRequestId: document.previousRequestId ?? null,
          lifecycleStages: computeLifecycleStages(document),
          riskLevel: risk.riskLevel,
          riskScore: risk.riskScore,
          isSlaBreached: risk.isSlaBreached,
          isOverdue: risk.isOverdue,
          deadlineIso: risk.deadlineIso,
          blocker: risk.blocker,
          affectedSystem: risk.affectedSystem,
          nextAction: risk.nextAction,
          nextActionKey: risk.nextActionKey,
          activeAccessWarning: risk.activeAccessWarning,
        };
      })
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  async function getMetrics() {
    const allDocuments = await collection.find(() => true);
    const supersededIds = new Set(allDocuments.map((d) => d.previousRequestId).filter(Boolean));
    const documents = allDocuments.filter((d) => !supersededIds.has(d.id));
    const nowMs = Date.now();
    const count = (predicate) => documents.filter(predicate).length;
    const countByType = (requestType, predicate) => documents.filter(
      (document) => document.submission.requestType === requestType && predicate(document),
    ).length;

    const isException = (document) =>
      document.status === STATUS.PROVISIONING_FAILED
      || document.status === STATUS.PARTIALLY_PROVISIONED
      || (document.status === STATUS.PENDING_REVIEW && document.proposedAccount?.needsReview);

    const isDone = (document) =>
      document.status === STATUS.COMPLETED
      || document.status === STATUS.ACCESS_REVOKED
      || document.status === STATUS.NOTIFICATION_SENT
      || document.status === STATUS.ACCOUNT_CREATED;

    const totalCount = documents.length;
    const completedTotal = count(isDone);
    const completionRate = totalCount === 0 ? 100 : Math.round((completedTotal / totalCount) * 100);

    // Automation rate: share of requests that cleanly mapped via rules without exception or provisioning failure
    const autoCleanCount = count(
      (d) => !d.proposedAccount?.needsReview && d.status !== STATUS.PROVISIONING_FAILED && d.status !== STATUS.PARTIALLY_PROVISIONED,
    );
    const automationRate = totalCount === 0 ? 100 : Math.round((autoCleanCount / totalCount) * 100);

    // Median provisioning time (minutes from startedAt/submittedAt to completedAt)
    const durationsMinutes = documents
      .filter((d) => d.provisioning?.completedAt && (d.provisioning?.startedAt || d.submittedAt))
      .map((d) => {
        const start = new Date(d.provisioning.startedAt || d.submittedAt).getTime();
        const end = new Date(d.provisioning.completedAt).getTime();
        return Math.max(0.2, (end - start) / 60000);
      })
      .sort((a, b) => a - b);

    let medianProvisioningMinutes = null;
    if (durationsMinutes.length > 0) {
      const mid = Math.floor(durationsMinutes.length / 2);
      const raw =
        durationsMinutes.length % 2 === 0
          ? (durationsMinutes[mid - 1] + durationsMinutes[mid]) / 2
          : durationsMinutes[mid];
      medianProvisioningMinutes = Math.round(raw * 10) / 10;
    }

    const risks = documents.map((d) => ({ doc: d, risk: evaluateOperationalRisk(d, nowMs) }));
    const overdueRequests = risks.filter(({ risk }) => risk.isOverdue).length;

    const leaverDocs = risks.filter(({ doc }) => doc.submission.requestType === 'LEAVING_COMPANY');
    const leaverCompliant = leaverDocs.filter(({ risk }) => !risk.activeAccessWarning && !risk.isSlaBreached).length;
    const offboardingSlaRate = leaverDocs.length === 0 ? 100 : Math.round((leaverCompliant / leaverDocs.length) * 100);
    const urgentRevocationCount = risks.filter(({ risk }) => risk.activeAccessWarning).length;

    const typeBreakdown = (requestType) => ({
      pending: countByType(requestType, (document) => document.status === STATUS.PENDING_REVIEW),
      provisioning: countByType(
        requestType,
        (document) => document.status === STATUS.PROVISIONING || document.status === STATUS.APPROVED || document.status === STATUS.SCHEDULED_OFFBOARDING,
      ),
      failed: countByType(requestType, (document) => document.status === STATUS.PROVISIONING_FAILED || document.status === STATUS.PARTIALLY_PROVISIONED),
      completed: countByType(requestType, (document) => isDone(document)),
      total: countByType(requestType, () => true),
    });

    return {
      newRequests: count((document) => document.status === STATUS.PENDING_REVIEW),
      provisioning: count((document) => document.status === STATUS.PROVISIONING || document.status === STATUS.APPROVED || document.status === STATUS.SCHEDULED_OFFBOARDING),
      readyToCreate: count((document) => document.status === STATUS.APPROVED),
      scheduledOffboardings: count((document) => document.status === STATUS.SCHEDULED_OFFBOARDING),
      failed: count((document) => document.status === STATUS.PROVISIONING_FAILED || document.status === STATUS.PARTIALLY_PROVISIONED),
      exceptions: count(isException),
      completed: count((document) => document.status === STATUS.COMPLETED || document.status === STATUS.ACCESS_REVOKED),
      kpis: {
        completionRate,
        automationRate,
        medianProvisioningMinutes,
        overdueRequests,
        offboardingSlaRate,
        urgentRevocationCount,
        totalRequests: totalCount,
      },
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
    const previousDoc = document.previousRequestId
      ? await collection.findOne((entry) => entry.id === document.previousRequestId)
      : null;
    const previousSubmission = document.previousSubmission ?? previousDoc?.submission ?? null;
    return {
      ...document,
      previousSubmission,
      supersededByRequestId: supersededBy?.id ?? null,
      supersededByRequestCode: supersededBy?.requestCode ?? null,
    };
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

  /** Returns the full master-sheet directory rows for the "All employees" auditor table. */
  async function listEmployeeMasterDirectory() {
    const documents = await listCurrentEmployees();
    // Only include employees who have already been onboarded (or have an update / offboarding record)
    const onboardedEmployees = documents.filter((document) => {
      if (document.submission?.requestType === 'NEW_HIRE') {
        const hasAccountCreated =
          document.status === STATUS.ACCOUNT_CREATED
          || document.status === STATUS.NOTIFICATION_SENT
          || document.status === STATUS.COMPLETED
          || (document.provisioning?.steps ?? []).some(
            (s) => (s.name === 'create_user' || s.name === 'create_insidemaps_user') && s.outcome === 'SUCCESS',
          );
        return hasAccountCreated;
      }
      return document.status !== STATUS.REJECTED && document.status !== STATUS.CANCELLED;
    });
    return onboardedEmployees
      .map((document) => {
        const sub = document.submission ?? {};
        const resolved = document.resolvedAccount;
        const proposed = document.proposedAccount;
        const account = resolved ?? proposed;
        const corporateEmail = account?.corporateEmail ?? '';
        const emailSplit = corporateEmail ? corporateEmail.split('@')[0] : '';
        const accountType = account?.accountType ?? ACCOUNT_TYPE.ZOHO;
        const zohoRole = account?.role ?? 'Standard User';
        const imRoles = includesInsideMaps(accountType)
          ? (Array.isArray(account?.insideMapsRoles) && account.insideMapsRoles.length > 0
            ? account.insideMapsRoles
            : (proposed?.insideMapsRoles ?? []))
          : [];

        // Active status: active unless access revoked, rejected, cancelled, or completed offboarding
        const isInactive =
          document.status === STATUS.ACCESS_REVOKED
          || document.status === STATUS.REJECTED
          || document.status === STATUS.CANCELLED
          || (sub.requestType === 'LEAVING_COMPANY' && document.status === STATUS.COMPLETED);

        // Role (primary account summary)
        const roleLabel = [
          includesZoho(accountType) ? 'Zoho Mail' : null,
          includesInsideMaps(accountType) ? `InsideMaps (${imRoles.join(', ') || zohoRole})` : null,
        ].filter(Boolean).join(' + ');

        // Actual roles: Zoho mailbox (no roles/groups) + InsideMaps roles
        const actualRoleParts = [];
        if (includesZoho(accountType)) actualRoleParts.push('Zoho: Mailbox');
        if (imRoles.length > 0) {
          actualRoleParts.push(`IM: ${imRoles.join(', ')}`);
        }

        return {
          id: document.id,
          requestCode: document.requestCode,
          status: document.status,
          requestType: sub.requestType ?? 'NEW_HIRE',
          name: sub.nameAndSurname ?? '',
          emailAddress: sub.privateEmail ?? '',
          emailSplit,
          costCenter: sub.resolvedCountry || sub.country || '',
          department: sub.resolvedDepartment || sub.department || '',
          team: sub.resolvedTeam || sub.team || '',
          subTeam: sub.resolvedSubTeam || sub.subTeam || '',
          jobPosition: sub.resolvedJobPosition || sub.jobPosition || '',
          tlManager: sub.managerEmail ?? '',
          departmentLead: sub.departmentLead || sub.managerEmail || '',
          companyEmail: corporateEmail,
          github: sub.githubProfile
            ? `${sub.githubProfile}${sub.githubRepositories ? ` (${sub.githubRepositories})` : ''}`
            : '',
          active: !isInactive,
          accountType,
          role: roleLabel,
          actualRoles: actualRoleParts.join(' · '),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
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
  async function saveResolvedAccount(id, { actorId, corporateEmail, insideMapsRoles, accountType }) {
    const document = await getById(id);
    if (
      document.status !== STATUS.PENDING_REVIEW
      && document.status !== STATUS.APPROVED
      && document.status !== STATUS.PROVISIONING_FAILED
      && document.status !== STATUS.PARTIALLY_PROVISIONED
    ) {
      throw conflict(`Cannot edit account configuration while request is ${document.status}.`);
    }

    const resolvedAccountType = accountType ?? ACCOUNT_TYPE.ZOHO;
    const hasInsideMaps = includesInsideMaps(resolvedAccountType);
    const normalizedImRoles = hasInsideMaps
      ? (Array.isArray(insideMapsRoles) ? insideMapsRoles : [])
        .map((r) => String(r).trim())
        .filter(Boolean)
      : [];

    // Zoho mailboxes carry no role/groups; `role` is kept only as a summary label.
    const resolvedAccount = {
      corporateEmail: String(corporateEmail).trim(),
      role: normalizedImRoles[0] || 'Standard User',
      groups: [],
      insideMapsRoles: normalizedImRoles,
      accountType: resolvedAccountType,
      resolvedBy: actorId,
      resolvedAt: new Date().toISOString(),
    };

    const proposed = document.proposedAccount;
    const overrides = [];
    if (proposed) {
      if (proposed.corporateEmail && proposed.corporateEmail !== resolvedAccount.corporateEmail) {
        overrides.push(`Email: "${proposed.corporateEmail}" → "${resolvedAccount.corporateEmail}"`);
      }
      if (proposed.accountType && proposed.accountType !== resolvedAccount.accountType) {
        overrides.push(`Account type: "${proposed.accountType}" → "${resolvedAccount.accountType}"`);
      }
      if (hasInsideMaps && (proposed.insideMapsRoles ?? []).join(', ') !== resolvedAccount.insideMapsRoles.join(', ')) {
        overrides.push(`InsideMaps roles: [${(proposed.insideMapsRoles ?? []).join(', ')}] → [${resolvedAccount.insideMapsRoles.join(', ')}]`);
      }
    }

    const overrideSuffix = overrides.length > 0 ? ` (Overrides: ${overrides.join('; ')})` : '';
    const accountSummary = [
      includesZoho(resolvedAccountType) ? 'Zoho Mail' : null,
      hasInsideMaps ? `InsideMaps roles [${resolvedAccount.insideMapsRoles.join(', ')}]` : null,
    ].filter(Boolean).join(' + ');
    const detail = `Account configuration approved: ${resolvedAccount.corporateEmail} / ${accountSummary}${overrideSuffix}`;

    const nowIso = new Date().toISOString();
    const keepFailureStatus = document.status === STATUS.PROVISIONING_FAILED || document.status === STATUS.PARTIALLY_PROVISIONED;
    const updated = await collection.updateOne(
      (entry) => entry.id === id,
      (entry) => ({
        ...entry,
        resolvedAccount,
        status: keepFailureStatus ? entry.status : STATUS.APPROVED,
        reviewedAt: entry.reviewedAt ?? nowIso,
        reviewedBy: entry.reviewedBy ?? actorId,
        auditTrail: [
          ...entry.auditTrail,
          {
            at: nowIso,
            actorId,
            actorType: 'AUDITOR',
            system: 'PORTAL',
            action: 'ACCOUNT_CONFIGURATION_APPROVED',
            result: 'APPROVED',
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
    'startDate',
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
    startDate: 'Start date',
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

    const nextStatus = actorType === 'HR'
      ? STATUS.PENDING_REVIEW
      : document.status;
    const nextRequestType = actorType === 'HR' && patch.resubmit && document.status !== STATUS.RETURNED
      ? 'UPDATE_EMPLOYEE_INFO'
      : nextSubmission.requestType;

    // Even if HR resubmitted identical fields for an info update, allow re-queuing as UPDATE_EMPLOYEE_INFO
    if (changes.length === 0 && !patch.resubmit && nextRequestType === document.submission.requestType) {
      return document;
    }

    const nowIso = new Date().toISOString();
    const detailPrefix = actorLabel ? `${actorLabel} updated employee information` : 'Updated employee information';
    const recalculateProposal =
      document.status === STATUS.PENDING_REVIEW
      || document.status === STATUS.RETURNED
      || actorType === 'HR'
      || !document.resolvedAccount;
    const nextProposedAccount = recalculateProposal
      ? await computeProposedAccount(nextSubmission, id)
      : document.proposedAccount;

    const updated = await collection.updateOne(
      (entry) => entry.id === id,
      (entry) => ({
        ...entry,
        previousSubmission: changes.length > 0 ? entry.submission : (entry.previousSubmission ?? null),
        submission: { ...nextSubmission, requestType: nextRequestType },
        proposedAccount: nextProposedAccount,
        status: nextStatus,
        auditTrail: [
          ...entry.auditTrail,
          {
            at: nowIso,
            actorId,
            actorType,
            system: 'PORTAL',
            action: entry.status === STATUS.RETURNED && actorType === 'HR' ? 'REQUEST_RESUBMITTED' : 'EMPLOYEE_INFO_UPDATED',
            result: 'UPDATED',
            detail: `${detailPrefix} - ${changes.length ? changes.join('; ') : 'resubmitted to queue'}`,
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
   * targets the employee's existing Zoho/IM account (never a newly generated
   * email), and cross-links both records in their audit trails.
   *
   * Supports both immediate execution and scheduled execution on the
   * employee's effective leave date (with timezone).
   */
  async function initiateOffboarding(
    sourceId,
    {
      actorId,
      actorEmail,
      actorType = 'AUDITOR',
      actorLabel,
      effectiveLeaveDate = '',
      effectiveLeaveTimezone = 'UTC',
      leavingReason = '',
    } = {},
  ) {
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
      throw conflict(
        `There is already a pending offboarding request for ${source.submission.nameAndSurname}. Please wait for it to be resolved before submitting another request.`,
      );
    }

    const normalizedDate = String(effectiveLeaveDate ?? '').trim();
    const normalizedTz = String(effectiveLeaveTimezone ?? 'UTC').trim() || 'UTC';
    const normalizedReason = String(leavingReason ?? '').trim();

    // Determine whether the effective leave date is in the future compared to today (YYYY-MM-DD).
    const todayYmd = new Date().toISOString().slice(0, 10);
    const isFutureScheduled = Boolean(normalizedDate && normalizedDate > todayYmd);
    const effectiveAtIso = normalizedDate ? `${normalizedDate}T17:00:00.000Z` : new Date().toISOString();

    const initiatedBy = actorLabel ? `${actorLabel} (${actorType === 'HR' ? 'HR' : 'an auditor'})` : (actorType === 'HR' ? 'HR' : 'an auditor');
    const scheduleNote = normalizedDate
      ? ` Effective leave date: ${normalizedDate} (${normalizedTz})${normalizedReason ? ` — Reason: ${normalizedReason}` : ''}.`
      : '';

    const offboardingRequest = await create(
      {
        ...source.submission,
        requestType: 'LEAVING_COMPANY',
        requesterEmail: actorEmail || source.submission.requesterEmail,
        effectiveLeaveDate: normalizedDate,
        effectiveLeaveTimezone: normalizedTz,
        leavingReason: normalizedReason,
      },
      {
        actorId,
        actorType,
        action: 'OFFBOARDING_INITIATED',
        initialAuditDetail: `Offboarding initiated by ${initiatedBy} from onboarding request ${source.requestCode}.${scheduleNote}`,
        accountOverride: {
          corporateEmail: account.corporateEmail,
          role: account.role,
          groups: account.groups,
          insideMapsRoles: account.insideMapsRoles ?? [],
          accountType: account.accountType,
        },
        offboardingSchedule: normalizedDate
          ? {
              effectiveDate: normalizedDate,
              timezone: normalizedTz,
              effectiveAtIso,
              reason: normalizedReason,
              isScheduledFuture: isFutureScheduled,
            }
          : null,
        previousRequestId: source.id,
      },
    );

    await appendAuditEvent(sourceId, {
      actorId,
      actorType,
      system: 'PORTAL',
      action: 'OFFBOARDING_INITIATED',
      result: isFutureScheduled ? 'SCHEDULED' : 'INITIATED',
      detail: `Offboarding request ${offboardingRequest.requestCode} was created for this employee${actorLabel ? ` by ${actorLabel}` : ''}.${scheduleNote}`,
    });

    const resolved = await saveResolvedAccount(offboardingRequest.id, {
      actorId,
      corporateEmail: account.corporateEmail,
      role: account.role,
      groups: account.groups,
      insideMapsRoles: account.insideMapsRoles ?? [],
      accountType: account.accountType,
    });

    if (isFutureScheduled) {
      return collection.updateOne(
        (entry) => entry.id === resolved.id,
        (entry) => ({
          ...entry,
          status: STATUS.SCHEDULED_OFFBOARDING,
          auditTrail: [
            ...entry.auditTrail,
            {
              at: new Date().toISOString(),
              actorId,
              actorType,
              system: 'PORTAL',
              action: 'OFFBOARDING_SCHEDULED',
              result: 'SCHEDULED',
              detail: `Access blocking scheduled for ${normalizedDate} (${normalizedTz}).`,
            },
          ],
        }),
      );
    }

    return resolved;
  }

  async function findDueOffboardings(asOfIso = new Date().toISOString()) {
    const asOfYmd = String(asOfIso).slice(0, 10);
    const documents = await collection.find((entry) => entry.status === STATUS.SCHEDULED_OFFBOARDING);
    return documents.filter((doc) => {
      const targetDate = doc.offboardingSchedule?.effectiveDate || doc.submission?.effectiveLeaveDate || '';
      return !targetDate || targetDate <= asOfYmd;
    });
  }

  async function listHrRequests(requesterEmail = '') {
    const documents = await collection.find(() => true);
    const normalizedEmail = String(requesterEmail ?? '').trim().toLowerCase();
    const filtered = normalizedEmail
      ? documents.filter((doc) => doc.submission.requesterEmail?.toLowerCase() === normalizedEmail)
      : documents;

    return filtered
      .map((doc) => {
        const lastReturnOrReject = [...(doc.auditTrail ?? [])]
          .reverse()
          .find((e) => e.action === 'REQUEST_RETURNED' || e.action === 'REQUEST_REJECTED');
        return {
          id: doc.id,
          requestCode: doc.requestCode,
          nameAndSurname: doc.submission.nameAndSurname,
          requestType: doc.submission.requestType,
          department: doc.submission.resolvedDepartment,
          jobPosition: doc.submission.resolvedJobPosition,
          status: doc.status,
          submittedAt: doc.submittedAt,
          startDate: doc.submission.startDate ?? '',
          effectiveLeaveDate: doc.submission.effectiveLeaveDate ?? doc.offboardingSchedule?.effectiveDate ?? '',
          note: lastReturnOrReject?.detail ?? null,
        };
      })
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  const usersCollection = store.collection('users');

  async function listSystemAuditLog({ query = '', actorType = '', action = '', system = '' } = {}) {
    const [documents, users] = await Promise.all([
      collection.find(() => true),
      usersCollection.find(() => true),
    ]);
    const userById = new Map(users.map((u) => [u.id, u]));

    const entries = [];
    for (const doc of documents) {
      const requesterEmail = doc.submission?.requesterEmail ?? '';
      for (const item of doc.auditTrail ?? []) {
        const actorUser = item.actorId ? userById.get(item.actorId) : null;
        let actorName = 'System';
        let actorEmail = '';
        if (actorUser) {
          actorName = actorUser.name;
          actorEmail = actorUser.email;
        } else if (item.actorType === 'HR') {
          actorName = requesterEmail ? `HR (${requesterEmail})` : 'HR Submitter';
          actorEmail = requesterEmail;
        } else if (item.actorType === 'AUDITOR') {
          actorName = 'Admin';
        }

        entries.push({
          requestId: doc.id,
          requestCode: doc.requestCode,
          employeeName: doc.submission?.nameAndSurname ?? '',
          requestType: doc.submission?.requestType ?? '',
          at: item.at,
          actorId: item.actorId ?? null,
          actorName,
          actorEmail,
          actorType: item.actorType ?? 'SYSTEM',
          system: item.system ?? 'PORTAL',
          action: item.action ?? '',
          result: item.result ?? 'RECORDED',
          detail: item.detail ?? '',
        });
      }
    }

    const needle = String(query ?? '').trim().toLowerCase();
    return entries
      .filter((entry) => {
        if (actorType && entry.actorType !== actorType) return false;
        if (action && entry.action !== action) return false;
        if (system && entry.system !== system) return false;
        if (needle) {
          const hay = `${entry.requestCode} ${entry.employeeName} ${entry.actorName} ${entry.actorEmail} ${entry.action} ${entry.detail} ${entry.system}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.at) - new Date(a.at));
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
    findDueOffboardings,
    listHrRequests,
    listSystemAuditLog,
    listCurrentEmployees,
    listEmployeeMasterDirectory,
    searchEmployeeDirectory,
    getEmployeeSubmission,
  };
}
