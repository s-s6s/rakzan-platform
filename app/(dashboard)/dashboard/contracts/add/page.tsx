'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import type { Property } from '@/types/property';

export default function AddContractPage() {
  const { dir } = useLocale();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({
    property_id: '', client_id: '', type: 'sale', status: 'draft',
    start_date: '', end_date: '', amount: 0, currency: 'SAR',
    down_payment: 0, installment_count: 0,
    commission_amount: 0, commission_percentage: 0,
    terms: '', special_conditions: '', notes: '',
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [propsRes, clientsRes] = await Promise.all([
        supabase.from('properties').select('id, title, price, currency').eq('status', 'available'),
        supabase.from('clients').select('id, name, phone').order('name'),
      ]);
      setProperties(propsRes.data || []);
      setClients(clientsRes.data || []);
      // Generate contract number
      const { data: lastContract } = await supabase.from('contracts').select('contract_number').order('created_at', { ascending: false }).limit(1);
      const lastNum = lastContract?.[0]?.contract_number || 'C-0000';
      const num = parseInt(lastNum.split('-')[1]) + 1;
      setForm(f => ({ ...f, contract_number: `C-${String(num).padStart(4, '0')}` }));
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.property_id || !form.client_id) { toast.error('الرجاء اختيار العقار والعميل'); return; }
    setSaving(true);
    const supabase = createClient();

    const { data: contractData, error } = await supabase.from('contracts').insert({
      ...form, amount: Number(form.amount), down_payment: form.down_payment ? Number(form.down_payment) : null,
      installment_count: form.installment_count || null, commission_amount: form.commission_amount ? Number(form.commission_amount) : null,
      commission_percentage: form.commission_percentage ? Number(form.commission_percentage) : null,
      contract_number: `C-${Date.now()}`,
    }).select().single();

    if (error) { toast.error(error.message); setSaving(false); return; }

    // Update property status
    await supabase.from('properties').update({ status: 'under_contract' }).eq('id', form.property_id);

    // Create notification
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notifications').insert({
        user_id: user.id, title: 'عقد جديد', body: `تم إنشاء عقد ${form.type} جديد`,
        type: 'contract', link: '/dashboard/contracts',
      });
    }

    toast.success('تم إنشاء العقد بنجاح');
    router.push('/dashboard/contracts');
  };

  const set = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }));
  const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary';
  const labelCls = 'block text-xs font-medium text-muted mb-1.5';

  return (
    <div dir={dir} className='max-w-2xl'>
      <h1 className='font-display text-2xl font-bold'>إضافة عقد جديد</h1>

      <form onSubmit={handleSubmit} className='mt-6 space-y-5'>
        <div className='rounded-xl border p-5 space-y-4'>
          <h3 className='font-display text-sm font-semibold'>معلومات العقد</h3>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div><label className={labelCls}>العقار *</label><select required value={form.property_id} onChange={e => set('property_id', e.target.value)} className={inputCls}><option value=''>اختر عقار</option>{properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
            <div><label className={labelCls}>العميل *</label><select required value={form.client_id} onChange={e => set('client_id', e.target.value)} className={inputCls}><option value=''>اختر عميل</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}</select></div>
          </div>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div><label className={labelCls}>النوع</label><select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}><option value='sale'>بيع</option><option value='rent'>إيجار</option><option value='lease'>تأجير طويل</option><option value='management'>إدارة</option></select></div>
            <div><label className={labelCls}>الحالة</label><select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}><option value='draft'>مسودة</option><option value='active'>نشط</option></select></div>
            <div><label className={labelCls}>العملة</label><select value={form.currency} onChange={e => set('currency', e.target.value)} className={inputCls}><option value='SAR'>ريال</option><option value='USD'>دولار</option><option value='AED'>درهم</option></select></div>
          </div>
        </div>

        <div className='rounded-xl border p-5 space-y-4'>
          <h3 className='font-display text-sm font-semibold'>المبالغ المالية</h3>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div><label className={labelCls}>المبلغ *</label><input type='number' required min='0' value={form.amount || ''} onChange={e => set('amount', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
            <div><label className={labelCls}>الدفعة المقدمة</label><input type='number' min='0' value={form.down_payment || ''} onChange={e => set('down_payment', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
            <div><label className={labelCls}>عدد الأقساط</label><input type='number' min='0' value={form.installment_count || ''} onChange={e => set('installment_count', parseInt(e.target.value) || 0)} className={inputCls} /></div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div><label className={labelCls}>مبلغ العمولة</label><input type='number' min='0' value={form.commission_amount || ''} onChange={e => set('commission_amount', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
            <div><label className={labelCls}>نسبة العمولة (%)</label><input type='number' min='0' max='100' value={form.commission_percentage || ''} onChange={e => set('commission_percentage', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
          </div>
        </div>

        <div className='rounded-xl border p-5 space-y-4'>
          <h3 className='font-display text-sm font-semibold'>التواريخ</h3>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div><label className={labelCls}>تاريخ البداية *</label><input type='date' required value={form.start_date} onChange={e => set('start_date', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>تاريخ النهاية</label><input type='date' value={form.end_date} onChange={e => set('end_date', e.target.value)} className={inputCls} /></div>
          </div>
        </div>

        <div className='rounded-xl border p-5 space-y-4'>
          <h3 className='font-display text-sm font-semibold'>الشروط والملاحظات</h3>
          <div><label className={labelCls}>الشروط</label><textarea rows={4} value={form.terms} onChange={e => set('terms', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>الشروط الخاصة</label><textarea rows={3} value={form.special_conditions} onChange={e => set('special_conditions', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>ملاحظات</label><textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} className={inputCls} /></div>
        </div>

        <div className='flex items-center gap-3 pt-2'>
          <button type='submit' disabled={saving} className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60 transition-all'>
            {saving && <Loader2 className='h-4 w-4 animate-spin' />}
            <Save className='h-4 w-4' />إنشاء العقد
          </button>
          <button type='button' onClick={() => router.back()} className='rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted hover:bg-muted/10 transition-all'>إلغاء</button>
        </div>
      </form>
    </div>
  );
}
