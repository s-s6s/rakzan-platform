'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils/format';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1A2B72', '#C9A84C', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

type CountItem = { name: string; value: number; label: string };

export default function ReportsPage() {
  const { t, dir } = useLocale();
  const [loading, setLoading] = useState(true);
  const [propertyTypes, setPropertyTypes] = useState<CountItem[]>([]);
  const [propertyPurposes, setPropertyPurposes] = useState<CountItem[]>([]);
  const [propertyStatuses, setPropertyStatuses] = useState<CountItem[]>([]);
  const [topCities, setTopCities] = useState<CountItem[]>([]);
  const [totalProps, setTotalProps] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalInquiries, setTotalInquiries] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: properties } = await supabase.from('properties').select('type, purpose, status, city');
      const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      const { count: inquiryCount } = await supabase.from('inquiries').select('*', { count: 'exact', head: true });

      if (properties) {
        setTotalProps(properties.length);
        setTotalClients(clientCount || 0);
        setTotalInquiries(inquiryCount || 0);

        const typeMap: Record<string, number> = {};
        const purposeMap: Record<string, number> = {};
        const statusMap: Record<string, number> = {};
        const cityMap: Record<string, number> = {};

        properties.forEach(p => {
          if (p.type) typeMap[p.type] = (typeMap[p.type] || 0) + 1;
          if (p.purpose) purposeMap[p.purpose] = (purposeMap[p.purpose] || 0) + 1;
          if (p.status) statusMap[p.status] = (statusMap[p.status] || 0) + 1;
          if (p.city) cityMap[p.city] = (cityMap[p.city] || 0) + 1;
        });

        const typeLabels: Record<string, string> = { apartment: 'شقة', villa: 'فيلا', land: 'أرض', office: 'مكتب', commercial: 'تجاري', warehouse: 'مستودع', building: 'مبنى' };
        const purposeLabels: Record<string, string> = { sale: 'بيع', rent: 'إيجار' };
        const statusLabels: Record<string, string> = { available: 'متاح', sold: 'مباع', rented: 'مؤجر', under_contract: 'تحت العقد', off_market: 'غير متاح' };

        setPropertyTypes(Object.entries(typeMap).map(([k, v]) => ({ name: k, value: v, label: typeLabels[k] || k })));
        setPropertyPurposes(Object.entries(purposeMap).map(([k, v]) => ({ name: k, value: v, label: purposeLabels[k] || k })));
        setPropertyStatuses(Object.entries(statusMap).map(([k, v]) => ({ name: k, value: v, label: statusLabels[k] || k })));
        setTopCities(Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => ({ name: k, value: v, label: k })));
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div dir={dir}>
      <h1 className='font-display text-2xl font-bold'>{t('dashboard.reports')}</h1>

      <div className='mt-6 grid gap-4 sm:grid-cols-3'>
        <div className='rounded-lg border bg-card p-4'><p className='text-xs text-muted'>إجمالي العقارات</p><p className='mt-1 font-display text-2xl font-bold'>{totalProps}</p></div>
        <div className='rounded-lg border bg-card p-4'><p className='text-xs text-muted'>إجمالي العملاء</p><p className='mt-1 font-display text-2xl font-bold'>{totalClients}</p></div>
        <div className='rounded-lg border bg-card p-4'><p className='text-xs text-muted'>إجمالي الاستفسارات</p><p className='mt-1 font-display text-2xl font-bold'>{totalInquiries}</p></div>
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-2'>
        <div className='rounded-lg border bg-card p-4'>
          <h2 className='font-display text-sm font-semibold mb-4'>توزيع العقارات حسب النوع</h2>
          {propertyTypes.length === 0 ? <p className='text-sm text-muted text-center py-8'>لا توجد بيانات</p> : (
            <ResponsiveContainer width='100%' height={280}><PieChart><Pie data={propertyTypes} dataKey='value' nameKey='label' cx='50%' cy='50%' outerRadius={90} label={({ label, value }) => `${label} ${value}`}><Cell fill={COLORS[0]} /><Cell fill={COLORS[1]} /><Cell fill={COLORS[2]} /><Cell fill={COLORS[3]} /><Cell fill={COLORS[4]} /><Cell fill={COLORS[5]} /></Pie><Tooltip formatter={(v: number) => [v, 'العدد']} /></PieChart></ResponsiveContainer>
          )}
        </div>
        <div className='rounded-lg border bg-card p-4'>
          <h2 className='font-display text-sm font-semibold mb-4'>توزيع العقارات حسب الغرض</h2>
          {propertyPurposes.length === 0 ? <p className='text-sm text-muted text-center py-8'>لا توجد بيانات</p> : (
            <ResponsiveContainer width='100%' height={280}><PieChart><Pie data={propertyPurposes} dataKey='value' nameKey='label' cx='50%' cy='50%' outerRadius={90} label={({ label, value }) => `${label} ${value}`}><Cell fill={COLORS[0]} /><Cell fill={COLORS[1]} /></Pie><Tooltip /></PieChart></ResponsiveContainer>
          )}
        </div>
        <div className='rounded-lg border bg-card p-4'>
          <h2 className='font-display text-sm font-semibold mb-4'>حالة العقارات</h2>
          {propertyStatuses.length === 0 ? <p className='text-sm text-muted text-center py-8'>لا توجد بيانات</p> : (
            <ResponsiveContainer width='100%' height={280}><BarChart data={propertyStatuses}><XAxis dataKey='label' tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Bar dataKey='value' fill={COLORS[0]} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          )}
        </div>
        <div className='rounded-lg border bg-card p-4'>
          <h2 className='font-display text-sm font-semibold mb-4'>أكثر المدن تواجداً</h2>
          {topCities.length === 0 ? <p className='text-sm text-muted text-center py-8'>لا توجد بيانات</p> : (
            <ResponsiveContainer width='100%' height={280}><BarChart data={topCities} layout='vertical'><XAxis type='number' /><YAxis type='category' dataKey='label' tick={{ fontSize: 12 }} width={80} /><Tooltip /><Bar dataKey='value' fill={COLORS[1]} radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
