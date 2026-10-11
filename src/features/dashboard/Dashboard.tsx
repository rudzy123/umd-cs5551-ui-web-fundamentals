import { Button } from '../../components/Button';
import { StatusMessage } from '../../components/StatusMessage';
import { useTaskQuery } from '../../hooks/useTaskQuery';
import { useTasks } from '../../hooks/useTasks';
import { ProgressSummary } from '../tasks/ProgressSummary';
import { TaskFilters } from '../tasks/TaskFilters';
import { TaskForm } from '../tasks/TaskForm';
import { TaskList } from '../tasks/TaskList';
import { filterTasks, todayISO } from '../tasks/taskQueries';

export function Dashboard() {
  const { state, addTask, retryLoad, retrySave, dismissNotice } = useTasks();
  const today = todayISO();
  const taskQuery = useTaskQuery(state.tasks);
  const visibleTasks = filterTasks(state.tasks, taskQuery.query);

  return (
    <main id="main-content" className="content" tabIndex={-1}>
      <header className="page-intro">
        <h1>Study dashboard</h1>
        <p className="lede">
          Keep coursework visible. Add a task, set a due date, and mark it complete when you are
          done.
        </p>
      </header>

      {state.status === 'loading' ? (
        <p className="loading" role="status">
          Loading study tasks…
        </p>
      ) : null}

      {state.status === 'error' ? (
        <section className="panel" aria-labelledby="load-error-heading">
          <h2 id="load-error-heading">Tasks are unavailable</h2>
          <StatusMessage
            tone="error"
            action={
              <Button variant="primary" onClick={retryLoad}>
                Try again
              </Button>
            }
          >
            {state.errorMessage}
          </StatusMessage>
        </section>
      ) : null}

      {state.status === 'ready' ? (
        <>
          {state.notice ? (
            <StatusMessage tone="success" onDismiss={dismissNotice}>
              {state.notice}
            </StatusMessage>
          ) : null}
          {state.errorMessage ? (
            <StatusMessage
              tone="error"
              action={
                <Button variant="primary" onClick={retrySave}>
                  Try saving again
                </Button>
              }
            >
              {state.errorMessage}
            </StatusMessage>
          ) : null}
          <div className="dashboard-grid">
            <div className="dashboard-tools">
              <ProgressSummary tasks={state.tasks} today={today} />
              <TaskFilters
                query={taskQuery.query}
                courses={taskQuery.courses}
                total={state.tasks.length}
                visible={visibleTasks.length}
                isDefault={taskQuery.isDefault}
                onChange={taskQuery.setQuery}
                onReset={taskQuery.reset}
              />
            </div>
            <div className="dashboard-work">
              <section className="panel" aria-labelledby="add-task-heading">
                <TaskForm
                  idPrefix="new-task"
                  headingId="add-task-heading"
                  heading="Add a study task"
                  submitLabel="Add task"
                  resetOnSubmit
                  onSubmit={(draft) => {
                    addTask(draft);
                    taskQuery.reset();
                  }}
                />
              </section>
              <TaskList
                tasks={visibleTasks}
                today={today}
                hasTasks={state.tasks.length > 0}
                onClearFilters={taskQuery.reset}
              />
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
