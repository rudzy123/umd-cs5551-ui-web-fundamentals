import { isStudyTask, type StudyTask } from '../types/studyTask';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface TaskRepository {
  load(): Promise<StudyTask[]>;
  save(tasks: StudyTask[]): Promise<void>;
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export const TASK_STORAGE_KEY = 'cs5551-study-tasks';
export const THEME_STORAGE_KEY = 'cs5551-theme';

export function createMemoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = { ...initial };
  return {
    getItem(key) {
      return data[key] ?? null;
    },
    setItem(key, value) {
      data[key] = value;
    },
  };
}

export function createBrowserStore(storage: Storage): KeyValueStore {
  return {
    getItem(key) {
      return storage.getItem(key);
    },
    setItem(key, value) {
      storage.setItem(key, value);
    },
  };
}

export function createMemoryTaskRepository(initial: StudyTask[] = []): TaskRepository {
  let tasks = initial.map((task) => ({ ...task }));
  return {
    async load() {
      return tasks.map((task) => ({ ...task }));
    },
    async save(next) {
      tasks = next.map((task) => ({ ...task }));
    },
  };
}

export function createLocalStorageTaskRepository(
  store: KeyValueStore,
  key = TASK_STORAGE_KEY,
): TaskRepository {
  return {
    async load() {
      let raw: string | null;
      try {
        raw = store.getItem(key);
      } catch {
        throw new StorageError('Study tasks could not be loaded from this browser.');
      }

      if (raw === null || raw.trim() === '') return [];

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new StorageError(
          'Saved study tasks could not be read. The stored data is not valid JSON.',
        );
      }

      if (!Array.isArray(parsed) || !parsed.every(isStudyTask)) {
        throw new StorageError(
          'Saved study tasks could not be read. The stored data has an unexpected shape.',
        );
      }

      return parsed.map((task) => ({ ...task }));
    },
    async save(tasks) {
      try {
        store.setItem(key, JSON.stringify(tasks));
      } catch {
        throw new StorageError('The browser could not save your tasks. Storage may be full.');
      }
    },
  };
}

export const studyTaskRepository = createLocalStorageTaskRepository(
  createBrowserStore(localStorage),
);
