export function StepIndicator({ current, total }: { current: number; total: number }) {
  return <div className="step-indicator" aria-label={`Step ${current} of ${total}`}><div className="step-track"><span style={{ width: `${(current / total) * 100}%` }} /></div><span>Step {current} of {total}</span></div>;
}
