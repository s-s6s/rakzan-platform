'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { getStatusText, formatPrice } from '@/lib/utils/format';
import { exportCSV } from '@/lib/utils/export';
import { Plus, Search, Download, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Property } from '@/types/property';

const statusColors: Record<string, string> = { available: 'bg-emerald-100 text-emerald-800', sold: 'bg-red-100 text-red-800', rented: 'bg-blue-100 text-blue-800', under_contract: 'bg-amber-100 text-amber-800', off_market: 'bg-gray-100 text-gray-800' };

export default function PropertiesListPage() {
  const { t, dir } = useLocale();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      setProperties(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('تأكيد حذف العقار؟')) return;
    const supabase = createClient();
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) { toast.error('فشل الحذف'); return; }
    setProperties(prev => prev.filter(p => p.id !== id));
    toast.success('تم الحذف');
  };

  const filtered = properties.filter(p => p.title.includes(search));

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div dir={dir}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <h1 className='font-display text-2xl font-bold'>{t('dashboard.properties')} ({properties.length})</h1>
        <div className='flex items-center gap-2'>
          <button onClick={() => exportCSV(filtered, 'properties')} className='inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-muted/10'><Download className='h-4 w-4' />{t('common.export')}</button>
          <Link href='/dashboard/properties/add' className='inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'><Plus className='h-4 w-4' />{t('dashboard.add_property')}</Link>
        </div>
      </div>

      <div className='mt-6 relative max-w-xs'>
        <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
        <input type='text' value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className='w-full rounded-md border border-border bg-white py-2 pr-10 pl-3 text-sm outline-none focus:border-primary' />
      </div>

      {filtered.length === 0 ? (
        <div className='mt-10 text-center py-10 border rounded-lg'>
          <p className='text-muted'>{t('dashboard.no_data')}</p>
        </div>
      ) : (
        <div className='mt-4 overflow-x-auto rounded-lg border border-border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/10 text-left'>
              <tr><th className='p-3 font-medium'>العقار</th><th className='p-3 font-medium'>السعر</th><th className='p-3 font-medium'>{t('common.status')}</th><th className='p-3 font-medium'>{t('common.created_at')}</th><th className='p-3 font-medium'></th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className='border-t border-border'>
                  <td className='p-3'>
                    <div className='flex items-center gap-2'>
                      <img src={p.featured_image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100'} alt='' className='h-8 w-8 rounded object-cover' />
                      <span className='font-medium'>{p.title}</span>
                    </div>
                  </td>
                  <td className='p-3 font-semibold whitespace-nowrap'>{formatPrice(p.price)}</td>
                  <td className='p-3'><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || ''}`}>{getStatusText(p.status, 'ar')}</span></td>
                  <td className='p-3 text-muted whitespace-nowrap'>{new Date(p.created_at).toLocaleDateString('ar-SA')}</td>
                  <td className='p-3'>
                    <button onClick={() => handleDelete(p.id)} className='text-destructive hover:text-destructive/80'><Trash2 className='h-4 w-4' /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
