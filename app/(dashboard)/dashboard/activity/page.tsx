'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { DataTable } from '@/components/dashboard/DataTable';
import { timeAgo, activityActionLabel, activityEntityLabel } from '@/lib/utils/format';
import { Loader2, Activity, Clock, Filter } from 'lucide-react';
import type { ActivityLog } from '@/types/property';

export default function ActivityPage() {
  const { dir } = useLocale();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(100);
      if (filterAction) query = query.eq('action', filterAction);
      if (filterEntity) query = query.eq('entity', filterEntity);
      const { data } = await query;
      setActivities(data || []);
      setLoading(false);
    }
    load();
  }, [filterAction, filterEntity]);

  const actionColors: Record<string, string> = {
    created: 'bg-emerald-500', updated: 'bg-blue-500', deleted: 'bg-red-500',
    viewed: 'bg-gray-500', contacted: 'bg-amber-500', converted: 'bg-purple-500',
    signed: 'bg-indigo-500', paid: 'bg-emerald-500', imported: 'bg-cyan-500', exported: 'bg-pink-500',
  };

  return (
    <div dir={dir} className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='font-display text-2xl font-bold'>سجل النشاطات</h1>
      </div>

      <div className='flex items-center gap-3 flex-wrap'>
        <div className='flex items-center gap-1.5 text-xs text-muted'><Filter className='h-3.5 w-3.5' />تصفية:</div>
        <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setLoading(true); }} className='rounded-lg border border-border px-3 py-1.5 text-xs outline-none focus:border-primary'>
          <option value=''>جميع الإجراءات</option>
          <option value='created'>إنشاء</option><option value='updated'>تحديث</option><option value='deleted'>حذف</option>
          <option value='viewed'>مشاهدة</option><option value='contacted'>اتصال</option><option value='converted'>تحويل</option>
          <option value='signed'>توقيع</option><option value='paid'>دفع</option><option value='imported'>استيراد</option><option value='exported'>تصدير</option>
        </select>
        <select value={filterEntity} onChange={e => { setFilterEntity(e.target.value); setLoading(true); }} className='rounded-lg border border-border px-3 py-1.5 text-xs outline-none focus:border-primary'>
          <option value=''>جميع الكيانات</option>
          <option value='property'>عقار</option><option value='client'>عميل</option><option value='contract'>عقد</option>
          <option value='payment'>دفعة</option><option value='appointment'>موعد</option><option value='inquiry'>استفسار</option>
          <option value='user'>مستخدم</option><option value='setting'>إعدادات</option>
        </select>
      </div>

      {loading ? (
        <div className='flex justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>
      ) : activities.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 border rounded-xl text-muted'>
          <Activity className='h-12 w-12 mb-3 opacity-30' />
          <p>لا توجد نشاطات</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {activities.map(a => (
            <div key={a.id} className='flex items-start gap-3 rounded-xl border bg-white p-4 transition-colors hover:bg-muted/5'>
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${actionColors[a.action] || 'bg-primary'}`}>
                {a.action === 'created' ? 'ج' : a.action === 'updated' ? 'ت' : a.action === 'deleted' ? 'ح' : a.action === 'paid' ? 'د' : 'ن'}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className='font-medium text-sm'>{a.user_name || 'النظام'}</span>
                  <span className='text-sm text-muted'>{activityActionLabel(a.action)}</span>
                  <span className='rounded-full bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary'>{activityEntityLabel(a.entity)}</span>
                  {a.entity_name && <span className='text-sm'>: {a.entity_name}</span>}
                </div>
                {a.description && <p className='text-xs text-muted mt-1'>{a.description}</p>}
                <p className='text-[11px] text-muted/50 mt-1.5 flex items-center gap-1'><Clock className='h-3 w-3' />{timeAgo(a.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
