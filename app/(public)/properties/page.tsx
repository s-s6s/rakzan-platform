'use client';
import { useState } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Search } from 'lucide-react';
import type { Property } from '@/types/property';
export default function PropertiesPage() {
  const { t, dir } = useLocale();
  return (
    <div dir={dir} className='py-10'>
      <div className='container'>
        <h1 className='font-display text-3xl font-bold'>{t('properties.title')}</h1>
        <div className='mt-6 relative flex-1 min-w-[250px]'>
          <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
          <input type='text' placeholder={t('properties.search')} className='w-full rounded-md border border-border bg-white py-2 pr-10 pl-3 text-sm outline-none focus:border-primary' />
        </div>
        <p className='mt-10 text-center text-muted'>{t('properties.no_results')}</p>
      </div>
    </div>
  );
}
