import { useId, useState, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { RadioGroup } from '../../components/RadioGroup';
import { TextAreaField } from '../../components/TextAreaField';
import { TextField } from '../../components/TextField';
import type { FieldErrors, TaskDraft, TaskField } from '../../types/studyTask';
import { COURSE_SUGGESTIONS, PRIORITY_OPTIONS, TASK_LIMITS } from './constants';
import { emptyTaskDraft, firstInvalidField, hasErrors, validateTaskDraft } from './validation';

interface TaskFormProps {
  idPrefix: string;
  heading: string;
  headingId?: string;
  showHeading?: boolean;
  submitLabel: string;
  initialValue?: TaskDraft;
  resetOnSubmit?: boolean;
  onSubmit: (draft: TaskDraft) => void;
  onCancel?: () => void;
}

const FIELD_LABELS: Record<TaskField, string> = {
  title: 'Title',
  course: 'Course',
  priority: 'Priority',
  dueDate: 'Due date',
  notes: 'Notes',
};

function fieldDomId(idPrefix: string, field: TaskField): string {
  if (field === 'priority') return `${idPrefix}-priority-low`;
  if (field === 'dueDate') return `${idPrefix}-due`;
  return `${idPrefix}-${field}`;
}

function focusField(idPrefix: string, field: TaskField) {
  document.getElementById(fieldDomId(idPrefix, field))?.focus();
}

export function TaskForm({
  idPrefix,
  heading,
  headingId,
  showHeading = true,
  submitLabel,
  initialValue,
  resetOnSubmit = false,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const generatedHeadingId = useId();
  const resolvedHeadingId = headingId ?? generatedHeadingId;
  const summaryId = useId();
  const courseListId = `${idPrefix}-course-list`;
  const [draft, setDraft] = useState<TaskDraft>(initialValue ?? emptyTaskDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function updateDraft<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (submitted) setErrors(validateTaskDraft(next));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateTaskDraft(draft);
    setSubmitted(true);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      const field = firstInvalidField(nextErrors);
      if (field) focusField(idPrefix, field);
      return;
    }

    onSubmit({
      title: draft.title.trim(),
      course: draft.course.trim(),
      priority: draft.priority,
      dueDate: draft.dueDate,
      notes: draft.notes.trim(),
    });

    if (resetOnSubmit) {
      setDraft(emptyTaskDraft);
      setErrors({});
      setSubmitted(false);
    }
  }

  const errorEntries = (Object.entries(errors) as [TaskField, string | undefined][]).filter(
    (entry): entry is [TaskField, string] => Boolean(entry[1]),
  );

  return (
    <form
      className="task-form"
      noValidate
      aria-labelledby={showHeading ? resolvedHeadingId : undefined}
      aria-label={showHeading ? undefined : heading}
      onSubmit={handleSubmit}
    >
      {showHeading ? <h2 id={resolvedHeadingId}>{heading}</h2> : null}
      <p className="field__hint">Required fields are marked.</p>
      {submitted && errorEntries.length > 0 ? (
        <div id={summaryId} className="form-errors" role="alert">
          <p>
            Fix {errorEntries.length} {errorEntries.length === 1 ? 'field' : 'fields'} before
            saving.
          </p>
          <ul>
            {errorEntries.map(([field, message]) => (
              <li key={field}>
                <a
                  href={`#${fieldDomId(idPrefix, field)}`}
                  onClick={(event) => {
                    event.preventDefault();
                    focusField(idPrefix, field);
                  }}
                >
                  {FIELD_LABELS[field]}: {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="form-grid">
        <TextField
          className="full"
          id={`${idPrefix}-title`}
          label="Task title"
          required
          value={draft.title}
          maxLength={TASK_LIMITS.titleMax + 20}
          hint={`Use ${TASK_LIMITS.titleMin} to ${TASK_LIMITS.titleMax} characters.`}
          error={submitted ? errors.title : undefined}
          onChange={(event) => updateDraft('title', event.target.value)}
        />
        <TextField
          className="full"
          id={`${idPrefix}-course`}
          label="Course"
          required
          value={draft.course}
          list={courseListId}
          maxLength={TASK_LIMITS.courseMax + 20}
          hint="Type a course name, or pick a suggestion."
          error={submitted ? errors.course : undefined}
          autoComplete="off"
          onChange={(event) => updateDraft('course', event.target.value)}
        />
        <datalist id={courseListId}>
          {COURSE_SUGGESTIONS.map((course) => (
            <option key={course} value={course} />
          ))}
        </datalist>
        <RadioGroup
          legend="Priority"
          name={`${idPrefix}-priority`}
          value={draft.priority}
          options={PRIORITY_OPTIONS}
          required
          error={submitted ? errors.priority : undefined}
          onChange={(value) => updateDraft('priority', value as TaskDraft['priority'])}
        />
        <TextField
          id={`${idPrefix}-due`}
          label="Due date"
          type="date"
          required
          value={draft.dueDate}
          hint="Past dates stay in the list as overdue."
          error={submitted ? errors.dueDate : undefined}
          onChange={(event) => updateDraft('dueDate', event.target.value)}
        />
        <TextAreaField
          className="full"
          id={`${idPrefix}-notes`}
          label="Notes"
          value={draft.notes}
          rows={3}
          maxLength={TASK_LIMITS.notesMax + 40}
          hint={`Optional. ${TASK_LIMITS.notesMax} characters maximum.`}
          error={submitted ? errors.notes : undefined}
          onChange={(event) => updateDraft('notes', event.target.value)}
        />
      </div>
      <div className="form-actions">
        {onCancel ? (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
