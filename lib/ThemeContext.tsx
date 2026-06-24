'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'gold';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = 'rakzan-theme';
export const THEME_LABELS: Record<ThemeMode, { label: string; icon: string }> = {
  light: { label: 'فاتح', icon: 'sun' },
  dark: { label: 'غامق', icon: 'moon' },
  gold: { label: 'ذهبي', icon: 'sparkles' },
};

const NEXT_THEME: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'gold', gold: 'light' };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (saved && ['light', 'dark', 'gold'].includes(saved)) {
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme(NEXT_THEME[theme]);
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, cycleTheme }), [theme, setTheme, cycleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
