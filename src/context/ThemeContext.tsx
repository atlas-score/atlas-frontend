import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ThemeMode } from '../types/theme';

export type AtlasTheme = ThemeMode;

const STORAGE_KEY = 'atlas-theme';

const ThemeContext = createContext<{
  theme: AtlasTheme;
  setTheme: (t: AtlasTheme) => void;
  toggleTheme: () => void;
} | null>(null);

function readStoredTheme(): AtlasTheme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'day' || v === 'night') return v;
  } catch {
    // -- ignore
  }
  return 'night';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AtlasTheme>(() => {
    if (typeof document === 'undefined') return 'night';
    return readStoredTheme();
  });

  const setTheme = useCallback((t: AtlasTheme) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'night' ? 'day' : 'night'));
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // -- ignore
    }
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
