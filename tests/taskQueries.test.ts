import { describe, expect, it } from 'vitest';
import {
  defaultTaskQuery,
  filterTasks,
  formatDueDate,
  isDefaultQuery,
  summarizeTasks,
} from '../src/features/tasks/taskQueries';
import { sampleTask } from './fixtures';

const tasks = [
  sampleTask({ id: 'a', title: 'Read contrast notes', dueDate: '2026-10-20', priority: 'high' }),
  sampleTask({
    id: 'b',
    title: 'Sketch the layout',
    course: 'CS 5541',
    dueDate: '2026-10-18',
    priority: 'low',
    notes: 'Mobile first',
    completed: true,
  }),
  sampleTask({
    id: 'c',
    title: 'Fix the form',
    dueDate: '2026-10-01',
    priority: 'medium',
    course: 'CS 5551',
  }),
];

describe('filterTasks', () => {
  it('sorts by due date and matches title, course, and notes', () => {
    expect(filterTasks(tasks, defaultTaskQuery).map((task) => task.id)).toEqual(['c', 'b', 'a']);
    expect(
      filterTasks(tasks, { ...defaultTaskQuery, search: 'MOBILE' }).map((task) => task.id),
    ).toEqual(['b']);
    expect(
      filterTasks(tasks, { ...defaultTaskQuery, search: '5541' }).map((task) => task.id),
    ).toEqual(['b']);
  });

  it('filters by status, priority, and course', () => {
    expect(
      filterTasks(tasks, { ...defaultTaskQuery, status: 'completed' }).map((task) => task.id),
    ).toEqual(['b']);
    expect(
      filterTasks(tasks, { ...defaultTaskQuery, status: 'active' }).map((task) => task.id),
    ).toEqual(['c', 'a']);
    expect(
      filterTasks(tasks, { ...defaultTaskQuery, priority: 'high' }).map((task) => task.id),
    ).toEqual(['a']);
    expect(
      filterTasks(tasks, { ...defaultTaskQuery, course: 'CS 5541' }).map((task) => task.id),
    ).toEqual(['b']);
  });

  it('knows when every filter is at its default', () => {
    expect(isDefaultQuery(defaultTaskQuery)).toBe(true);
    expect(isDefaultQuery({ ...defaultTaskQuery, search: '  ' })).toBe(true);
    expect(isDefaultQuery({ ...defaultTaskQuery, status: 'active' })).toBe(false);
  });
});

describe('summarizeTasks', () => {
  it('counts completion and overdue work against a supplied day', () => {
    expect(summarizeTasks(tasks, '2026-10-10')).toEqual({
      total: 3,
      completed: 1,
      remaining: 2,
      overdue: 1,
      percent: 33,
    });
  });

  it('formats a date without shifting the calendar day', () => {
    expect(formatDueDate('2026-10-20')).toBe('Oct 20, 2026');
  });
});
