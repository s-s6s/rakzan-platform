'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from '@/lib/LocaleContext';

interface UserFormProps {
  onClose: () => void;
  onSuccess: () => void;
  existingUser?: { id: string; full_name: string; email: string; phone: string; role: string };
}

export function UserForm({ onClose, onSuccess, existingUser }: UserFormProps) {
  const { dir } = useLocale();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: existingUser?.full_name || '',
    email: existingUser?.email || '',
    phone: existingUser?.phone || '',
    role: existingUser?.role || 'agent',
    password: '',
  });
  const [error, setError] = useState('');

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const supabase = createClient();

    if (existingUser) {
      const { error: updateError } = await supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone, role: form.role }).eq('id', existingUser.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
      if (form.password) {
        const { error: pwError } = await supabase.auth.admin.updateUserById(existingUser.id, { password: form.password });
        if (pwError) { setError(pwError.message); setSaving(false); return; }
      }
      toast.success('تم تحديث المستخدم');
    } else {
      const { data, error: signUpError } = await supabase.auth.admin.createUser({
        email: form.email, password: form.password || 'Rakzan123!',
        email_confirm: true,
        user_metadata: { full_name: form.full_name, role: form.role },
      });
      if (signUpError) { setError(signUpError.message); setSaving(false); return; }
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, full_name: form.full_name, phone: form.phone, role: form.role });
      }
      toast.success('تم إنشاء المستخدم');
    }

    setSaving(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} dir={dir} className='space-y-4'>
      {error && <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</div>}

      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <label className='block text-xs font-medium text-muted mb-1'>الاسم *</label>
          <input required value={form.full_name} onChange={e => set('full_name', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
        </div>
        <div>
          <label className='block text-xs font-medium text-muted mb-1'>البريد الإلكتروني *</label>
          <input required type='email' value={form.email} onChange={e => set('email', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' disabled={!!existingUser} />
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <label className='block text-xs font-medium text-muted mb-1'>رقم الجوال</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
        </div>
        <div>
          <label className='block text-xs font-medium text-muted mb-1'>الصلاحية</label>
          <select value={form.role} onChange={e => set('role', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'>
            <option value='super_admin'>مدير عام</option>
            <option value='manager'>مدير</option>
            <option value='agent'>وسيط</option>
            <option value='viewer'>مشاهد</option>
          </select>
        </div>
      </div>

      <div>
        <label className='block text-xs font-medium text-muted mb-1'>
          {existingUser ? 'كلمة المرور الجديدة (اتركها فارغة إذا لا تريد التغيير)' : 'كلمة المرور *'}
        </label>
        <input type='password' value={form.password} onChange={e => set('password', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' placeholder='Rakzan123!' />
      </div>

      <div className='flex items-center gap-3 pt-2'>
        <button type='submit' disabled={saving} className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60 transition-all'>
          {saving && <Loader2 className='h-4 w-4 animate-spin' />}
          {existingUser ? 'تحديث' : 'إنشاء مستخدم'}
        </button>
        <button type='button' onClick={onClose} className='rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted hover:bg-muted/10 transition-all'>إلغاء</button>
      </div>
    </form>
  );
}
