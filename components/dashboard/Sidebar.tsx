'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, Building2, Users, MessageSquare, FileText, CreditCard, Calendar, BarChart3, Bell, Settings, ChevronLeft, ChevronRight, Activity, Mail, DollarSign, MapPin } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { key: 'dashboard.overview', href: '/dashboard', icon: LayoutDashboard },
  { key: 'dashboard.properties', href: '/dashboard/properties', icon: Building2 },
  { key: 'dashboard.clients', href: '/dashboard/clients', icon: Users },
  { key: 'dashboard.contracts', href: '/dashboard/contracts', icon: FileText },
  { key: 'dashboard.payments', href: '/dashboard/payments', icon: DollarSign },
  { key: 'dashboard.appointments', href: '/dashboard/appointments', icon: Calendar },
  { key: 'dashboard.inquiries', href: '/dashboard/inquiries', icon: MessageSquare },
  { key: 'dashboard.reports', href: '/dashboard/reports', icon: BarChart3 },
  { key: 'سجل النشاطات', href: '/dashboard/activity', icon: Activity },
  { key: 'قوالب الإشعارات', href: '/dashboard/email-templates', icon: Mail },
  { key: 'dashboard.notifications', href: '/dashboard/notifications', icon: Bell },
  { key: 'dashboard.settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn('flex flex-col border-l border-white/5 bg-sidebar text-white transition-all duration-300', collapsed ? 'w-16' : 'w-56')} dir="rtl">
      <div className={cn('flex h-14 items-center border-b border-white/5', collapsed ? 'justify-center px-0' : 'justify-between px-4')}>
        {!collapsed && (
          <Link href='/dashboard' className='flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-sidebar'>ر</div>
            <span className='font-display text-sm font-bold'>ركزان</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className='rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-white'>{collapsed ? <ChevronLeft className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}</button>
      </div>
      <nav className='flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin'>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all', active ? 'bg-sidebar-active text-white shadow-sm' : 'text-white/60 hover:bg-sidebar-hover hover:text-white')}>
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-accent' : 'text-white/40')} />
              {!collapsed && <span>{item.key}</span>}
              {!collapsed && active && <span className='mr-auto h-1.5 w-1.5 rounded-full bg-accent' />}
            </Link>
          );
        })}
      </nav>
      <div className='border-t border-white/5 p-2'>
        <div className='flex items-center gap-3 rounded-lg px-3 py-2'>
          <div className='flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white/60'>م</div>
          {!collapsed && <div className='text-xs'><div className='font-medium text-white/80'>النظام الداخلي</div><div className='text-white/40'>ركزان</div></div>}
        </div>
      </div>
    </aside>
  );
}
