'use client';

const DEFAULT_STAGES = [
  { step: 1, title: 'Request' },
  { step: 2, title: 'Employee & placement' },
  { step: 3, title: 'Review & submit' },
];

interface StageIndicatorProps {
  currentStage: number;
  stages?: { step: number; title: string }[];
}

export function StageIndicator({ currentStage, stages = DEFAULT_STAGES }: StageIndicatorProps) {
  return (
    <ol className="stage-indicator" aria-label="Request progress">
      {stages.map(({ step, title }) => {
        const isActive = step === currentStage;
        const isComplete = step < currentStage;
        return (
          <li
            key={step}
            className={`stage-item${isActive ? ' active' : ''}${isComplete ? ' complete' : ''}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="stage-number" aria-hidden>
              {isComplete ? '✓' : step}
            </span>
            <span>{title}</span>
          </li>
        );
      })}
    </ol>
  );
}
