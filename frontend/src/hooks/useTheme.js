import { useCallback, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';

const EVENT = 'coco-theme-change';

// Investor pages default to Day (investors prefer light screens); the
// developer site and dashboard default to Night. Each remembers its own choice.
const SCOPES = {
  site: { key: 'coco-theme', fallback: 'dark' },
  investor: { key: 'coco-theme-investor', fallback: 'light' },
};
const INVESTOR_PATHS = /^\/(investors|live|packages|checkout)(\/|$)/;

function read(scope) {
  const { key, fallback } = SCOPES[scope];
  try {
    const value = localStorage.getItem(key);
    return value === 'light' || value === 'dark' ? value : fallback;
  } catch {
    return fallback;
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
  const { pathname } = useLocation();
  const scope = INVESTOR_PATHS.test(pathname) ? 'investor' : 'site';
  const theme = useSyncExternalStore(subscribe, () => read(scope), () => SCOPES[scope].fallback);

  const setTheme = useCallback(
    (next) => {
      try {
        localStorage.setItem(SCOPES[scope].key, next);
      } catch {
        /* storage unavailable (private mode) */
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [scope],
  );

  const toggle = useCallback(() => setTheme(read(scope) === 'light' ? 'dark' : 'light'), [scope, setTheme]);

  return { theme, light: theme === 'light', setTheme, toggle };
}
