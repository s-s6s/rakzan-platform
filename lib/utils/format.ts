export function formatPrice(price: number, currency = 'SAR', showSymbol = true): string {
  if (price === null || price === undefined) return '-';
  const symbols: Record<string, string> = { SAR: 'ر.س', USD: '$', AED: 'د.إ', QAR: 'ر.ق', KWD: 'د.ك', BHD: 'د.ب', OMR: 'ر.ع', EGP: 'ج.م' };
  const formatted = price.toLocaleString('ar-SA');
  if (!showSymbol) return formatted;
  const sym = symbols[currency] || currency;
  return `${formatted} ${sym}`;
}

export function formatDate(date: string | Date, showTime = false): string {
  if (!date) return '-';
  const d = new Date(date);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  if (showTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
  return d.toLocaleDateString('ar-SA', opts);
}

export function formatNumber(num: number): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('ar-SA');
}

export function formatArea(area: number | null, unit = 'م²'): string {
  if (!area) return '-';
  return `${area.toLocaleString('ar-SA')} ${unit}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 2592000) return `منذ ${Math.floor(diff / 86400)} يوم`;
  if (diff < 31536000) return `منذ ${Math.floor(diff / 2592000)} شهر`;
  return `منذ ${Math.floor(diff / 31536000)} سنة`;
}

export function statusLabel(status: string, type: 'property' | 'client' | 'inquiry' | 'contract' | 'payment' | 'appointment'): string {
  const labels: Record<string, Record<string, string>> = {
    property: { available: 'متاح', sold: 'مباع', rented: 'مؤجر', under_contract: 'تحت العقد', off_market: 'غير متاح' },
    client: { active: 'نشط', inactive: 'غير نشط', lead: 'عميل محتمل' },
    inquiry: { new: 'جديد', contacted: 'تم الاتصال', converted: 'تم التحويل', closed: 'مغلق' },
    contract: { active: 'نشط', expired: 'منتهي', terminated: 'ملغي', draft: 'مسودة' },
    payment: { pending: 'قيد الانتظار', paid: 'مدفوع', overdue: 'متأخر', cancelled: 'ملغي' },
    appointment: { scheduled: 'مجدول', completed: 'مكتمل', cancelled: 'ملغي', rescheduled: 'إعادة جدولة' },
  };
  return labels[type]?.[status] || status;
}

export function statusColor(status: string, type: 'property' | 'client' | 'inquiry' | 'contract' | 'payment' | 'appointment'): string {
  const colors: Record<string, Record<string, string>> = {
    property: { available: 'bg-emerald-100 text-emerald-800', sold: 'bg-blue-100 text-blue-800', rented: 'bg-purple-100 text-purple-800', under_contract: 'bg-amber-100 text-amber-800', off_market: 'bg-gray-100 text-gray-800' },
    client: { active: 'bg-emerald-100 text-emerald-800', inactive: 'bg-gray-100 text-gray-800', lead: 'bg-amber-100 text-amber-800' },
    inquiry: { new: 'bg-blue-100 text-blue-800', contacted: 'bg-amber-100 text-amber-800', converted: 'bg-emerald-100 text-emerald-800', closed: 'bg-gray-100 text-gray-800' },
    contract: { active: 'bg-emerald-100 text-emerald-800', expired: 'bg-gray-100 text-gray-800', terminated: 'bg-red-100 text-red-800', draft: 'bg-amber-100 text-amber-800' },
    payment: { pending: 'bg-amber-100 text-amber-800', paid: 'bg-emerald-100 text-emerald-800', overdue: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-800' },
    appointment: { scheduled: 'bg-blue-100 text-blue-800', completed: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-red-100 text-red-800', rescheduled: 'bg-amber-100 text-amber-800' },
  };
  return colors[type]?.[status] || 'bg-gray-100 text-gray-800';
}

export function clientTypeLabel(type: string): string {
  const map: Record<string, string> = { buyer: 'مشتري', seller: 'بائع', tenant: 'مستأجر', landlord: 'مالك', investor: 'مستثمر', other: 'آخر' };
  return map[type] || type;
}

export function propertyTypeLabel(type: string): string {
  const map: Record<string, string> = { apartment: 'شقة', villa: 'فيلا', land: 'أرض', office: 'مكتب', commercial: 'تجاري', warehouse: 'مستودع', building: 'مبنى' };
  return map[type] || type;
}

export function propertyPurposeLabel(purpose: string): string {
  const map: Record<string, string> = { sale: 'بيع', rent: 'إيجار' };
  return map[purpose] || purpose;
}

export function furnishedLabel(value: string): string {
  const map: Record<string, string> = { furnished: 'مفروش', semi_furnished: 'نصف مفروش', unfurnished: 'غير مفروش' };
  return map[value] || value;
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = { super_admin: 'مدير عام', manager: 'مدير', agent: 'وسيط', viewer: 'مشاهد', client: 'عميل' };
  return map[role] || role;
}

export function paymentMethodLabel(method: string): string {
  const map: Record<string, string> = { cash: 'نقداً', bank_transfer: 'تحويل بنكي', check: 'شيك', credit_card: 'بطاقة ائتمان', other: 'آخر' };
  return map[method] || method;
}

export function appointmentTypeLabel(type: string): string {
  const map: Record<string, string> = { visit: 'زيارة عقار', meeting: 'اجتماع', call: 'مكالمة', other: 'آخر' };
  return map[type] || type;
}

export function activityActionLabel(action: string): string {
  const map: Record<string, string> = { created: 'إنشاء', updated: 'تحديث', deleted: 'حذف', viewed: 'مشاهدة', contacted: 'اتصال', converted: 'تحويل', signed: 'توقيع', paid: 'دفع', imported: 'استيراد', exported: 'تصدير' };
  return map[action] || action;
}

export function activityEntityLabel(entity: string): string {
  const map: Record<string, string> = { property: 'عقار', client: 'عميل', contract: 'عقد', payment: 'دفعة', appointment: 'موعد', inquiry: 'استفسار', user: 'مستخدم', setting: 'إعدادات', template: 'قالب' };
  return map[entity] || entity;
}

export function contractTypeLabel(type: string): string {
  const map: Record<string, string> = { sale: 'بيع', rent: 'إيجار', lease: 'تأجير طويل', management: 'إدارة' };
  return map[type] || type;
}

// Backwards compatibility
export function getStatusText(status: string, _locale?: string): string {
  return statusLabel(status, 'property');
}
export function getPurposeBadge(purpose: string, _locale?: string): { label: string; className: string } {
  const label = propertyPurposeLabel(purpose);
  const className = purpose === 'sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800';
  return { label, className };
}
