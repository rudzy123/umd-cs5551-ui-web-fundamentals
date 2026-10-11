import { ProgressMeter } from '../../components/ProgressMeter';
import type { StudyTask } from '../../types/studyTask';
import { summarizeTasks } from './taskQueries';

interface ProgressSummaryProps {
  tasks: readonly StudyTask[];
  today: string;
}

export function ProgressSummary({ tasks, today }: ProgressSummaryProps) {
  const summary = summarizeTasks(tasks, today);

  return (
    <section className="panel" aria-labelledby="progress-heading">
      <h2 id="progress-heading">Progress</h2>
      {summary.total === 0 ? (
        <p>Add a task to start tracking progress.</p>
      ) : (
        <>
          <p id="progress-label" className="progress-lead">
            <span className="progress-value">{summary.completed}</span> of {summary.total} tasks
            complete
          </p>
          <ProgressMeter
            labelledBy="progress-label"
            value={summary.percent}
            valueText={`${summary.completed} of ${summary.total} tasks complete`}
          />
          <dl className="stats">
            <div>
              <dt>Remaining</dt>
              <dd>{summary.remaining}</dd>
            </div>
            <div>
              <dt>Overdue</dt>
              <dd>{summary.overdue}</dd>
            </div>
            <div>
              <dt>Complete</dt>
              <dd>{summary.percent}%</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
