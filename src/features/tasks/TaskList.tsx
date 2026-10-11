import { useEffect, useRef, useState } from 'react';
import { PRIORITY_OPTIONS } from './constants';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { EmptyState } from '../../components/EmptyState';
import { useTasks } from '../../hooks/useTasks';
import type { StudyTask } from '../../types/studyTask';
import { formatDueDate, isOverdue } from './taskQueries';
import { draftFromTask } from './validation';
import { TaskForm } from './TaskForm';

interface TaskListProps {
  tasks: readonly StudyTask[];
  today: string;
  hasTasks: boolean;
  onClearFilters: () => void;
}

type DialogState =
  { type: 'none' } | { type: 'edit'; task: StudyTask } | { type: 'delete'; task: StudyTask };

export function TaskList({ tasks, today, hasTasks, onClearFilters }: TaskListProps) {
  const { updateTask, toggleTask, deleteTask } = useTasks();
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });
  const [focusRequest, setFocusRequest] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!focusRequest) return;
    if (focusRequest === 'list') headingRef.current?.focus();
    else document.getElementById(focusRequest)?.focus();
    setFocusRequest(null);
  }, [focusRequest]);

  return (
    <section className="panel" aria-labelledby="task-list-heading">
      <h2 id="task-list-heading" ref={headingRef} tabIndex={-1}>
        Study tasks
      </h2>
      {tasks.length === 0 ? (
        hasTasks ? (
          <EmptyState
            title="No tasks match these filters"
            action={
              <Button variant="secondary" onClick={onClearFilters}>
                Clear filters
              </Button>
            }
          >
            Try a different search, status, priority, or course.
          </EmptyState>
        ) : (
          <EmptyState title="No study tasks yet">
            Add a title, course, priority, and due date. Your tasks stay in this browser.
          </EmptyState>
        )
      ) : (
        <ul className="task-list">
          {tasks.map((task) => {
            const overdue = isOverdue(task, today);
            const titleId = `task-${task.id}-title`;
            return (
              <li key={task.id}>
                <article
                  className={`task-card task-card--${task.priority}`}
                  aria-labelledby={titleId}
                >
                  <div className="task-card__main">
                    <label className="complete-toggle">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span className="sr-only">
                        Mark {task.title} {task.completed ? 'active' : 'complete'}
                      </span>
                    </label>
                    <div>
                      <h3 id={titleId} tabIndex={-1}>
                        {task.completed ? <span className="sr-only">Completed: </span> : null}
                        <span className={task.completed ? 'task-title is-complete' : 'task-title'}>
                          {task.title}
                        </span>
                      </h3>
                      <p className="task-meta">
                        <span>{task.course}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Due <time dateTime={task.dueDate}>{formatDueDate(task.dueDate)}</time>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={`badge badge--${task.priority}`}>
                          {PRIORITY_OPTIONS.find((option) => option.value === task.priority)?.label}
                        </span>
                        {task.completed ? (
                          <span className="badge badge--done">Completed</span>
                        ) : null}
                        {overdue ? <span className="badge badge--overdue">Overdue</span> : null}
                      </p>
                      {task.notes ? <p className="task-notes">{task.notes}</p> : null}
                    </div>
                  </div>
                  <div className="task-card__actions">
                    <Button variant="secondary" onClick={() => setDialog({ type: 'edit', task })}>
                      Edit <span className="sr-only">{task.title}</span>
                    </Button>
                    <Button variant="danger" onClick={() => setDialog({ type: 'delete', task })}>
                      Delete <span className="sr-only">{task.title}</span>
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {dialog.type === 'edit' ? (
        <Dialog title="Edit study task" onClose={() => setDialog({ type: 'none' })}>
          <TaskForm
            idPrefix="edit-task"
            heading="Edit study task"
            showHeading={false}
            submitLabel="Save changes"
            initialValue={draftFromTask(dialog.task)}
            onCancel={() => setDialog({ type: 'none' })}
            onSubmit={(draft) => {
              updateTask(dialog.task.id, draft);
              setFocusRequest(`task-${dialog.task.id}-title`);
              setDialog({ type: 'none' });
            }}
          />
        </Dialog>
      ) : null}

      {dialog.type === 'delete' ? (
        <Dialog title="Delete study task" onClose={() => setDialog({ type: 'none' })}>
          <p>
            Delete “{dialog.task.title}”? This removes it from this browser and cannot be undone.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setDialog({ type: 'none' })}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteTask(dialog.task.id);
                setFocusRequest('list');
                setDialog({ type: 'none' });
              }}
            >
              Delete task
            </Button>
          </div>
        </Dialog>
      ) : null}
    </section>
  );
}
