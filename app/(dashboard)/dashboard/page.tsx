'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { formatPrice, formatDate, timeAgo, statusLabel, statusColor } from '@/lib/utils/format';
import { Building2, Users, MessageSquare, DollarSign, Calendar, TrendingUp, Loader2, ArrowLeft, FileText, Bell, Activity, Eye, Star, BarChart3 } from 'lucide-react';
import type { Property, Inquiry, Appointment, Contract, DashboardStats } from '@/types/property';

export default function DashboardPage() {
  const { t, dir } = useLocale();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [recentContracts, setRecentContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [propsRes, clientsRes, inqRes, contractsRes, paymentsRes, apptsRes] = await Promise.all([
        supabase.from('properties').select('*'),
        supabase.from('clients').select('count'),
        supabase.from('inquiries').select('*'),
        supabase.from('contracts').select('*'),
        supabase.from('payments').select('amount, status, currency, due_date'),
        supabase.from('appointments').select('*').gte('date', new Date().toISOString().split('T')[0]).lte('date', new Date().toISOString().split('T')[0]),
      ]);

      const properties = propsRes.data || [];
      const inquiries = inqRes.data || [];
      const contracts = contractsRes.data || [];
      const payments = paymentsRes.data || [];
      const todayAppointments = apptsRes.data || [];

      const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
      const pendingRevenue = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((s, p) => s + Number(p.amount), 0);
      const monthlyRevenue = payments.filter(p => p.status === 'paid').filter(p => {
        const d = new Date(p.due_date); const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).reduce((s, p) => s + Number(p.amount), 0);
      const avgPrice = properties.length > 0 ? properties.reduce((s, p) => s + Number(p.price), 0) / properties.length : 0;
      const totalCommission = contracts.reduce((s, c) => s + (Number(c.commission_amount) || 0), 0);

      setStats({
        total_properties: properties.length,
        active_properties: properties.filter(p => p.status === 'available').length,
        sold_properties: properties.filter(p => p.status === 'sold' || p.status === 'rented').length,
        total_clients: clientsRes.count || 0,
        active_clients: 0,
        lead_clients: 0,
        total_inquiries: inquiries.length,
        new_inquiries: inquiries.filter(i => i.status === 'new').length,
        total_contracts: contracts.length,
        active_contracts: contracts.filter(c => c.status === 'active').length,
        total_payments: payments.length,
        paid_payments: payments.filter(p => p.status === 'paid').length,
        pending_payments: payments.filter(p => p.status === 'pending').length,
        total_revenue: totalRevenue,
        pending_revenue: pendingRevenue,
        monthly_revenue: monthlyRevenue,
        total_appointments: 0,
        today_appointments: todayAppointments.length,
        conversion_rate: inquiries.length > 0 ? (inquiries.filter(i => i.status === 'converted').length / inquiries.length) * 100 : 0,
        average_price: avgPrice,
        total_commission: totalCommission,
        pending_commission: 0,
      });

      setRecentProperties((propsRes.data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setRecentInquiries(inquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setTodayAppts(todayAppointments);
      setRecentContracts((contractsRes.data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className='flex items-center justify-center min-h-[60vh]'><Loader2 className='h-10 w-10 animate-spin text-muted' /></div>;

  return (
    <div dir={dir} className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-display text-2xl font-bold'>لوحة التحكم</h1>
          <p className='text-sm text-muted mt-1'>مرحباً بك في نظام إدارة ركزان الآفاق العقارية</p>
        </div>
        <div className='flex items-center gap-2'>
          <Link href='/dashboard/reports' className='inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted hover:bg-muted/10 transition-all'>
            <BarChart3 className='h-4 w-4' />التقارير
          </Link>
          <Link href='/dashboard/properties/add' className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-all'>
            <Building2 className='h-4 w-4' />إضافة عقار
          </Link>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard icon={<Building2 className='h-5 w-5' />} label='إجمالي العقارات' value={stats?.total_properties || 0} sublabel={`${stats?.active_properties || 0} متاح`} color='primary' />
        <StatCard icon={<Users className='h-5 w-5' />} label='إجمالي العملاء' value={stats?.total_clients || 0} sublabel={`${stats?.lead_clients || 0} عميل محتمل`} color='blue' />
        <StatCard icon={<MessageSquare className='h-5 w-5' />} label='الاستفسارات' value={stats?.total_inquiries || 0} sublabel={`${stats?.new_inquiries || 0} استفسار جديد`} color='gold' />
        <StatCard icon={<DollarSign className='h-5 w-5' />} label='الإيرادات الشهرية' value={formatPrice(stats?.monthly_revenue || 0)} sublabel={`الإجمالي ${formatPrice(stats?.total_revenue || 0)}`} color='emerald' />
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard icon={<FileText className='h-5 w-5' />} label='العقود' value={stats?.total_contracts || 0} sublabel={`${stats?.active_contracts || 0} نشط`} color='primary' />
        <StatCard icon={<DollarSign className='h-5 w-5' />} label='المدفوعات' value={stats?.total_payments || 0} sublabel={`${stats?.paid_payments || 0} مدفوع`} color='emerald' />
        <StatCard icon={<Calendar className='h-5 w-5' />} label='مواعيد اليوم' value={stats?.today_appointments || 0} color='amber' />
        <StatCard icon={<TrendingUp className='h-5 w-5' />} label='معدل التحويل' value={`${(stats?.conversion_rate || 0).toFixed(1)}%`} sublabel={`معدل ${stats?.average_price ? formatPrice(stats.average_price) : '-'}`} color='gold' />
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='rounded-xl border bg-white p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-display text-base font-semibold flex items-center gap-2'><Eye className='h-4 w-4 text-primary' />آخر العقارات المضافة</h2>
              <Link href='/dashboard/properties' className='text-xs text-primary hover:underline flex items-center gap-1'>عرض الكل <ArrowLeft className='h-3 w-3' /></Link>
            </div>
            {recentProperties.length === 0 ? (
              <div className='text-center py-8 text-muted'><Building2 className='mx-auto h-8 w-8 mb-2 opacity-40' /><p className='text-sm'>لا توجد عقارات بعد</p><Link href='/dashboard/properties/add' className='text-xs text-primary hover:underline mt-1 inline-block'>أضف أول عقار</Link></div>
            ) : (
              <div className='space-y-2'>
                {recentProperties.map(p => (
                  <Link key={p.id} href={`/dashboard/properties/edit/${p.id}`} className='flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-muted/5 hover:border-primary/20 group'>
                    <img src={p.featured_image || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=عقار'} alt='' className='h-12 w-12 rounded-lg object-cover shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate group-hover:text-primary transition-colors'>{p.title}</p>
                      <p className='text-xs text-muted'>{p.city}{p.district ? ` - ${p.district}` : ''}</p>
                    </div>
                    <div className='text-left shrink-0'>
                      <p className='text-sm font-semibold'>{formatPrice(p.price, p.currency)}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(p.status, 'property')}`}>{statusLabel(p.status, 'property')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className='rounded-xl border bg-white p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-display text-base font-semibold flex items-center gap-2'><MessageSquare className='h-4 w-4 text-gold' />آخر الاستفسارات</h2>
              <Link href='/dashboard/inquiries' className='text-xs text-primary hover:underline flex items-center gap-1'>عرض الكل <ArrowLeft className='h-3 w-3' /></Link>
            </div>
            {recentInquiries.length === 0 ? (
              <div className='text-center py-8 text-muted'><MessageSquare className='mx-auto h-8 w-8 mb-2 opacity-40' /><p className='text-sm'>لا توجد استفسارات بعد</p></div>
            ) : (
              <div className='space-y-2'>
                {recentInquiries.map((inq, i) => (
                  <div key={inq.id || i} className='flex items-center justify-between rounded-lg border p-3'>
                    <div>
                      <p className='text-sm font-medium'>{inq.name}</p>
                      <p className='text-xs text-muted'>{inq.phone} {inq.property ? `• ${inq.property.title}` : ''}</p>
                    </div>
                    <div className='text-left'>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor(inq.status, 'inquiry')}`}>{statusLabel(inq.status, 'inquiry')}</span>
                      <p className='text-[11px] text-muted/60 mt-0.5'>{timeAgo(inq.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='space-y-6'>
          <div className='rounded-xl border bg-white p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-display text-base font-semibold flex items-center gap-2'><Calendar className='h-4 w-4 text-amber' />مواعيد اليوم</h2>
              <Link href='/dashboard/appointments' className='text-xs text-primary hover:underline'>عرض الكل</Link>
            </div>
            {todayAppts.length === 0 ? (
              <div className='text-center py-8 text-muted'><Calendar className='mx-auto h-8 w-8 mb-2 opacity-40' /><p className='text-sm'>لا توجد مواعيد اليوم</p></div>
            ) : (
              <div className='space-y-2'>
                {todayAppts.map(a => (
                  <div key={a.id} className='rounded-lg border p-3'>
                    <p className='text-sm font-medium'>{a.title}</p>
                    <p className='text-xs text-muted mt-0.5'>الساعة {a.time}</p>
                    {a.notes && <p className='text-xs text-muted/60 mt-1'>{a.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='rounded-xl border bg-white p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-display text-base font-semibold flex items-center gap-2'><Activity className='h-4 w-4 text-primary' />آخر النشاطات</h2>
              <Link href='/dashboard/activity' className='text-xs text-primary hover:underline'>عرض الكل</Link>
            </div>
            <ActivityFeed limit={6} />
          </div>

          <div className='rounded-xl border bg-white p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-display text-base font-semibold flex items-center gap-2'><Bell className='h-4 w-4 text-gold' />إحصائيات سريعة</h2>
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div className='rounded-lg bg-primary/5 p-3 text-center'>
                <p className='text-2xl font-bold text-primary'>{stats?.active_properties || 0}</p>
                <p className='text-xs text-muted mt-0.5'>عقار متاح</p>
              </div>
              <div className='rounded-lg bg-emerald-50 p-3 text-center'>
                <p className='text-2xl font-bold text-emerald-600'>{stats?.sold_properties || 0}</p>
                <p className='text-xs text-muted mt-0.5'>مباع / مؤجر</p>
              </div>
              <div className='rounded-lg bg-amber-50 p-3 text-center'>
                <p className='text-2xl font-bold text-amber-600'>{stats?.pending_payments || 0}</p>
                <p className='text-xs text-muted mt-0.5'>دفعة معلقة</p>
              </div>
              <div className='rounded-lg bg-blue-50 p-3 text-center'>
                <p className='text-2xl font-bold text-blue-600'>{stats?.new_inquiries || 0}</p>
                <p className='text-xs text-muted mt-0.5'>استفسار جديد</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
