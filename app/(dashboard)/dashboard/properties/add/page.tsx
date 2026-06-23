'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { ImageUpload } from '@/components/property/ImageUpload';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const tabs = ['البيانات الأساسية', 'التفاصيل', 'الموقع', 'الصور', 'المميزات'];

export default function AddPropertyPage() {
  const { dir } = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', slug: '',
    status: 'available', purpose: 'sale', type: 'apartment',
    price: 0, area: 0, bedrooms: 0, bathrooms: 0,
    year_built: null as number | null, floors: null as number | null,
    deed_number: '', street_width: null as number | null,
    latitude: null as number | null, longitude: null as number | null,
    address: '', city: '', district: '',
    featured_image: '',
    images_bathroom: [] as string[], images_bedroom: [] as string[],
    images_living: [] as string[], images_kitchen: [] as string[],
    images_facilities: [] as string[], images_exterior: [] as string[],
    images_other: [] as string[],
    features: [''] as string[],
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
      toast.success('تم إضافة العقار بنجاح');
      router.push('/dashboard/properties');
    } catch {
      toast.error('حدث خطأ في إضافة العقار');
    } finally { setSaving(false); }
  };

  return (
    <div dir={dir}>
      <h1 className='font-display text-2xl font-bold'>إضافة عقار جديد</h1>

      <div className='mt-6 flex gap-1 border-b overflow-x-auto'>
        {tabs.map((label, i) => (
          <button key={i} onClick={() => setTab(i)} className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${tab === i ? 'border-b-2 border-primary text-primary' : 'text-muted hover:text-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className='mt-6 max-w-2xl space-y-4'>
        {tab === 0 && (
          <>
            <div><label className='block text-xs font-medium text-muted mb-1'>العنوان *</label><input required value={form.title} onChange={e => { set('title', e.target.value); if (!form.slug) set('slug', e.target.value.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase()); }} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div><label className='block text-xs font-medium text-muted mb-1'>الوصف</label><textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div><label className='block text-xs font-medium text-muted mb-1'>الغرض *</label><select value={form.purpose} onChange={e => set('purpose', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='sale'>بيع</option><option value='rent'>إيجار</option></select></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>النوع *</label><select value={form.type} onChange={e => set('type', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='apartment'>شقة</option><option value='villa'>فيلا</option><option value='land'>أرض</option><option value='office'>مكتب</option><option value='commercial'>تجاري</option><option value='warehouse'>مستودع</option><option value='building'>مبنى</option></select></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>الحالة</label><select value={form.status} onChange={e => set('status', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='available'>متاح</option><option value='sold'>مباع</option><option value='rented'>مؤجر</option><option value='under_contract'>تحت التعاقد</option><option value='off_market'>غير متاح</option></select></div>
            </div>
            <div className='flex items-center gap-2'><input type='checkbox' id='featured' checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className='rounded border-border' /><label htmlFor='featured' className='text-sm'>عقار مميز</label></div>
          </>
        )}

        {tab === 1 && (
          <>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>السعر *</label><input type='number' required value={form.price} onChange={e => set('price', Number(e.target.value))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>المساحة (م²) *</label><input type='number' required value={form.area} onChange={e => set('area', Number(e.target.value))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>عدد غرف النوم</label><input type='number' value={form.bedrooms} onChange={e => set('bedrooms', Number(e.target.value))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>عدد دورات المياه</label><input type='number' value={form.bathrooms} onChange={e => set('bathrooms', Number(e.target.value))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div><label className='block text-xs font-medium text-muted mb-1'>سنة البناء</label><input type='number' value={form.year_built ?? ''} onChange={e => set('year_built', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>عدد الأدوار</label><input type='number' value={form.floors ?? ''} onChange={e => set('floors', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>عرض الشارع (م)</label><input type='number' value={form.street_width ?? ''} onChange={e => set('street_width', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div><label className='block text-xs font-medium text-muted mb-1'>رقم الصك</label><input value={form.deed_number} onChange={e => set('deed_number', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
          </>
        )}

        {tab === 2 && (
          <>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>المدينة *</label><input required value={form.city} onChange={e => set('city', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>الحي</label><input value={form.district} onChange={e => set('district', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div><label className='block text-xs font-medium text-muted mb-1'>العنوان</label><input value={form.address} onChange={e => set('address', e.target.value)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>خط العرض (latitude)</label><input type='number' step='any' value={form.latitude ?? ''} onChange={e => set('latitude', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>خط الطول (longitude)</label><input type='number' step='any' value={form.longitude ?? ''} onChange={e => set('longitude', e.target.value ? Number(e.target.value) : null)} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
          </>
        )}

        {tab === 3 && (
          <div className='space-y-4'>
            <div>
              <label className='block text-xs font-medium text-muted mb-1'>رابط الصورة الرئيسية</label>
              <input value={form.featured_image} onChange={e => set('featured_image', e.target.value)} placeholder='https://...' className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
              {form.featured_image && <img src={form.featured_image} alt='' className='mt-2 h-40 w-full rounded-lg object-cover' />}
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <ImageUpload images={form.images_bathroom} onChange={v => set('images_bathroom', v)} label='صور الحمامات' />
              <ImageUpload images={form.images_bedroom} onChange={v => set('images_bedroom', v)} label='صور غرف النوم' />
              <ImageUpload images={form.images_living} onChange={v => set('images_living', v)} label='صور الصالات' />
              <ImageUpload images={form.images_kitchen} onChange={v => set('images_kitchen', v)} label='صور المطابخ' />
              <ImageUpload images={form.images_facilities} onChange={v => set('images_facilities', v)} label='صور المرافق' />
              <ImageUpload images={form.images_exterior} onChange={v => set('images_exterior', v)} label='صور الواجهة' />
            </div>
            <ImageUpload images={form.images_other} onChange={v => set('images_other', v)} label='صور أخرى' />
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
            حفظ
          </button>
          <button type='button' onClick={() => router.back()} className='rounded-md border border-border px-6 py-2 text-sm font-medium text-muted hover:bg-muted/10'>إلغاء</button>
        </div>
      </form>
    </div>
  );
}
