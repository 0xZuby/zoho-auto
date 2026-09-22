'use client';

import { useState } from 'react';
import type { FormFieldErrors, OnboardingFormValues } from '@/lib/types';

export const EMPTY_FORM_VALUES: OnboardingFormValues = {
  requesterEmail: '',
  requestType: '',

  nameAndSurname: '',
  privateEmail: '',

  country: '',
  countryOther: '',
  department: '',
  departmentOther: '',
  team: '',
  teamOther: '',
  subTeam: '',
  subTeamOther: '',
  jobPosition: '',
  jobPositionOther: '',

  managerEmail: '',

  githubProfile: '',
  githubRepositories: '',
};

/** Holds form state + per-field errors and exposes a typed field setter that
 * clears a field's error the moment the user edits it (immediate feedback,
 * matching the "correct the highlighted fields" UX). */
export function useOnboardingForm() {
  const [values, setValues] = useState<OnboardingFormValues>(EMPTY_FORM_VALUES);
  const [errors, setErrors] = useState<FormFieldErrors>({});

  function setField<K extends keyof OnboardingFormValues>(field: K, value: OnboardingFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  /** Bulk-loads values (e.g. an existing employee's submission fetched via "Get all information"), keeping requesterEmail/requestType intact. */
  function loadValues(patch: Partial<OnboardingFormValues>) {
    setValues((previous) => ({ ...previous, ...patch }));
    setErrors({});
  }

  function resetForm() {
    setValues(EMPTY_FORM_VALUES);
    setErrors({});
  }

  return { values, errors, setErrors, setField, loadValues, resetForm };
}
