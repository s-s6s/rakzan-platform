'use client';
import { useLocale } from '@/lib/LocaleContext';
export default function AboutPage() {
  const { t, dir } = useLocale();
  return (
    <div dir={dir} className='py-16'>
      <div className='container'>
        <h1 className='font-display text-4xl font-bold text-center'>{t('about.title')}</h1>
      </div>
    </div>
  );
}
