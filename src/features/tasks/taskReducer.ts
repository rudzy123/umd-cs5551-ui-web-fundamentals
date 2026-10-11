import type { StudyTask, TaskDraft } from '../../types/studyTask';
import { isPriority } from '../../types/studyTask';

export type TaskLoadStatus = 'loading' | 'ready' | 'error';

export interface TaskState {
  tasks: StudyTask[];
  status: TaskLoadStatus;
  errorMessage: string | null;
  notice: string | null;
}

export type TaskAction =
  | { type: 'loading' }
  | { type: 'load-success'; tasks: StudyTask[] }
  | { type: 'load-error'; message: string }
  | { type: 'add'; task: StudyTask }
  | { type: 'update'; task: StudyTask }
  | { type: 'toggle'; id: string; updatedAt: string }
  | { type: 'delete'; id: string }
  | { type: 'save-error'; message: string }
  | { type: 'clear-notice' }
  | { type: 'clear-error' };

export const initialTaskState: TaskState = {
  tasks: [],
  status: 'loading',
  errorMessage: null,
  notice: null,
};

export function createStudyTask(
  draft: TaskDraft,
  now = new Date().toISOString(),
  id: string = crypto.randomUUID(),
): StudyTask {
  if (!isPriority(draft.priority)) {
    throw new Error('A study task needs a priority of low, medium, or high.');
  }

  return {
    id,
    title: draft.title.trim(),
    course: draft.course.trim(),
    priority: draft.priority,
    dueDate: draft.dueDate,
    notes: draft.notes.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function applyTaskDraft(task: StudyTask, draft: TaskDraft, now: string): StudyTask {
  if (!isPriority(draft.priority)) {
    throw new Error('A study task needs a priority of low, medium, or high.');
  }

  return {
    ...task,
    title: draft.title.trim(),
    course: draft.course.trim(),
    priority: draft.priority,
    dueDate: draft.dueDate,
    notes: draft.notes.trim(),
    updatedAt: now,
  };
}

function quote(title: string): string {
  return `“${title}”`;
}

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        status: 'loading',
        errorMessage: null,
        notice: null,
      };
    case 'load-success':
      return {
        ...state,
        status: 'ready',
        tasks: action.tasks,
        errorMessage: null,
      };
    case 'load-error':
      return {
        ...state,
        status: 'error',
        errorMessage: action.message,
        notice: null,
      };
    case 'add':
      return {
        ...state,
        tasks: [...state.tasks, action.task],
        errorMessage: null,
        notice: `Added ${quote(action.task.title)}.`,
      };
    case 'update':
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.task.id ? action.task : task)),
        errorMessage: null,
        notice: `Updated ${quote(action.task.title)}.`,
      };
    case 'toggle': {
      const current = state.tasks.find((task) => task.id === action.id);
      if (!current) return state;
      const completed = !current.completed;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, completed, updatedAt: action.updatedAt } : task,
        ),
        errorMessage: null,
        notice: completed
          ? `Marked ${quote(current.title)} complete.`
          : `Marked ${quote(current.title)} active.`,
      };
    }
    case 'delete': {
      const current = state.tasks.find((task) => task.id === action.id);
      if (!current) return state;
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
        errorMessage: null,
        notice: `Deleted ${quote(current.title)}.`,
      };
    }
    case 'save-error':
      return {
        ...state,
        errorMessage: action.message,
        notice: null,
      };
    case 'clear-notice':
      return { ...state, notice: null };
    case 'clear-error':
      return { ...state, errorMessage: null };
    default:
      return assertNever(action);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected action: ${JSON.stringify(value)}`);
}
