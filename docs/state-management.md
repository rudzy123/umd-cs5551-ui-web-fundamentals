# State management

The app uses React state, one reducer, and two context providers. It does not use Redux, Zustand, or a similar library. The data flow is small enough to read in one sitting, which is the point.

## What is global, and what is not

Global here means “needed by components that are not parent and child.”

| State                                   | Owner                               | Persisted           |
| --------------------------------------- | ----------------------------------- | ------------------- |
| Tasks, load status, error, notice       | `taskReducer` inside `TaskProvider` | Tasks only          |
| Theme name                              | `ThemeProvider`                     | Yes, `cs5551-theme` |
| Form draft and errors                   | `TaskForm`                          | No                  |
| Search, status, priority, course filter | `useTaskQuery`                      | No                  |
| Open dialog and where to move focus     | `TaskList`                          | No                  |

If a value is only needed while one form is open, it stays in that form. Context is for the task list and the theme because the header, the summary, the list, and the form all meet at the provider instead of passing callbacks through `Dashboard` for every action.

## The reducer

`taskReducer` switches on a `TaskAction`.

| Action                                 | Result                                             |
| -------------------------------------- | -------------------------------------------------- |
| `loading`                              | Status becomes `loading` and notices clear         |
| `load-success`                         | Status becomes `ready` and tasks are replaced      |
| `load-error`                           | Status becomes `error` and the message is stored   |
| `add` / `update` / `toggle` / `delete` | The list changes and a specific notice is set      |
| `save-error`                           | The list stays visible and an error message is set |
| `clear-notice` / `clear-error`         | Clears that message only                           |

Each branch returns a new object. Array updates use `map` or `filter`. Tests freeze the previous state and would throw if a branch mutated it.

`createStudyTask` and `applyTaskDraft` run before `dispatch`. They trim strings and attach ids and timestamps. The reducer stays pure because it does not call `Date` or `crypto`.

## Context boundaries

```text
ThemeProvider
  stores theme
  writes document.documentElement.dataset.theme

TaskProvider
  useReducer(taskReducer)
  effect: storage.load()
  effect: storage.save() after the first ready state
  effect: clear the notice after 8 seconds

useTheme() / useTasks()
  read the matching context or throw
```

`Dashboard` calls `useTasks` for the list and the commands. It calls `useTaskQuery(state.tasks)` for the view. `TaskList` calls `useTasks` again for edit, complete, and delete. That is two readers of one store, not prop drilling.

The form does not call `useTasks` except through the `onSubmit` callback `Dashboard` passes in. The create form can be understood without opening the provider.

## Data flow for adding a task

```text
input onChange
  -> TaskForm draft state
submit
  -> validateTaskDraft
  -> Dashboard onSubmit
  -> addTask(draft)
  -> dispatch({ type: 'add', task })
  -> taskReducer returns the next list and a notice
  -> React renders the list and the status message
  -> effect calls storage.save(tasks)
```

Filtering never enters that path. `filterTasks(state.tasks, query)` runs during render. Changing the search box does not write to `localStorage`.

## Persistence interface

```ts
interface TaskRepository {
  load(): Promise<StudyTask[]>;
  save(tasks: StudyTask[]): Promise<void>;
}
```

The provider depends on this interface, not on `localStorage`. Tests pass `createMemoryTaskRepository` or a repository that fails on purpose. The production entry passes `studyTaskRepository`.

Load validates every record with `isStudyTask`. Corrupt JSON or a partial object becomes an error state with **Try again**. A failed save becomes an error while the current list stays on screen, with **Try saving again**.

The save effect skips the first `ready` render so loading does not immediately write the same list back. `skipNextSave` is set again before a retry load.

JavaScript runs the current `localStorage` write to completion before the next one starts, so two quick edits cannot finish out of order. If `save` later waits on a network request, the repository must ignore an older response that finishes last. That guard is not needed for the synchronous browser store.

## Why not a state library

A library would hide `dispatch`, action shapes, and the render that follows them. Those are the ideas this project is practicing. The cost of doing it by hand is a provider file and a reducer file. That cost stays smaller than the task list.

Add a field by extending `StudyTask`, `TaskDraft`, `validateTaskDraft`, the form, and the repository type guard. Do not add a second global store for it.
