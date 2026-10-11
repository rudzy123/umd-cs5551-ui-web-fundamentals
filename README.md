# CS 5551 study dashboard

An accessible study dashboard for planning coursework. You can add, edit, complete, search, filter, and delete tasks. Each task has a course, a priority, and a due date. The list stays in this browser through a small storage interface. There is no server and no global state library.

The interface is built with React, TypeScript, and Vite. Behavior is checked with Vitest, React Testing Library, axe, and Playwright.

## Run the project

```bash
npm install
npm run dev
```

Open the URL Vite prints. The first visit follows the operating system theme. Use **Use dark theme** or **Use light theme** in the header to override it.

| Script                 | What it does                               |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start the Vite development server          |
| `npm run build`        | Typecheck and create the production bundle |
| `npm run preview`      | Serve the production bundle                |
| `npm run lint`         | Run ESLint, including `jsx-a11y`           |
| `npm run format`       | Format the repository with Prettier        |
| `npm run format:check` | Fail if formatting is stale                |
| `npm test`             | Run unit, component, and axe tests         |
| `npm run test:e2e`     | Build, then run the Playwright tests       |

## Component architecture

Reusable controls live in `src/components`. They know how to render an accessible button, field, dialog, or meter. They do not know what a study task is.

Feature code lives in `src/features`. `TaskForm`, `TaskList`, `TaskFilters`, and `ProgressSummary` own the study-task workflow. `Dashboard` composes those pieces and is the only feature that decides the page layout.

`App` is the shell: header, main dashboard, and footer. Providers wrap `App` in `src/main.tsx`.

```text
main.tsx
  ThemeProvider          theme preference
    TaskProvider         task reducer + repository
      App
        AppHeader        landmark + skip link + theme button
        Dashboard        loading, error, and ready views
          ProgressSummary
          TaskFilters
          TaskForm
          TaskList
        footer
```

That split keeps a visual control reusable. `TextField` is used for the task title and for search. `RadioGroup` is used for priority and for filters. Neither component imports the reducer.

## Props and state

A prop is an input passed by a parent. State is memory that a component owns and can change.

| Data                            | Where it lives               | Why                                                 |
| ------------------------------- | ---------------------------- | --------------------------------------------------- |
| Task list, load status, notices | Reducer in `TaskProvider`    | Several components read and change it               |
| Theme                           | `ThemeProvider`              | The header writes it and the document reads it      |
| Form draft and field errors     | `useState` inside `TaskForm` | Only the form needs the in-progress values          |
| Search and filters              | `useTaskQuery`               | Filtering is a view preference, not saved task data |
| Which dialog is open            | `useState` inside `TaskList` | Edit and delete are local to the list               |

`TaskForm` is controlled. The input `value` is the draft in React state, and `onChange` writes the next draft. The DOM does not own the value. That makes validation, reset, and tests straightforward: the draft is a plain object.

Filter controls are controlled too. `TaskFilters` receives the current `TaskQuery` and calls `onChange` with the next query. It does not store its own copy.

Avoid prop drilling by passing the repository and theme through context. Do not put the form draft in context. Lifting that state would re-render the whole dashboard on every keystroke and would hide the fact that a draft is local.

## Controlled forms

`TaskForm` keeps one `TaskDraft`:

```ts
{
  (title, course, priority, dueDate, notes);
}
```

Each field passes `value={draft.title}` and an `onChange` that copies the draft with one new property. Submit calls `validateTaskDraft`. If there are errors, the form focuses the first invalid field and lists the problems in an alert. If the draft is valid, the parent receives the trimmed values.

The create form then clears its draft. The edit form does not, because the dialog closes. Validation runs on submit first, so the form does not scold someone before they have tried to save. After that first submit, editing a field revalidates immediately.

`noValidate` turns off the browser's built-in bubble. Those bubbles are inconsistent for screen readers. The visible error text, `aria-invalid`, and `aria-describedby` are the accessible path instead.

## Render lifecycle, in practice

1. The first render of `TaskProvider` uses `initialTaskState`, whose status is `loading`. `Dashboard` shows “Loading study tasks…”.
2. After that paint, an effect calls `storage.load()`.
3. Success dispatches `load-success`. React renders again with status `ready`. The empty state or the saved tasks appear.
4. Typing in the form calls `setDraft`. React renders `TaskForm` again. The rest of the tree does not need to change unless a parent render is already in progress.
5. A successful submit dispatches `add`. The reducer returns a new state object. Every `useTasks()` reader renders again, and a later effect writes the new list.
6. Unmounting the provider cleans up the load request so a late response cannot update an unmounted tree.

Effects are for work that must touch the outside world: storage, `matchMedia`, and moving focus after a dialog closes. Calculating the visible list is not an effect. `filterTasks` runs during render.

Strict Mode runs effects twice in development. The load effect ignores a response if its cleanup already ran.

## Reducer and context

`taskReducer` is a pure function: `(state, action) => nextState`. It does not read the clock, the DOM, or storage. The provider builds timestamps and ids before it dispatches, so tests can call the reducer with plain objects.

Context is only the delivery mechanism. `TaskProvider` holds `useReducer`, loads and saves through the repository, and exposes functions such as `addTask` and `toggleTask`. `useTasks` throws if a component forgets the provider. That failure is immediate and specific.

Filter state stays outside the reducer. A search string is not a study task, and putting it in the same reducer would mix persisted data with a temporary view.

Read `docs/state-management.md` for the action list and the save rule.

## Responsive design

Layout is mobile first. The base CSS is a single column: progress, filters, the add form, then the list. At 720px the form fields become two columns. At 1024px the tools column sits beside the work column and sticks while the list scrolls.

Source order matches the visual order, including on a wide screen. CSS `order` is not used to rearrange controls, because it would change what you see without changing the tab order.

The type scale uses `clamp` for the page title. Cards and inputs use `min-width: 0` so long titles wrap inside the grid instead of widening the page. Playwright checks 390px, 768px, and 1280px for horizontal overflow.

## Semantic HTML

Landmarks are elements, not styled divs:

| Element               | Role on the page                      |
| --------------------- | ------------------------------------- |
| `header`              | Course label, skip link, theme button |
| `main`                | The dashboard                         |
| `footer`              | Storage reminder                      |
| `section`             | Progress, filters, the task list      |
| `form`                | Create task, and a search form        |
| `fieldset` + `legend` | Priority and filter choices           |
| `dialog`              | Edit and delete confirmation          |
| `article`             | One study task                        |

The heading order is `h1` “Study dashboard”, then `h2` for Progress, Find tasks, Add a study task, and Study tasks. Each task title is an `h3`. Due dates use `<time datetime="YYYY-MM-DD">`. Counts use a description list. Completion uses a real checkbox.

There is no `nav` because this app has one page. A navigation landmark would advertise links that do not exist.

## Accessibility

The target is WCAG 2.2 AA.

- Skip link is the first control in the header.
- Every control has a visible label. Required fields add the word “required” for assistive tech, not only an asterisk.
- Focus uses `:focus-visible` with a 3px outline that stays visible on the teal header and in both themes.
- Status uses text. Priority badges say Low, Medium, or High. Overdue and Completed are words. Color and a strikethrough repeat that information; they do not replace it.
- Errors use `role="alert"`, `aria-invalid`, and `aria-describedby`. The summary links move focus to the field.
- Success and loading use `role="status"`. The result count uses `aria-live="polite"`.
- Delete asks for confirmation in a dialog. Escape closes it and returns focus to the button that opened it. After a delete, focus moves to the “Study tasks” heading so it does not fall into the page.
- Animations are declared only inside `@media (prefers-reduced-motion: no-preference)`.
- Light and dark themes set `color-scheme` and token pairs chosen for text and control contrast. The header script applies the saved theme before React paints, which avoids a light flash.

Details and the test mapping are in `docs/accessibility.md`.

## Browser storage

`TaskRepository` is the persistence interface:

```ts
load(): Promise<StudyTask[]>
save(tasks: StudyTask[]): Promise<void>
```

`createLocalStorageTaskRepository` implements it with `localStorage`. `createMemoryTaskRepository` implements it with an array, which is what most tests use. The provider cannot tell which one it has.

The storage key is `cs5551-study-tasks`. The theme uses a separate key, `cs5551-theme`, because a theme is not a task.

`localStorage` is origin-scoped, synchronous, and limited to strings. The repository is async anyway, so a later implementation could call a server without rewriting the reducer. JSON parse failures and unexpected shapes throw `StorageError`. The dashboard shows that message and a retry button instead of crashing.

This data is not an account. Anyone who can run script on the origin can read it. Do not store secrets here.

The first time the list becomes `ready`, the provider does not write it back. Later task changes are saved. If a write fails, the tasks stay on screen and **Try saving again** repeats the write.

## Testing strategy

| Layer                    | Tool                           | Question it answers                                                                    |
| ------------------------ | ------------------------------ | -------------------------------------------------------------------------------------- |
| Reducer                  | Vitest                         | Does each action return the next state without mutating the previous one?              |
| Validation and filtering | Vitest                         | Do the pure rules accept and reject the right drafts and queries?                      |
| Repository               | Vitest                         | Does the adapter round-trip, reject corrupt JSON, and report a failed write?           |
| Form and dashboard       | React Testing Library          | Can a person add, filter, complete, edit, and delete using accessible names?           |
| Keyboard                 | Testing Library and Playwright | Do the skip link, arrow keys, Enter, and Escape work?                                  |
| Accessibility            | axe in Vitest and Playwright   | Does the rendered page violate axe rules in light mode, dark mode, and an open dialog? |
| Browser journey          | Playwright                     | Does the production build persist a task across reload and fit three viewports?        |

Tests query by role and name. A button labeled “Edit Read contrast notes” fails the test if the accessible name disappears, even when the pixels still look fine.

## Project map

```text
src/components     reusable controls
src/features       study-task workflow and dashboard
src/context        task and theme providers
src/hooks          useTasks, useTheme, useTaskQuery, reduced motion
src/services       TaskRepository and storage adapters
src/styles         tokens and layout
tests              unit, component, keyboard, and axe tests
e2e                Playwright
docs               design system, accessibility, state, usability, learning log
```

## Further reading in this repo

- [Design system](docs/design-system.md)
- [Accessibility](docs/accessibility.md)
- [State management](docs/state-management.md)
- [Usability study](docs/usability-study.md)
- [Learning log](docs/learning-log.md)
