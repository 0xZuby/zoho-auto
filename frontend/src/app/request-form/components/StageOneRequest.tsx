'use client';

import type { FormCatalog, FormFieldErrors, OnboardingFormValues, RequestType } from '@/lib/types';
import { TextField } from './TextField';

interface StageOneRequestProps {
  values: OnboardingFormValues;
  errors: FormFieldErrors;
  catalog: FormCatalog;
  onChange: <K extends keyof OnboardingFormValues>(field: K, value: OnboardingFormValues[K]) => void;
}

export function StageOneRequest({ values, errors, catalog, onChange }: StageOneRequestProps) {
  return (
    <div className="stack gap-24">
      <div className="stack gap-4">
        <h2 style={{ fontSize: 19 }}>Request details</h2>
        <p className="text-muted text-sm">
          Tell us what HR needs the Auditor to review.
        </p>
      </div>

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

      <div className="field">
        <span className="field-label">
          Request type<span className="required">*</span>
        </span>
        <div className="radio-group" role="radiogroup" aria-label="Request type">
          {catalog.requestTypes.map((option) => {
            const selected = values.requestType === option.value;
            return (
              <label key={option.value} className={`radio-option${selected ? ' selected' : ''}`}>
                <input
                  type="radio"
                  name="requestType"
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange('requestType', option.value as RequestType)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
        {errors.requestType && <span className="field-error">{errors.requestType}</span>}
      </div>
    </div>
  );
}
