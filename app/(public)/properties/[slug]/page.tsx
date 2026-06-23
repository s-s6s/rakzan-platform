'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { PropertyMap } from '@/components/property/PropertyMap';
import { formatPrice, formatArea, getStatusText, getPurposeBadge } from '@/lib/utils/format';
import { ArrowLeft, MapPin, Bed, Bath, Maximize2, Calendar, Building, Ruler, FileText, CheckCircle, Send, Phone, Mail, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Property } from '@/types/property';

const imageCategories = [
  { key: 'images_bathroom', label: 'الحمامات' },
  { key: 'images_bedroom', label: 'غرف النوم' },
  { key: 'images_living', label: 'الصالات' },
  { key: 'images_kitchen', label: 'المطابخ' },
  { key: 'images_facilities', label: 'المرافق' },
  { key: 'images_exterior', label: 'الواجهة' },
  { key: 'images_other', label: 'أخرى' },
] as const;

export default function PropertyDetailPage() {
  const { t, dir } = useLocale();
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('featured');
  const [imgIndex, setImgIndex] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/properties/${params.slug}`);
        if (!res.ok) return;
        const data = await res.json();
        setProperty(data.data || data);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [params.slug]);

  const handleInquiry = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inquiryForm, property_id: property?.id }),
      });
      if (res.ok) { setSubmitted(true); setInquiryForm({ name: '', phone: '', email: '', message: '' }); }
    } catch {} finally { setSubmitting(false); }
  }, [inquiryForm, property?.id]);

  if (loading) return <div className='py-20 text-center text-muted'><Loader2 className='mx-auto h-8 w-8 animate-spin' /></div>;
  if (!property) return (
    <div dir={dir} className='py-8'>
      <div className='container'>
        <Link href='/properties' className='mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-primary'><ArrowLeft className='h-4 w-4' />{t('common.back')}</Link>
        <p className='text-center text-muted py-20'>{t('property.not_found')}</p>
      </div>
    </div>
  );

  const allImages = property.featured_image ? [property.featured_image] : [];
  const catImages = imageCategories.flatMap(c => (property[c.key as keyof Property] as string[]) || []);
  const displayImages = activeCat === 'featured' ? allImages : (property[activeCat as keyof Property] as string[]) || [];
  const badge = getPurposeBadge(property.purpose, 'ar');
  const statusText = getStatusText(property.status, 'ar');

  return (
    <div dir={dir} className='py-6'>
      <div className='container'>
        <Link href='/properties' className='mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-primary'><ArrowLeft className='h-4 w-4' />{t('common.back')}</Link>

        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='lg:col-span-2 space-y-6'>
            <div className='relative overflow-hidden rounded-xl bg-black/5'>
              <img src={displayImages[imgIndex] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'} alt={property.title} className='h-80 w-full object-cover' />
              {displayImages.length > 1 && (
                <div className='absolute inset-0 flex items-center justify-between px-2'>
                  <button onClick={() => setImgIndex(i => (i - 1 + displayImages.length) % displayImages.length)} className='rounded-full bg-white/80 p-1.5 shadow hover:bg-white'><ChevronRight className='h-4 w-4' /></button>
                  <button onClick={() => setImgIndex(i => (i + 1) % displayImages.length)} className='rounded-full bg-white/80 p-1.5 shadow hover:bg-white'><ChevronLeft className='h-4 w-4' /></button>
                </div>
              )}
            </div>

            <div className='flex gap-2 overflow-x-auto pb-1 flex-wrap'>
              <button onClick={() => { setActiveCat('featured'); setImgIndex(0); }} className={`shrink-0 rounded-md border-2 px-3 py-1 text-xs font-medium ${activeCat === 'featured' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted'}`}>الرئيسية</button>
              {imageCategories.map(cat => {
                const imgs = (property[cat.key as keyof Property] as string[]) || [];
                if (!imgs.length) return null;
                return (
                  <button key={cat.key} onClick={() => { setActiveCat(cat.key); setImgIndex(0); }} className={`shrink-0 rounded-md border-2 px-3 py-1 text-xs font-medium ${activeCat === cat.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted'}`}>
                    {cat.label} ({imgs.length})
                  </button>
                );
              })}
            </div>

            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                <span className='rounded-full bg-muted/20 px-2.5 py-0.5 text-xs text-muted'>{statusText}</span>
              </div>
              <h1 className='mt-2 font-display text-2xl font-bold'>{property.title}</h1>
              <p className='mt-1 flex items-center gap-1 text-sm text-muted'><MapPin className='h-3.5 w-3.5 shrink-0' />{property.city}{property.district ? `، ${property.district}` : ''}</p>
              <p className='mt-4 text-3xl font-bold text-primary'>{formatPrice(property.price)}</p>
            </div>

            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <SpecItem icon={<Maximize2 className='h-4 w-4' />} label={t('property.area')} value={formatArea(property.area)} />
              {property.bedrooms != null && <SpecItem icon={<Bed className='h-4 w-4' />} label={t('property.bedrooms')} value={`${property.bedrooms}`} />}
              {property.bathrooms != null && <SpecItem icon={<Bath className='h-4 w-4' />} label={t('property.bathrooms')} value={`${property.bathrooms}`} />}
              {property.year_built != null && <SpecItem icon={<Calendar className='h-4 w-4' />} label={t('property.year_built')} value={`${property.year_built}`} />}
              {property.floors != null && <SpecItem icon={<Building className='h-4 w-4' />} label={t('property.floors')} value={`${property.floors}`} />}
              {property.street_width != null && <SpecItem icon={<Ruler className='h-4 w-4' />} label={t('property.street_width')} value={`${property.street_width} م`} />}
              {property.deed_number && <SpecItem icon={<FileText className='h-4 w-4' />} label={t('property.deed_number')} value={property.deed_number} />}
            </div>

            <div>
              <h2 className='font-display text-lg font-semibold'>{t('property.details')}</h2>
              <p className='mt-1 leading-relaxed text-muted whitespace-pre-line'>{property.description}</p>
            </div>

            {property.features?.length > 0 && (
              <div>
                <h2 className='font-display text-lg font-semibold'>{t('property.features')}</h2>
                <div className='mt-2 grid gap-1.5 sm:grid-cols-2'>
                  {property.features.map((f, i) => (
                    <div key={i} className='flex items-center gap-2 text-sm text-muted'><CheckCircle className='h-3.5 w-3.5 shrink-0 text-accent' />{f}</div>
                  ))}
                </div>
              </div>
            )}

            {property.latitude && property.longitude && (
              <div>
                <h2 className='mb-2 font-display text-lg font-semibold'>{t('property.location')}</h2>
                <PropertyMap latitude={property.latitude} longitude={property.longitude} title={property.title} />
              </div>
            )}
          </div>

          <div className='space-y-4'>
            <div className='rounded-lg border bg-card p-4'>
              <h3 className='font-display text-base font-semibold'>{t('property.inquiry')}</h3>
              {submitted ? (
                <div className='mt-3 rounded-lg bg-success/10 p-3 text-center text-sm text-success'>{t('property.inquiry_success')}</div>
              ) : (
                <form onSubmit={handleInquiry} className='mt-3 space-y-3'>
                  <input required value={inquiryForm.name} onChange={e => setInquiryForm(f => ({ ...f, name: e.target.value }))} placeholder={t('property.inquiry_name')} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
                  <input required value={inquiryForm.phone} onChange={e => setInquiryForm(f => ({ ...f, phone: e.target.value }))} placeholder={t('property.inquiry_phone')} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
                  <input type='email' value={inquiryForm.email} onChange={e => setInquiryForm(f => ({ ...f, email: e.target.value }))} placeholder={t('property.inquiry_email')} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
                  <textarea rows={3} value={inquiryForm.message} onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))} placeholder={t('property.inquiry_message')} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' />
                  <button type='submit' disabled={submitting} className='flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60'>
                    {submitting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
                    {t('property.inquiry_submit')}
                  </button>
                </form>
              )}
            </div>

            <div className='rounded-lg border bg-card p-4 space-y-3'>
              <h3 className='font-display text-base font-semibold'>معلومات الاتصال</h3>
              <a href='tel:+966500000000' className='flex items-center gap-2 text-sm text-muted hover:text-primary'><Phone className='h-4 w-4' />+966 50 000 0000</a>
              <a href='mailto:info@rakzan.com' className='flex items-center gap-2 text-sm text-muted hover:text-primary'><Mail className='h-4 w-4' />info@rakzan.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className='rounded-lg border bg-card p-3'>
      <div className='flex items-center gap-1.5 text-xs text-muted'>{icon}{label}</div>
      <p className='mt-0.5 font-display text-sm font-semibold'>{value}</p>
    </div>
  );
}
