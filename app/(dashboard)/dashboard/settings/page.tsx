'use client';
import { useLocale } from '@/lib/LocaleContext';
export default function SettingsPage() { const {t,dir}=useLocale(); return (<div dir={dir}><h1 className='font-display text-2xl font-bold'>{t('dashboard.settings')}</h1><p className='mt-10 text-center text-muted'>{t('dashboard.no_data')}</p></div>); }
