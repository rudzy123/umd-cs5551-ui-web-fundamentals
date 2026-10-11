import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const summary = results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} [${violation.nodes
        .map((node) => node.target.join(' '))
        .join('; ')}]`,
  );
  expect(summary).toEqual([]);
}

async function addStudyTask(page: Page, title: string) {
  const form = page.getByRole('form', { name: 'Add a study task' });
  await form.getByLabel('Task title').fill(title);
  await form.getByLabel('Course').fill('CS 5551');
  await form.getByRole('radio', { name: 'High' }).check();
  await form.getByLabel('Due date').fill('2026-10-20');
  await form.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'No study tasks yet' })).toBeVisible();
});

test('adds, finds, completes, edits, and deletes a study task', async ({ page }) => {
  await expectNoAxeViolations(page);

  await addStudyTask(page, 'Read contrast notes');
  await expect(page.getByRole('status')).toContainText('Added “Read contrast notes”.');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Read contrast notes' })).toBeVisible();

  await page.getByLabel('Search tasks').fill('contrast');
  await expect(page.getByText('Showing 1 of 1 task')).toBeVisible();
  await page.getByLabel('Search tasks').fill('zzzz');
  await expect(page.getByRole('heading', { name: 'No tasks match these filters' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(page.getByRole('heading', { name: 'Read contrast notes' })).toBeVisible();

  await page.getByRole('checkbox', { name: 'Mark Read contrast notes complete' }).check();
  await page.getByRole('radio', { name: 'Completed' }).check();
  await expect(page.getByRole('article').getByText('Completed', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Edit Read contrast notes' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit study task' });
  await dialog.getByLabel('Task title').fill('Review contrast notes');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Review contrast notes' })).toBeVisible();

  await page.getByRole('button', { name: 'Delete Review contrast notes' }).click();
  await page.getByRole('button', { name: 'Delete task' }).click();
  await expect(page.getByRole('heading', { name: 'No study tasks yet' })).toBeVisible();

  await page.getByRole('button', { name: 'Use dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expectNoAxeViolations(page);
});

test('completes the primary path from the keyboard', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  await page.getByRole('radio', { name: 'All', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Active' })).toBeChecked();
  await page.keyboard.press('ArrowLeft');

  const form = page.getByRole('form', { name: 'Add a study task' });
  await form.getByLabel('Task title').focus();
  await page.keyboard.type('Keyboard outline');
  await page.keyboard.press('Tab');
  await expect(form.getByLabel('Course')).toBeFocused();
  await page.keyboard.type('CS 5551');
  await form.getByRole('radio', { name: 'High' }).focus();
  await page.keyboard.press('Space');
  await form.getByLabel('Due date').fill('2026-11-02');
  await form.getByRole('button', { name: 'Add task' }).focus();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'Keyboard outline' })).toBeVisible();

  await page.getByRole('button', { name: 'Delete Keyboard outline' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Delete study task' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Delete Keyboard outline' })).toBeFocused();
});

test('fits phone, tablet, and desktop widths', async ({ page }) => {
  await addStudyTask(page, 'Responsive task');

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole('heading', { name: 'Study dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Responsive task' })).toBeVisible();
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflows).toBe(false);
  }
});

test('does not animate the dialog when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await addStudyTask(page, 'Quiet task');
  await page.getByRole('button', { name: 'Edit Quiet task' }).click();

  const duration = await page
    .locator('.dialog__panel')
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(duration).toBe('0s');
});
