import type { FieldErrors, TaskDraft, TaskField } from '../../types/studyTask';
import { isPriority } from '../../types/studyTask';
import { TASK_LIMITS } from './constants';

export const emptyTaskDraft: TaskDraft = {
  title: '',
  course: '',
  priority: '',
  dueDate: '',
  notes: '',
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function validateTaskDraft(draft: TaskDraft): FieldErrors {
  const errors: FieldErrors = {};
  const title = draft.title.trim();
  const course = draft.course.trim();
  const notes = draft.notes.trim();

  if (!title) {
    errors.title = 'Enter a task title.';
  } else if (title.length < TASK_LIMITS.titleMin) {
    errors.title = `Use at least ${TASK_LIMITS.titleMin} characters.`;
  } else if (title.length > TASK_LIMITS.titleMax) {
    errors.title = `Use ${TASK_LIMITS.titleMax} characters or fewer.`;
  }

  if (!course) {
    errors.course = 'Enter a course name.';
  } else if (course.length > TASK_LIMITS.courseMax) {
    errors.course = `Use ${TASK_LIMITS.courseMax} characters or fewer.`;
  }

  if (!draft.priority) {
    errors.priority = 'Choose a priority.';
  } else if (!isPriority(draft.priority)) {
    errors.priority = 'Choose low, medium, or high.';
  }

  if (!draft.dueDate) {
    errors.dueDate = 'Choose a due date.';
  } else if (!isRealDate(draft.dueDate)) {
    errors.dueDate = 'Use a valid date.';
  }

  if (notes.length > TASK_LIMITS.notesMax) {
    errors.notes = `Use ${TASK_LIMITS.notesMax} characters or fewer.`;
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function firstInvalidField(errors: FieldErrors): TaskField | null {
  const order: TaskField[] = ['title', 'course', 'priority', 'dueDate', 'notes'];
  return order.find((field) => errors[field]) ?? null;
}

export function draftFromTask(task: {
  title: string;
  course: string;
  priority: TaskDraft['priority'];
  dueDate: string;
  notes: string;
}): TaskDraft {
  return {
    title: task.title,
    course: task.course,
    priority: task.priority,
    dueDate: task.dueDate,
    notes: task.notes,
  };
}
