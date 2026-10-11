import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import { sampleTask } from './fixtures';
import { renderApp } from './renderApp';

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, { resultTypes: ['violations'] });
  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.html),
  }));
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
}

describe('accessibility', () => {
  it('has no axe violations on the empty dashboard', async () => {
    const { container } = renderApp();
    await screen.findByRole('heading', { name: 'No study tasks yet' });
    await expectNoAxeViolations(container);
  });

  it('has no axe violations with a task, an open dialog, and the dark theme', async () => {
    const user = userEvent.setup();
    const { container } = renderApp({
      async load() {
        return [sampleTask()];
      },
      async save() {
        return undefined;
      },
    });

    await screen.findByRole('heading', { name: 'Read contrast notes' });
    await expectNoAxeViolations(container);

    await user.click(screen.getByRole('button', { name: 'Use dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await expectNoAxeViolations(container);

    await user.click(screen.getByRole('button', { name: /edit read contrast notes/i }));
    expect(screen.getByRole('dialog', { name: 'Edit study task' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('exposes progress without relying on color alone', async () => {
    renderApp({
      async load() {
        return [
          sampleTask({ completed: true, title: 'Done task' }),
          sampleTask({ id: 'task-2', title: 'Late task', dueDate: '2020-01-01' }),
        ];
      },
      async save() {
        return undefined;
      },
    });

    expect(await screen.findByRole('meter')).toHaveAccessibleName(/1 of 2 tasks complete/i);
    const done = screen.getByRole('article', { name: /done task/i });
    const late = screen.getByRole('article', { name: /late task/i });
    expect(within(done).getByText('Completed')).toBeInTheDocument();
    expect(within(done).getByText('High')).toBeInTheDocument();
    expect(within(late).getByText('Overdue')).toBeInTheDocument();
  });

  it('records a reduced-motion preference on the document', async () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    renderApp();
    await screen.findByRole('heading', { name: 'No study tasks yet' });
    expect(document.documentElement.dataset.motion).toBe('reduce');
  });
});
