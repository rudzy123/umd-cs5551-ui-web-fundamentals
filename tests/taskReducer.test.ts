import { describe, expect, it } from 'vitest';
import {
  applyTaskDraft,
  createStudyTask,
  initialTaskState,
  taskReducer,
} from '../src/features/tasks/taskReducer';
import { sampleTask } from './fixtures';

describe('taskReducer', () => {
  it('starts in a loading state with no tasks', () => {
    expect(initialTaskState).toEqual({
      tasks: [],
      status: 'loading',
      errorMessage: null,
      notice: null,
    });
  });

  it('replaces tasks when a load succeeds', () => {
    const task = sampleTask();
    const next = taskReducer(initialTaskState, { type: 'load-success', tasks: [task] });

    expect(next.status).toBe('ready');
    expect(next.tasks).toEqual([task]);
    expect(next.errorMessage).toBeNull();
  });

  it('records a load failure without keeping a success notice', () => {
    const next = taskReducer(
      { ...initialTaskState, notice: 'Added “Outline”.' },
      { type: 'load-error', message: 'Saved study tasks could not be read.' },
    );

    expect(next.status).toBe('error');
    expect(next.errorMessage).toBe('Saved study tasks could not be read.');
    expect(next.notice).toBeNull();
  });

  it('adds, updates, completes, and deletes tasks immutably', () => {
    const original = sampleTask();
    const ready = taskReducer(initialTaskState, { type: 'load-success', tasks: [original] });
    Object.freeze(ready);
    Object.freeze(ready.tasks);
    Object.freeze(original);

    const created = createStudyTask(
      {
        title: '  Practice forms  ',
        course: ' CS 5551 ',
        priority: 'low',
        dueDate: '2026-10-22',
        notes: '  ',
      },
      '2026-10-02T00:00:00.000Z',
      'task-2',
    );
    const added = taskReducer(ready, { type: 'add', task: created });
    expect(added.tasks).toHaveLength(2);
    expect(added.tasks[1]).toMatchObject({ title: 'Practice forms', course: 'CS 5551', notes: '' });
    expect(added.notice).toMatch(/Practice forms/);
    expect(ready.tasks).toHaveLength(1);

    const updatedTask = applyTaskDraft(
      created,
      {
        title: 'Practice controlled forms',
        course: 'CS 5551',
        priority: 'medium',
        dueDate: '2026-10-23',
        notes: 'Bring questions',
      },
      '2026-10-03T00:00:00.000Z',
    );
    const updated = taskReducer(added, { type: 'update', task: updatedTask });
    expect(updated.tasks.find((task) => task.id === 'task-2')?.title).toBe(
      'Practice controlled forms',
    );

    const toggled = taskReducer(updated, {
      type: 'toggle',
      id: 'task-1',
      updatedAt: '2026-10-04T00:00:00.000Z',
    });
    expect(toggled.tasks.find((task) => task.id === 'task-1')).toMatchObject({
      completed: true,
      updatedAt: '2026-10-04T00:00:00.000Z',
    });
    expect(original.completed).toBe(false);

    const removed = taskReducer(toggled, { type: 'delete', id: 'task-2' });
    expect(removed.tasks.map((task) => task.id)).toEqual(['task-1']);
    expect(removed.notice).toMatch(/Practice controlled forms/);
  });

  it('ignores toggle and delete requests for an unknown id', () => {
    const ready = taskReducer(initialTaskState, {
      type: 'load-success',
      tasks: [sampleTask()],
    });

    expect(taskReducer(ready, { type: 'toggle', id: 'missing', updatedAt: 'now' })).toBe(ready);
    expect(taskReducer(ready, { type: 'delete', id: 'missing' })).toBe(ready);
  });

  it('keeps the loaded tasks visible when saving fails', () => {
    const ready = taskReducer(initialTaskState, {
      type: 'load-success',
      tasks: [sampleTask()],
    });
    const next = taskReducer(ready, {
      type: 'save-error',
      message: 'The browser could not save your tasks. Storage may be full.',
    });

    expect(next.status).toBe('ready');
    expect(next.tasks).toHaveLength(1);
    expect(next.errorMessage).toMatch(/storage may be full/i);
    expect(next.notice).toBeNull();
  });
});
