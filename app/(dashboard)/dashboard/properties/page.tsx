'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { AdvancedSearch } from '@/components/dashboard/AdvancedSearch';
import { DataTable } from '@/components/dashboard/DataTable';
import { formatPrice, formatDate, statusLabel, statusColor, propertyTypeLabel, propertyPurposeLabel } from '@/lib/utils/format';
import { exportCSV } from '@/lib/utils/export';
import { Plus, Download, Loader2, Trash2, Pencil, Eye, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Property } from '@/types/property';

export default function PropertiesListPage() {
  const { t, dir } = useLocale();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      setProperties(data || []);
      setFiltered(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('تأكيد حذف العقار؟')) return;
    const supabase = createClient();
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) { toast.error('فشل الحذف'); return; }
    setProperties(prev => prev.filter(p => p.id !== id));
    setFiltered(prev => prev.filter(p => p.id !== id));
    toast.success('تم الحذف');
  };

  const handleBulkDelete = async () => {
    if (!confirm(`تأكيد حذف ${selected.length} عقار؟`)) return;
    const supabase = createClient();
    for (const id of selected) {
      await supabase.from('properties').delete().eq('id', id);
    }
    setProperties(prev => prev.filter(p => !selected.includes(p.id)));
    setFiltered(prev => prev.filter(p => !selected.includes(p.id)));
    setSelected([]);
    setBulkMode(false);
    toast.success(`تم حذف ${selected.length} عقار`);
  };

  const handleSearch = (query: string, filters: Record<string, string>) => {
    let result = [...properties];
    if (query) result = result.filter(p => p.title.includes(query) || p.city.includes(query) || (p.district || '').includes(query));
    if (filters.purpose) result = result.filter(p => p.purpose === filters.purpose);
    if (filters.type) result = result.filter(p => p.type === filters.type);
    if (filters.status) result = result.filter(p => p.status === filters.status);
    if (filters.city) result = result.filter(p => p.city === filters.city);
    if (filters.furnished) result = result.filter(p => p.furnished === filters.furnished);
    setFiltered(result);
  };

  const cities = [...new Set(properties.map(p => p.city).filter(Boolean))];

  const searchFilters = [
    { key: 'purpose', label: 'الغرض', options: [{ value: 'sale', label: 'بيع' }, { value: 'rent', label: 'إيجار' }] },
    { key: 'type', label: 'النوع', options: [{ value: 'apartment', label: 'شقة' }, { value: 'villa', label: 'فيلا' }, { value: 'land', label: 'أرض' }, { value: 'office', label: 'مكتب' }, { value: 'commercial', label: 'تجاري' }, { value: 'warehouse', label: 'مستودع' }, { value: 'building', label: 'مبنى' }] },
    { key: 'status', label: 'الحالة', options: [{ value: 'available', label: 'متاح' }, { value: 'sold', label: 'مباع' }, { value: 'rented', label: 'مؤجر' }, { value: 'under_contract', label: 'تحت العقد' }, { value: 'off_market', label: 'غير متاح' }] },
    { key: 'furnished', label: 'التأثيث', options: [{ value: 'furnished', label: 'مفروش' }, { value: 'semi_furnished', label: 'نصف مفروش' }, { value: 'unfurnished', label: 'غير مفروش' }] },
    ...(cities.length > 0 ? [{ key: 'city' as string, label: 'المدينة', options: cities.map(c => ({ value: c, label: c })) }] : []),
  ];

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  const columns = [
    { key: 'title', label: 'العقار', sortable: true, render: (p: Property) => (
      <div className='flex items-center gap-2.5'>
        <img src={p.featured_image || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=ع'} alt='' className='h-9 w-9 rounded-lg object-cover shrink-0' />
        <div className='min-w-0'>
          <Link href={`/properties/${p.slug}`} className='text-sm font-medium hover:text-primary truncate block'>{p.title}</Link>
          <p className='text-[11px] text-muted'>{p.city}{p.district ? ` - ${p.district}` : ''}</p>
        </div>
      </div>
    )},
    { key: 'type', label: 'النوع', render: (p: Property) => <span className='text-sm text-muted'>{propertyTypeLabel(p.type)}</span>, hideOnMobile: true },
    { key: 'price', label: 'السعر', sortable: true, render: (p: Property) => <span className='font-semibold whitespace-nowrap'>{formatPrice(p.price, p.currency)}</span> },
    { key: 'area', label: 'المساحة', render: (p: Property) => <span className='text-sm text-muted'>{p.area ? `${p.area} م²` : '-'}</span>, hideOnMobile: true },
    { key: 'status', label: 'الحالة', render: (p: Property) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(p.status, 'property')}`}>{statusLabel(p.status, 'property')}</span> },
    { key: 'created_at', label: 'التاريخ', sortable: true, render: (p: Property) => <span className='text-xs text-muted whitespace-nowrap'>{formatDate(p.created_at)}</span>, hideOnMobile: true },
    { key: 'actions', label: '', render: (p: Property) => (
      <div className='flex items-center gap-0.5' onClick={e => e.stopPropagation()}>
        <Link href={`/properties/${p.slug}`} className='rounded-md p-1.5 text-muted hover:bg-muted/10' title='عرض'><Eye className='h-3.5 w-3.5' /></Link>
        {bulkMode && (
          <input type='checkbox' checked={selected.includes(p.id)} onChange={() => setSelected(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])} className='rounded border-border' />
        )}
        <button onClick={() => handleDelete(p.id)} className='rounded-md p-1.5 text-destructive hover:bg-red-50' title='حذف'><Trash2 className='h-3.5 w-3.5' /></button>
      </div>
    )},
  ];

  return (
    <div dir={dir} className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <h1 className='font-display text-2xl font-bold'>{t('dashboard.properties')}</h1>
          <p className='text-xs text-muted mt-0.5'>إجمالي {properties.length} عقار</p>
        </div>
        <div className='flex items-center gap-2'>
          <button onClick={() => exportCSV(filtered.map(p => ({ title: p.title, city: p.city, price: p.price, type: propertyTypeLabel(p.type), status: statusLabel(p.status, 'property'), created_at: p.created_at })), 'properties')} className='inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted hover:bg-muted/10 transition-all'>
            <Download className='h-4 w-4' />{t('common.export')}
          </button>
          <button onClick={() => { setBulkMode(!bulkMode); setSelected([]); }} className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${bulkMode ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted hover:bg-muted/10'}`}>
            تحديد
          </button>
          {bulkMode && selected.length > 0 && (
            <button onClick={handleBulkDelete} className='inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-700'>
              <Trash2 className='h-4 w-4' />حذف ({selected.length})
            </button>
          )}
          <Link href='/dashboard/properties/add' className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-all'>
            <Plus className='h-4 w-4' />{t('dashboard.add_property')}
          </Link>
        </div>
      </div>

      <AdvancedSearch
        placeholder='ابحث بالعنوان، المدينة، الحي...'
        filters={searchFilters}
        onSearch={handleSearch}
      />

      <DataTable
        columns={columns as any}
        data={filtered as unknown as Record<string, unknown>[]}
        keyExtractor={(p) => (p as unknown as Property).id}
        emptyMessage='لا توجد عقارات. أضف أول عقار الآن!'
        pageSize={20}
      />
    </div>
  );
}
