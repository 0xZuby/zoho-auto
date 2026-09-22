'use client';

import type { ChangeEvent } from 'react';

interface TextAreaFieldProps {
  label: string;
  required?: boolean;
  value: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function TextAreaField({ label, required = false, value, error, hint, placeholder, onChange }: TextAreaFieldProps) {
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  const fieldId = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const messageId = `${fieldId}-message`;

  return (
    <div className="field span-2">
      <label className="field-label" htmlFor={fieldId}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <textarea
        id={fieldId}
        className={`textarea${error ? ' has-error' : ''}`}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
      />
      {(hint || error) && (
        <span id={messageId} className={error ? 'field-error' : 'field-hint'}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
}
