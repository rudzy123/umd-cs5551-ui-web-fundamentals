export const PRIORITIES = ['low', 'medium', 'high'] as const;

export type Priority = (typeof PRIORITIES)[number];

export interface StudyTask {
  id: string;
  title: string;
  course: string;
  priority: Priority;
  dueDate: string;
  notes: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskDraft = {
  title: string;
  course: string;
  priority: Priority | '';
  dueDate: string;
  notes: string;
};

export type TaskField = keyof TaskDraft;

export type FieldErrors = Partial<Record<TaskField, string>>;

export type TaskStatusFilter = 'all' | 'active' | 'completed';

export type PriorityFilter = 'all' | Priority;

export interface TaskQuery {
  search: string;
  status: TaskStatusFilter;
  priority: PriorityFilter;
  course: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isPriority(value: string): value is Priority {
  return PRIORITIES.some((priority) => priority === value);
}

export function isStudyTask(value: unknown): value is StudyTask {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    typeof task.course === 'string' &&
    task.course.trim().length > 0 &&
    typeof task.priority === 'string' &&
    isPriority(task.priority) &&
    typeof task.dueDate === 'string' &&
    DATE_PATTERN.test(task.dueDate) &&
    typeof task.notes === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
}
