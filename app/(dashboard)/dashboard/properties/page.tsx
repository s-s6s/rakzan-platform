'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { getStatusText, formatPrice } from '@/lib/utils/format';
import { Plus, Search, Download } from 'lucide-react';
import { exportCSV } from '@/lib/utils/export';
const sampleData = [
  { id: '1', title: 'فلة فاخرة في حي النرجس', type: 'فلة', purpose: 'بيع', price: 2500000, status: 'available', city: 'الرياض', date: '2024-03-15' },
  { id: '2', title: 'شقة حديثة في حي العليا', type: 'شقة', purpose: 'إيجار', price: 85000, status: 'available', city: 'الرياض', date: '2024-03-14' },
];
const statusColors: Record<string, string> = { available: 'bg-emerald-100 text-emerald-800', sold: 'bg-red-100 text-red-800', rented: 'bg-blue-100 text-blue-800', under_contract: 'bg-amber-100 text-amber-800', off_market: 'bg-gray-100 text-gray-800' };
export default function PropertiesListPage() {
  const { t, dir, locale } = useLocale();
  const [search, setSearch] = useState('');
  const filtered = sampleData.filter((p) => p.title.includes(search));
  return (
    <div dir={dir}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <h1 className='font-display text-2xl font-bold'>{t('dashboard.properties')}</h1>
        <div className='flex items-center gap-2'>
          <button onClick={() => exportCSV(filtered, 'properties')} className='inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-muted/10'><Download className='h-4 w-4' />{t('common.export')}</button>
          <Link href='/dashboard/properties/add' className='inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'><Plus className='h-4 w-4' />{t('dashboard.add_property')}</Link>
        </div>
      </div>
      <div className='mt-6 relative max-w-xs'>
        <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
        <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search')} className='w-full rounded-md border border-border bg-white py-2 pr-10 pl-3 text-sm outline-none focus:border-primary' />
      </div>
      <div className='mt-4 overflow-x-auto rounded-lg border border-border'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/10 text-left'>
            <tr><th className='p-3 font-medium'>العقار</th><th className='p-3 font-medium'>السعر</th><th className='p-3 font-medium'>{t('common.status')}</th><th className='p-3 font-medium'>{t('common.created_at')}</th></tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className='border-t border-border'>
                <td className='p-3 font-medium'>{p.title}</td>
                <td className='p-3 font-semibold'>{formatPrice(p.price)}</td>
                <td className='p-3'><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || ''}`}>{getStatusText(p.status, locale)}</span></td>
                <td className='p-3 text-muted'>{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
