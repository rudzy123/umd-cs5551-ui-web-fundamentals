import { describe, expect, it } from 'vitest';
import {
  emptyTaskDraft,
  firstInvalidField,
  validateTaskDraft,
} from '../src/features/tasks/validation';

describe('validateTaskDraft', () => {
  it('accepts a complete draft and ignores surrounding spaces', () => {
    const errors = validateTaskDraft({
      title: '  Read the contrast chapter  ',
      course: ' CS 5551 ',
      priority: 'high',
      dueDate: '2026-10-20',
      notes: '  ',
    });

    expect(errors).toEqual({});
  });

  it('reports every missing required field', () => {
    const errors = validateTaskDraft(emptyTaskDraft);

    expect(errors).toMatchObject({
      title: 'Enter a task title.',
      course: 'Enter a course name.',
      priority: 'Choose a priority.',
      dueDate: 'Choose a due date.',
    });
    expect(firstInvalidField(errors)).toBe('title');
  });

  it('rejects titles that are too short, impossible dates, and notes that are too long', () => {
    const errors = validateTaskDraft({
      title: 'A',
      course: 'CS 5551',
      priority: 'low',
      dueDate: '2026-02-31',
      notes: 'n'.repeat(241),
    });

    expect(errors.title).toMatch(/at least 2/);
    expect(errors.dueDate).toBe('Use a valid date.');
    expect(errors.notes).toMatch(/240/);
    expect(firstInvalidField(errors)).toBe('title');
  });

  it('allows a past due date so overdue work can stay on the list', () => {
    const errors = validateTaskDraft({
      title: 'Review feedback',
      course: 'CS 5551',
      priority: 'medium',
      dueDate: '2020-01-15',
      notes: '',
    });

    expect(errors.dueDate).toBeUndefined();
  });
});
