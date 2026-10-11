import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createBrowserStore,
  THEME_STORAGE_KEY,
  type KeyValueStore,
} from '../services/taskRepository';
import { ThemeContext, type ThemeContextValue, type ThemeName } from './theme-context';

function isThemeName(value: string | null): value is ThemeName {
  return value === 'light' || value === 'dark';
}

function preferredTheme(): ThemeName {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readTheme(store: KeyValueStore): ThemeName {
  try {
    const stored = store.getItem(THEME_STORAGE_KEY);
    return isThemeName(stored) ? stored : preferredTheme();
  } catch {
    return preferredTheme();
  }
}

export function ThemeProvider({ children, store }: { children: ReactNode; store?: KeyValueStore }) {
  const themeStore = useMemo(() => store ?? createBrowserStore(localStorage), [store]);
  const [theme, setTheme] = useState<ThemeName>(() => readTheme(themeStore));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      themeStore.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The page can still switch themes if the browser refuses storage.
    }
  }, [theme, themeStore]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme() {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
