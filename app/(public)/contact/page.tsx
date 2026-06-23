'use client';
import { useLocale } from '@/lib/LocaleContext';
export default function ContactPage() {
  const { t, dir } = useLocale();
  return (
    <div dir={dir} className='py-16'>
      <div className='container'>
        <h1 className='font-display text-4xl font-bold text-center'>{t('contact.title')}</h1>
      </div>
    </div>
  );
}
