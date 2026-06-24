'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { exportCSV } from '@/lib/utils/export';
import { clientTypeLabel, statusLabel } from '@/lib/utils/format';
import { Plus, Search, Download, Loader2, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/types/property';

const statusColors: Record<string, string> = { active: 'bg-emerald-100 text-emerald-800', inactive: 'bg-gray-100 text-gray-800', lead: 'bg-amber-100 text-amber-800' };

export default function ClientsPage() {
  const { t, dir } = useLocale();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({ name: '', phone: '', email: '', type: 'buyer', status: 'lead', city: '', notes: '' });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      setClients(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('تأكيد الحذف؟')) return;
    const supabase = createClient();
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) { toast.error('فشل الحذف'); return; }
    setClients(prev => prev.filter(c => c.id !== id));
    toast.success('تم الحذف');
  };

  const handleEdit = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('clients').update({ name: editForm.name, phone: editForm.phone, email: editForm.email || null, type: editForm.type, status: editForm.status, city: editForm.city || null, notes: editForm.notes || null }).eq('id', id);
    if (error) { toast.error('فشل التحديث'); return; }
    setClients(prev => prev.map(c => c.id === id ? { ...c, name: editForm.name, phone: editForm.phone, email: editForm.email || null, type: editForm.type as Client['type'], status: editForm.status as Client['status'], city: editForm.city || null, notes: editForm.notes || null } : c));
    setEditId(null);
    toast.success('تم التحديث');
  };

  const startEdit = (c: Client) => {
    setEditId(c.id);
    setEditForm({ name: c.name, phone: c.phone, email: c.email || '', type: c.type, status: c.status, city: c.city || '', notes: c.notes || '' });
  };

  const filtered = clients.filter(c => c.name.includes(search) || c.phone.includes(search));

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div dir={dir}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <h1 className='font-display text-2xl font-bold'>{t('dashboard.clients')} ({clients.length})</h1>
        <div className='flex items-center gap-2'>
          <button onClick={() => exportCSV(filtered, 'clients')} className='inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-muted/10'><Download className='h-4 w-4' />{t('common.export')}</button>
          <Link href='/dashboard/clients/add' className='inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'><Plus className='h-4 w-4' />{t('dashboard.add_client')}</Link>
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
              <tr><th className='p-3 text-right font-medium'>الاسم</th><th className='p-3 text-right font-medium'>الجوال</th><th className='p-3 text-right font-medium'>النوع</th><th className='p-3 text-right font-medium'>الحالة</th><th className='p-3 text-right font-medium'>{t('common.created_at')}</th><th className='p-3 text-right font-medium'></th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className='border-t border-border'>
                  {editId === c.id ? (
                    <>
                      <td className='p-3'><input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className='w-full rounded border border-border px-2 py-1 text-xs' /></td>
                      <td className='p-3'><input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className='w-full rounded border border-border px-2 py-1 text-xs' /></td>
                      <td className='p-3'>
                        <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} className='rounded border border-border px-2 py-1 text-xs'>
                          <option value='buyer'>مشتري</option><option value='seller'>بائع</option><option value='tenant'>مستأجر</option><option value='landlord'>مالك</option><option value='investor'>مستثمر</option>
                        </select>
                      </td>
                      <td className='p-3'>
                        <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className='rounded border border-border px-2 py-1 text-xs'>
                          <option value='lead'>عميل محتمل</option><option value='active'>نشط</option><option value='inactive'>غير نشط</option>
                        </select>
                      </td>
                      <td className='p-3'></td>
                      <td className='p-3'>
                        <button onClick={() => handleEdit(c.id)} className='text-xs text-primary hover:underline ml-2'>حفظ</button>
                        <button onClick={() => setEditId(null)} className='text-xs text-muted hover:underline'>إلغاء</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className='p-3 font-medium'>{c.name}</td>
                      <td className='p-3 text-muted' dir='ltr'>{c.phone}</td>
                      <td className='p-3 text-muted'>{clientTypeLabel(c.type)}</td>
                      <td className='p-3'><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[c.status] || ''}`}>{statusLabel(c.status, 'client')}</span></td>
                      <td className='p-3 text-muted whitespace-nowrap'>{new Date(c.created_at).toLocaleDateString('ar-SA')}</td>
                      <td className='p-3'>
                        <button onClick={() => startEdit(c)} className='text-primary hover:text-primary/80 ml-2'><Pencil className='h-3.5 w-3.5 inline' /></button>
                        <button onClick={() => handleDelete(c.id)} className='text-destructive hover:text-destructive/80'><Trash2 className='h-3.5 w-3.5 inline' /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
