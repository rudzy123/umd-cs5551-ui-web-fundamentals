import { useContext } from 'react';
import { TaskContext, type TaskContextValue } from '../context/task-context';

export function useTasks(): TaskContextValue {
  const value = useContext(TaskContext);
  if (!value) {
    throw new Error('useTasks must be used within a TaskProvider.');
  }
  return value;
}
