export function formatPrice(price: number, currency: string = 'SAR'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
}
export function formatArea(area: number, unit: string = 'sqm'): string {
  return `${new Intl.NumberFormat('en-US').format(area)} ${unit === 'sqm' ? 'م²' : unit}`;
}
export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}
export function getStatusText(status: string, locale: 'ar' | 'en' = 'ar'): string {
  const map: Record<string, Record<string, string>> = {
    available: { ar: 'متاح', en: 'Available' },
    sold: { ar: 'مباع', en: 'Sold' },
    rented: { ar: 'مؤجر', en: 'Rented' },
    under_contract: { ar: 'تحت التعاقد', en: 'Under Contract' },
    off_market: { ar: 'غير متاح', en: 'Off Market' },
    sale: { ar: 'بيع', en: 'For Sale' },
    rent: { ar: 'إيجار', en: 'For Rent' },
    active: { ar: 'نشط', en: 'Active' },
    inactive: { ar: 'غير نشط', en: 'Inactive' },
    lead: { ar: 'عميل محتمل', en: 'Lead' },
  };
  return map[status]?.[locale] || status;
}
export function getPurposeBadge(purpose: string, locale: 'ar' | 'en' = 'ar'): { label: string; className: string } {
  const isSale = purpose === 'sale';
  return {
    label: isSale ? (locale === 'ar' ? 'بيع' : 'For Sale') : locale === 'ar' ? 'إيجار' : 'For Rent',
    className: isSale ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };
}
