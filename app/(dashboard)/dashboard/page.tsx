'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { Building2, Users, MessageSquare, DollarSign, Loader2, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import type { Property, Inquiry } from '@/types/property';

export default function DashboardPage() {
  const { t, dir } = useLocale();
  const [data, setData] = useState({ properties: 0, clients: 0, inquiries: 0, revenue: 0, recentProperties: [] as Property[], recentInquiries: [] as Inquiry[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [propsRes, clientsRes, inqRes] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*, property:properties(*)', { count: 'exact', head: false }).order('created_at', { ascending: false }).limit(5),
      ]);
      const { data: recentProps } = await supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(5);
      setData({
        properties: propsRes.count || 0,
        clients: clientsRes.count || 0,
        inquiries: inqRes.count || 0,
        revenue: 0,
        recentProperties: recentProps || [],
        recentInquiries: (inqRes.data || []) as Inquiry[],
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div dir={dir}>
      <h1 className='font-display text-2xl font-bold'>{t('dashboard.overview')}</h1>

      <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard icon={<Building2 className='h-5 w-5' />} label={t('dashboard.total_properties')} value={data.properties} href='/dashboard/properties' />
        <StatCard icon={<Users className='h-5 w-5' />} label={t('dashboard.active_clients')} value={data.clients} href='/dashboard/clients' />
        <StatCard icon={<MessageSquare className='h-5 w-5' />} label={t('dashboard.pending_inquiries')} value={data.inquiries} href='/dashboard/inquiries' />
        <StatCard icon={<DollarSign className='h-5 w-5' />} label={t('dashboard.monthly_revenue')} value={formatPrice(data.revenue)} href='/dashboard/payments' />
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-2'>
        <div className='rounded-lg border bg-card p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='font-display text-base font-semibold'>{t('dashboard.recent_properties')}</h2>
            <Link href='/dashboard/properties' className='text-xs text-primary hover:underline'>{t('dashboard.view_all')}</Link>
          </div>
          {data.recentProperties.length === 0 ? (
            <p className='text-sm text-muted py-4 text-center'>{t('dashboard.no_data')}</p>
          ) : (
            <div className='space-y-2'>
              {data.recentProperties.map(p => (
                <div key={p.id} className='flex items-center gap-3 rounded-md border p-2 text-sm'>
                  <img src={p.featured_image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100'} alt='' className='h-10 w-10 rounded object-cover' />
                  <div className='flex-1 min-w-0'><p className='truncate font-medium'>{p.title}</p><p className='text-xs text-muted'>{p.city}</p></div>
                  <span className='shrink-0 font-semibold text-primary'>{formatPrice(p.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='rounded-lg border bg-card p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h2 className='font-display text-base font-semibold'>{t('dashboard.recent_inquiries')}</h2>
            <Link href='/dashboard/inquiries' className='text-xs text-primary hover:underline'>{t('dashboard.view_all')}</Link>
          </div>
          {data.recentInquiries.length === 0 ? (
            <p className='text-sm text-muted py-4 text-center'>{t('dashboard.no_data')}</p>
          ) : (
            <div className='space-y-2'>
              {data.recentInquiries.map(inq => (
                <div key={inq.id} className='rounded-md border p-2 text-sm'>
                  <p className='font-medium'>{inq.name}</p>
                  <p className='text-xs text-muted'>{inq.property?.title || ''} — {inq.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string | number; href: string }) {
  return (
    <Link href={href} className='rounded-lg border bg-card p-4 transition-colors hover:border-primary/30'>
      <div className='flex items-center gap-2 text-muted'>{icon}<span className='text-xs'>{label}</span></div>
      <p className='mt-1 font-display text-2xl font-bold'>{value}</p>
    </Link>
  );
}
