# Restore all project files for Rakzan Al-Ufuq Platform
# Run from project root: powershell -ExecutionPolicy Bypass .\scripts\restore-all.ps1

$root = "C:\Users\Mohammed\Desktop\Rakzan\rakzan-platform"

function Write-File {
  param($Path, $Content)
  $full = Join-Path $root $Path
  $dir = Split-Path $full -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  Set-Content -Path $full -Value $Content -Encoding UTF8 -Force
  Write-Host "  $Path" -ForegroundColor Gray
}

Write-Host "=== Restoring Rakzan Platform Files ===" -ForegroundColor Cyan

# === CONFIG ===
Write-Host "Config files..." -ForegroundColor Yellow

# === TYPES ===
Write-Host "Types..." -ForegroundColor Yellow
Write-File "types/property.ts" @"
export type PropertyStatus = "available" | "sold" | "rented" | "under_contract" | "off_market";
export type PropertyPurpose = "sale" | "rent";
export type PropertyType = "apartment" | "villa" | "land" | "office" | "commercial" | "warehouse" | "building";
export type UserRole = "super_admin" | "manager" | "agent" | "viewer" | "client";
export interface Property {
  id: string; created_at: string; updated_at: string;
  title_ar: string; title_en: string | null; description_ar: string; description_en: string | null;
  slug: string; status: PropertyStatus; purpose: PropertyPurpose; type: PropertyType;
  price: number; currency: string; area: number; area_unit: string;
  bedrooms: number | null; bathrooms: number | null; year_built: number | null;
  floors: number | null; deed_number: string | null; street_width: number | null;
  latitude: number | null; longitude: number | null;
  address_ar: string | null; address_en: string | null;
  city_ar: string; city_en: string | null; district_ar: string | null; district_en: string | null;
  images: string[]; featured_image: string | null; features: string[];
  owner_id: string | null; is_featured: boolean; views_count: number;
  meta_title_ar: string | null; meta_title_en: string | null;
  meta_description_ar: string | null; meta_description_en: string | null;
}
export interface Client {
  id: string; created_at: string; name: string; phone: string; email: string | null;
  type: "buyer"|"seller"|"tenant"|"landlord"|"investor"|"other";
  status: "active"|"inactive"|"lead"; notes: string | null; city: string | null;
  preferred_contact: "phone"|"email"|"whatsapp"|null;
}
export interface Inquiry {
  id: string; created_at: string; property_id: string | null; property?: Property | null;
  client_id: string | null; client?: Client | null;
  name: string; phone: string; email: string | null; message: string;
  status: "new"|"contacted"|"converted"|"closed"; source: string | null;
}
export interface Contract {
  id: string; created_at: string; contract_number: string;
  property_id: string; property?: Property | null; client_id: string; client?: Client | null;
  type: "sale"|"rent"|"lease"|"management";
  start_date: string; end_date: string | null; amount: number;
  status: "active"|"expired"|"terminated"|"draft";
  terms: string | null; file_url: string | null;
}
export interface Payment {
  id: string; created_at: string; contract_id: string; contract?: Contract | null;
  amount: number; due_date: string; paid_date: string | null;
  status: "pending"|"paid"|"overdue"|"cancelled";
  method: "cash"|"bank_transfer"|"check"|"credit_card"|"other";
  reference: string | null; notes: string | null;
}
export interface Appointment {
  id: string; created_at: string; property_id: string | null; property?: Property | null;
  client_id: string | null; client?: Client | null; agent_id: string | null;
  title: string; date: string; time: string;
  status: "scheduled"|"completed"|"cancelled"|"rescheduled"; notes: string | null;
}
export interface Notification {
  id: string; created_at: string; user_id: string;
  title_ar: string; title_en: string | null; body_ar: string; body_en: string | null;
  type: "inquiry"|"contract"|"payment"|"appointment"|"system";
  is_read: boolean; link: string | null;
}
export interface Favorite {
  id: string; user_id: string; property_id: string; property?: Property | null; created_at: string;
}
"@

# === I18N ===
Write-Host "i18n..." -ForegroundColor Yellow
Write-File "i18n/ar.json" '{ "nav.home": "الرئيسية", "nav.properties": "العقارات", "nav.about": "من نحن", "nav.contact": "اتصل بنا", "nav.favorites": "المفضلة", "nav.dashboard": "لوحة التحكم", "nav.login": "تسجيل الدخول", "nav.register": "إنشاء حساب", "nav.logout": "تسجيل الخروج", "hero.title": "شريكك الموثوق في العقارات", "hero.subtitle": "نحوِّل أحكامَكم العقارية إلى واقع — بأمان، احترافية، وثقة.", "hero.cta": "استعرض العقارات", "hero.cta_secondary": "اتصل بنا", "home.featured": "عقارات مميزة", "home.featured_desc": "اكتشف أفضل العقارات المتاحة في السعودية", "home.why_us": "لماذا ركزان الأفق؟", "home.why_us_desc": "خبرة، نزاهة، ونتائج ملموسة", "home.contact_strip": "هل تبحث عن عقار أحلامك؟", "home.contact_strip_desc": "فريقنا مستعد لمساعدتك في العثور على العقار المناسب", "home.contact_cta": "تواصل معنا", "property.details": "تفاصيل العقار", "property.price": "السعر", "property.area": "المساحة", "property.bedrooms": "غرف النوم", "property.bathrooms": "دورات المياه", "property.type": "النوع", "property.status": "الحالة", "property.purpose": "الغرض", "property.year_built": "سنة البناء", "property.floors": "عدد الأدوار", "property.deed_number": "رقم الصك", "property.street_width": "عرض الشارع", "property.features": "المميزات", "property.location": "الموقع", "property.inquiry": "استفسار عن العقار", "property.inquiry_name": "الاسم", "property.inquiry_phone": "رقم الجوال", "property.inquiry_email": "البريد الإلكتروني", "property.inquiry_message": "رسالتك", "property.inquiry_submit": "إرسال الاستفسار", "property.inquiry_success": "تم إرسال استفسارك بنجاح", "property.not_found": "العقار غير موجود", "properties.title": "عقاراتنا", "properties.search": "بحث عن عقار...", "properties.filter_purpose": "الغرض", "properties.filter_type": "النوع", "properties.filter_city": "المدينة", "properties.filter_status": "الحالة", "properties.all": "الكل", "properties.grid": "شبكي", "properties.list": "قائمة", "properties.no_results": "لا توجد نتائج", "about.title": "من نحن", "about.vision": "رؤيتنا", "about.vision_text": "أن نكون الخيار الأول في السوق العقاري السعودي من خلال التميز والشفافية والابتكار.", "about.mission": "رسالتنا", "about.mission_text": "تقديم خدمات عقارية متكاملة تلبي تطلعات عملائنا، مدعومة بأحدث التقنيات وأعلى معايير الجودة.", "contact.title": "تواصل معنا", "contact.name": "الاسم", "contact.email": "البريد الإلكتروني", "contact.phone": "رقم الجوال", "contact.subject": "الموضوع", "contact.message": "الرسالة", "contact.submit": "إرسال", "contact.success": "تم إرسال رسالتك بنجاح، سنتواصل معك قريباً.", "contact.address": "العنوان", "contact.address_value": "الرياض، المملكة العربية السعودية", "contact.phone_value": "+966 55 123 4567", "contact.email_value": "info@rakzan.com", "favorites.title": "عقاراتي المفضلة", "favorites.empty": "لا توجد عقارات في المفضلة", "favorites.add": "إضافة إلى المفضلة", "favorites.remove": "إزالة من المفضلة", "auth.login_title": "تسجيل الدخول", "auth.login_email": "البريد الإلكتروني", "auth.login_password": "كلمة المرور", "auth.login_btn": "دخول", "auth.login_no_account": "ليس لديك حساب؟", "auth.register_title": "إنشاء حساب جديد", "auth.register_name": "الاسم", "auth.register_btn": "إنشاء حساب", "auth.register_have_account": "لديك حساب بالفعل؟", "auth.error_invalid": "بيانات الدخول غير صحيحة", "dashboard.title": "لوحة التحكم", "dashboard.overview": "نظرة عامة", "dashboard.properties": "العقارات", "dashboard.add_property": "إضافة عقار", "dashboard.clients": "العملاء", "dashboard.add_client": "إضافة عميل", "dashboard.inquiries": "الاستفسارات", "dashboard.contracts": "العقود", "dashboard.payments": "المدفوعات", "dashboard.appointments": "المواعيد", "dashboard.reports": "التقارير", "dashboard.notifications": "الإشعارات", "dashboard.settings": "الإعدادات", "dashboard.total_properties": "إجمالي العقارات", "dashboard.active_clients": "العملاء النشطون", "dashboard.pending_inquiries": "الاستفسارات المعلقة", "dashboard.monthly_revenue": "الإيرادات الشهرية", "dashboard.recent_properties": "أحدث العقارات", "dashboard.recent_inquiries": "أحدث الاستفسارات", "dashboard.view_all": "عرض الكل", "dashboard.no_data": "لا توجد بيانات", "common.save": "حفظ", "common.cancel": "إلغاء", "common.edit": "تعديل", "common.delete": "حذف", "common.search": "بحث", "common.filter": "تصفية", "common.export": "تصدير", "common.actions": "إجراءات", "common.loading": "جارٍ التحميل...", "common.error": "حدث خطأ", "common.success": "تم بنجاح", "common.confirm": "تأكيد", "common.yes": "نعم", "common.no": "لا", "common.back": "رجوع", "common.next": "التالي", "common.prev": "السابق", "common.status": "الحالة", "common.created_at": "تاريخ الإنشاء", "common.updated_at": "آخر تحديث" }'

Write-File "i18n/en.json" '{ "nav.home": "Home", "nav.properties": "Properties", "nav.about": "About Us", "nav.contact": "Contact Us", "nav.favorites": "Favorites", "nav.dashboard": "Dashboard", "nav.login": "Login", "nav.register": "Register", "nav.logout": "Logout", "hero.title": "Your Trusted Real Estate Partner", "hero.subtitle": "Turning your real estate decisions into reality — with security, professionalism, and trust.", "hero.cta": "Browse Properties", "hero.cta_secondary": "Contact Us", "home.featured": "Featured Properties", "home.featured_desc": "Discover the best available properties in Saudi Arabia", "home.why_us": "Why Rakzan Al-Ufuq?", "home.why_us_desc": "Experience, integrity, and tangible results", "home.contact_strip": "Looking for your dream property?", "home.contact_strip_desc": "Our team is ready to help you find the right property", "home.contact_cta": "Contact Us", "property.details": "Property Details", "property.price": "Price", "property.area": "Area", "property.bedrooms": "Bedrooms", "property.bathrooms": "Bathrooms", "property.type": "Type", "property.status": "Status", "property.purpose": "Purpose", "property.year_built": "Year Built", "property.floors": "Floors", "property.deed_number": "Deed Number", "property.street_width": "Street Width", "property.features": "Features", "property.location": "Location", "property.inquiry": "Inquire About This Property", "property.inquiry_name": "Name", "property.inquiry_phone": "Phone", "property.inquiry_email": "Email", "property.inquiry_message": "Your Message", "property.inquiry_submit": "Send Inquiry", "property.inquiry_success": "Your inquiry has been sent successfully", "property.not_found": "Property not found", "properties.title": "Our Properties", "properties.search": "Search properties...", "properties.filter_purpose": "Purpose", "properties.filter_type": "Type", "properties.filter_city": "City", "properties.filter_status": "Status", "properties.all": "All", "properties.grid": "Grid", "properties.list": "List", "properties.no_results": "No results found", "about.title": "About Us", "about.vision": "Our Vision", "about.vision_text": "To be the first choice in the Saudi real estate market through excellence, transparency, and innovation.", "about.mission": "Our Mission", "about.mission_text": "Providing integrated real estate services that meet our clients'\'' aspirations, supported by the latest technologies and highest quality standards.", "contact.title": "Contact Us", "contact.name": "Name", "contact.email": "Email", "contact.phone": "Phone", "contact.subject": "Subject", "contact.message": "Message", "contact.submit": "Send", "contact.success": "Your message has been sent successfully. We will contact you soon.", "contact.address": "Address", "contact.address_value": "Riyadh, Saudi Arabia", "contact.phone_value": "+966 55 123 4567", "contact.email_value": "info@rakzan.com", "favorites.title": "My Favorites", "favorites.empty": "No favorite properties yet", "favorites.add": "Add to Favorites", "favorites.remove": "Remove from Favorites", "auth.login_title": "Login", "auth.login_email": "Email", "auth.login_password": "Password", "auth.login_btn": "Sign In", "auth.login_no_account": "Don'\''t have an account?", "auth.register_title": "Create Account", "auth.register_name": "Full Name", "auth.register_btn": "Create Account", "auth.register_have_account": "Already have an account?", "auth.error_invalid": "Invalid credentials", "dashboard.title": "Dashboard", "dashboard.overview": "Overview", "dashboard.properties": "Properties", "dashboard.add_property": "Add Property", "dashboard.clients": "Clients", "dashboard.add_client": "Add Client", "dashboard.inquiries": "Inquiries", "dashboard.contracts": "Contracts", "dashboard.payments": "Payments", "dashboard.appointments": "Appointments", "dashboard.reports": "Reports", "dashboard.notifications": "Notifications", "dashboard.settings": "Settings", "dashboard.total_properties": "Total Properties", "dashboard.active_clients": "Active Clients", "dashboard.pending_inquiries": "Pending Inquiries", "dashboard.monthly_revenue": "Monthly Revenue", "dashboard.recent_properties": "Recent Properties", "dashboard.recent_inquiries": "Recent Inquiries", "dashboard.view_all": "View All", "dashboard.no_data": "No data available", "common.save": "Save", "common.cancel": "Cancel", "common.edit": "Edit", "common.delete": "Delete", "common.search": "Search", "common.filter": "Filter", "common.export": "Export", "common.actions": "Actions", "common.loading": "Loading...", "common.error": "An error occurred", "common.success": "Success", "common.confirm": "Confirm", "common.yes": "Yes", "common.no": "No", "common.back": "Back", "common.next": "Next", "common.prev": "Previous", "common.status": "Status", "common.created_at": "Created At", "common.updated_at": "Updated At" }'

# === LIB ===
Write-Host "lib..." -ForegroundColor Yellow
Write-File "lib/i18n.ts" "import ar from '@/i18n/ar.json'; import en from '@/i18n/en.json'; export type Locale = 'ar' | 'en'; const messages: Record<Locale, Record<string, string>> = { ar, en }; export function t(key: string, locale: Locale): string { return messages[locale]?.[key] || messages['ar']?.[key] || key; } export function getDir(locale: Locale): 'rtl' | 'ltr' { return locale === 'ar' ? 'rtl' : 'ltr'; }"

Write-File "lib/utils/cn.ts" "import { clsx, type ClassValue } from 'clsx'; import { twMerge } from 'tailwind-merge'; export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }"

Write-File "lib/utils/format.ts" "export function formatPrice(price: number, currency: string = 'SAR'): string { return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price); } export function formatArea(area: number, unit: string = 'sqm'): string { return `${new Intl.NumberFormat('en-US').format(area)} ${unit === 'sqm' ? 'م²' : unit}`; } export function slugify(text: string): string { return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, ''); } export function getStatusText(status: string, locale: 'ar' | 'en' = 'ar'): string { const map: Record<string, Record<string, string>> = { available: { ar: 'متاح', en: 'Available' }, sold: { ar: 'مباع', en: 'Sold' }, rented: { ar: 'مؤجر', en: 'Rented' }, under_contract: { ar: 'تحت التعاقد', en: 'Under Contract' }, off_market: { ar: 'غير متاح', en: 'Off Market' }, sale: { ar: 'بيع', en: 'For Sale' }, rent: { ar: 'إيجار', en: 'For Rent' }, active: { ar: 'نشط', en: 'Active' }, inactive: { ar: 'غير نشط', en: 'Inactive' }, lead: { ar: 'عميل محتمل', en: 'Lead' } }; return map[status]?.[locale] || status; } export function getPurposeBadge(purpose: string, locale: 'ar' | 'en' = 'ar'): { label: string; className: string } { const isSale = purpose === 'sale'; return { label: isSale ? (locale === 'ar' ? 'بيع' : 'For Sale') : locale === 'ar' ? 'إيجار' : 'For Rent', className: isSale ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', }; }"

Write-File "lib/LocaleContext.tsx" "\"use client\"; import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from \"react\"; import { type Locale, t, getDir } from \"./i18n\"; interface LocaleContextType { locale: Locale; setLocale: (locale: Locale) => void; t: (key: string) => string; dir: \"rtl\" | \"ltr\"; } const LocaleContext = createContext<LocaleContextType | null>(null); export function LocaleProvider({ children }: { children: ReactNode }) { const [locale, setLocaleState] = useState<Locale>(\"ar\"); const setLocale = useCallback((newLocale: Locale) => { setLocaleState(newLocale); if (typeof document !== \"undefined\") { document.documentElement.dir = newLocale === \"ar\" ? \"rtl\" : \"ltr\"; document.documentElement.lang = newLocale; } }, []); const translate = useCallback((key: string) => t(key, locale), [locale]); const dir = useMemo(() => getDir(locale), [locale]); const value = useMemo(() => ({ locale, setLocale, t: translate, dir }), [locale, setLocale, translate, dir]); return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>; } export function useLocale() { const ctx = useContext(LocaleContext); if (!ctx) throw new Error(\"useLocale must be used within LocaleProvider\"); return ctx; }"

Write-File "lib/supabase/client.ts" "import { createBrowserClient } from \"@supabase/ssr\"; export function createClient() { return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }"

Write-File "lib/supabase/server.ts" "import { createServerClient } from \"@supabase/ssr\"; import { cookies } from \"next/headers\"; export async function createClient() { const cookieStore = await cookies(); return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } }); } export async function getSession() { const supabase = await createClient(); const { data } = await supabase.auth.getSession(); return data.session; } export async function getCurrentUser() { const supabase = await createClient(); const { data } = await supabase.auth.getUser(); return data?.user ?? null; }"

# === COMPONENTS ===
Write-Host "Components..." -ForegroundColor Yellow
Write-File "components/layout/Navbar.tsx" @"
"use client";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { Building2, Menu, X, Heart, Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
const navLinks = [
  { key: "nav.home", href: "/" },
  { key: "nav.properties", href: "/properties" },
  { key: "nav.about", href: "/about" },
  { key: "nav.contact", href: "/contact" },
];
export function Navbar() {
  const { t, locale, setLocale, dir } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <header className={cn("sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80")} dir={dir}>
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <Building2 className="h-6 w-6 text-accent" />ركزان الأفق
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.key} href={link.href} className="text-sm font-medium text-muted transition-colors hover:text-primary">{t(link.key)}</Link>
          ))}
          <Link href="/favorites" className="flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-primary">
            <Heart className="h-4 w-4" />{t("nav.favorites")}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setLocale(locale === "ar" ? "en" : "ar")} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-primary" aria-label={`Switch to ${locale === "ar" ? "English" : "Arabic"}`}>
            <Globe className="h-3.5 w-3.5" />{locale === "ar" ? "EN" : "عربي"}
          </button>
          <Link href="/auth/login" className="hidden md:inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light">{t("nav.login")}</Link>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-muted hover:text-primary" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-white p-4">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.key} href={link.href} onClick={() => setOpen(false)} className="text-sm font-medium text-muted transition-colors hover:text-primary">{t(link.key)}</Link>
            ))}
            <Link href="/favorites" onClick={() => setOpen(false)} className="flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-primary"><Heart className="h-4 w-4" />{t("nav.favorites")}</Link>
            <Link href="/auth/login" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">{t("nav.login")}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
"@

Write-File "components/layout/Footer.tsx" @"
"use client";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { Building2, Phone, Mail, MapPin, Instagram, Twitter, Youtube } from "lucide-react";
export function Footer() {
  const { t, dir } = useLocale();
  return (
    <footer className="border-t border-border bg-primary text-white" dir={dir}>
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold"><Building2 className="h-5 w-5 text-accent" />ركزان الأفق</div>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">{t("hero.subtitle")}</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/" className="transition-colors hover:text-white">{t("nav.home")}</Link></li>
              <li><Link href="/properties" className="transition-colors hover:text-white">{t("nav.properties")}</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-white">{t("nav.about")}</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-white">{t("nav.contact")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{t("contact.title")}</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-accent" />{t("contact.phone_value")}</li>
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-accent" />{t("contact.email_value")}</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-accent" />{t("contact.address_value")}</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">وسائل التواصل</h3>
            <div className="flex gap-3">
              <a href="#" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-accent hover:text-primary" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-accent hover:text-primary" aria-label="Twitter"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-accent hover:text-primary" aria-label="Youtube"><Youtube className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">&copy; {new Date().getFullYear()} ركزان الأفق العقارية. جميع الحقوق محفوظة.</div>
      </div>
    </footer>
  );
}
"@

Write-File "components/layout/WhatsAppFloat.tsx" @"
"use client";
import { MessageCircle } from "lucide-react";
const PHONE = "966551234567"; const MESSAGE = "مرحباً، أود الاستفسار عن عقاراتكم";
export function WhatsAppFloat() {
  return (
    <a href={`https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`} target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110" aria-label="WhatsApp">
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
"@

Write-File "components/property/PropertyCard.tsx" @"
"use client";
import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";
import { formatPrice, formatArea, getPurposeBadge } from "@/lib/utils/format";
import { MapPin, Bed, Bath, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Property } from "@/types/property";
interface Props { property: Property; view?: "grid" | "list"; }
export function PropertyCard({ property, view = "grid" }: Props) {
  const { locale, dir } = useLocale();
  const purposeBadge = getPurposeBadge(property.purpose, locale);
  const isGrid = view === "grid";
  return (
    <Link href={`/properties/${property.slug}`} className={cn("group block overflow-hidden rounded-lg bg-card shadow-sm border border-border transition-all hover:shadow-md", !isGrid && "md:flex")} dir={dir}>
      <div className={cn("relative overflow-hidden", isGrid ? "aspect-[4/3]" : "md:w-80 md:shrink-0 h-48 md:h-auto")}>
        <img src={property.featured_image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400"} alt={locale === "ar" ? property.title_ar : property.title_en || property.title_ar}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <span className={cn("absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-medium", purposeBadge.className)}>{purposeBadge.label}</span>
      </div>
      <div className="p-4 flex-1">
        <h3 className="font-display text-base font-semibold leading-snug line-clamp-1">{locale === "ar" ? property.title_ar : property.title_en || property.title_ar}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" /><span>{locale === "ar" ? property.city_ar : property.city_en || property.city_ar}</span></div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted">
          {property.bedrooms != null && <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms}</span>}
          {property.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms}</span>}
          <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" />{formatArea(property.area)}</span>
        </div>
        <p className="mt-2 font-display text-lg font-bold text-primary">{formatPrice(property.price)}</p>
      </div>
    </Link>
  );
}
"@

Write-File "components/dashboard/Sidebar.tsx" @"
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { cn } from "@/lib/utils/cn";
import { LayoutDashboard, Building2, Users, MessageSquare, FileText, CreditCard, Calendar, BarChart3, Bell, Settings, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
const navItems = [
  { key: "dashboard.overview", href: "/dashboard", icon: LayoutDashboard },
  { key: "dashboard.properties", href: "/dashboard/properties", icon: Building2 },
  { key: "dashboard.clients", href: "/dashboard/clients", icon: Users },
  { key: "dashboard.inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
  { key: "dashboard.contracts", href: "/dashboard/contracts", icon: FileText },
  { key: "dashboard.payments", href: "/dashboard/payments", icon: CreditCard },
  { key: "dashboard.appointments", href: "/dashboard/appointments", icon: Calendar },
  { key: "dashboard.reports", href: "/dashboard/reports", icon: BarChart3 },
  { key: "dashboard.notifications", href: "/dashboard/notifications", icon: Bell },
  { key: "dashboard.settings", href: "/dashboard/settings", icon: Settings },
];
export function Sidebar() {
  const pathname = usePathname();
  const { t, dir } = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={cn("flex flex-col border-l border-border bg-white transition-all duration-300", collapsed ? "w-16" : "w-60")} dir={dir}>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && <Link href="/dashboard" className="font-display text-sm font-bold text-primary">{t("dashboard.title")}</Link>}
        <button onClick={() => setCollapsed(!collapsed)} className="rounded-md p-1.5 text-muted hover:bg-muted/10 hover:text-primary" aria-label={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", active ? "bg-primary/10 text-primary" : "text-muted hover:bg-muted/5 hover:text-foreground")}
              title={collapsed ? t(item.key) : undefined}>
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{t(item.key)}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-2">
        <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-muted/5 hover:text-foreground">
          <LogOut className="h-4 w-4 shrink-0" />{!collapsed && <span>الموقع العام</span>}
        </Link>
      </div>
    </aside>
  );
}
"@

Write-Host "=== Done ===" -ForegroundColor Cyan
