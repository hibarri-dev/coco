import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'coco-theme';
const LEGACY_KEY = 'coco-investor-theme';
const EVENT = 'coco-theme-change';

function read() {
  try {
    const value = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    return value === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => 'dark');

  const setTheme = useCallback((next) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable (private mode) */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggle = useCallback(() => setTheme(read() === 'light' ? 'dark' : 'light'), [setTheme]);

  return { theme, light: theme === 'light', setTheme, toggle };
}
