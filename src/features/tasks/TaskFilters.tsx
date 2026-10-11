import { Button } from '../../components/Button';
import { RadioGroup } from '../../components/RadioGroup';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import type { PriorityFilter, TaskQuery, TaskStatusFilter } from '../../types/studyTask';
import { PRIORITY_OPTIONS } from './constants';

interface TaskFiltersProps {
  query: TaskQuery;
  courses: readonly string[];
  total: number;
  visible: number;
  isDefault: boolean;
  onChange: (query: TaskQuery) => void;
  onReset: () => void;
}

const STATUS_OPTIONS: { value: TaskStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_FILTER_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All priorities' },
  ...PRIORITY_OPTIONS,
];

function isStatus(value: string): value is TaskStatusFilter {
  return STATUS_OPTIONS.some((option) => option.value === value);
}

function isPriorityFilter(value: string): value is PriorityFilter {
  return PRIORITY_FILTER_OPTIONS.some((option) => option.value === value);
}

export function TaskFilters({
  query,
  courses,
  total,
  visible,
  isDefault,
  onChange,
  onReset,
}: TaskFiltersProps) {
  const courseOptions = [
    { value: 'all', label: 'All courses' },
    ...courses.map((course) => ({ value: course, label: course })),
  ];
  if (query.course !== 'all' && !courses.includes(query.course)) {
    courseOptions.push({ value: query.course, label: query.course });
  }

  return (
    <section className="panel" aria-labelledby="filters-heading">
      <h2 id="filters-heading">Find tasks</h2>
      <form role="search" aria-label="Task search" onSubmit={(event) => event.preventDefault()}>
        <TextField
          id="task-search"
          label="Search tasks"
          type="search"
          value={query.search}
          placeholder="Title, course, or notes"
          onChange={(event) => onChange({ ...query, search: event.target.value })}
        />
      </form>
      <RadioGroup
        legend="Status"
        name="filter-status"
        value={query.status}
        options={STATUS_OPTIONS}
        onChange={(value) => {
          if (isStatus(value)) onChange({ ...query, status: value });
        }}
      />
      <RadioGroup
        legend="Priority filter"
        name="filter-priority"
        value={query.priority}
        options={PRIORITY_FILTER_OPTIONS}
        onChange={(value) => {
          if (isPriorityFilter(value)) onChange({ ...query, priority: value });
        }}
      />
      <SelectField
        id="filter-course"
        label="Course filter"
        value={query.course}
        options={courseOptions}
        onChange={(value) => onChange({ ...query, course: value })}
      />
      <p className="result-count" aria-live="polite" aria-atomic="true">
        Showing {visible} of {total} {total === 1 ? 'task' : 'tasks'}
      </p>
      {isDefault ? null : (
        <Button variant="secondary" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </section>
  );
}
