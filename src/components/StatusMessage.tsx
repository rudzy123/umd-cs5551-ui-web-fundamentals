import type { ReactNode } from 'react';
import { Button } from './Button';

interface StatusMessageProps {
  tone: 'success' | 'error';
  children: ReactNode;
  onDismiss?: () => void;
  action?: ReactNode;
}

export function StatusMessage({ tone, children, onDismiss, action }: StatusMessageProps) {
  return (
    <div className={`status status--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <p>{children}</p>
      <div className="status__actions">
        {action}
        {onDismiss ? (
          <Button variant="secondary" onClick={onDismiss}>
            Dismiss
          </Button>
        ) : null}
      </div>
    </div>
  );
}
