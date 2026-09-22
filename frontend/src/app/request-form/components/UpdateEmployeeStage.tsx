'use client';

import type { FormCatalog, FormFieldErrors, OnboardingFormValues } from '@/lib/types';
import { isDevelopmentDepartment, resolveChoiceValue } from '@/lib/validate-onboarding-form';
import { StageTwoPlacement } from './StageTwoPlacement';
import { TextField } from './TextField';
import { TextAreaField } from './TextAreaField';

interface UpdateEmployeeStageProps {
  values: OnboardingFormValues;
  errors: FormFieldErrors;
  catalog: FormCatalog;
  onChange: <K extends keyof OnboardingFormValues>(field: K, value: OnboardingFormValues[K]) => void;
}

/**
 * Editable form for the "Update employee info" flow (PRD: HR clicks
 * "Get all information", updates it, done). Reuses the same field set the
 * onboarding wizard collects, prefilled from the selected employee's current
 * record, so HR only has to change what's actually different.
 */
export function UpdateEmployeeStage({ values, errors, catalog, onChange }: UpdateEmployeeStageProps) {
  const resolvedDepartment = resolveChoiceValue(values.department, values.departmentOther, catalog.otherValue);
  const showGithubFields = isDevelopmentDepartment(resolvedDepartment);

  return (
    <div className="stack gap-24">
      <div className="notice notice-info">
        Editing this employee&rsquo;s information updates their record immediately. The Auditor is notified of the
        change in the audit log — there is no separate approval step for edits.
      </div>

      <StageTwoPlacement values={values} errors={errors} catalog={catalog} onChange={onChange} showRequesterEmail={false} />

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
    </div>
  );
}
