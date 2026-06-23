'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Activity, Clock } from 'lucide-react';
import { timeAgo, activityActionLabel, activityEntityLabel } from '@/lib/utils/format';
import type { ActivityLog } from '@/types/property';

export function ActivityFeed({ limit = 20 }: { limit?: number }) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(limit);
      setActivities(data || []);
      setLoading(false);
    }
    load();
  }, [limit]);

  if (loading) return <div className='flex justify-center py-8'><Loader2 className='h-6 w-6 animate-spin text-muted' /></div>;

  if (activities.length === 0) return <div className='flex flex-col items-center justify-center py-10 text-muted'><Activity className='h-8 w-8 mb-2' /><p className='text-sm'>لا توجد نشاطات حتى الآن</p></div>;

  return (
    <div className='space-y-2'>
      {activities.map(a => (
        <div key={a.id} className='flex items-start gap-3 rounded-lg border bg-white p-3 transition-colors hover:bg-muted/5'>
          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
            a.action === 'created' ? 'bg-emerald-500' : a.action === 'updated' ? 'bg-blue-500' : a.action === 'deleted' ? 'bg-red-500' : 'bg-primary'
          }`}>
            {a.action === 'created' ? 'ج' : a.action === 'updated' ? 'ت' : a.action === 'deleted' ? 'ح' : 'ن'}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm'>
              <span className='font-medium'>{a.user_name || 'النظام'}</span>
              {' '}{activityActionLabel(a.action)}{' '}
              <span className='font-medium text-primary'>{activityEntityLabel(a.entity)}</span>
              {a.entity_name && <>: {a.entity_name}</>}
            </p>
            {a.description && <p className='text-xs text-muted mt-0.5'>{a.description}</p>}
            <p className='text-[11px] text-muted/60 mt-1 flex items-center gap-1'><Clock className='h-3 w-3' />{timeAgo(a.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
