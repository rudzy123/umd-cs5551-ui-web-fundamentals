import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './renderApp';

describe('keyboard interaction', () => {
  it('moves from the skip link into main content', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'No study tasks yet' });

    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(document.getElementById('main-content')).toHaveFocus();
  });

  it('closes the delete dialog with Escape and restores focus', async () => {
    const user = userEvent.setup();
    renderApp();
    const form = await screen.findByRole('form', { name: 'Add a study task' });

    await user.type(within(form).getByLabelText(/task title/i), 'Keyboard task');
    await user.type(within(form).getByLabelText(/^course/i), 'CS 5551');
    await user.click(within(form).getByRole('radio', { name: 'Low' }));
    fireEvent.change(within(form).getByLabelText(/due date/i), { target: { value: '2026-11-02' } });
    await user.click(screen.getByRole('button', { name: 'Add task' }));
    await screen.findByRole('heading', { name: 'Keyboard task' });

    const deleteButton = screen.getByRole('button', { name: /delete keyboard task/i });
    deleteButton.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog', { name: 'Delete study task' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
  });

  it('moves through the status filter with arrow keys', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'No study tasks yet' });

    const all = screen.getByRole('radio', { name: 'All' });
    all.focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', { name: 'Active' })).toBeChecked();
  });
});
