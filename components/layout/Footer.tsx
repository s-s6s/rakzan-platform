'use client';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { Building2, Phone, Mail, MapPin, Instagram, Twitter, Youtube } from 'lucide-react';
export function Footer() {
  const { t, dir } = useLocale();
  return (
    <footer className='border-t border-border bg-primary text-white' dir={dir}>
      <div className='container py-12'>
        <div className='grid gap-8 md:grid-cols-4'>
          <div><div className='flex items-center gap-2 font-display text-lg font-bold'><Building2 className='h-5 w-5 text-accent' />ركزان الأفق</div><p className='mt-3 text-sm text-white/70 leading-relaxed'>{t('hero.subtitle')}</p></div>
          <div><h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-accent'>روابط سريعة</h3><ul className='space-y-2 text-sm text-white/70'>
            <li><Link href='/' className='transition-colors hover:text-white'>{t('nav.home')}</Link></li>
            <li><Link href='/properties' className='transition-colors hover:text-white'>{t('nav.properties')}</Link></li>
            <li><Link href='/about' className='transition-colors hover:text-white'>{t('nav.about')}</Link></li>
            <li><Link href='/contact' className='transition-colors hover:text-white'>{t('nav.contact')}</Link></li>
          </ul></div>
          <div><h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-accent'>{t('contact.title')}</h3><ul className='space-y-2 text-sm text-white/70'>
            <li className='flex items-center gap-2'><Phone className='h-3.5 w-3.5 text-accent' />{t('contact.phone_value')}</li>
            <li className='flex items-center gap-2'><Mail className='h-3.5 w-3.5 text-accent' />{t('contact.email_value')}</li>
            <li className='flex items-center gap-2'><MapPin className='h-3.5 w-3.5 text-accent' />{t('contact.address_value')}</li>
          </ul></div>
          <div><h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-accent'>وسائل التواصل</h3><div className='flex gap-3'>
            <a href='#' className='rounded-full bg-white/10 p-2 transition-colors hover:bg-accent hover:text-primary'><Instagram className='h-4 w-4' /></a>
            <a href='#' className='rounded-full bg-white/10 p-2 transition-colors hover:bg-accent hover:text-primary'><Twitter className='h-4 w-4' /></a>
            <a href='#' className='rounded-full bg-white/10 p-2 transition-colors hover:bg-accent hover:text-primary'><Youtube className='h-4 w-4' /></a>
          </div></div>
        </div>
        <div className='mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50'>&copy; {new Date().getFullYear()} ركزان الأفق العقارية. جميع الحقوق محفوظة.</div>
      </div>
    </footer>
  );
}
