import ar from '@/i18n/ar.json';
import en from '@/i18n/en.json';
export type Locale = 'ar' | 'en';
const messages: Record<Locale, Record<string, string>> = { ar, en };
export function t(key: string, locale: Locale): string {
  return messages[locale]?.[key] || messages['ar']?.[key] || key;
}
export function getDir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
