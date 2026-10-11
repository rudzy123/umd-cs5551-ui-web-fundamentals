interface ProgressMeterProps {
  labelledBy: string;
  value: number;
  valueText: string;
}

export function ProgressMeter({ labelledBy, value, valueText }: ProgressMeterProps) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className="meter"
      role="meter"
      aria-labelledby={labelledBy}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      aria-valuetext={valueText}
    >
      <span className="meter__fill" style={{ width: `${safeValue}%` }} />
    </div>
  );
}
