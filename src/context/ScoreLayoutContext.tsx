import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ScoreLayoutMode } from '../types/layout';

const STORAGE_KEY = 'atlas-score-layout';

const ScoreLayoutContext = createContext<{
  layout: ScoreLayoutMode;
  setLayout: (mode: ScoreLayoutMode) => void;
} | null>(null);

function readStoredLayout(): ScoreLayoutMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'classic' || v === 'compact') return v;
  } catch {
    // -- ignore
  }
  return 'classic';
}

export function ScoreLayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayoutState] = useState<ScoreLayoutMode>(() => {
    if (typeof window === 'undefined') return 'classic';
    return readStoredLayout();
  });

  const setLayout = useCallback((mode: ScoreLayoutMode) => {
    setLayoutState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // -- ignore
    }
  }, []);

  const value = useMemo(() => ({ layout, setLayout }), [layout, setLayout]);

  return (
    <ScoreLayoutContext.Provider value={value}>
      {children}
    </ScoreLayoutContext.Provider>
  );
}

export function useScoreLayout() {
  const ctx = useContext(ScoreLayoutContext);
  if (!ctx) {
    throw new Error('useScoreLayout must be used within ScoreLayoutProvider');
  }
  return ctx;
}
