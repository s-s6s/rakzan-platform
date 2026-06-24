'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { exportCSV } from '@/lib/utils/export';
import { formatPrice, statusLabel } from '@/lib/utils/format';
import { Loader2, Download, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Contract } from '@/types/property';

const statusColors: Record<string, string> = { active: 'bg-emerald-100 text-emerald-800', expired: 'bg-gray-100 text-gray-800', terminated: 'bg-red-100 text-red-800', draft: 'bg-amber-100 text-amber-800' };

export default function ContractsPage() {
  const { t, dir } = useLocale();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('contracts').select('*, property:properties(*), client:clients(*)').order('created_at', { ascending: false });
      setContracts(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = contracts.filter(c => c.contract_number.includes(search) || c.client?.name?.includes(search));

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div dir={dir}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <h1 className='font-display text-2xl font-bold'>{t('dashboard.contracts')} ({contracts.length})</h1>
        <div className='flex items-center gap-2'>
          <button onClick={() => exportCSV(filtered, 'contracts')} className='inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-muted/10'><Download className='h-4 w-4' />{t('common.export')}</button>
          <Link href='/dashboard/contracts/add' className='inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'><Plus className='h-4 w-4' />إضافة عقد</Link>
        </div>
      </div>

      <div className='mt-6 relative max-w-xs'>
        <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
        <input type='text' value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')} className='w-full rounded-md border border-border bg-white py-2 pr-10 pl-3 text-sm outline-none focus:border-primary' />
      </div>

      {filtered.length === 0 ? (
        <div className='mt-10 text-center py-10 border rounded-lg'><p className='text-muted'>{t('dashboard.no_data')}</p></div>
      ) : (
        <div className='mt-4 overflow-x-auto rounded-lg border border-border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/10'>
              <tr><th className='p-3 text-right font-medium'>رقم العقد</th><th className='p-3 text-right font-medium'>العميل</th><th className='p-3 text-right font-medium'>العقار</th><th className='p-3 text-right font-medium'>المبلغ</th><th className='p-3 text-right font-medium'>الحالة</th><th className='p-3 text-right font-medium'>تاريخ البداية</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className='border-t border-border'>
                  <td className='p-3 font-medium'>{c.contract_number}</td>
                  <td className='p-3'>{c.client?.name || '-'}</td>
                  <td className='p-3 text-muted'>{c.property?.title || '-'}</td>
                  <td className='p-3 font-semibold whitespace-nowrap'>{formatPrice(c.amount)}</td>
                  <td className='p-3'><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status] || ''}`}>{statusLabel(c.status, 'contract')}</span></td>
                  <td className='p-3 text-muted whitespace-nowrap'>{new Date(c.start_date).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
