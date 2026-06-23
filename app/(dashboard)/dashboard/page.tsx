'use client';
import { useLocale } from '@/lib/LocaleContext';
import { Building2, Users, MessageSquare, TrendingUp } from 'lucide-react';
const stats = [
  { icon: Building2, key: 'dashboard.total_properties', value: '156', change: '+12', color: 'text-blue-600 bg-blue-100' },
  { icon: Users, key: 'dashboard.active_clients', value: '89', change: '+5', color: 'text-emerald-600 bg-emerald-100' },
  { icon: MessageSquare, key: 'dashboard.pending_inquiries', value: '23', change: '+8', color: 'text-amber-600 bg-amber-100' },
  { icon: TrendingUp, key: 'dashboard.monthly_revenue', value: '2.4M', change: '+18%', color: 'text-purple-600 bg-purple-100' },
];
export default function DashboardPage() {
  const { t, dir } = useLocale();
  return (
    <div dir={dir}>
      <h1 className='font-display text-2xl font-bold'>{t('dashboard.overview')}</h1>
      <div className='mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className='rounded-lg border border-border bg-white p-4'>
              <div className='flex items-center justify-between'>
                <div className={`rounded-md p-2 ${s.color}`}><Icon className='h-5 w-5' /></div>
                <span className='text-xs font-medium text-emerald-600'>{s.change}</span>
              </div>
              <p className='mt-3 text-2xl font-bold'>{s.value}</p>
              <p className='text-xs text-muted'>{t(s.key)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
