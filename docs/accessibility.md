# Accessibility

The study dashboard targets WCAG 2.2 Level AA. Automated checks use axe in Vitest and Playwright. Automated tools do not prove a page is accessible. Keyboard tests and the semantic structure cover the gaps axe cannot judge, such as whether the visible label matches the task a person is trying to finish.

## How requirements are met

| Requirement          | Implementation                                                                                                                    | Check                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Semantic landmarks   | `header`, `main`, `footer`, labeled `section` elements, `form`, and `dialog`                                                      | axe; `docs` and code review                                      |
| Heading hierarchy    | One `h1`, section `h2` elements, task `h3` titles                                                                                 | axe `heading-order`; empty-state headings in component tests     |
| Explicit labels      | Every input has a `<label>`. Groups use `<legend>`. Icon-free text labels on every button.                                        | Testing Library queries by role and name; `jsx-a11y`             |
| Visible focus        | `:focus-visible` outline, 3px, with a lighter orange on the teal header                                                           | CSS; keyboard Playwright test                                    |
| Keyboard operation   | Skip link, native radios, buttons, dialog Escape, focus return, focus on the list heading after delete                            | `tests/keyboard.test.tsx`; Playwright keyboard test              |
| Status announcements | Loading and success use `role="status"`. Save and validation errors use `role="alert"`. The result count is `aria-live="polite"`. | Component tests assert those roles                               |
| Form errors          | Error summary, `aria-invalid`, `aria-describedby`, focus on the first invalid field                                               | `tests/TaskForm.test.tsx`                                        |
| Not color alone      | Priority, overdue, and completed states include words. The checkbox state is in the accessible name.                              | Accessibility component test                                     |
| Contrast             | Token pairs in `src/styles/tokens.css` for both themes                                                                            | axe `color-contrast` in light and dark, including an open dialog |
| Reduced motion       | Motion lives under `prefers-reduced-motion: no-preference`                                                                        | Playwright reads `animationDuration`                             |
| Name, role, value    | Native controls. The progress bar is `role="meter"` with `aria-valuetext`.                                                        | axe; meter test                                                  |

## Keyboard map

| Key                                  | Result                                 |
| ------------------------------------ | -------------------------------------- |
| Tab / Shift+Tab                      | Moves through controls in source order |
| Enter on the skip link               | Moves focus to `main`                  |
| Arrow keys in a radio group          | Selects the next or previous choice    |
| Space on a focused radio or checkbox | Toggles that control                   |
| Enter on a button                    | Activates it                           |
| Escape in a dialog                   | Closes it and restores focus           |
| Enter in a single-line field         | Submits the surrounding form           |

The delete dialog focuses Cancel first because it is the first control in the dialog. The destructive action is not the default focus.

## Dialog focus

`Dialog` calls `showModal()` when the browser supports it, which gives the dialog the top layer and a backdrop. A keydown listener also handles Escape and keeps Tab inside the dialog when the native trap is unavailable, which matters in jsdom tests.

On close, focus returns to the element that opened the dialog when that element is still in the document. Deleting a task removes that button, so `TaskList` moves focus to the “Study tasks” heading instead.

## Reduced motion

Do not disable motion by deleting every animation after the fact. The stylesheet only creates the dialog animation and color transitions when the person has not requested reduced motion. The operating system setting is the source of truth. The React hook mirrors it onto `<html data-motion>` so tests can observe it and so script can avoid starting motion later.

## Contrast and themes

Body text, muted hints, badges, links, and buttons each have a light pair and a dark pair. Input borders use `--border`, which is stronger than the decorative card line, because a control boundary needs to be visible against its surface.

The header is dark teal in both themes. Header controls set their own focus color (`#fdba74`) because the default brown focus ring is hard to see on that teal.

Placeholder text uses `--text-muted` and `opacity: 1`. Browser default placeholders are often too faint.

## What axe is asked to do

Vitest renders the app and runs `axe-core` on:

- the empty ready state
- a populated list
- dark theme
- the edit dialog

Playwright runs `@axe-core/playwright` on the production page in light mode and again after switching to dark mode. Those browser runs compute real styles, which is the reliable contrast check. jsdom does not lay out CSS the way a browser does.

## Known limits

- The result count announces filter changes immediately. A larger list would debounce that announcement so typing does not speak on every key.
- The repository saves to this origin only. There is no account, session timeout, or server error format beyond the storage message.
- Target size is 44px for the controls we draw. The native date picker popup is drawn by the browser.
- axe does not decide whether the words “High” and “Overdue” are clear to the course’s students. That question belongs in `docs/usability-study.md`.
