import { useId, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function TextField({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={['field', className].filter(Boolean).join(' ')}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      <input
        id={id}
        className="field__control"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="field__error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function RequiredMark() {
  return (
    <span className="required">
      <span aria-hidden="true"> *</span>
      <span className="sr-only"> (required)</span>
    </span>
  );
}
