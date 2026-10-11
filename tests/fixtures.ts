import type { StudyTask } from '../src/types/studyTask';

export function sampleTask(overrides: Partial<StudyTask> = {}): StudyTask {
  return {
    id: 'task-1',
    title: 'Read contrast notes',
    course: 'CS 5551',
    priority: 'high',
    dueDate: '2026-10-20',
    notes: 'Chapter 4',
    completed: false,
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
    ...overrides,
  };
}
