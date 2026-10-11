import { SkipLink } from './SkipLink';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader() {
  return (
    <header className="site-header">
      <SkipLink />
      <div className="site-header__inner">
        <p className="eyebrow">CS 5551 · UI and web fundamentals</p>
        <ThemeToggle />
      </div>
    </header>
  );
}
