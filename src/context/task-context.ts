import { createContext } from 'react';
import type { TaskState } from '../features/tasks/taskReducer';
import type { TaskDraft } from '../types/studyTask';

export interface TaskContextValue {
  state: TaskState;
  addTask: (draft: TaskDraft) => void;
  updateTask: (id: string, draft: TaskDraft) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  retryLoad: () => void;
  retrySave: () => void;
  dismissNotice: () => void;
}

export const TaskContext = createContext<TaskContextValue | null>(null);
