'use client';

import type { FormCatalog, FormFieldErrors, OnboardingFormValues } from '@/lib/types';
import { isDevelopmentDepartment, resolveChoiceValue } from '@/lib/validate-onboarding-form';
import { TextField } from './TextField';
import { TextAreaField } from './TextAreaField';

interface StageThreeReviewProps {
  values: OnboardingFormValues;
  errors: FormFieldErrors;
  catalog: FormCatalog;
  onChange: <K extends keyof OnboardingFormValues>(field: K, value: OnboardingFormValues[K]) => void;
  onEditStage: (stage: 1 | 2) => void;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  NEW_HIRE: 'New hire',
  LEAVING_COMPANY: 'Leaving company',
  UPDATE_EMPLOYEE_INFO: 'Update employee info',
};

export function StageThreeReview({ values, errors, catalog, onChange, onEditStage }: StageThreeReviewProps) {
  const resolvedDepartment = resolveChoiceValue(values.department, values.departmentOther, catalog.otherValue);
  const showGithubFields = isDevelopmentDepartment(resolvedDepartment);

  return (
    <div className="stack gap-24">
      <div className="stack gap-4">
        <h2 style={{ fontSize: 19 }}>Review request</h2>
        <p className="text-muted text-sm">
          {showGithubFields
            ? 'Development details detected — include GitHub information before sending the request.'
            : 'Confirm the details below before sending the request.'}
        </p>
      </div>

      {showGithubFields && (
        <div className="form-grid">
          <TextField
            label="GitHub profile link/name (Dev only)"
            required
            value={values.githubProfile}
            error={errors.githubProfile}
            placeholder="https://github.com/janedoe"
            onChange={(value) => onChange('githubProfile', value)}
          />
          <TextAreaField
            label="GitHub repo/s to be added to (Dev only)"
            required
            value={values.githubRepositories}
            error={errors.githubRepositories}
            hint="List one or more repositories, separated by commas or new lines."
            placeholder="insidemaps/api, insidemaps/web-portal"
            onChange={(value) => onChange('githubRepositories', value)}
          />
        </div>
      )}

      <div className="card card-padded stack gap-16">
        <div className="row-between">
          <h3 style={{ fontSize: 15 }}>Request summary</h3>
        </div>

        <dl className="definition-list">
          <ReviewItem label="Requester email" value={values.requesterEmail} onEdit={() => onEditStage(2)} />
          <ReviewItem label="Request type" value={REQUEST_TYPE_LABELS[values.requestType] ?? values.requestType} onEdit={() => onEditStage(1)} />
          <ReviewItem label="Name and surname" value={values.nameAndSurname} onEdit={() => onEditStage(2)} />
          <ReviewItem label="Private email" value={values.privateEmail} />
          <ReviewItem label="Country" value={resolveChoiceValue(values.country, values.countryOther, catalog.otherValue)} />
          <ReviewItem label="Department" value={resolvedDepartment} />
          <ReviewItem label="Team" value={resolveChoiceValue(values.team, values.teamOther, catalog.otherValue)} />
          <ReviewItem label="Sub team" value={resolveChoiceValue(values.subTeam, values.subTeamOther, catalog.otherValue)} />
          <ReviewItem label="Job position" value={resolveChoiceValue(values.jobPosition, values.jobPositionOther, catalog.otherValue)} />
          <ReviewItem label="Manager email" value={values.managerEmail} />
          {showGithubFields && <ReviewItem label="GitHub profile" value={values.githubProfile || '—'} />}
          {showGithubFields && <ReviewItem label="GitHub repositories" value={values.githubRepositories || '—'} />}
        </dl>
      </div>
    </div>
  );
}

function ReviewItem({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
  return (
    <div>
      <dt className="row-between">
        <span>{label}</span>
        {onEdit && (
          <button type="button" className="btn btn-ghost" style={{ height: 'auto', padding: '2px 6px', fontSize: 11 }} onClick={onEdit}>
            Edit
          </button>
        )}
      </dt>
      <dd>{value || '—'}</dd>
    </div>
  );
}
