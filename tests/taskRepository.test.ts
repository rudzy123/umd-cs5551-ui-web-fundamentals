import { describe, expect, it } from 'vitest';
import {
  createBrowserStore,
  createLocalStorageTaskRepository,
  createMemoryStore,
  createMemoryTaskRepository,
  StorageError,
} from '../src/services/taskRepository';
import { sampleTask } from './fixtures';

describe('task repository', () => {
  it('round-trips tasks through an in-memory store', async () => {
    const repository = createMemoryTaskRepository();
    const task = sampleTask();

    await repository.save([task]);
    const loaded = await repository.load();

    expect(loaded).toEqual([task]);
    loaded[0]!.title = 'Changed locally';
    expect((await repository.load())[0]?.title).toBe('Read contrast notes');
  });

  it('reads and writes JSON through the browser storage adapter', async () => {
    const store = createBrowserStore(localStorage);
    const repository = createLocalStorageTaskRepository(store, 'test-tasks');
    const task = sampleTask();

    await repository.save([task]);
    expect(JSON.parse(localStorage.getItem('test-tasks') ?? '[]')).toEqual([task]);
    expect(await repository.load()).toEqual([task]);
  });

  it('treats a missing key as an empty list', async () => {
    const repository = createLocalStorageTaskRepository(createMemoryStore());
    expect(await repository.load()).toEqual([]);
  });

  it('rejects malformed JSON and unexpected shapes', async () => {
    const store = createMemoryStore({ 'cs5551-study-tasks': '{' });
    const repository = createLocalStorageTaskRepository(store);

    await expect(repository.load()).rejects.toBeInstanceOf(StorageError);
    await expect(repository.load()).rejects.toThrow(/not valid JSON/i);

    store.setItem('cs5551-study-tasks', JSON.stringify([{ title: 'Missing the rest' }]));
    await expect(repository.load()).rejects.toThrow(/unexpected shape/i);
  });

  it('reports a storage failure when the browser refuses to write', async () => {
    const store = createMemoryStore();
    store.setItem = () => {
      throw new Error('quota');
    };
    const repository = createLocalStorageTaskRepository(store);

    await expect(repository.save([sampleTask()])).rejects.toThrow(/storage may be full/i);
  });
});
