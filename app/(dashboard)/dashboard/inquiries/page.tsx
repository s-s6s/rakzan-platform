'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Mail, CheckCircle, XCircle, Phone, Trash2 } from 'lucide-react';
import { statusLabel } from '@/lib/utils/format';
import { toast } from 'sonner';
import type { Inquiry } from '@/types/property';

const statusColors: Record<string, string> = { new: 'bg-blue-100 text-blue-800', contacted: 'bg-amber-100 text-amber-800', converted: 'bg-emerald-100 text-emerald-800', closed: 'bg-gray-100 text-gray-800' };

export default function InquiriesPage() {
  const { t, dir } = useLocale();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('inquiries').select('*, property:properties(*)').order('created_at', { ascending: false });
      setInquiries(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
    if (error) { toast.error('فشل التحديث'); return; }
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as Inquiry['status'] } : i));
    toast.success('تم التحديث');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('تأكيد الحذف؟')) return;
    const supabase = createClient();
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) { toast.error('فشل الحذف'); return; }
    setInquiries(prev => prev.filter(i => i.id !== id));
    toast.success('تم الحذف');
  };

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  const newCount = inquiries.filter(i => i.status === 'new').length;

  return (
    <div dir={dir}>
      <div className='flex items-center gap-3'>
        <h1 className='font-display text-2xl font-bold'>{t('dashboard.inquiries')}</h1>
        {newCount > 0 && <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>{newCount} جديد</span>}
      </div>

      {inquiries.length === 0 ? (
        <div className='mt-10 text-center py-10 border rounded-lg'><p className='text-muted'>{t('dashboard.no_data')}</p></div>
      ) : (
        <div className='mt-6 space-y-3'>
          {inquiries.map(i => (
            <div key={i.id} className='rounded-lg border bg-card p-4'>
              <div className='flex items-start justify-between flex-wrap gap-2'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <h3 className='font-medium text-sm'>{i.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[i.status] || ''}`}>{statusLabel(i.status, 'inquiry')}</span>
                  </div>
                  <div className='mt-1 flex items-center gap-3 text-xs text-muted flex-wrap'>
                    <span className='flex items-center gap-1'><Phone className='h-3 w-3' />{i.phone}</span>
                    {i.email && <span className='flex items-center gap-1'><Mail className='h-3 w-3' />{i.email}</span>}
                    <span>{new Date(i.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {i.message && <p className='mt-2 text-sm'>{i.message}</p>}
                  <div className='mt-2 flex items-center gap-2 text-xs text-muted'>
                    {i.property && <span>العقار: {i.property.title}</span>}
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                  {i.status !== 'contacted' && <button onClick={() => updateStatus(i.id, 'contacted')} className='rounded-md border border-border px-2.5 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50'>تم الاتصال</button>}
                  {i.status !== 'converted' && <button onClick={() => updateStatus(i.id, 'converted')} className='rounded-md border border-border px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50'>تحويل</button>}
                  {i.status !== 'closed' && <button onClick={() => updateStatus(i.id, 'closed')} className='rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted hover:bg-muted/10'>إغلاق</button>}
                  <button onClick={(e) => handleDelete(i.id, e)} className='rounded-md p-1.5 text-destructive hover:bg-red-50'><Trash2 className='h-3.5 w-3.5' /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
