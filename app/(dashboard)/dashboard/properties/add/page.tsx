'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { toast } from 'sonner';
import { Loader2, MapPin, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '@/components/property/ImageUpload';
import dynamic from 'next/dynamic';

const PropertyMapInput = dynamic(() => import('@/components/property/PropertyMapInput'), { ssr: false });

const tabs = ['basic', 'details', 'location', 'media', 'features']; 
const tabLabels = { ar: ['البيانات الأساسية', 'التفاصيل', 'الموقع', 'الصور', 'المميزات'], en: ['Basic Info', 'Details', 'Location', 'Media', 'Features'] };

export default function AddPropertyPage() {
  const { t, locale, dir } = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title_ar: '', title_en: '',
    description_ar: '', description_en: '',
    slug: '', status: 'available', purpose: 'sale', type: 'apartment',
    price: 0, area: 0, bedrooms: 0, bathrooms: 0,
    year_built: null as number | null, floors: null as number | null,
    deed_number: '', street_width: null as number | null,
    latitude: null as number | null, longitude: null as number | null,
    address_ar: '', address_en: '',
    city_ar: '', city_en: '', district_ar: '', district_en: '',
    featured_image: '', images: [] as string[], features: [''] as string[],
    is_featured: false,
  });

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, features: form.features.filter(Boolean) };
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(locale === 'ar' ? 'تم إضافة العقار بنجاح' : 'Property added successfully');
      router.push('/dashboard/properties');
    } catch {
      toast.error(locale === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally { setSaving(false); }
  };

  const labels = locale === 'ar' ? tabLabels.ar : tabLabels.en;

  return (
    <div dir={dir}>
      <h1 className='font-display text-2xl font-bold'>{t('dashboard.add_property')}</h1>

      <div className='mt-6 flex gap-1 border-b'>
        {tabs.map((_, i) => (
          <button key={i} onClick={() => setTab(i)} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === i ? 'border-b-2 border-primary text-primary' : 'text-muted hover:text-foreground'}`}>
            {labels[i]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className='mt-6 max-w-2xl space-y-4'>
        {tab === 0 && (
          <>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>العنوان (عربي) *</label><input required value={form.title_ar} onChange={e => { set('title_ar', e.target.value); if (!form.slug) set('slug', e.target.value.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase()); }} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>Title (English)</label><input value={form.title_en} onChange={e => set('title_en', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>الوصف (عربي)</label><textarea rows={4} value={form.description_ar} onChange={e => set('description_ar', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>Description (English)</label><textarea rows={4} value={form.description_en} onChange={e => set('description_en', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div><label className='block text-xs font-medium text-muted mb-1'>الغرض *</label><select value={form.purpose} onChange={e => set('purpose', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='sale'>بيع</option><option value='rent'>إيجار</option></select></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>النوع *</label><select value={form.type} onChange={e => set('type', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='apartment'>شقة</option><option value='villa'>فيلا</option><option value='land'>أرض</option><option value='office'>مكتب</option><option value='commercial'>تجاري</option><option value='warehouse'>مستودع</option><option value='building'>مبنى</option></select></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>الحالة</label><select value={form.status} onChange={e => set('status', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='available'>متاح</option><option value='sold'>مباع</option><option value='rented'>مؤجر</option><option value='under_contract'>تحت التعاقد</option><option value='off_market'>غير متاح</option></select></div>
            </div>
            <div className='flex items-center gap-2'><input type='checkbox' id='featured' checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className='rounded border-border' /><label htmlFor='featured' className='text-sm'>مميز</label></div>
          </>
        )}

        {tab === 1 && (
          <>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>السعر *</label><input type='number' required value={form.price} onChange={e => set('price', Number(e.target.value))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>المساحة (م²) *</label><input type='number' required value={form.area} onChange={e => set('area', Number(e.target.value))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>غرف النوم</label><input type='number' value={form.bedrooms} onChange={e => set('bedrooms', Number(e.target.value))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>دورات المياه</label><input type='number' value={form.bathrooms} onChange={e => set('bathrooms', Number(e.target.value))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div><label className='block text-xs font-medium text-muted mb-1'>سنة البناء</label><input type='number' value={form.year_built ?? ''} onChange={e => set('year_built', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>عدد الأدوار</label><input type='number' value={form.floors ?? ''} onChange={e => set('floors', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>عرض الشارع</label><input type='number' value={form.street_width ?? ''} onChange={e => set('street_width', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div><label className='block text-xs font-medium text-muted mb-1'>رقم الصك</label><input value={form.deed_number} onChange={e => set('deed_number', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
          </>
        )}

        {tab === 2 && (
          <>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>المدينة (عربي) *</label><input required value={form.city_ar} onChange={e => set('city_ar', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>City (English)</label><input value={form.city_en} onChange={e => set('city_en', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>الحي (عربي)</label><input value={form.district_ar} onChange={e => set('district_ar', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>District (English)</label><input value={form.district_en} onChange={e => set('district_en', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>العنوان (عربي)</label><input value={form.address_ar} onChange={e => set('address_ar', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>Address (English)</label><input value={form.address_en} onChange={e => set('address_en', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>خط العرض</label><input type='number' step='any' value={form.latitude ?? ''} onChange={e => set('latitude', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>خط الطول</label><input type='number' step='any' value={form.longitude ?? ''} onChange={e => set('longitude', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            {form.latitude && form.longitude && (
              <div className='h-48 rounded-lg overflow-hidden'>
                <PropertyMapInput latitude={form.latitude} longitude={form.longitude} onMove={(lat, lng) => { set('latitude', lat); set('longitude', lng); }} />
              </div>
            )}
          </>
        )}

        {tab === 3 && (
          <div className='space-y-4'>
            <div>
              <label className='block text-xs font-medium text-muted mb-1'>الصورة الرئيسية</label>
              <input value={form.featured_image} onChange={e => set('featured_image', e.target.value)} placeholder='https://...' className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
              {form.featured_image && <img src={form.featured_image} alt='' className='mt-2 h-40 w-full rounded-lg object-cover' />}
            </div>
            <div>
              <label className='block text-xs font-medium text-muted mb-1'>رفع صورة رئيسية</label>
              <ImageUpload images={form.featured_image ? [form.featured_image] : []} onChange={(imgs) => set('featured_image', imgs[0] || '')} max={1} />
            </div>
            <div>
              <label className='block text-xs font-medium text-muted mb-1'>صور إضافية</label>
              <ImageUpload images={form.images} onChange={(imgs) => set('images', imgs)} max={10} />
            </div>
          </div>
        )}

        {tab === 4 && (
          <div className='space-y-2'>
            <label className='block text-xs font-medium text-muted'>المميزات</label>
            {form.features.map((f, i) => (
              <div key={i} className='flex gap-2'>
                <input value={f} onChange={e => { const features = [...form.features]; features[i] = e.target.value; set('features', features); }} placeholder='ميزة' className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
                {form.features.length > 1 && <button type='button' onClick={() => set('features', form.features.filter((_, j) => j !== i))} className='px-2 text-sm text-destructive'>×</button>}
              </div>
            ))}
            <button type='button' onClick={() => set('features', [...form.features, ''])} className='text-sm text-primary hover:underline'>+ إضافة ميزة</button>
          </div>
        )}

        <div className='flex items-center gap-3 pt-4 border-t'>
          <button type='submit' disabled={saving} className='flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60'>
            {saving && <Loader2 className='h-4 w-4 animate-spin' />}
            {t('common.save')}
          </button>
          <button type='button' onClick={() => router.back()} className='rounded-md border border-border px-6 py-2 text-sm font-medium text-muted hover:bg-muted/10'>{t('common.cancel')}</button>
        </div>
      </form>
    </div>
  );
}
