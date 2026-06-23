'use client';
import Link from 'next/link';
import { useLocale } from '@/lib/LocaleContext';
import { Building2, Menu, X, Heart, Globe } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
const navLinks = [{ key: 'nav.home', href: '/' }, { key: 'nav.properties', href: '/properties' }, { key: 'nav.about', href: '/about' }, { key: 'nav.contact', href: '/contact' }];
export function Navbar() {
  const { t, locale, setLocale, dir } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <header className={cn('sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80')} dir={dir}>
      <div className='container flex h-16 items-center justify-between'>
        <Link href='/' className='flex items-center gap-2 font-display text-xl font-bold text-primary'><Building2 className='h-6 w-6 text-accent' />ركزان الأفق</Link>
        <nav className='hidden md:flex items-center gap-6'>{navLinks.map((link) => (<Link key={link.key} href={link.href} className='text-sm font-medium text-muted transition-colors hover:text-primary'>{t(link.key)}</Link>))}
          <Link href='/favorites' className='flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-primary'><Heart className='h-4 w-4' />{t('nav.favorites')}</Link>
        </nav>
        <div className='flex items-center gap-3'>
          <button onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')} className='flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-primary'><Globe className='h-3.5 w-3.5' />{locale === 'ar' ? 'EN' : 'عربي'}</button>
          <Link href='/auth/login' className='hidden md:inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light'>{t('nav.login')}</Link>
          <button onClick={() => setOpen(!open)} className='md:hidden p-2 text-muted hover:text-primary'>{open ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}</button>
        </div>
      </div>
      {open && (
        <div className='md:hidden border-t border-border bg-white p-4'>
          <nav className='flex flex-col gap-3'>{navLinks.map((link) => (<Link key={link.key} href={link.href} onClick={() => setOpen(false)} className='text-sm font-medium text-muted transition-colors hover:text-primary'>{t(link.key)}</Link>))}
            <Link href='/favorites' onClick={() => setOpen(false)} className='flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-primary'><Heart className='h-4 w-4' />{t('nav.favorites')}</Link>
            <Link href='/auth/login' onClick={() => setOpen(false)} className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white'>{t('nav.login')}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
