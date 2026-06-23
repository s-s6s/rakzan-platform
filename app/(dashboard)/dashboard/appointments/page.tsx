'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Appointment } from '@/types/property';

const statusColors: Record<string, string> = { scheduled: 'bg-blue-100 text-blue-800', completed: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-red-100 text-red-800', rescheduled: 'bg-amber-100 text-amber-800' };

export default function AppointmentsPage() {
  const { t, dir } = useLocale();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', date: '', time: '', notes: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('appointments').select('*, property:properties(*), client:clients(*)').order('date', { ascending: true });
      setAppointments(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from('appointments').insert(form);
    if (error) { toast.error('فشل الإضافة'); return; }
    toast.success('تمت الإضافة');
    setShowForm(false);
    setForm({ title: '', date: '', time: '', notes: '' });
    const { data } = await supabase.from('appointments').select('*, property:properties(*), client:clients(*)').order('date', { ascending: true });
    setAppointments(data || []);
  };

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div dir={dir}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <h1 className='font-display text-2xl font-bold'>{t('dashboard.appointments')} ({appointments.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className='inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'>
          <Plus className='h-4 w-4' />إضافة موعد
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className='mt-4 max-w-md space-y-3 rounded-lg border bg-card p-4'>
          <div className='grid gap-3 sm:grid-cols-2'>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder='الموعد' className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
            <input required type='date' value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <input required type='time' value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder='ملاحظات' className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
          </div>
          <button type='submit' className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'>حفظ</button>
        </form>
      )}

      {appointments.length === 0 ? (
        <div className='mt-10 text-center py-10 border rounded-lg'><p className='text-muted'>{t('dashboard.no_data')}</p></div>
      ) : (
        <div className='mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {appointments.map(a => (
            <div key={a.id} className='rounded-lg border bg-card p-4'>
              <div className='flex items-center justify-between'>
                <h3 className='font-medium text-sm'>{a.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[a.status] || ''}`}>{a.status}</span>
              </div>
              <div className='mt-2 flex items-center gap-2 text-xs text-muted'><CalendarIcon className='h-3.5 w-3.5' />{new Date(a.date).toLocaleDateString('ar-SA')} — {a.time}</div>
              {a.notes && <p className='mt-1 text-xs text-muted'>{a.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
