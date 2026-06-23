'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AddClientPage() {
  const { dir } = useLocale();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', type: 'buyer', city: '', notes: '', preferred_contact: 'phone' });
  const set = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from('clients').insert(form);
    if (error) { toast.error('فشل الإضافة'); setSaving(false); return; }
    toast.success('تم إضافة العميل');
    router.push('/dashboard/clients');
  };

  return (
    <div dir={dir}>
      <h1 className='font-display text-2xl font-bold'>إضافة عميل</h1>
      <form onSubmit={handleSubmit} className='mt-6 max-w-lg space-y-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div><label className='block text-xs font-medium text-muted mb-1'>الاسم *</label><input required value={form.name} onChange={e => set('name', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
          <div><label className='block text-xs font-medium text-muted mb-1'>الجوال *</label><input required value={form.phone} onChange={e => set('phone', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div><label className='block text-xs font-medium text-muted mb-1'>البريد</label><input type='email' value={form.email} onChange={e => set('email', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
          <div><label className='block text-xs font-medium text-muted mb-1'>النوع</label><select value={form.type} onChange={e => set('type', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='buyer'>مشتري</option><option value='seller'>بائع</option><option value='tenant'>مستأجر</option><option value='landlord'>مالك</option><option value='investor'>مستثمر</option></select></div>
        </div>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div><label className='block text-xs font-medium text-muted mb-1'>المدينة</label><input value={form.city} onChange={e => set('city', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
          <div><label className='block text-xs font-medium text-muted mb-1'>طريقة الاتصال</label><select value={form.preferred_contact} onChange={e => set('preferred_contact', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='phone'>اتصال</option><option value='whatsapp'>واتساب</option><option value='email'>بريد</option></select></div>
        </div>
        <div><label className='block text-xs font-medium text-muted mb-1'>ملاحظات</label><textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
        <div className='flex items-center gap-3 pt-4'>
          <button type='submit' disabled={saving} className='flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60'>
            {saving && <Loader2 className='h-4 w-4 animate-spin' />}حفظ
          </button>
          <button type='button' onClick={() => router.back()} className='rounded-md border border-border px-6 py-2 text-sm font-medium text-muted hover:bg-muted/10'>إلغاء</button>
        </div>
      </form>
    </div>
  );
}
