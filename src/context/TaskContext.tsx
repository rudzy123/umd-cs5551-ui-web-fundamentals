import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import {
  applyTaskDraft,
  createStudyTask,
  initialTaskState,
  taskReducer,
} from '../features/tasks/taskReducer';
import type { TaskRepository } from '../services/taskRepository';
import { TaskContext, type TaskContextValue } from './task-context';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function TaskProvider({
  storage,
  children,
}: {
  storage: TaskRepository;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'loading' });

    storage
      .load()
      .then((tasks) => {
        if (!cancelled) dispatch({ type: 'load-success', tasks });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          dispatch({
            type: 'load-error',
            message: errorMessage(error, 'Study tasks could not be loaded.'),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storage, loadAttempt]);

  useEffect(() => {
    if (state.status !== 'ready') return;
    // The first ready state is the data we just loaded. Writing it back is unnecessary.
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const snapshot = state.tasks;
    storage.save(snapshot).catch((error: unknown) => {
      dispatch({
        type: 'save-error',
        message: errorMessage(error, 'Study tasks could not be saved.'),
      });
    });
  }, [state.tasks, state.status, storage]);

  useEffect(() => {
    if (!state.notice) return;
    const timeoutId = window.setTimeout(() => dispatch({ type: 'clear-notice' }), 8000);
    return () => window.clearTimeout(timeoutId);
  }, [state.notice]);

  const value = useMemo<TaskContextValue>(() => {
    return {
      state,
      addTask(draft) {
        dispatch({ type: 'add', task: createStudyTask(draft) });
      },
      updateTask(id, draft) {
        const current = state.tasks.find((task) => task.id === id);
        if (!current) return;
        dispatch({
          type: 'update',
          task: applyTaskDraft(current, draft, new Date().toISOString()),
        });
      },
      toggleTask(id) {
        dispatch({ type: 'toggle', id, updatedAt: new Date().toISOString() });
      },
      deleteTask(id) {
        dispatch({ type: 'delete', id });
      },
      retryLoad() {
        skipNextSave.current = true;
        setLoadAttempt((attempt) => attempt + 1);
      },
      retrySave() {
        storage
          .save(state.tasks)
          .then(() => dispatch({ type: 'clear-error' }))
          .catch((error: unknown) => {
            dispatch({
              type: 'save-error',
              message: errorMessage(error, 'Study tasks could not be saved.'),
            });
          });
      },
      dismissNotice() {
        dispatch({ type: 'clear-notice' });
      },
    };
  }, [state, storage]);

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
