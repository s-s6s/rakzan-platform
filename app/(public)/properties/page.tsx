'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Search, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Property } from '@/types/property';

export default function PropertiesPage() {
  const { t, dir } = useLocale();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ purpose: '', type: '', city: '' });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (filter.purpose) query = query.eq('purpose', filter.purpose);
      if (filter.type) query = query.eq('type', filter.type);
      if (filter.city) query = query.ilike('city', `%${filter.city}%`);
      if (search) query = query.ilike('title', `%${search}%`);
      const { data } = await query;
      setProperties(data || []);
      setLoading(false);
    }
    load();
  }, [search, filter]);

  const cities = [...new Set(properties.map(p => p.city))];

  return (
    <div dir={dir} className='py-10'>
      <div className='container'>
        <h1 className='font-display text-3xl font-bold'>{t('properties.title')}</h1>

        <div className='mt-6 flex flex-wrap gap-3'>
          <div className='relative flex-1 min-w-[200px]'>
            <Search className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
            <input type='text' value={search} onChange={e => setSearch(e.target.value)} placeholder={t('properties.search')} className='w-full rounded-md border border-border bg-white py-2 pr-10 pl-3 text-sm outline-none focus:border-primary' />
          </div>
          <select value={filter.purpose} onChange={e => setFilter(f => ({ ...f, purpose: e.target.value }))} className='rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'>
            <option value=''>{t('properties.filter_purpose')}</option>
            <option value='sale'>بيع</option><option value='rent'>إيجار</option>
          </select>
          <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className='rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'>
            <option value=''>{t('properties.filter_type')}</option>
            <option value='apartment'>شقة</option><option value='villa'>فيلا</option><option value='land'>أرض</option><option value='office'>مكتب</option><option value='commercial'>تجاري</option><option value='warehouse'>مستودع</option>
          </select>
          <select value={filter.city} onChange={e => setFilter(f => ({ ...f, city: e.target.value }))} className='rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary'>
            <option value=''>{t('properties.filter_city')}</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>
        ) : properties.length === 0 ? (
          <p className='mt-10 text-center text-muted'>{t('properties.no_results')}</p>
        ) : (
          <div className='mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {properties.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
