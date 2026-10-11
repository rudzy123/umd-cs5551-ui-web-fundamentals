import type { StudyTask, TaskQuery } from '../../types/studyTask';

export const defaultTaskQuery: TaskQuery = {
  search: '',
  status: 'all',
  priority: 'all',
  course: 'all',
};

export interface TaskSummary {
  total: number;
  completed: number;
  remaining: number;
  overdue: number;
  percent: number;
}

export function todayISO(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDueDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export function isOverdue(task: StudyTask, today: string): boolean {
  return !task.completed && task.dueDate < today;
}

export function isDefaultQuery(query: TaskQuery): boolean {
  return (
    query.search.trim() === '' &&
    query.status === 'all' &&
    query.priority === 'all' &&
    query.course === 'all'
  );
}

export function listCourses(tasks: readonly StudyTask[]): string[] {
  return [...new Set(tasks.map((task) => task.course))].sort((a, b) => a.localeCompare(b));
}

export function filterTasks(tasks: readonly StudyTask[], query: TaskQuery): StudyTask[] {
  const search = query.search.trim().toLocaleLowerCase();

  return tasks
    .filter((task) => {
      if (query.status === 'active' && task.completed) return false;
      if (query.status === 'completed' && !task.completed) return false;
      if (query.priority !== 'all' && task.priority !== query.priority) return false;
      if (query.course !== 'all' && task.course !== query.course) return false;
      if (!search) return true;
      const haystack = `${task.title} ${task.course} ${task.notes}`.toLocaleLowerCase();
      return haystack.includes(search);
    })
    .sort((a, b) => {
      if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
}

export function summarizeTasks(tasks: readonly StudyTask[], today: string): TaskSummary {
  const completed = tasks.filter((task) => task.completed).length;
  const overdue = tasks.filter((task) => isOverdue(task, today)).length;
  const total = tasks.length;

  return {
    total,
    completed,
    remaining: total - completed,
    overdue,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
