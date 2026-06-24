'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { LeafletMapInput } from '@/components/dashboard/LeafletMapInput';
import { ImageManager } from '@/components/dashboard/ImageManager';
import { toast } from 'sonner';
import { Loader2, Plus, X, ChevronRight, ChevronLeft, Save, Building2, MapPin, Image as ImageIcon, Tag, DollarSign, ListChecks } from 'lucide-react';

const TABS = [
  { key: 'basic', label: 'معلومات أساسية', icon: Building2 },
  { key: 'details', label: 'التفاصيل', icon: ListChecks },
  { key: 'pricing', label: 'السعر', icon: DollarSign },
  { key: 'location', label: 'الموقع', icon: MapPin },
  { key: 'media', label: 'الصور', icon: ImageIcon },
  { key: 'features', label: 'الميزات', icon: Tag },
];

const defaultForm = {
  title: '', description: '', slug: '', purpose: 'sale' as const, type: 'apartment' as const, status: 'available' as const,
  price: 0, currency: 'SAR', rent_period: '', price_per_meter: 0, is_negotiable: true, has_mortgage: false,
  area: 0, area_unit: 'متر مربع', land_area: 0, building_area: 0,
  bedrooms: 0, bathrooms: 0, living_rooms: 0, kitchens: 0, parking_spots: 0,
  furnished: 'unfurnished', floors: 0, year_built: 0, street_width: 0, deed_number: '', property_number: '', plot_number: '', license_number: '',
  has_electricity: false, has_water: false, has_sewage: false, has_gas: false,
  amenities: [] as string[],
  address: '', city: '', district: '', neighborhood: '',
  latitude: null as number | null, longitude: null as number | null, map_zoom: 15,
  featured_image: '', video_url: '', virtual_tour_url: '',
  images_bathroom: [] as string[], images_bedroom: [] as string[], images_living: [] as string[],
  images_kitchen: [] as string[], images_facilities: [] as string[], images_exterior: [] as string[],
  images_other: [] as string[], additional_images: [] as string[],
  features: [] as string[], nearby_places: [] as { name: string; type: string; distance: string }[],
  owner_name: '', owner_phone: '',
};

export default function AddPropertyPage() {
  const { dir } = useLocale();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [featureInput, setFeatureInput] = useState('');
  const [amenityInput, setAmenityInput] = useState('');
  const [nearbyInput, setNearbyInput] = useState({ name: '', type: '', distance: '' });

  const set = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error('الرجاء إدخال عنوان العقار'); setStep(0); return; }
    if (!form.city) { toast.error('الرجاء إدخال المدينة'); setStep(3); return; }
    if (form.price <= 0) { toast.error('الرجاء إدخال السعر'); setStep(2); return; }

    setSaving(true);
    const supabase = createClient();
    const slug = form.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase() + '-' + Date.now();

    const payload = {
      ...form,
      slug,
      price: Number(form.price),
      area: form.area ? Number(form.area) : null,
      land_area: form.land_area ? Number(form.land_area) : null,
      building_area: form.building_area ? Number(form.building_area) : null,
      price_per_meter: form.price_per_meter ? Number(form.price_per_meter) : null,
      bedrooms: form.bedrooms || null, bathrooms: form.bathrooms || null,
      living_rooms: form.living_rooms || null, kitchens: form.kitchens || null,
      floors: form.floors || null, year_built: form.year_built || null,
      street_width: form.street_width || null, parking_spots: form.parking_spots || 0,
      amenities: form.amenities.filter(Boolean),
      features: form.features.filter(Boolean),
      nearby_places: form.nearby_places,
      additional_images: form.additional_images || [],
    };

    const { error } = await supabase.from('properties').insert(payload);
    if (error) { toast.error('فشل الإضافة: ' + error.message); setSaving(false); return; }
    toast.success('تم إضافة العقار بنجاح');
    router.push('/dashboard/properties');
  };

  const prev = () => setStep(s => Math.max(0, s - 1));
  const next = () => setStep(s => Math.min(TABS.length - 1, s + 1));

  const addFeature = () => { if (featureInput.trim()) { set('features', [...form.features, featureInput.trim()]); setFeatureInput(''); } };
  const removeFeature = (i: number) => set('features', form.features.filter((_, idx) => idx !== i));

  const addAmenity = () => { if (amenityInput.trim()) { set('amenities', [...form.amenities, amenityInput.trim()]); setAmenityInput(''); } };
  const removeAmenity = (i: number) => set('amenities', form.amenities.filter((_, idx) => idx !== i));

  const addNearby = () => { if (nearbyInput.name.trim()) { set('nearby_places', [...form.nearby_places, { ...nearbyInput }]); setNearbyInput({ name: '', type: '', distance: '' }); } };
  const removeNearby = (i: number) => set('nearby_places', form.nearby_places.filter((_, idx) => idx !== i));

  const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20';
  const labelCls = 'block text-xs font-medium text-muted mb-1.5';

  return (
    <div dir={dir} className='max-w-4xl'>
      <h1 className='font-display text-2xl font-bold'>إضافة عقار جديد</h1>

      <div className='mt-6 flex gap-1 overflow-x-auto border-b'>
        {TABS.map((t, i) => (
          <button key={t.key} onClick={() => setStep(i)} className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all ${step === i ? 'border-b-2 border-primary text-primary' : step > i ? 'text-emerald-600' : 'text-muted hover:text-foreground'}`}>
            <t.icon className='h-4 w-4' />{t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className='mt-6 space-y-6'>
          {/* TAB 0: Basic Info */}
          {step === 0 && (
            <div className='rounded-xl border p-6 space-y-5'>
              <h3 className='font-display text-sm font-semibold'>معلومات العقار الأساسية</h3>
              <div><label className={labelCls}>عنوان العقار *</label><input required value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} placeholder='مثال: فيلا فاخرة للبيع في حي النرجس' /></div>
              <div><label className={labelCls}>الوصف</label><textarea rows={4} value={form.description || ''} onChange={e => set('description', e.target.value)} className={inputCls} placeholder='وصف تفصيلي للعقار...' /></div>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div><label className={labelCls}>الغرض *</label><select value={form.purpose} onChange={e => set('purpose', e.target.value)} className={inputCls}><option value='sale'>بيع</option><option value='rent'>إيجار</option></select></div>
                <div><label className={labelCls}>النوع *</label><select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}><option value='apartment'>شقة</option><option value='villa'>فيلا</option><option value='land'>أرض</option><option value='office'>مكتب</option><option value='commercial'>تجاري</option><option value='warehouse'>مستودع</option><option value='building'>مبنى</option></select></div>
                <div><label className={labelCls}>الحالة</label><select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}><option value='available'>متاح</option><option value='sold'>مباع</option><option value='rented'>مؤجر</option><option value='under_contract'>تحت العقد</option><option value='off_market'>غير متاح</option></select></div>
              </div>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div><label className={labelCls}>اسم المالك</label><input value={form.owner_name} onChange={e => set('owner_name', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>جوال المالك</label><input value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>رابط فيديو</label><input value={form.video_url || ''} onChange={e => set('video_url', e.target.value)} className={inputCls} placeholder='https://youtube.com/...' /></div>
              </div>
            </div>
          )}

          {/* TAB 1: Details */}
          {step === 1 && (
            <div className='rounded-xl border p-6 space-y-5'>
              <h3 className='font-display text-sm font-semibold'>تفاصيل العقار</h3>
              <div className='grid gap-4 sm:grid-cols-4'>
                <div><label className={labelCls}>غرف النوم</label><input type='number' min='0' value={form.bedrooms || ''} onChange={e => set('bedrooms', parseInt(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>الحمامات</label><input type='number' min='0' value={form.bathrooms || ''} onChange={e => set('bathrooms', parseInt(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>مجلس</label><input type='number' min='0' value={form.living_rooms || ''} onChange={e => set('living_rooms', parseInt(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>مطابخ</label><input type='number' min='0' value={form.kitchens || ''} onChange={e => set('kitchens', parseInt(e.target.value) || 0)} className={inputCls} /></div>
              </div>
              <div className='grid gap-4 sm:grid-cols-4'>
                <div><label className={labelCls}>مواقف السيارات</label><input type='number' min='0' value={form.parking_spots || ''} onChange={e => set('parking_spots', parseInt(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>الأدوار</label><input type='number' min='0' value={form.floors || ''} onChange={e => set('floors', parseInt(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>سنة البناء</label><input type='number' min='1900' max='2030' value={form.year_built || ''} onChange={e => set('year_built', parseInt(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>عرض الشارع (م)</label><input type='number' min='0' value={form.street_width || ''} onChange={e => set('street_width', parseInt(e.target.value) || 0)} className={inputCls} /></div>
              </div>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div><label className={labelCls}>التأثيث</label><select value={form.furnished} onChange={e => set('furnished', e.target.value)} className={inputCls}><option value='furnished'>مفروش</option><option value='semi_furnished'>نصف مفروش</option><option value='unfurnished'>غير مفروش</option></select></div>
                <div><label className={labelCls}>المساحة</label><input type='number' min='0' value={form.area || ''} onChange={e => set('area', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>مساحة الأرض</label><input type='number' min='0' value={form.land_area || ''} onChange={e => set('land_area', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
              </div>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div><label className={labelCls}>مساحة البناء</label><input type='number' min='0' value={form.building_area || ''} onChange={e => set('building_area', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>رقم الصك</label><input value={form.deed_number} onChange={e => set('deed_number', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>رقم القطعة</label><input value={form.plot_number} onChange={e => set('plot_number', e.target.value)} className={inputCls} /></div>
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div><label className={labelCls}>رقم رخصة البناء</label><input value={form.license_number} onChange={e => set('license_number', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>رقم العقار</label><input value={form.property_number} onChange={e => set('property_number', e.target.value)} className={inputCls} /></div>
              </div>

              <div>
                <p className='text-xs font-medium text-muted mb-2'>المرافق والخدمات</p>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                  {[{ key: 'has_electricity', label: 'الكهرباء' }, { key: 'has_water', label: 'الماء' }, { key: 'has_sewage', label: 'الصرف الصحي' }, { key: 'has_gas', label: 'الغاز' }].map(item => (
                    <label key={item.key} className='flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/5'>
                      <input type='checkbox' checked={form[item.key as keyof typeof form] as boolean} onChange={e => set(item.key, e.target.checked)} className='rounded border-border' />
                      <span className='text-sm'>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>وسائل الراحة (Amenities)</label>
                <div className='flex flex-wrap gap-1.5 mb-2'>
                  {form.amenities.map((a, i) => (
                    <span key={i} className='inline-flex items-center gap-1 rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary'>{a}<button type='button' onClick={() => removeAmenity(i)} className='text-primary/60 hover:text-primary'><X className='h-3 w-3' /></button></span>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())} className='flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' placeholder='أضف وسيلة راحة...' />
                  <button type='button' onClick={addAmenity} className='rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20'><Plus className='h-4 w-4' /></button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pricing */}
          {step === 2 && (
            <div className='rounded-xl border p-6 space-y-5'>
              <h3 className='font-display text-sm font-semibold'>معلومات السعر</h3>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div><label className={labelCls}>السعر *</label><input type='number' required min='0' value={form.price || ''} onChange={e => set('price', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>العملة</label><select value={form.currency} onChange={e => set('currency', e.target.value)} className={inputCls}><option value='SAR'>ريال سعودي</option><option value='USD'>دولار</option><option value='AED'>درهم إماراتي</option><option value='EGP'>جنيه مصري</option></select></div>
              </div>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div><label className={labelCls}>سعر المتر</label><input type='number' min='0' value={form.price_per_meter || ''} onChange={e => set('price_per_meter', parseFloat(e.target.value) || 0)} className={inputCls} /></div>
                <div><label className={labelCls}>مدة الإيجار (للإيجار)</label><select value={form.rent_period} onChange={e => set('rent_period', e.target.value)} className={inputCls}><option value=''>اختر</option><option value='monthly'>شهري</option><option value='yearly'>سنوي</option></select></div>
                <div className='flex items-end pb-1'>
                  <label className='flex items-center gap-2 text-sm cursor-pointer'><input type='checkbox' checked={form.is_negotiable} onChange={e => set('is_negotiable', e.target.checked)} className='rounded border-border' /> قابل للتفاوض</label>
                </div>
              </div>
              <label className='flex items-center gap-2 text-sm cursor-pointer'><input type='checkbox' checked={form.has_mortgage} onChange={e => set('has_mortgage', e.target.checked)} className='rounded border-border' /> متاح للتمويل العقاري</label>
            </div>
          )}

          {/* TAB 3: Location */}
          {step === 3 && (
            <div className='rounded-xl border p-6 space-y-5'>
              <h3 className='font-display text-sm font-semibold'>موقع العقار</h3>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div><label className={labelCls}>المدينة *</label><input required value={form.city} onChange={e => set('city', e.target.value)} className={inputCls} placeholder='الرياض' /></div>
                <div><label className={labelCls}>الحي</label><input value={form.district || ''} onChange={e => set('district', e.target.value)} className={inputCls} placeholder='حي النرجس' /></div>
                <div><label className={labelCls}>الحي (تحديد أكثر)</label><input value={form.neighborhood || ''} onChange={e => set('neighborhood', e.target.value)} className={inputCls} placeholder='الفرعية' /></div>
              </div>
              <div><label className={labelCls}>العنوان</label><input value={form.address || ''} onChange={e => set('address', e.target.value)} className={inputCls} placeholder='العنوان الكامل' /></div>
              <div><label className={labelCls}>اختر الموقع على الخريطة</label><LeafletMapInput latitude={form.latitude} longitude={form.longitude} city={form.city} onChange={(lat, lng) => { set('latitude', lat); set('longitude', lng); }} onAddressChange={addr => set('address', addr)} height='350px' /></div>

              <div>
                <label className={labelCls}>أماكن قريبة</label>
                {form.nearby_places.map((p, i) => (
                  <div key={i} className='flex items-center gap-2 rounded-lg border p-2 mb-2'>
                    <span className='flex-1 text-sm'>{p.name} ({p.type}) - {p.distance}</span>
                    <button type='button' onClick={() => removeNearby(i)} className='text-destructive hover:text-destructive/80'><X className='h-3.5 w-3.5' /></button>
                  </div>
                ))}
                <div className='grid grid-cols-3 gap-2'>
                  <input value={nearbyInput.name} onChange={e => setNearbyInput(p => ({ ...p, name: e.target.value }))} className='rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' placeholder='الاسم' />
                  <select value={nearbyInput.type} onChange={e => setNearbyInput(p => ({ ...p, type: e.target.value }))} className='rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value=''>النوع</option><option value='school'>مدرسة</option><option value='mosque'>مسجد</option><option value='hospital'>مستشفى</option><option value='mall'>مول</option><option value='park'>حديقة</option><option value='restaurant'>مطعم</option><option value='bank'>بنك</option></select>
                  <div className='flex gap-1'>
                    <input value={nearbyInput.distance} onChange={e => setNearbyInput(p => ({ ...p, distance: e.target.value }))} className='flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' placeholder='المسافة' />
                    <button type='button' onClick={addNearby} className='rounded-lg bg-primary px-2.5 text-white hover:bg-primary-light'><Plus className='h-4 w-4' /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Media */}
          {step === 4 && (
            <div className='rounded-xl border p-6 space-y-6'>
              <h3 className='font-display text-sm font-semibold'>الصور والوسائط</h3>
              <div><label className={labelCls}>الصورة الرئيسية</label><input value={form.featured_image || ''} onChange={e => set('featured_image', e.target.value)} className={inputCls} placeholder='رابط الصورة الرئيسية' /></div>

              <div className='space-y-6'>
                {[
                  { key: 'images_bathroom', label: 'صور الحمامات' },
                  { key: 'images_bedroom', label: 'صور غرف النوم' },
                  { key: 'images_living', label: 'صور المجلس' },
                  { key: 'images_kitchen', label: 'صور المطبخ' },
                  { key: 'images_facilities', label: 'صور المرافق' },
                  { key: 'images_exterior', label: 'صور الواجهة' },
                  { key: 'images_other', label: 'صور أخرى' },
                ].map(cat => (
                  <div key={cat.key} className='rounded-lg border p-4'>
                    <label className={labelCls}>{cat.label}</label>
                    <ImageManager
                      images={form[cat.key as keyof typeof form] as string[]}
                      onChange={(imgs) => set(cat.key, imgs)}
                      category={cat.key.replace('images_', '')}
                    />
                  </div>
                ))}
              </div>

              <div className='rounded-xl border-2 border-dashed border-gold/30 bg-gold/[0.02] p-6'>
                <h4 className='font-display text-sm font-semibold text-gold mb-3'>صور إضافية</h4>
                <p className='text-xs text-muted mb-3'>يمكنك إضافة صور إضافية غير مصنفة</p>
                <ImageManager
                  images={form.additional_images}
                  onChange={(imgs) => set('additional_images', imgs)}
                  category='additional'
                  maxImages={50}
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div><label className={labelCls}>رابط الجولة الافتراضية</label><input value={form.virtual_tour_url || ''} onChange={e => set('virtual_tour_url', e.target.value)} className={inputCls} placeholder='https://tour.example.com/...' /></div>
              </div>
            </div>
          )}

          {/* TAB 5: Features */}
          {step === 5 && (
            <div className='rounded-xl border p-6 space-y-5'>
              <h3 className='font-display text-sm font-semibold'>الميزات والخصائص</h3>
              <div>
                <label className={labelCls}>الميزات</label>
                <div className='flex flex-wrap gap-1.5 mb-2'>
                  {form.features.map((f, i) => (
                    <span key={i} className='inline-flex items-center gap-1 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary'>
                      {f}<button type='button' onClick={() => removeFeature(i)} className='text-primary/60 hover:text-primary'><X className='h-3 w-3' /></button>
                    </span>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} className='flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary' placeholder='مثال: مسبح، حديقة خاصة، مصعد...' />
                  <button type='button' onClick={addFeature} className='rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-light transition-all'>إضافة</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className='mt-8 flex items-center justify-between border-t pt-6'>
          <button type='button' onClick={prev} disabled={step === 0} className='flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted hover:bg-muted/10 disabled:opacity-40 transition-all'>
            <ChevronRight className='h-4 w-4' />السابق
          </button>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted'>الخطوة {step + 1} من {TABS.length}</span>
          </div>
          {step === TABS.length - 1 ? (
            <button type='submit' disabled={saving} className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60 transition-all'>
              {saving && <Loader2 className='h-4 w-4 animate-spin' />}
              <Save className='h-4 w-4' />نشر العقار
            </button>
          ) : (
            <button type='button' onClick={next} className='flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light transition-all'>
              التالي<ChevronLeft className='h-4 w-4' />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
