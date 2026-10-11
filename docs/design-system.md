# Design system

The study dashboard uses a small set of tokens and controls. The goal is a readable academic tool: warm paper in light mode, the same structure in dark mode, and no decoration that carries meaning by itself.

## Color

Tokens live in `src/styles/tokens.css`. Components never hard-code a second palette. They use variables such as `--text`, `--surface`, and `--accent`.

Light mode is warm paper (`#f3efe6`) with ivory cards (`#fffdf8`) and ink text (`#1c1915`). The header and primary button use deep teal (`#0c3944`) with white text.

Dark mode inverts the surfaces (`#12110f` and `#1e1b17`) and switches the primary button to mint (`#99f6e4`) with dark text (`#042f2e`). A dark teal button on a dark card would fail contrast for both the label and the button shape. The mint button stays distinct from the page.

| Token                              | Light use                 | Dark use                  |
| ---------------------------------- | ------------------------- | ------------------------- |
| `--text` / `--bg`                  | Body copy                 | Body copy                 |
| `--text-muted`                     | Hints, metadata           | Hints, metadata           |
| `--border`                         | Input and button outlines | Input and button outlines |
| `--line`                           | Card edges                | Card edges                |
| `--focus`                          | `#9a3412` outline         | `#fdba74` outline         |
| `--danger`                         | Destructive button        | Destructive button        |
| `--high-text` on `--high-soft`     | High badge                | High badge                |
| `--medium-text` on `--medium-soft` | Medium badge              | Medium badge              |
| `--low-text` on `--low-soft`       | Low badge                 | Low badge                 |

Status is never color alone. A high-priority task has a High badge and a colored edge. An overdue task says “Overdue”. A completed task says “Completed” and uses a checked checkbox.

## Type

The UI uses system fonts so the app does not depend on a network font.

- `--font-serif` for headings: Iowan Old Style, Palatino, Georgia
- `--font-sans` for controls and body text: Segoe UI, system-ui

The page title uses `clamp(2rem, 4vw, 3.1rem)`. Body text stays at `1rem` with a line height of 1.5. Hints are slightly smaller but still above 0.9rem.

## Space and shape

Spacing is based on 0.25rem steps. Cards use 1rem of padding on a phone and 1.25rem from 720px up. The page column is `min(70rem, calc(100% - 2rem))`.

Controls use a 0.55rem radius. Cards use 0.75rem. Filter choices are pills so the hit target and the label stay together. Buttons, inputs, radios, and the complete checkbox have a minimum size of 2.75rem (44px).

## Components

| Component                                     | Responsibility                                                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                      | Primary, secondary, danger, and ghost actions. Defaults to `type="button"` so a control inside a form does not submit by accident. |
| `TextField` / `TextAreaField` / `SelectField` | Label, hint, error, and described-by wiring                                                                                        |
| `RadioGroup`                                  | A fieldset of one-of-many choices                                                                                                  |
| `StatusMessage`                               | Success (`role="status"`) or error (`role="alert"`)                                                                                |
| `EmptyState`                                  | Title, explanation, and an optional action                                                                                         |
| `ProgressMeter`                               | `role="meter"` with a text value                                                                                                   |
| `Dialog`                                      | Native `<dialog>` with Escape, backdrop click, and focus return                                                                    |
| `SkipLink` / `ThemeToggle`                    | Bypass block and theme action                                                                                                      |

Feature components (`TaskForm`, `TaskList`, `TaskFilters`, `ProgressSummary`) compose those controls. They are not part of the visual primitive set.

## Motion

Transitions and the dialog entrance exist only in `@media (prefers-reduced-motion: no-preference)`. Reduced motion gets the same layout with no animation. `usePrefersReducedMotion` records the preference on `document.documentElement.dataset.motion` for tests and for any future script that must branch.

## Breakpoints

| Width         | Layout                                                                                |
| ------------- | ------------------------------------------------------------------------------------- |
| Under 720px   | One column. Form fields stack.                                                        |
| 720px and up  | Form fields sit in two columns. Wide fields span both.                                |
| 1024px and up | Progress and filters stick in a left column. The form and list fill the right column. |

## Themes

`data-theme="light"` or `data-theme="dark"` on `<html>` selects the token set. `color-scheme` follows that choice so native date inputs and scrollbars match. An inline script in `index.html` sets the attribute before paint.
