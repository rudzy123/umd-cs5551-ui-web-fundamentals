import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <svg className="empty__icon" viewBox="0 0 48 48" aria-hidden="true">
        <rect
          x="10"
          y="8"
          width="28"
          height="32"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M16 18h16M16 24h16M16 30h10" stroke="currentColor" strokeWidth="2" />
      </svg>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
