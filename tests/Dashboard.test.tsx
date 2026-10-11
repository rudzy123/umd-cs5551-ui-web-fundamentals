import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  createLocalStorageTaskRepository,
  createMemoryStore,
} from '../src/services/taskRepository';
import type { TaskRepository } from '../src/services/taskRepository';
import { sampleTask } from './fixtures';
import { createDeferredRepository, renderApp } from './renderApp';

async function addTask(title = 'Read contrast notes', course = 'CS 5551') {
  const user = userEvent.setup();
  const form = await screen.findByRole('form', { name: 'Add a study task' });

  await user.type(within(form).getByLabelText(/task title/i), title);
  await user.type(within(form).getByLabelText(/^course/i), course);
  await user.click(within(form).getByRole('radio', { name: 'High' }));
  fireEvent.change(within(form).getByLabelText(/due date/i), { target: { value: '2026-10-20' } });
  await user.click(within(form).getByRole('button', { name: 'Add task' }));
  await screen.findByRole('status');

  return user;
}

describe('Dashboard', () => {
  it('shows a loading state until the repository resolves', async () => {
    const deferred = createDeferredRepository();
    renderApp(deferred.repository);

    expect(screen.getByRole('status')).toHaveTextContent(/loading study tasks/i);
    expect(screen.queryByRole('form', { name: 'Add a study task' })).not.toBeInTheDocument();

    deferred.resolve([]);
    expect(await screen.findByRole('heading', { name: 'No study tasks yet' })).toBeInTheDocument();
  });

  it('shows a load error and recovers when the retry succeeds', async () => {
    let shouldFail = true;
    const storage: TaskRepository = {
      async load() {
        if (shouldFail) {
          throw new Error(
            'Saved study tasks could not be read. The stored data is not valid JSON.',
          );
        }
        return [];
      },
      async save() {
        return undefined;
      },
    };
    renderApp(storage);
    const user = userEvent.setup();

    expect(await screen.findByRole('alert')).toHaveTextContent(/not valid JSON/i);
    shouldFail = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'No study tasks yet' })).toBeInTheDocument();
  });

  it('creates, filters, completes, edits, and deletes a task', async () => {
    renderApp();
    const user = await addTask();

    expect(screen.getByRole('status')).toHaveTextContent(/added “read contrast notes”/i);
    expect(screen.getByRole('heading', { name: 'Read contrast notes' })).toBeInTheDocument();
    expect(screen.getByRole('meter')).toHaveAccessibleName(/0 of 1 tasks complete/i);
    expect(screen.getByText('0%')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/search tasks/i), 'missing');
    expect(
      screen.getByRole('heading', { name: 'No tasks match these filters' }),
    ).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]!);

    await user.click(screen.getByRole('checkbox', { name: /mark read contrast notes complete/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/marked “read contrast notes” complete/i);
    await user.click(screen.getByRole('radio', { name: 'Completed' }));
    expect(screen.getByRole('heading', { name: /read contrast notes/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /edit read contrast notes/i }));
    const dialog = screen.getByRole('dialog', { name: 'Edit study task' });
    const title = within(dialog).getByLabelText(/task title/i);
    await user.clear(title);
    await user.type(title, 'Review contrast notes');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /review contrast notes/i })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: /delete review contrast notes/i }));
    await user.click(screen.getByRole('button', { name: 'Delete task' }));

    expect(screen.getByRole('heading', { name: 'Study tasks' })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'No study tasks yet' })).toBeInTheDocument();
  });

  it('keeps an overdue task visible with a text badge', async () => {
    const storage = {
      async load() {
        return [sampleTask({ dueDate: '2020-01-15', title: 'Submit the draft' })];
      },
      async save() {
        return undefined;
      },
    };
    renderApp(storage);

    expect(await screen.findAllByText('Overdue')).toHaveLength(2);
  });

  it('reloads tasks that were saved through the storage abstraction', async () => {
    const storage = createLocalStorageTaskRepository(createMemoryStore(), 'study-tasks-test');
    const first = renderApp(storage);
    await addTask('Persist this task');
    first.unmount();

    renderApp(storage);
    expect(await screen.findByRole('heading', { name: 'Persist this task' })).toBeInTheDocument();
  });

  it('shows a save error and retries the write', async () => {
    let failSave = true;
    const storage: TaskRepository = {
      async load() {
        return [];
      },
      async save() {
        if (failSave)
          throw new Error('The browser could not save your tasks. Storage may be full.');
      },
    };
    renderApp(storage);
    const user = userEvent.setup();
    const form = await screen.findByRole('form', { name: 'Add a study task' });
    await user.type(within(form).getByLabelText(/task title/i), 'Needs a retry');
    await user.type(within(form).getByLabelText(/^course/i), 'CS 5551');
    await user.click(within(form).getByRole('radio', { name: 'High' }));
    fireEvent.change(within(form).getByLabelText(/due date/i), { target: { value: '2026-10-20' } });
    await user.click(within(form).getByRole('button', { name: 'Add task' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/storage may be full/i);
    failSave = false;
    await user.click(screen.getByRole('button', { name: 'Try saving again' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Needs a retry' })).toBeInTheDocument();
  });
});
