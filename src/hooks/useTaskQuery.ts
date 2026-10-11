import { useEffect, useMemo, useState } from 'react';
import { defaultTaskQuery, isDefaultQuery, listCourses } from '../features/tasks/taskQueries';
import type { StudyTask, TaskQuery } from '../types/studyTask';

export function useTaskQuery(tasks: readonly StudyTask[]) {
  const [query, setQuery] = useState<TaskQuery>(defaultTaskQuery);
  const courses = useMemo(() => listCourses(tasks), [tasks]);

  useEffect(() => {
    setQuery((current) => {
      if (current.course !== 'all' && !courses.includes(current.course)) {
        return { ...current, course: 'all' };
      }
      return current;
    });
  }, [courses]);

  return {
    query,
    courses,
    isDefault: isDefaultQuery(query),
    setQuery,
    reset() {
      setQuery(defaultTaskQuery);
    },
  };
}
