'use client';

import type { FormCatalog, FormFieldErrors, OnboardingFormValues } from '@/lib/types';
import { TextField } from './TextField';
import { ChoiceWithOtherField } from './ChoiceWithOtherField';

interface StageTwoPlacementProps {
  values: OnboardingFormValues;
  errors: FormFieldErrors;
  catalog: FormCatalog;
  onChange: <K extends keyof OnboardingFormValues>(field: K, value: OnboardingFormValues[K]) => void;
  /** Hidden when this form is reused for the "Update employee info" flow, where there is no separate requester step. */
  showRequesterEmail?: boolean;
}

export function StageTwoPlacement({ values, errors, catalog, onChange, showRequesterEmail = true }: StageTwoPlacementProps) {
  return (
    <div className="stack gap-24">
      <div className="stack gap-4">
        <h2 style={{ fontSize: 19 }}>Employee details</h2>
        <p className="text-muted text-sm">Tell us who the request is for and where they sit in the organization.</p>
      </div>

      <div className="notice notice-info">
        Placement details help route the request. An auditor reviews and approves the final Zoho role and groups separately.
      </div>

      {showRequesterEmail && (
        <TextField
          label="HR requester email"
          required
          type="email"
          value={values.requesterEmail}
          error={errors.requesterEmail}
          hint="We’ll keep this on the request record for follow-up."
          placeholder="hr@company.com"
          onChange={(value) => onChange('requesterEmail', value)}
        />
      )}

      <div className="form-grid">
        <TextField
          label="Name and Surname"
          required
          value={values.nameAndSurname}
          error={errors.nameAndSurname}
          className="span-2"
          placeholder="Jane Doe"
          onChange={(value) => onChange('nameAndSurname', value)}
        />

        <TextField
          label="Email address of employee (private email)"
          required
          type="email"
          value={values.privateEmail}
          error={errors.privateEmail}
          hint="Account information will be sent here after approval."
          placeholder="jane.doe@gmail.com"
          onChange={(value) => onChange('privateEmail', value)}
        />

        <TextField
          label="Team Lead / Manager email"
          required
          type="email"
          value={values.managerEmail}
          error={errors.managerEmail}
          onChange={(value) => onChange('managerEmail', value)}
        />

        <ChoiceWithOtherField
          label="Country"
          options={catalog.countries}
          otherSentinel={catalog.otherValue}
          value={values.country}
          otherValue={values.countryOther}
          error={errors.country}
          otherError={errors.countryOther}
          onChange={(value) => onChange('country', value)}
          onOtherChange={(value) => onChange('countryOther', value)}
        />

        <ChoiceWithOtherField
          label="Requested department"
          options={catalog.departments}
          otherSentinel={catalog.otherValue}
          value={values.department}
          otherValue={values.departmentOther}
          error={errors.department}
          otherError={errors.departmentOther}
          onChange={(value) => onChange('department', value)}
          onOtherChange={(value) => onChange('departmentOther', value)}
        />

        <ChoiceWithOtherField
          label="Requested team"
          options={catalog.teams}
          otherSentinel={catalog.otherValue}
          value={values.team}
          otherValue={values.teamOther}
          error={errors.team}
          otherError={errors.teamOther}
          onChange={(value) => onChange('team', value)}
          onOtherChange={(value) => onChange('teamOther', value)}
        />

        <ChoiceWithOtherField
          label="Requested sub team"
          options={catalog.subTeams}
          otherSentinel={catalog.otherValue}
          value={values.subTeam}
          otherValue={values.subTeamOther}
          error={errors.subTeam}
          otherError={errors.subTeamOther}
          onChange={(value) => onChange('subTeam', value)}
          onOtherChange={(value) => onChange('subTeamOther', value)}
        />

        <ChoiceWithOtherField
          label="Requested job position"
          options={catalog.jobPositions}
          otherSentinel={catalog.otherValue}
          value={values.jobPosition}
          otherValue={values.jobPositionOther}
          error={errors.jobPosition}
          otherError={errors.jobPositionOther}
          onChange={(value) => onChange('jobPosition', value)}
          onOtherChange={(value) => onChange('jobPositionOther', value)}
        />
      </div>
    </div>
  );
}
