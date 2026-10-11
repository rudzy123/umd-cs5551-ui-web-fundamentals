import { useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { Dashboard } from './features/dashboard/Dashboard';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

export function App() {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduce' : 'no-preference';
  }, [reducedMotion]);

  return (
    <div className="app">
      <AppHeader />
      <Dashboard />
      <footer className="site-footer">
        <p className="site-footer__inner">Tasks are saved in this browser only.</p>
      </footer>
    </div>
  );
}
