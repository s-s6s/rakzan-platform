'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils/format';
import { Loader2, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Payment } from '@/types/property';

const statusColors: Record<string, string> = { paid: 'bg-emerald-100 text-emerald-800', pending: 'bg-amber-100 text-amber-800', overdue: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-800' };

export default function PaymentsPage() {
  const { t, dir } = useLocale();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('payments').select('*, contract:contracts(*)').order('due_date', { ascending: false });
      setPayments(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div dir={dir}>
      <h1 className='font-display text-2xl font-bold'>{t('dashboard.payments')}</h1>

      <div className='mt-6 grid gap-4 sm:grid-cols-3'>
        <div className='rounded-lg border bg-card p-4'><div className='flex items-center gap-2 text-emerald-600'><CheckCircle className='h-5 w-5' /><span className='text-xs font-medium'>مدفوع</span></div><p className='mt-1 font-display text-xl font-bold'>{formatPrice(totalPaid)}</p></div>
        <div className='rounded-lg border bg-card p-4'><div className='flex items-center gap-2 text-amber-600'><DollarSign className='h-5 w-5' /><span className='text-xs font-medium'>قيد الانتظار</span></div><p className='mt-1 font-display text-xl font-bold'>{formatPrice(totalPending)}</p></div>
        <div className='rounded-lg border bg-card p-4'><div className='flex items-center gap-2 text-red-600'><AlertTriangle className='h-5 w-5' /><span className='text-xs font-medium'>متأخر</span></div><p className='mt-1 font-display text-xl font-bold'>{formatPrice(totalOverdue)}</p></div>
      </div>

      {payments.length === 0 ? (
        <div className='mt-10 text-center py-10 border rounded-lg'><p className='text-muted'>{t('dashboard.no_data')}</p></div>
      ) : (
        <div className='mt-6 overflow-x-auto rounded-lg border border-border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/10'>
              <tr><th className='p-3 text-right font-medium'>المبلغ</th><th className='p-3 text-right font-medium'>تاريخ الاستحقاق</th><th className='p-3 text-right font-medium'>تاريخ الدفع</th><th className='p-3 text-right font-medium'>الحالة</th><th className='p-3 text-right font-medium'>الطريقة</th></tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className='border-t border-border'>
                  <td className='p-3 font-semibold'>{formatPrice(p.amount)}</td>
                  <td className='p-3 whitespace-nowrap'>{new Date(p.due_date).toLocaleDateString('ar-SA')}</td>
                  <td className='p-3 whitespace-nowrap text-muted'>{p.paid_date ? new Date(p.paid_date).toLocaleDateString('ar-SA') : '-'}</td>
                  <td className='p-3'><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || ''}`}>{p.status}</span></td>
                  <td className='p-3 text-muted'>{p.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
