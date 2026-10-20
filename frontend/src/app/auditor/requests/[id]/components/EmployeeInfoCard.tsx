'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormCatalog, OnboardingRequest } from '@/lib/types';
import { ApiError } from '@/lib/api-client';
import { getFormCatalog } from '@/lib/form-api';
import { offboardEmployee, updateEmployeeSubmission, type UpdateSubmissionInput } from '@/lib/auditor-api';
import { TextField } from '../../../../request-form/components/TextField';
import { ChoiceWithOtherField } from '../../../../request-form/components/ChoiceWithOtherField';
import { ConfirmOffboardDialog } from './ConfirmOffboardDialog';

const REQUEST_TYPE_LABELS: Record<string, string> = {
  NEW_HIRE: 'New hire',
  LEAVING_COMPANY: 'Leaving company',
  UPDATE_EMPLOYEE_INFO: 'Update employee info',
};

// Matches config/catalog.js's OTHER_VALUE sentinel. HR chose free text for
// this field instead of a catalog option, so the rules engine (PRD section
// 10) has nothing to map it to — flag it for the auditor rather than
// silently falling back to "needs review" on the account side only.
const OTHER_SENTINEL = 'Other';

function UnmappedFlag() {
  return (
    <span className="chip chip-warning unmapped-flag" title="HR entered a free-text value the rules engine can't map.">
      Unmapped
    </span>
  );
}

function toFormState(request: OnboardingRequest): UpdateSubmissionInput {
  const { submission } = request;
  return {
    nameAndSurname: submission.nameAndSurname,
    privateEmail: submission.privateEmail,
    country: submission.country,
    countryOther: submission.countryOther,
    department: submission.department,
    departmentOther: submission.departmentOther,
    team: submission.team,
    teamOther: submission.teamOther,
    subTeam: submission.subTeam,
    subTeamOther: submission.subTeamOther,
    jobPosition: submission.jobPosition,
    jobPositionOther: submission.jobPositionOther,
    managerEmail: submission.managerEmail,
    startDate: submission.startDate,
    githubProfile: submission.githubProfile,
    githubRepositories: submission.githubRepositories,
  };
}

interface EmployeeInfoCardProps {
  request: OnboardingRequest;
  onUpdated: (request: OnboardingRequest) => void;
}

function renderDiffValue(oldValue: string | undefined, newValue: string | undefined) {
  const prev = (oldValue ?? '').trim();
  const next = (newValue ?? '').trim();
  if (prev && prev !== next) {
    return (
      <span className="diff-value">
        <del className="diff-old">{prev}</del>
        <span className="diff-arrow" aria-hidden>→</span>
        <ins className="diff-new">{next || '-'}</ins>
      </span>
    );
  }
  return <span>{next || '-'}</span>;
}

export function EmployeeInfoCard({ request, onUpdated }: EmployeeInfoCardProps) {
  const router = useRouter();
  const { submission, previousSubmission } = request;

  const [catalog, setCatalog] = useState<FormCatalog | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateSubmissionInput>(() => toFormState(request));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const [showOffboardConfirm, setShowOffboardConfirm] = useState(false);
  const [isOffboarding, setIsOffboarding] = useState(false);
  const [offboardError, setOffboardError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && !catalog) {
      getFormCatalog()
        .then(setCatalog)
        .catch(() => setErrors({ _form: 'Could not load the option lists. Try again.' }));
    }
  }, [isEditing, catalog]);

  function updateField<K extends keyof UpdateSubmissionInput>(field: K, value: UpdateSubmissionInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEditing() {
    setForm(toFormState(request));
    setErrors({});
    setSaveNotice(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setErrors({});
  }

  async function handleSave() {
    setErrors({});
    setSaveNotice(null);
    setIsSaving(true);
    try {
      const updated = await updateEmployeeSubmission(request.id, form);
      onUpdated(updated);
      setIsEditing(false);
      setSaveNotice('Employee information updated.');
    } catch (error) {
      if (error instanceof ApiError && error.payload.errors) {
        setErrors(error.payload.errors);
      } else {
        setErrors({ _form: error instanceof ApiError ? error.message : 'Could not save employee information.' });
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleOffboard() {
    setIsOffboarding(true);
    setOffboardError(null);
    try {
      const offboardingRequest = await offboardEmployee(request.id);
      router.push(`/auditor/requests/${offboardingRequest.id}`);
    } catch (error) {
      setOffboardError(error instanceof ApiError ? error.message : 'Could not start offboarding for this employee.');
      setIsOffboarding(false);
      setShowOffboardConfirm(false);
    }
  }

  const isDevelopmentRequest = catalog
    ? isDevelopmentValue(form.department === catalog.otherValue ? form.departmentOther : form.department)
    : submission.isDevelopmentRequest;

  const canOffboard = submission.requestType !== 'LEAVING_COMPANY' && !request.supersededByRequestId;
  const canEdit = !request.supersededByRequestId;

  return (
    <section className="card card-padded detail-card stack gap-16">
      <div className="row-between">
        <div className="row" style={{ gap: 10 }}>
          <h2 style={{ fontSize: 15 }}>Employee information</h2>
          {previousSubmission && !isEditing && (
            <span className="chip chip-info" style={{ fontSize: 11, padding: '2px 8px' }}>
              Changes highlighted
            </span>
          )}
        </div>
        {canEdit && (
          <div className="row" style={{ gap: 8 }}>
            {isEditing ? (
              <>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEditing} disabled={isSaving}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-secondary btn-sm" onClick={startEditing}>
                Edit
              </button>
            )}
            {canOffboard && !isEditing && (
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setShowOffboardConfirm(true)}>
                Offboard
              </button>
            )}
          </div>
        )}
      </div>

      {offboardError && <div className="notice notice-error">{offboardError}</div>}
      {saveNotice && !isEditing && <div className="notice notice-success">{saveNotice}</div>}

      {!isEditing && (
        <dl className="definition-list">
          <div className={previousSubmission && previousSubmission.nameAndSurname !== submission.nameAndSurname ? 'is-changed' : ''}>
            <dt>Name and Surname</dt>
            <dd>{renderDiffValue(previousSubmission?.nameAndSurname, submission.nameAndSurname)}</dd>
          </div>
          <div className={previousSubmission && previousSubmission.requesterEmail !== submission.requesterEmail ? 'is-changed' : ''}>
            <dt>Requester email</dt>
            <dd>{renderDiffValue(previousSubmission?.requesterEmail, submission.requesterEmail)}</dd>
          </div>
          <div>
            <dt>Request type</dt>
            <dd>{REQUEST_TYPE_LABELS[submission.requestType] ?? submission.requestType}</dd>
          </div>
          <div className={previousSubmission && previousSubmission.privateEmail !== submission.privateEmail ? 'is-changed' : ''}>
            <dt>Personal email</dt>
            <dd>{renderDiffValue(previousSubmission?.privateEmail, submission.privateEmail)}</dd>
          </div>
          <div className={previousSubmission && previousSubmission.resolvedCountry !== submission.resolvedCountry ? 'is-changed' : ''}>
            <dt>Country</dt>
            <dd>
              {renderDiffValue(previousSubmission?.resolvedCountry, submission.resolvedCountry)}{' '}
              {submission.country === OTHER_SENTINEL && <UnmappedFlag />}
            </dd>
          </div>
          <div className={previousSubmission && previousSubmission.resolvedDepartment !== submission.resolvedDepartment ? 'is-changed' : ''}>
            <dt>Department</dt>
            <dd>
              {renderDiffValue(previousSubmission?.resolvedDepartment, submission.resolvedDepartment)}{' '}
              {submission.department === OTHER_SENTINEL && <UnmappedFlag />}
            </dd>
          </div>
          <div className={previousSubmission && previousSubmission.resolvedTeam !== submission.resolvedTeam ? 'is-changed' : ''}>
            <dt>Team</dt>
            <dd>
              {renderDiffValue(previousSubmission?.resolvedTeam, submission.resolvedTeam)}{' '}
              {submission.team === OTHER_SENTINEL && <UnmappedFlag />}
            </dd>
          </div>
          <div className={previousSubmission && previousSubmission.resolvedSubTeam !== submission.resolvedSubTeam ? 'is-changed' : ''}>
            <dt>Sub team</dt>
            <dd>
              {renderDiffValue(previousSubmission?.resolvedSubTeam, submission.resolvedSubTeam)}{' '}
              {submission.subTeam === OTHER_SENTINEL && <UnmappedFlag />}
            </dd>
          </div>
          <div className={previousSubmission && previousSubmission.resolvedJobPosition !== submission.resolvedJobPosition ? 'is-changed' : ''}>
            <dt>Job position</dt>
            <dd>
              {renderDiffValue(previousSubmission?.resolvedJobPosition, submission.resolvedJobPosition)}{' '}
              {submission.jobPosition === OTHER_SENTINEL && <UnmappedFlag />}
            </dd>
          </div>
          <div className={previousSubmission && previousSubmission.managerEmail !== submission.managerEmail ? 'is-changed' : ''}>
            <dt>Team Lead / Manager email</dt>
            <dd>{renderDiffValue(previousSubmission?.managerEmail, submission.managerEmail)}</dd>
          </div>
          <div className={previousSubmission && previousSubmission.startDate !== submission.startDate ? 'is-changed' : ''}>
            <dt>Start date</dt>
            <dd>{renderDiffValue(previousSubmission?.startDate, submission.startDate)}</dd>
          </div>
          {submission.isDevelopmentRequest && (
            <>
              <div className={previousSubmission && previousSubmission.githubProfile !== submission.githubProfile ? 'is-changed' : ''}>
                <dt>GitHub profile</dt>
                <dd>{renderDiffValue(previousSubmission?.githubProfile, submission.githubProfile)}</dd>
              </div>
              <div className={`span-2${previousSubmission && previousSubmission.githubRepositories !== submission.githubRepositories ? ' is-changed' : ''}`}>
                <dt>GitHub repositories</dt>
                <dd style={{ whiteSpace: 'pre-wrap' }}>
                  {renderDiffValue(previousSubmission?.githubRepositories, submission.githubRepositories)}
                </dd>
              </div>
            </>
          )}
        </dl>
      )}

      {isEditing && (
        <div className="stack gap-16">
          {!catalog && <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />}

          {catalog && (
            <>
              <div className="form-grid">
                <TextField
                  label="Name and Surname"
                  required
                  value={form.nameAndSurname}
                  error={errors.nameAndSurname}
                  className="span-2"
                  onChange={(value) => updateField('nameAndSurname', value)}
                />
                <TextField
                  label="Personal email"
                  required
                  type="email"
                  value={form.privateEmail}
                  error={errors.privateEmail}
                  onChange={(value) => updateField('privateEmail', value)}
                />
                <TextField
                  label="Team Lead / Manager email"
                  required
                  type="email"
                  value={form.managerEmail}
                  error={errors.managerEmail}
                  onChange={(value) => updateField('managerEmail', value)}
                />
                <TextField
                  label="Start date"
                  type="date"
                  value={form.startDate}
                  error={errors.startDate}
                  onChange={(value) => updateField('startDate', value)}
                />
                <ChoiceWithOtherField
                  label="Country"
                  options={catalog.countries}
                  otherSentinel={catalog.otherValue}
                  value={form.country}
                  otherValue={form.countryOther}
                  error={errors.country}
                  otherError={errors.countryOther}
                  onChange={(value) => updateField('country', value)}
                  onOtherChange={(value) => updateField('countryOther', value)}
                />
                <ChoiceWithOtherField
                  label="Department"
                  options={catalog.departments}
                  otherSentinel={catalog.otherValue}
                  value={form.department}
                  otherValue={form.departmentOther}
                  error={errors.department}
                  otherError={errors.departmentOther}
                  onChange={(value) => updateField('department', value)}
                  onOtherChange={(value) => updateField('departmentOther', value)}
                />
                <ChoiceWithOtherField
                  label="Team"
                  options={catalog.teams}
                  otherSentinel={catalog.otherValue}
                  value={form.team}
                  otherValue={form.teamOther}
                  error={errors.team}
                  otherError={errors.teamOther}
                  onChange={(value) => updateField('team', value)}
                  onOtherChange={(value) => updateField('teamOther', value)}
                />
                <ChoiceWithOtherField
                  label="Sub team"
                  options={catalog.subTeams}
                  otherSentinel={catalog.otherValue}
                  value={form.subTeam}
                  otherValue={form.subTeamOther}
                  error={errors.subTeam}
                  otherError={errors.subTeamOther}
                  onChange={(value) => updateField('subTeam', value)}
                  onOtherChange={(value) => updateField('subTeamOther', value)}
                />
                <ChoiceWithOtherField
                  label="Job position"
                  options={catalog.jobPositions}
                  otherSentinel={catalog.otherValue}
                  value={form.jobPosition}
                  otherValue={form.jobPositionOther}
                  error={errors.jobPosition}
                  otherError={errors.jobPositionOther}
                  onChange={(value) => updateField('jobPosition', value)}
                  onOtherChange={(value) => updateField('jobPositionOther', value)}
                />

                {isDevelopmentRequest && (
                  <>
                    <TextField
                      label="GitHub profile"
                      required
                      value={form.githubProfile}
                      error={errors.githubProfile}
                      onChange={(value) => updateField('githubProfile', value)}
                    />
                    <TextField
                      label="GitHub repositories"
                      required
                      value={form.githubRepositories}
                      error={errors.githubRepositories}
                      className="span-2"
                      onChange={(value) => updateField('githubRepositories', value)}
                    />
                  </>
                )}
              </div>

              {errors._form && <div className="notice notice-error">{errors._form}</div>}

              <div className="row" style={{ gap: 8 }}>
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={cancelEditing} disabled={isSaving}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {showOffboardConfirm && (
        <ConfirmOffboardDialog
          employeeName={submission.nameAndSurname}
          isSubmitting={isOffboarding}
          onCancel={() => setShowOffboardConfirm(false)}
          onConfirm={handleOffboard}
        />
      )}
    </section>
  );
}

function isDevelopmentValue(value: string) {
  return ['3d', 'development', 'developement'].includes(value.trim().toLowerCase());
}
