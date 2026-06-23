'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Notification } from '@/types/property';

const typeIcons: Record<string, string> = { inquiry: '✉️', contract: '📄', payment: '💰', appointment: '📅', system: '⚙️' };

export default function NotificationsPage() {
  const { t, dir } = useLocale();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      setNotifications(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const markAllRead = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    if (error) { toast.error('فشل التحديث'); return; }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('تم تحديد الكل كمقروء');
  };

  const toggleRead = async (id: string, current: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.from('notifications').update({ is_read: !current }).eq('id', id);
    if (error) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: !current } : n));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) { toast.error('فشل الحذف'); return; }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div dir={dir}>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div className='flex items-center gap-3'>
          <h1 className='font-display text-2xl font-bold'>{t('dashboard.notifications')}</h1>
          {unreadCount > 0 && <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className='inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-muted/10'>
            <CheckCheck className='h-4 w-4' />تحديد الكل مقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className='mt-10 text-center py-10 border rounded-lg'>
          <Bell className='mx-auto h-8 w-8 text-muted' />
          <p className='mt-2 text-muted'>{t('dashboard.no_data')}</p>
        </div>
      ) : (
        <div className='mt-6 space-y-2'>
          {notifications.map(n => (
            <div key={n.id} onClick={() => toggleRead(n.id, n.is_read)} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${n.is_read ? 'bg-white' : 'bg-primary/[0.02] border-primary/20'}`}>
              <span className='text-lg'>{typeIcons[n.type] || '🔔'}</span>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <h3 className={`text-sm ${n.is_read ? 'font-normal' : 'font-semibold'}`}>{n.title}</h3>
                  {!n.is_read && <span className='h-2 w-2 rounded-full bg-primary' />}
                </div>
                <p className='text-xs text-muted mt-0.5'>{n.body}</p>
                <p className='text-[11px] text-muted/60 mt-1'>{new Date(n.created_at).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button onClick={(e) => handleDelete(n.id, e)} className='shrink-0 rounded-md p-1 text-muted hover:bg-muted/10 hover:text-destructive'><Trash2 className='h-3.5 w-3.5' /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
