import { useTheme } from '../hooks/useTheme';
import { Button } from './Button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <Button variant="ghost" className="theme-toggle" onClick={toggleTheme}>
      Use {nextTheme} theme
    </Button>
  );
}
