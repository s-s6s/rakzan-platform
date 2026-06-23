'use client';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { formatPrice, formatArea, getPurposeBadge } from '@/lib/utils/format';
import { MapPin, Bed, Bath, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Property } from '@/types/property';
interface Props { property: Property; view?: 'grid' | 'list'; }
export function PropertyCard({ property, view = 'grid' }: Props) {
  const { locale, dir } = useLocale();
  const badge = getPurposeBadge(property.purpose, locale);
  const isGrid = view === 'grid';
  return (
    <Link href={`/properties/${property.slug}`} className={cn('group block overflow-hidden rounded-lg bg-card shadow-sm border border-border transition-all hover:shadow-md', !isGrid && 'md:flex')} dir={dir}>
      <div className={cn('relative overflow-hidden', isGrid ? 'aspect-[4/3]' : 'md:w-80 md:shrink-0 h-48 md:h-auto')}>
        <img src={property.featured_image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'} alt={locale === 'ar' ? property.title_ar : property.title_en || property.title_ar} className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110' />
        <span className={cn('absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-medium', badge.className)}>{badge.label}</span>
      </div>
      <div className='p-4 flex-1'>
        <h3 className='font-display text-base font-semibold leading-snug line-clamp-1'>{locale === 'ar' ? property.title_ar : property.title_en || property.title_ar}</h3>
        <div className='mt-1 flex items-center gap-1 text-xs text-muted'><MapPin className='h-3 w-3' /><span>{locale === 'ar' ? property.city_ar : property.city_en || property.city_ar}</span></div>
        <div className='mt-2 flex items-center gap-4 text-xs text-muted'>
          {property.bedrooms != null && <span className='flex items-center gap-1'><Bed className='h-3.5 w-3.5' />{property.bedrooms}</span>}
          {property.bathrooms != null && <span className='flex items-center gap-1'><Bath className='h-3.5 w-3.5' />{property.bathrooms}</span>}
          <span className='flex items-center gap-1'><Maximize2 className='h-3.5 w-3.5' />{formatArea(property.area)}</span>
        </div>
        <p className='mt-2 font-display text-lg font-bold text-primary'>{formatPrice(property.price)}</p>
      </div>
    </Link>
  );
}
