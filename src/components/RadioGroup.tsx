import { useId } from 'react';
import { RequiredMark } from './TextField';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  legend: string;
  name: string;
  value: string;
  options: readonly RadioOption[];
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function RadioGroup({
  legend,
  name,
  value,
  options,
  onChange,
  error,
  required = false,
}: RadioGroupProps) {
  const generatedId = useId();
  const errorId = error ? `${generatedId}-error` : undefined;

  return (
    <fieldset className="radio-group" aria-describedby={errorId}>
      <legend className="field__label">
        {legend}
        {required ? <RequiredMark /> : null}
      </legend>
      <div className="radio-group__options">
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          return (
            <label key={option.value} className="radio" htmlFor={optionId}>
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                aria-describedby={errorId}
                onChange={(event) => {
                  if (event.target.checked) onChange(event.target.value);
                }}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className="field__error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
