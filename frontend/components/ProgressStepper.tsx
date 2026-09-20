type ProgressStepperProps = { step: number; labels: string[] };

export function ProgressStepper({ step, labels }: ProgressStepperProps) {
  return <ol className="stepper" aria-label="Onboarding progress">
    {labels.map((label, index) => {
      const state = index < step ? 'done' : index === step ? 'current' : 'upcoming';
      return <li key={label} className={`stepper__item stepper__item--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
        <span className="stepper__number">{index < step ? '✓' : index + 1}</span><span>{label}</span>
      </li>;
    })}
  </ol>;
}
