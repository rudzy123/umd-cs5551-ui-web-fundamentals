import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskForm } from '../src/features/tasks/TaskForm';

function renderForm(onSubmit = vi.fn()) {
  render(
    <TaskForm
      idPrefix="new-task"
      headingId="add-task-heading"
      heading="Add a study task"
      submitLabel="Add task"
      resetOnSubmit
      onSubmit={onSubmit}
    />,
  );
  return onSubmit;
}

describe('TaskForm', () => {
  it('shows an error summary and does not submit an empty draft', async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();

    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/fix 4 fields/i);
    expect(screen.getByLabelText(/task title/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(/task title/i)).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a controlled draft and then clears the fields', async () => {
    const user = userEvent.setup();
    const onSubmit = renderForm();
    const form = screen.getByRole('form', { name: 'Add a study task' });

    await user.type(screen.getByLabelText(/task title/i), '  Read contrast notes  ');
    await user.type(screen.getByLabelText(/^course/i), 'CS 5551');
    await user.click(screen.getByRole('radio', { name: 'High' }));
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: '2026-10-20' } });
    await user.type(screen.getByLabelText(/notes/i), 'Chapter 4');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Read contrast notes',
      course: 'CS 5551',
      priority: 'high',
      dueDate: '2026-10-20',
      notes: 'Chapter 4',
    });
    expect(form).toBeInTheDocument();
    expect(screen.getByLabelText(/task title/i)).toHaveValue('');
    expect(screen.getByLabelText(/^course/i)).toHaveValue('');
    expect(screen.getByLabelText(/notes/i)).toHaveValue('');
  });

  it('removes a field error as soon as the value becomes valid', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Add task' }));
    expect(screen.getByText('Enter a task title.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/task title/i), 'Read');
    expect(screen.queryByText('Enter a task title.')).not.toBeInTheDocument();
  });

  it('moves focus from an error summary link to the matching field', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Add task' }));
    await user.click(screen.getByRole('link', { name: /course: enter a course name/i }));

    expect(screen.getByLabelText(/^course/i)).toHaveFocus();
  });
});
