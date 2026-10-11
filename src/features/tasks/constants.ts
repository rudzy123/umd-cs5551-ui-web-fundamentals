import type { Priority } from '../../types/studyTask';

export const COURSE_SUGGESTIONS = [
  'CS 5551 User Interface',
  'CS 5541 Artificial Intelligence',
  'CS 5531 Database Systems',
  'CS 5511 Programming Languages',
] as const;

export const PRIORITY_OPTIONS: readonly { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const TASK_LIMITS = {
  titleMin: 2,
  titleMax: 80,
  courseMax: 40,
  notesMax: 240,
} as const;
