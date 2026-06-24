'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/LocaleContext';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { formatPrice, formatDate, timeAgo, statusLabel, statusColor } from '@/lib/utils/format';
import {
  Building2, Users, MessageSquare, DollarSign, Calendar, TrendingUp,
  Loader2, FileText, Activity, Plus, ArrowLeft, BarChart3, MapPin,
  Phone, ChevronLeft, Target, Percent, Clock, Wallet
} from 'lucide-react';
import type { Property, Inquiry, Appointment, DashboardStats } from '@/types/property';
import { cn } from '@/lib/utils/cn';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLocale();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      const [propsRes, clientsRes, inqRes, contractsRes, paymentsRes, apptsRes] = await Promise.all([
        supabase.from('properties').select('*'),
        supabase.from('clients').select('count'),
        supabase.from('inquiries').select('*'),
        supabase.from('contracts').select('*'),
        supabase.from('payments').select('amount, status, currency, due_date'),
        supabase.from('appointments').select('*').gte('date', today).lte('date', today),
      ]);
      const properties = propsRes.data || [];
      const inquiries = inqRes.data || [];
      const contracts = contractsRes.data || [];
      const payments = paymentsRes.data || [];
      const todayAppointments = apptsRes.data || [];
      const paidPayments = payments.filter(p => p.status === 'paid');
      const totalRevenue = paidPayments.reduce((s, p) => s + Number(p.amount), 0);
      const monthlyRevenue = paidPayments.filter(p => {
        const d = new Date(p.due_date); const n = new Date();
        return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
      }).reduce((s, p) => s + Number(p.amount), 0);
      const avgPrice = properties.length > 0
        ? properties.reduce((s, p) => s + Number(p.price), 0) / properties.length : 0;
      const totalCommission = contracts.reduce((s, c) => s + (Number(c.commission_amount) || 0), 0);
      const conversionRate = inquiries.length > 0
        ? (inquiries.filter(i => i.status === 'converted').length / inquiries.length) * 100 : 0;

      setStats({
        total_properties: properties.length,
        active_properties: properties.filter(p => p.status === 'available').length,
        sold_properties: properties.filter(p => p.status === 'sold' || p.status === 'rented').length,
        total_clients: clientsRes.count || 0, active_clients: 0, lead_clients: 0,
        total_inquiries: inquiries.length,
        new_inquiries: inquiries.filter(i => i.status === 'new').length,
        total_contracts: contracts.length,
        active_contracts: contracts.filter(c => c.status === 'active').length,
        total_payments: payments.length, paid_payments: paidPayments.length,
        pending_payments: payments.filter(p => p.status === 'pending').length,
        total_revenue: totalRevenue, pending_revenue: 0, monthly_revenue: monthlyRevenue,
        total_appointments: 0, today_appointments: todayAppointments.length,
        conversion_rate: conversionRate, average_price: avgPrice,
        total_commission: totalCommission, pending_commission: 0,
      });
      setRecentProperties((propsRes.data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setRecentInquiries(inquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setTodayAppts(todayAppointments);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className='flex items-center justify-center min-h-[80vh]'>
      <div className='text-center'>
        <Loader2 className='h-10 w-10 animate-spin mx-auto' style={{ color: 'var(--muted)' }} />
        <p className='mt-3 text-sm' style={{ color: 'var(--muted)' }}>جاري التحميل...</p>
      </div>
    </div>
  );

  const statCards = [
    {
      label: 'إجمالي العقارات', value: stats?.total_properties || 0,
      sub: `${stats?.active_properties || 0} متاح`, icon: Building2,
      gradient: 'from-blue-600 to-indigo-600',
      lightBg: 'bg-blue-50', lightIcon: 'text-blue-600',
    },
    {
      label: 'العقود النشطة', value: stats?.active_contracts || 0,
      sub: `من ${stats?.total_contracts || 0} عقد`, icon: FileText,
      gradient: 'from-emerald-600 to-teal-600',
      lightBg: 'bg-emerald-50', lightIcon: 'text-emerald-600',
    },
    {
      label: 'العملاء', value: stats?.total_clients || 0,
      sub: `${stats?.lead_clients || 0} جديد`, icon: Users,
      gradient: 'from-violet-600 to-purple-600',
      lightBg: 'bg-violet-50', lightIcon: 'text-violet-600',
    },
    {
      label: 'معدل التحويل', value: `${(stats?.conversion_rate || 0).toFixed(1)}%`,
      sub: `متوسط ${formatPrice(stats?.average_price || 0)}`, icon: Percent,
      gradient: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50', lightIcon: 'text-amber-600',
    },
  ];

  const statCardsRow2 = [
    {
      label: 'استفسارات جديدة', value: stats?.new_inquiries || 0,
      sub: `من ${stats?.total_inquiries || 0}`, icon: MessageSquare,
      gradient: 'from-sky-600 to-blue-600',
      lightBg: 'bg-sky-50', lightIcon: 'text-sky-600',
    },
    {
      label: 'الإيرادات الشهرية', value: formatPrice(stats?.monthly_revenue || 0),
      sub: `إجمالي ${formatPrice(stats?.total_revenue || 0)}`, icon: Wallet,
      gradient: 'from-emerald-600 to-green-600',
      lightBg: 'bg-emerald-50', lightIcon: 'text-emerald-600',
    },
    {
      label: 'مواعيد اليوم', value: stats?.today_appointments || 0,
      sub: stats?.total_appointments ? `من ${stats.total_appointments}` : '', icon: Calendar,
      gradient: 'from-rose-500 to-pink-600',
      lightBg: 'bg-rose-50', lightIcon: 'text-rose-600',
    },
    {
      label: 'العمولات', value: formatPrice(stats?.total_commission || 0),
      sub: 'إجمالي العمولات', icon: Target,
      gradient: 'from-indigo-500 to-violet-600',
      lightBg: 'bg-indigo-50', lightIcon: 'text-indigo-600',
    },
  ];

  return (
    <div className='space-y-8 animate-in'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='page-title'>لوحة التحكم</h1>
          <p className='section-desc' style={{ color: 'var(--muted)' }}>نظرة عامة على أداء النظام</p>
        </div>
        <Link
          href='/dashboard/properties/add'
          className='btn btn-primary btn-lg'
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            boxShadow: '0 4px 14px var(--primary-glow)',
          }}
        >
          <Plus className='h-4 w-4' />
          إضافة عقار
        </Link>
      </div>

      {/* Stats Row 1 */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className='card card-hover p-5 animate-slide-up relative overflow-hidden group'
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className='flex items-start justify-between relative z-10'>
                <div>
                  <p className='stat-label'>{c.label}</p>
                  <p className='stat-value mt-1'>{c.value}</p>
                  <p className='mt-1 text-xs' style={{ color: 'var(--muted)' }}>{c.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${c.lightBg}`}>
                  <Icon className={`h-5 w-5 ${c.lightIcon}`} />
                </div>
              </div>
              <div
                className='absolute -bottom-2 -left-2 w-24 h-24 rounded-full opacity-[0.03] pointer-events-none'
                style={{ background: `linear-gradient(135deg, ${c.gradient.replace('from-', '').split(' ')[0]}, ${c.gradient.split(' ')[1]})` }}
              />
            </div>
          );
        })}
      </div>

      {/* Stats Row 2 */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statCardsRow2.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className='card card-hover p-5 animate-slide-up relative overflow-hidden group'
              style={{ animationDelay: `${(i + 4) * 0.06}s` }}
            >
              <div className='flex items-start justify-between relative z-10'>
                <div>
                  <p className='stat-label'>{c.label}</p>
                  <p className='stat-value mt-1'>{c.value}</p>
                  <p className='mt-1 text-xs' style={{ color: 'var(--muted)' }}>{c.sub}</p>
                </div>
                <div className={`p-3 rounded-xl ${c.lightBg}`}>
                  <Icon className={`h-5 w-5 ${c.lightIcon}`} />
                </div>
              </div>
              <div
                className='absolute -bottom-2 -left-2 w-24 h-24 rounded-full opacity-[0.03] pointer-events-none'
                style={{ background: `linear-gradient(135deg, ${c.gradient.replace('from-', '').split(' ')[0]}, ${c.gradient.split(' ')[1]})` }}
              />
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className='grid gap-6 xl:grid-cols-3'>
        {/* Left: 2 columns */}
        <div className='xl:col-span-2 space-y-6'>
          {/* Recent Properties */}
          <div className='card p-6 animate-slide-up' style={{ animationDelay: '0.2s' }}>
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-sm font-bold flex items-center gap-2'>
                <Building2 className='h-4 w-4' style={{ color: 'var(--primary)' }} />
                آخر العقارات
              </h2>
              <Link href='/dashboard/properties' className='text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-80' style={{ color: 'var(--primary)' }}>
                عرض الكل <ArrowLeft className='h-3 w-3' />
              </Link>
            </div>
            {recentProperties.length === 0 ? (
              <div className='text-center py-14' style={{ color: 'var(--muted)' }}>
                <Building2 className='mx-auto h-12 w-12 mb-3 opacity-20' />
                <p className='text-sm'>لا توجد عقارات بعد</p>
                <Link href='/dashboard/properties/add' className='btn btn-primary btn-sm mt-3'>
                  أضف أول عقار
                </Link>
              </div>
            ) : (
              <div className='space-y-2'>
                {recentProperties.map(p => (
                  <Link
                    key={p.id}
                    href={`/dashboard/properties/edit/${p.id}`}
                    className='flex items-center gap-3.5 rounded-xl p-3.5 transition-all group'
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <img
                      src={p.featured_image || 'https://placehold.co/56x56/e2e8f0/94a3b8?text= عقار'}
                      alt=''
                      className='h-14 w-14 rounded-xl object-cover shrink-0'
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate' style={{ color: 'var(--fg)' }}>
                        {p.title}
                      </p>
                      <p className='text-xs mt-0.5 flex items-center gap-1' style={{ color: 'var(--muted)' }}>
                        <MapPin className='h-3 w-3 shrink-0' />
                        {p.city}{p.district ? ` - ${p.district}` : ''}
                      </p>
                    </div>
                    <div className='text-left shrink-0'>
                      <p className='text-sm font-bold' style={{ color: 'var(--fg)' }}>
                        {formatPrice(p.price, p.currency)}
                      </p>
                      <span
                        className='inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium'
                        style={{
                          background: statusColor(p.status, 'property').includes('emerald') ? 'var(--success-bg)' : 'var(--warning-bg)',
                          color: statusColor(p.status, 'property').includes('emerald') ? 'var(--success)' : 'var(--warning)',
                        }}
                      >
                        {statusLabel(p.status, 'property')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Inquiries */}
          <div className='card p-6 animate-slide-up' style={{ animationDelay: '0.3s' }}>
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-sm font-bold flex items-center gap-2'>
                <MessageSquare className='h-4 w-4' style={{ color: 'var(--primary)' }} />
                آخر الاستفسارات
              </h2>
              <Link href='/dashboard/inquiries' className='text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-80' style={{ color: 'var(--primary)' }}>
                عرض الكل <ArrowLeft className='h-3 w-3' />
              </Link>
            </div>
            {recentInquiries.length === 0 ? (
              <div className='text-center py-14' style={{ color: 'var(--muted)' }}>
                <MessageSquare className='mx-auto h-12 w-12 mb-3 opacity-20' />
                <p className='text-sm'>لا توجد استفسارات بعد</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {recentInquiries.map((inq, i) => (
                  <div
                    key={inq.id || i}
                    className='flex items-center justify-between rounded-xl p-3.5 transition-all'
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
                  >
                    <div>
                      <p className='text-sm font-medium' style={{ color: 'var(--fg)' }}>{inq.name}</p>
                      <p className='text-xs mt-0.5 flex items-center gap-1' style={{ color: 'var(--muted)' }}>
                        <Phone className='h-3 w-3' />{inq.phone}
                        {inq.property ? ` • ${inq.property.title}` : ''}
                      </p>
                    </div>
                    <div className='text-left'>
                      <span
                        className='inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium'
                        style={{
                          background: inq.status === 'new' ? 'var(--info-bg)' : inq.status === 'converted' ? 'var(--success-bg)' : 'var(--warning-bg)',
                          color: inq.status === 'new' ? 'var(--info)' : inq.status === 'converted' ? 'var(--success)' : 'var(--warning)',
                        }}
                      >
                        {statusLabel(inq.status, 'inquiry')}
                      </span>
                      <p className='text-[10px] mt-0.5' style={{ color: 'var(--muted-fg)' }}>{timeAgo(inq.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: 1 column */}
        <div className='space-y-6'>
          {/* Today's Appointments */}
          <div className='card p-6 animate-slide-up' style={{ animationDelay: '0.35s' }}>
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-sm font-bold flex items-center gap-2'>
                <Calendar className='h-4 w-4' style={{ color: 'var(--accent)' }} />
                مواعيد اليوم
              </h2>
              <Link href='/dashboard/appointments' className='text-xs font-medium transition-opacity hover:opacity-80' style={{ color: 'var(--primary)' }}>
                عرض الكل
              </Link>
            </div>
            {todayAppts.length === 0 ? (
              <div className='text-center py-12' style={{ color: 'var(--muted)' }}>
                <Calendar className='mx-auto h-10 w-10 mb-2 opacity-20' />
                <p className='text-sm'>لا توجد مواعيد اليوم</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {todayAppts.map(a => (
                  <div
                    key={a.id}
                    className='rounded-xl p-4'
                    style={{ border: '1px solid var(--accent-glow)', background: 'var(--warning-bg)' }}
                  >
                    <div className='flex items-center gap-2.5'>
                      <div className='h-2.5 w-2.5 rounded-full shrink-0' style={{ background: 'var(--accent)' }} />
                      <p className='text-sm font-medium' style={{ color: 'var(--fg)' }}>{a.title}</p>
                    </div>
                    <p className='text-xs mt-2 flex items-center gap-1' style={{ color: 'var(--muted)' }}>
                      <Clock className='h-3 w-3' />
                      {a.time ? `الساعة ${a.time}` : formatDate(a.date)}
                    </p>
                    {a.notes && (
                      <p className='text-xs mt-1.5 pr-5' style={{ color: 'var(--muted-fg)' }}>{a.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className='card p-6 animate-slide-up' style={{ animationDelay: '0.4s' }}>
            <div className='flex items-center justify-between mb-5'>
              <h2 className='text-sm font-bold flex items-center gap-2'>
                <Activity className='h-4 w-4' style={{ color: 'var(--primary)' }} />
                آخر النشاطات
              </h2>
              <Link href='/dashboard/activity' className='text-xs font-medium transition-opacity hover:opacity-80' style={{ color: 'var(--primary)' }}>
                عرض الكل
              </Link>
            </div>
            <ActivityFeed limit={5} />
          </div>

          {/* Quick Stats */}
          <div className='card p-6 animate-slide-up' style={{ animationDelay: '0.45s' }}>
            <h2 className='text-sm font-bold mb-4 flex items-center gap-2'>
              <BarChart3 className='h-4 w-4' style={{ color: 'var(--primary)' }} />
              مؤشرات سريعة
            </h2>
            <div className='grid grid-cols-2 gap-3'>
              {[
                { value: stats?.active_properties || 0, label: 'عقار متاح', style: { bg: 'var(--primary-glow)', color: 'var(--primary)' } },
                { value: stats?.sold_properties || 0, label: 'مباع / مؤجر', style: { bg: 'var(--success-bg)', color: 'var(--success)' } },
                { value: stats?.pending_payments || 0, label: 'دفعة معلقة', style: { bg: 'var(--warning-bg)', color: 'var(--warning)' } },
                { value: stats?.new_inquiries || 0, label: 'استفسار جديد', style: { bg: 'var(--info-bg)', color: 'var(--info)' } },
              ].map((item, i) => (
                <div
                  key={i}
                  className='rounded-xl p-4 text-center transition-all hover:scale-[1.02]'
                  style={{ background: item.style.bg }}
                >
                  <p className='stat-value' style={{ color: item.style.color }}>{item.value}</p>
                  <p className='text-xs mt-1 font-medium' style={{ color: 'var(--fg-secondary)' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
