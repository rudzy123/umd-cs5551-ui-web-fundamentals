import { useId, type TextareaHTMLAttributes } from 'react';
import { RequiredMark } from './TextField';

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  ...props
}: TextAreaFieldProps) {
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
      <textarea
        id={id}
        className="field__control field__control--area"
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
