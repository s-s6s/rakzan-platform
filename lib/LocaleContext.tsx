'use client';
import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { type Locale, t, getDir } from './i18n';
interface LocaleContextType { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string) => string; dir: 'rtl' | 'ltr'; }
const LocaleContext = createContext<LocaleContextType | null>(null);
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');
  const setLocale = useCallback((newLocale: Locale) => { setLocaleState(newLocale); if (typeof document !== 'undefined') { document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'; document.documentElement.lang = newLocale; } }, []);
  const translate = useCallback((key: string) => t(key, locale), [locale]);
  const dir = useMemo(() => getDir(locale), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t: translate, dir }), [locale, setLocale, translate, dir]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
