'use client';
import { useLocale } from '@/lib/LocaleContext';
import { Heart } from 'lucide-react';
export default function FavoritesPage() {
  const { t, dir } = useLocale();
  return (
    <div dir={dir} className='py-16'>
      <div className='container text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/20'><Heart className='h-8 w-8 text-muted' /></div>
        <h1 className='font-display text-3xl font-bold'>{t('favorites.title')}</h1>
        <p className='mt-2 text-muted'>{t('favorites.empty')}</p>
      </div>
    </div>
  );
}
