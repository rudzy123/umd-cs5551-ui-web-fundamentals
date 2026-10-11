import { render } from '@testing-library/react';
import { App } from '../src/App';
import { TaskProvider } from '../src/context/TaskContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import {
  createMemoryStore,
  createMemoryTaskRepository,
  type KeyValueStore,
  type TaskRepository,
} from '../src/services/taskRepository';
import type { StudyTask } from '../src/types/studyTask';

export function renderApp(
  storage: TaskRepository = createMemoryTaskRepository(),
  themeStore: KeyValueStore = createMemoryStore(),
) {
  const view = render(
    <ThemeProvider store={themeStore}>
      <TaskProvider storage={storage}>
        <App />
      </TaskProvider>
    </ThemeProvider>,
  );

  return { ...view, storage, themeStore };
}

export function createDeferredRepository(initial: StudyTask[] = []) {
  let resolveLoad: (tasks: StudyTask[]) => void = () => undefined;
  const loadPromise = new Promise<StudyTask[]>((resolve) => {
    resolveLoad = resolve;
  });

  const repository: TaskRepository = {
    load() {
      return loadPromise;
    },
    async save() {
      return undefined;
    },
  };

  return {
    repository,
    resolve(tasks = initial) {
      resolveLoad(tasks);
    },
  };
}
