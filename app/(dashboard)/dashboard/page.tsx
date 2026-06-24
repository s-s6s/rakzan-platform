'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { formatPrice, formatDate, timeAgo, statusLabel, statusColor } from '@/lib/utils/format';
import { Building2, Users, MessageSquare, DollarSign, Calendar, TrendingUp, Loader2, ArrowLeft, FileText, Bell, Activity, Eye, Star, BarChart3, Plus } from 'lucide-react';
import type { Property, Inquiry, Appointment, Contract, DashboardStats } from '@/types/property';

const cardCls = 'card p-5 animate-in';

export default function DashboardPage() {
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
      const monthlyRevenue = payments.filter(p => p.status === 'paid').filter(p => { const d = new Date(p.due_date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).reduce((s, p) => s + Number(p.amount), 0);
      const avgPrice = properties.length > 0 ? properties.reduce((s, p) => s + Number(p.price), 0) / properties.length : 0;
      setStats({
        total_properties: properties.length, active_properties: properties.filter(p => p.status === 'available').length, sold_properties: properties.filter(p => p.status === 'sold' || p.status === 'rented').length,
        total_clients: clientsRes.count || 0, active_clients: 0, lead_clients: 0,
        total_inquiries: inquiries.length, new_inquiries: inquiries.filter(i => i.status === 'new').length,
        total_contracts: contracts.length, active_contracts: contracts.filter(c => c.status === 'active').length,
        total_payments: payments.length, paid_payments: payments.filter(p => p.status === 'paid').length, pending_payments: payments.filter(p => p.status === 'pending').length,
        total_revenue: totalRevenue, pending_revenue: pendingRevenue, monthly_revenue: monthlyRevenue,
        total_appointments: 0, today_appointments: todayAppointments.length,
        conversion_rate: inquiries.length > 0 ? (inquiries.filter(i => i.status === 'converted').length / inquiries.length) * 100 : 0,
        average_price: avgPrice, total_commission: contracts.reduce((s, c) => s + (Number(c.commission_amount) || 0), 0), pending_commission: 0,
      });
      setRecentProperties((propsRes.data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setRecentInquiries(inquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setTodayAppts(todayAppointments);
      setRecentContracts((contractsRes.data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className='flex items-center justify-center min-h-[70vh]'><Loader2 className='h-10 w-10 animate-spin text-muted' /></div>;

  return (
    <div className='space-y-8 animate-in'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='section-title'>لوحة التحكم</h1>
          <p className='section-desc'>نظرة عامة على أداء النظام</p>
        </div>
        <Link href='/dashboard/properties/add' className='btn btn-primary btn-lg'>
          <Plus className='h-4 w-4' />
          إضافة عقار
        </Link>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          { icon: <Building2 className='h-5 w-5 text-primary' />, label: 'إجمالي العقارات', value: stats?.total_properties || 0, sub: `${stats?.active_properties || 0} متاح`, bg: 'bg-primary/5' },
          { icon: <FileText className='h-5 w-5 text-blue-600' />, label: 'العقود النشطة', value: stats?.active_contracts || 0, sub: `من ${stats?.total_contracts || 0} عقد`, bg: 'bg-blue-50' },
          { icon: <Users className='h-5 w-5 text-emerald-600' />, label: 'العملاء', value: stats?.total_clients || 0, sub: `${stats?.lead_clients || 0} جديد`, bg: 'bg-emerald-50' },
          { icon: <TrendingUp className='h-5 w-5 text-amber-600' />, label: 'معدل التحويل', value: `${(stats?.conversion_rate || 0).toFixed(1)}%`, sub: `معدل ${stats?.average_price ? formatPrice(stats.average_price) : '-'}`, bg: 'bg-amber-50' },
        ].map((c, i) => (
          <div key={i} className={`card p-5 animate-slide-up`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className='flex items-start justify-between'>
              <div>
                <p className='stat-label'>{c.label}</p>
                <p className='stat-value mt-1'>{c.value}</p>
                <p className='text-xs text-muted mt-1'>{c.sub}</p>
              </div>
              <div className={`${c.bg} p-2.5 rounded-lg`}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {[
          { icon: <MessageSquare className='h-5 w-5 text-primary' />, label: 'استفسارات جديدة', value: stats?.new_inquiries || 0, sub: `من ${stats?.total_inquiries || 0}`, bg: 'bg-primary/5' },
          { icon: <DollarSign className='h-5 w-5 text-emerald-600' />, label: 'الإيرادات الشهرية', value: formatPrice(stats?.monthly_revenue || 0), sub: `إجمالي ${formatPrice(stats?.total_revenue || 0)}`, bg: 'bg-emerald-50' },
          { icon: <Calendar className='h-5 w-5 text-amber-600' />, label: 'مواعيد اليوم', value: stats?.today_appointments || 0, sub: stats?.total_appointments ? `من ${stats.total_appointments}` : '', bg: 'bg-amber-50' },
          { icon: <BarChart3 className='h-5 w-5 text-blue-600' />, label: 'العمولات', value: formatPrice(stats?.total_commission || 0), sub: 'إجمالي العمولات', bg: 'bg-blue-50' },
        ].map((c, i) => (
          <div key={i} className={`card p-5 animate-slide-up`} style={{ animationDelay: `${(i + 4) * 0.05}s` }}>
            <div className='flex items-start justify-between'>
              <div>
                <p className='stat-label'>{c.label}</p>
                <p className='stat-value mt-1'>{c.value}</p>
                <p className='text-xs text-muted mt-1'>{c.sub}</p>
              </div>
              <div className={`${c.bg} p-2.5 rounded-lg`}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className='grid gap-6 xl:grid-cols-3'>
        <div className='xl:col-span-2 space-y-6'>
          <div className={cardCls}>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-sm font-semibold flex items-center gap-2'><Building2 className='h-4 w-4 text-primary' />آخر العقارات</h2>
              <Link href='/dashboard/properties' className='text-xs text-primary hover:underline flex items-center gap-1'>عرض الكل <ArrowLeft className='h-3 w-3' /></Link>
            </div>
            {recentProperties.length === 0 ? (
              <div className='text-center py-12 text-muted'><Building2 className='mx-auto h-10 w-10 mb-2 opacity-30' /><p className='text-sm'>لا توجد عقارات بعد</p><Link href='/dashboard/properties/add' className='btn btn-primary btn-sm mt-2'>أضف أول عقار</Link></div>
            ) : (
              <div className='space-y-2'>
                {recentProperties.map(p => (
                  <Link key={p.id} href={`/dashboard/properties/edit/${p.id}`} className='flex items-center gap-3 rounded-lg border p-3 transition-all hover:border-primary/20 hover:shadow-sm group'>
                    <img src={p.featured_image || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=عقار'} alt='' className='h-12 w-12 rounded-lg object-cover shrink-0' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate group-hover:text-primary'>{p.title}</p>
                      <p className='text-xs text-muted'>{p.city}{p.district ? ` - ${p.district}` : ''}</p>
                    </div>
                    <div className='text-left shrink-0'>
                      <p className='text-sm font-semibold'>{formatPrice(p.price, p.currency)}</p>
                      <span className={`badge ${statusColor(p.status, 'property').replace('bg-', '').replace('text-', 'badge-') || 'badge-neutral'}`}>{statusLabel(p.status, 'property')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={cardCls}>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-sm font-semibold flex items-center gap-2'><MessageSquare className='h-4 w-4 text-amber' />آخر الاستفسارات</h2>
              <Link href='/dashboard/inquiries' className='text-xs text-primary hover:underline flex items-center gap-1'>عرض الكل <ArrowLeft className='h-3 w-3' /></Link>
            </div>
            {recentInquiries.length === 0 ? (
              <div className='text-center py-12 text-muted'><MessageSquare className='mx-auto h-10 w-10 mb-2 opacity-30' /><p className='text-sm'>لا توجد استفسارات بعد</p></div>
            ) : (
              <div className='space-y-2'>
                {recentInquiries.map((inq, i) => (
                  <div key={inq.id || i} className='flex items-center justify-between rounded-lg border p-3'>
                    <div>
                      <p className='text-sm font-medium'>{inq.name}</p>
                      <p className='text-xs text-muted'>{inq.phone} {inq.property ? `• ${inq.property.title}` : ''}</p>
                    </div>
                    <div className='text-left'>
                      <span className={`badge ${statusColor(inq.status, 'inquiry').replace('bg-', '').replace('text-', 'badge-') || 'badge-neutral'}`}>{statusLabel(inq.status, 'inquiry')}</span>
                      <p className='text-[11px] text-muted/60 mt-0.5'>{timeAgo(inq.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='space-y-6'>
          <div className={cardCls}>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-sm font-semibold flex items-center gap-2'><Calendar className='h-4 w-4 text-amber' />مواعيد اليوم</h2>
              <Link href='/dashboard/appointments' className='text-xs text-primary hover:underline'>عرض الكل</Link>
            </div>
            {todayAppts.length === 0 ? (
              <div className='text-center py-10 text-muted'><Calendar className='mx-auto h-10 w-10 mb-2 opacity-30' /><p className='text-sm'>لا توجد مواعيد اليوم</p></div>
            ) : (
              <div className='space-y-2'>
                {todayAppts.map(a => (
                  <div key={a.id} className='rounded-lg border p-3 border-amber-100 bg-amber-50/30'>
                    <div className='flex items-center gap-2'><div className='h-2 w-2 rounded-full bg-amber-400' /><p className='text-sm font-medium'>{a.title}</p></div>
                    <p className='text-xs text-muted mr-4'>{a.time ? `الساعة ${a.time}` : formatDate(a.date)}</p>
                    {a.notes && <p className='text-xs text-muted/60 mr-4 mt-1'>{a.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={cardCls}>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-sm font-semibold flex items-center gap-2'><Activity className='h-4 w-4 text-primary' />آخر النشاطات</h2>
              <Link href='/dashboard/activity' className='text-xs text-primary hover:underline'>عرض الكل</Link>
            </div>
            <ActivityFeed limit={5} />
          </div>

          <div className={cardCls}>
            <h2 className='text-sm font-semibold mb-4 flex items-center gap-2'><BarChart3 className='h-4 w-4 text-primary' />مؤشرات سريعة</h2>
            <div className='grid grid-cols-2 gap-3'>
              <div className='rounded-lg bg-primary/5 p-3 text-center'><p className='stat-value text-primary'>{stats?.active_properties || 0}</p><p className='stat-label mt-0.5'>عقار متاح</p></div>
              <div className='rounded-lg bg-emerald-50 p-3 text-center'><p className='stat-value text-emerald-600'>{stats?.sold_properties || 0}</p><p className='stat-label mt-0.5'>مباع / مؤجر</p></div>
              <div className='rounded-lg bg-amber-50 p-3 text-center'><p className='stat-value text-amber-600'>{stats?.pending_payments || 0}</p><p className='stat-label mt-0.5'>دفعة معلقة</p></div>
              <div className='rounded-lg bg-blue-50 p-3 text-center'><p className='stat-value text-blue-600'>{stats?.new_inquiries || 0}</p><p className='stat-label mt-0.5'>استفسار جديد</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
