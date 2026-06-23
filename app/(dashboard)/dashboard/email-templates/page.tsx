'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/dashboard/Modal';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, Send, Mail } from 'lucide-react';
import type { EmailTemplate } from '@/types/property';

export default function EmailTemplatesPage() {
  const { dir } = useLocale();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', body: '', variables: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('email_templates').select('*').order('name');
    setTemplates(data || []); setLoading(false);
  };

  const openAdd = () => { setEditTemplate(null); setForm({ name: '', subject: '', body: '', variables: '', is_active: true }); setShowModal(true); };
  const openEdit = (t: EmailTemplate) => { setEditTemplate(t); setForm({ name: t.name, subject: t.subject, body: t.body, variables: t.variables.join(', '), is_active: t.is_active }); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const supabase = createClient();
    const payload = { ...form, variables: form.variables.split(',').map(v => v.trim()).filter(Boolean) };
    if (editTemplate) {
      const { error } = await supabase.from('email_templates').update(payload).eq('id', editTemplate.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('تم تحديث القالب');
    } else {
      const { error } = await supabase.from('email_templates').insert(payload);
      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success('تم إضافة القالب');
    }
    setSaving(false); setShowModal(false); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('تأكيد الحذف؟')) return;
    const supabase = createClient();
    await supabase.from('email_templates').delete().eq('id', id);
    toast.success('تم الحذف'); load();
  };

  const toggleActive = async (t: EmailTemplate) => {
    const supabase = createClient();
    await supabase.from('email_templates').update({ is_active: !t.is_active }).eq('id', t.id);
    load();
  };

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div dir={dir} className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='font-display text-2xl font-bold'>قوالب الإشعارات</h1>
        <button onClick={openAdd} className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'><Plus className='h-4 w-4' />إضافة قالب</button>
      </div>

      {templates.length === 0 ? (
        <div className='text-center py-20 border rounded-xl text-muted'><Mail className='mx-auto h-10 w-10 mb-2 opacity-30' /><p>لا توجد قوالب</p></div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {templates.map(t => (
            <div key={t.id} className='rounded-xl border bg-white p-4 space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='font-medium text-sm'>{t.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{t.is_active ? 'مفعل' : 'معطل'}</span>
              </div>
              <p className='text-xs text-muted line-clamp-2' dir='ltr'>{t.subject}</p>
              <p className='text-xs text-muted/60 line-clamp-2'>{t.body}</p>
              <div className='flex items-center justify-between pt-2 border-t'>
                <div className='flex gap-1'>
                  <button onClick={() => toggleActive(t)} className='rounded-md p-1.5 text-muted hover:bg-muted/10' title={t.is_active ? 'تعطيل' : 'تفعيل'}><Send className='h-3.5 w-3.5' /></button>
                  <button onClick={() => openEdit(t)} className='rounded-md p-1.5 text-primary hover:bg-primary/5'><Pencil className='h-3.5 w-3.5' /></button>
                  <button onClick={() => handleDelete(t.id)} className='rounded-md p-1.5 text-destructive hover:bg-red-50'><Trash2 className='h-3.5 w-3.5' /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTemplate ? 'تعديل قالب' : 'إضافة قالب'} size='lg'>
        <form onSubmit={handleSave} className='space-y-4'>
          <div><label className='block text-xs font-medium text-muted mb-1'>الاسم</label><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className='w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary' /></div>
          <div><label className='block text-xs font-medium text-muted mb-1'>الموضوع</label><input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className='w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary' /></div>
          <div><label className='block text-xs font-medium text-muted mb-1'>النص</label><textarea required rows={8} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className='w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary font-mono' /></div>
          <div><label className='block text-xs font-medium text-muted mb-1'>المتغيرات (مفصولة بفواصل)</label><input value={form.variables} onChange={e => setForm(f => ({ ...f, variables: e.target.value }))} className='w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary' placeholder='client_name, client_phone, property_title' /></div>
          <label className='flex items-center gap-2 text-sm'><input type='checkbox' checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className='rounded border-border' /> مفعل</label>
          <div className='flex items-center gap-3 pt-2'>
            <button type='submit' disabled={saving} className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60'>{saving && <Loader2 className='h-4 w-4 animate-spin' />}{editTemplate ? 'تحديث' : 'إضافة'}</button>
            <button type='button' onClick={() => setShowModal(false)} className='rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-muted hover:bg-muted/10'>إلغاء</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
