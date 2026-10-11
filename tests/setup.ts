import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '../src/styles/global.css';

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.dataset.theme = 'light';
  document.documentElement.dataset.motion = 'no-preference';
});

document.documentElement.lang = 'en';
document.documentElement.dataset.theme = 'light';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }),
});
