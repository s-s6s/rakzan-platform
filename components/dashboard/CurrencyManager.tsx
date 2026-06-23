'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Pencil, Trash2, Check, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from './Modal';

interface Currency { id: string; code: string; name: string; symbol: string; exchange_rate: number; is_default: boolean; is_active: boolean; }

export function CurrencyManager() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCurrency, setEditCurrency] = useState<Currency | null>(null);
  const [form, setForm] = useState({ code: '', name: '', symbol: '', exchange_rate: '1.0', is_default: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('currencies').select('*').order('is_default', { ascending: false }).order('code');
    setCurrencies(data || []);
    setLoading(false);
  };

  const openAdd = () => { setEditCurrency(null); setForm({ code: '', name: '', symbol: '', exchange_rate: '1.0', is_default: false }); setShowModal(true); };
  const openEdit = (c: Currency) => { setEditCurrency(c); setForm({ code: c.code, name: c.name, symbol: c.symbol, exchange_rate: String(c.exchange_rate), is_default: c.is_default }); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const supabase = createClient();
    const payload = { ...form, exchange_rate: parseFloat(form.exchange_rate) || 1 };

    if (editCurrency) {
      const { error } = await supabase.from('currencies').update(payload).eq('id', editCurrency.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      if (form.is_default) {
        await supabase.from('currencies').update({ is_default: false }).neq('id', editCurrency.id);
        await supabase.from('currencies').update({ is_default: true }).eq('id', editCurrency.id);
      }
      toast.success('تم تحديث العملة');
    } else {
      const { error } = await supabase.from('currencies').insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      if (form.is_default) {
        await supabase.from('currencies').update({ is_default: false }).neq('code', form.code);
        await supabase.from('currencies').update({ is_default: true }).eq('code', form.code);
      }
      toast.success('تم إضافة العملة');
    }

    setSaving(false); setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('تأكيد الحذف؟')) return;
    const supabase = createClient();
    const { error } = await supabase.from('currencies').delete().eq('id', id);
    if (error) { toast.error('فشل الحذف'); return; }
    toast.success('تم الحذف');
    load();
  };

  const setDefault = async (id: string) => {
    const supabase = createClient();
    await supabase.from('currencies').update({ is_default: false }).neq('id', id);
    await supabase.from('currencies').update({ is_default: true }).eq('id', id);
    toast.success('تم تعيين العملة الافتراضية');
    load();
  };

  if (loading) return <div className='flex justify-center py-8'><Loader2 className='h-6 w-6 animate-spin text-muted' /></div>;

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-sm text-muted'>إدارة العملات المتاحة في النظام</p>
        <button onClick={openAdd} className='inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'><Plus className='h-4 w-4' />إضافة عملة</button>
      </div>

      <div className='overflow-x-auto rounded-lg border border-border'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/5'>
            <tr><th className='p-3 text-right font-medium'>الرمز</th><th className='p-3 text-right font-medium'>الاسم</th><th className='p-3 text-right font-medium'>المؤشر</th><th className='p-3 text-right font-medium'>سعر الصرف</th><th className='p-3 text-right font-medium'>افتراضي</th><th className='p-3 text-right font-medium'></th></tr>
          </thead>
          <tbody>
            {currencies.map(c => (
              <tr key={c.id} className='border-t border-border'>
                <td className='p-3 font-mono font-semibold'>{c.code}</td>
                <td className='p-3'>{c.name}</td>
                <td className='p-3 font-mono'>{c.symbol}</td>
                <td className='p-3 font-mono'>{c.exchange_rate.toFixed(4)}</td>
                <td className='p-3'>{c.is_default ? <Star className='h-4 w-4 text-[#C9A84C]' /> : <button onClick={() => setDefault(c.id)} className='text-xs text-primary hover:underline'>تعيين</button>}</td>
                <td className='p-3'>
                  <button onClick={() => openEdit(c)} className='text-primary hover:text-primary/80 ml-2'><Pencil className='h-3.5 w-3.5 inline' /></button>
                  <button onClick={() => handleDelete(c.id)} className='text-destructive hover:text-destructive/80'><Trash2 className='h-3.5 w-3.5 inline' /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editCurrency ? 'تعديل عملة' : 'إضافة عملة'} size='md'>
        <form onSubmit={handleSave} className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div><label className='block text-xs font-medium text-muted mb-1'>الرمز *</label><input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary font-mono' placeholder='SAR' /></div>
            <div><label className='block text-xs font-medium text-muted mb-1'>الاسم *</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' placeholder='ريال سعودي' /></div>
            <div><label className='block text-xs font-medium text-muted mb-1'>المؤشر *</label><input required value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary font-mono' placeholder='ر.س' /></div>
          </div>
          <div><label className='block text-xs font-medium text-muted mb-1'>سعر الصرف (مقابل الريال) *</label><input required type='number' step='0.000001' value={form.exchange_rate} onChange={e => setForm(f => ({ ...f, exchange_rate: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
          <label className='flex items-center gap-2 text-sm'><input type='checkbox' checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} className='rounded border-border' /> عملة افتراضية</label>
          <div className='flex items-center gap-3 pt-2'>
            <button type='submit' disabled={saving} className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60'>{saving && <Loader2 className='h-4 w-4 animate-spin' />}{editCurrency ? 'تحديث' : 'إضافة'}</button>
            <button type='button' onClick={() => setShowModal(false)} className='rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted hover:bg-muted/10'>إلغاء</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
