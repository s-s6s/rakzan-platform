'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { Plus, Search, Download } from 'lucide-react';
import { exportCSV } from '@/lib/utils/export';
export default function ClientsPage() {
  const { t, dir } = useLocale();
  const [search, setSearch] = useState('');
  return (
    <div dir={dir}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <h1 className='font-display text-2xl font-bold'>{t('dashboard.clients')}</h1>
        <div className='flex items-center gap-2'>
          <button onClick={() => exportCSV([], 'clients')} className='inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-muted/10'><Download className='h-4 w-4' />{t('common.export')}</button>
          <Link href='/dashboard/clients/add' className='inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'><Plus className='h-4 w-4' />{t('dashboard.add_client')}</Link>
        </div>
      </div>
      <div className='mt-6 relative max-w-xs'>
        <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
        <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search')} className='w-full rounded-md border border-border bg-white py-2 pr-10 pl-3 text-sm outline-none focus:border-primary' />
      </div>
      <p className='mt-10 text-center text-muted'>{t('dashboard.no_data')}</p>
    </div>
  );
}
