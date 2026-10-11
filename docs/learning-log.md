# Learning log

A record of the decisions in this dashboard and the course ideas they practice.

## Components and props

The first split is between controls that could appear in another app and controls that know what a study task is. `Button` receives a variant and children. `TaskList` receives tasks and decides what Edit means. Passing a task object into `Button` would couple a generic control to one feature.

Props are the parent’s current answer. State is what the child remembers between renders. The filter panel is controlled because the dashboard also needs the query in order to filter the list. If both the panel and the dashboard stored the query, they would drift.

## Controlled forms

An uncontrolled input keeps the typed value in the DOM. That is less code until validation, reset, and tests need the value. This form keeps a `TaskDraft` and passes it back down as `value`. Submit validates the object, not a collection of DOM nodes.

Errors wait for the first submit. Showing “Enter a task title” on the first empty focus is noise. After submit, each change revalidates so the error disappears while the person is fixing it.

## Render lifecycle

The loading message is the initial state, not a timer. The provider renders `loading`, then an effect talks to storage, then a second render shows the list. I can point at those two renders in the React developer tools.

Derived data does not get its own effect. The visible tasks are `filterTasks(tasks, query)` during render. An effect that copied the filtered list into state would be a frame behind and easy to forget to update.

## Reducer and context

The reducer is the list of legal changes. Context only makes `dispatch` available without threading it through every component. I kept the form draft out of the reducer after noticing that a keystroke is not a domain event. `add` is a domain event. `set-title` on an unsaved draft is not.

Actions carry the next task or the id, not a partial patch from the DOM. The provider creates ids and timestamps so the reducer does not call the clock. Tests can pass a fixed `updatedAt`.

## Responsive layout

I laid out the phone column first, then added a second column at 1024px. I did not use the CSS `order` property. It would put filters on the left visually while Tab still walked through the old source order. Source order is progress, filters, form, list, and the wide layout keeps that order from top to bottom in each column.

## Semantic HTML and accessibility

A `div` with a click handler would have forced me to rebuild keyboard support. A `button`, a checkbox, and a `dialog` already have it. The extra work was naming: “Edit” alone is ambiguous when there are two tasks, so the accessible name includes the task title while the visible word stays short.

Color is repeated by text. I checked that choice by reading the row with the stylesheet disabled in my head: the words High, Overdue, and Completed still describe the state.

Focus has to be moved when a dialog removes the button that was focused. Leaving focus on `document.body` makes the next Tab press start over at the top of the page.

## Browser storage

`localStorage` is a string map on the origin. The repository hides `JSON.parse` and the shape check. The rest of the app asks to load or save tasks. Tests replace the repository without mocking the entire `window`.

I treat corrupt data as an error instead of silently dropping it. Dropping it would look like the person’s tasks had been deleted.

## Testing

Pure functions are tested without rendering. The reducer, validator, filter, and repository answer “is the rule right?” Component tests answer “can someone operate it by its accessible name?” Playwright answers “does the production bundle do the journey in a browser, including reload?”

axe belongs in both layers. Unit-level axe catches missing labels early. Browser axe is the one that can measure contrast.

## What I would revisit

- Debounce the search announcement if a study shows it speaks too often.
- Add undo if participants delete the wrong task after the confirm dialog.
- Add a request id inside `save` before any networked repository, so a slow response cannot overwrite a newer list.
