'use client';

import type { ChangeEvent } from 'react';

interface TextFieldProps {
  label: string;
  required?: boolean;
  type?: 'text' | 'email';
  value: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TextField({ label, required = false, type = 'text', value, error, hint, placeholder, onChange, className }: TextFieldProps) {
  const fieldId = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  const messageId = `${fieldId}-message`;

  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label className="field-label" htmlFor={fieldId}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={fieldId}
        className={`input${error ? ' has-error' : ''}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        autoComplete="off"
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
