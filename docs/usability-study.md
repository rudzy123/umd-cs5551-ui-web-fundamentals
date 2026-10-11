# Usability study

Use this plan to watch someone complete real study-dashboard tasks. The findings below the templates are not results from a completed study. The sample finding shows how to fill the template after you have observations.

## Participants

Recruit 5 classmates who have not built this screen. Five people are enough to see repeated problems in a short study. Ask each person to use a keyboard for at least one task. Ask at least one person to use the dark theme and one person to use a phone-width window.

Do not explain the layout first. Read the task, then stay quiet unless they are stuck for more than a minute.

## Tasks

### Task 1. Add a high-priority task

> Add a study task titled “Read contrast notes” for CS 5551. Make it high priority and due tomorrow. Confirm that it appears in the list.

Success looks like: the task is visible, the priority reads High, and the due date is tomorrow. The person does not need to use the exact button name if the task is saved.

### Task 2. Find and complete overdue work

Before the session, add two tasks in that browser: one overdue active task titled “Submit the draft”, and one future task titled “Sketch the layout”.

> You have an overdue draft to turn in. Find “Submit the draft”, mark it complete, and show only completed tasks.

Success looks like: the completed filter is selected and “Submit the draft” is visible as completed. Using search, the course filter, or the status filter all count.

### Task 3. Change theme and edit with the keyboard only

> Without using a pointer, switch to the other theme and change “Sketch the layout” to “Sketch the mobile layout”.

Success looks like: the theme attribute changes and the new title is visible. Tab, arrow keys, Enter, Space, and Escape are allowed. Touch and mouse are not.

## Observation template

Copy one row per notable moment. Record what the person did, not what you think they meant, until the notes column.

| Time | Task | Participant action | Quote | Success so far | Error or hesitation | Notes |
| ---- | ---- | ------------------ | ----- | -------------- | ------------------- | ----- |
| 0:00 | 1    |                    |       | Not started    |                     |       |
|      |      |                    |       |                |                     |       |

Also record:

- Participant id (P1, P2, …) and input method (keyboard, mouse, touch)
- Theme at the start (light or dark)
- Viewport (phone, tablet, desktop)
- Whether they noticed the skip link
- Whether an error message was read aloud or only seen
- Task time and whether they finished without help

## Severity scale

Use this scale, adapted from Nielsen’s severity ratings. Rate the problem for the study task, not your personal taste.

| Score | Name          | Meaning                                                                      |
| ----- | ------------- | ---------------------------------------------------------------------------- |
| 0     | Not a problem | Disagreement or a one-time slip that the person corrected immediately        |
| 1     | Cosmetic      | Extra hesitation. The task still succeeds on the first try.                  |
| 2     | Minor         | The person finishes, but needs a workaround or rereads the screen.           |
| 3     | Major         | The task is difficult. They need a hint, or they finish with the wrong data. |
| 4     | Catastrophe   | They cannot finish the task.                                                 |

Frequency can raise a 2 to a 3 when most participants hit the same issue.

## Findings template

| ID  | Task | What happened | Severity | Evidence                   | Proposed change | Retest |
| --- | ---- | ------------- | -------- | -------------------------- | --------------- | ------ |
| F1  |      |               |          | Participant ids and quotes |                 |        |

Write the observation in the “what happened” cell. Write the design change in a separate cell so the note does not mix evidence with a solution.

## Sample finding

This row is an illustration of the template. It is not data from a session.

| ID  | Task | What happened                                                                                                                                                         | Severity | Evidence                                                                                 | Proposed change                                                                                       | Retest                                                                                   |
| --- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| S1  | 2    | The participant searched for “draft”, opened the task, and stopped. They treated the checkbox as unlabeled because the visible control has no nearby word “Complete”. | 2        | Sample only. Replace this quote with a real one: “I don’t know if this box turns it in.” | Add a visible “Mark complete” label beside the checkbox, keeping the accessible name unique per task. | Repeat Task 2 with two new participants and see whether they check the box without help. |

## Proposed improvements to test next

These are hypotheses, not conclusions. Study them only if a finding points at the same area.

1. **Undo delete.** The confirm dialog prevents accidents, but a person who confirms still cannot recover the task. An undo notice would matter if Task 1 or Task 2 shows people deleting the wrong row.
2. **Due-date shortcuts.** Tomorrow, this week, and overdue are common study filters. Add them only if Task 2 participants cannot find the overdue item with search and status.
3. **Visible complete label.** The checkbox name is exposed to assistive tech (“Mark {title} complete”) and the row says Completed after the check. If sighted participants hesitate, show that verb before the box is checked.
4. **Debounced result announcements.** The polite result count updates on each search change. If a screen reader user on Task 2 is interrupted while typing, debounce the live region and keep the list itself immediate.

After changes, rerun the same three tasks with people who did not see the earlier version. Compare completion, time, and the quotes. Do not treat a fixed severity number as proof until someone finishes the task.
