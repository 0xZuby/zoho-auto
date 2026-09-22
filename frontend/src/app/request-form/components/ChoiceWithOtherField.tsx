'use client';

interface ChoiceWithOtherFieldProps {
  label: string;
  required?: boolean;
  options: string[];
  otherSentinel: string;
  value: string;
  otherValue: string;
  error?: string;
  otherError?: string;
  onChange: (value: string) => void;
  onOtherChange: (value: string) => void;
}

/**
 * Renders a "choice + Other:" field pair, matching the source form's pattern
 * where every dropdown ends in a free-text "Other:" option. Selecting the
 * sentinel value reveals a required text input for the custom value.
 */
export function ChoiceWithOtherField({
  label,
  required = true,
  options,
  otherSentinel,
  value,
  otherValue,
  error,
  otherError,
  onChange,
  onOtherChange,
}: ChoiceWithOtherFieldProps) {
  const isOther = value === otherSentinel;
  const fieldId = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const messageId = `${fieldId}-message`;

  return (
    <div className="field">
      <label className="field-label" htmlFor={fieldId}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <select
        id={fieldId}
        className={`select${error ? ' has-error' : ''}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? messageId : undefined}
      >
        <option value="" disabled>
          Select {label.toLowerCase()}…
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={otherSentinel}>{otherSentinel}:</option>
      </select>
      {error && <span id={messageId} className="field-error">{error}</span>}

      {isOther && (
        <div className="field" style={{ marginTop: 4 }}>
          <input
            className={`input${otherError ? ' has-error' : ''}`}
            placeholder={`Enter ${label.toLowerCase()}`}
            value={otherValue}
            onChange={(event) => onOtherChange(event.target.value)}
            aria-label={`${label} — Other`}
            aria-invalid={Boolean(otherError)}
          />
          {otherError && <span className="field-error">{otherError}</span>}
        </div>
      )}
    </div>
  );
}
