'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, Building2, Users, MessageSquare, FileText, CreditCard, Calendar, BarChart3, Bell, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
const navItems = [
  { key: 'dashboard.overview', href: '/dashboard', icon: LayoutDashboard },
  { key: 'dashboard.properties', href: '/dashboard/properties', icon: Building2 },
  { key: 'dashboard.clients', href: '/dashboard/clients', icon: Users },
  { key: 'dashboard.inquiries', href: '/dashboard/inquiries', icon: MessageSquare },
  { key: 'dashboard.contracts', href: '/dashboard/contracts', icon: FileText },
  { key: 'dashboard.payments', href: '/dashboard/payments', icon: CreditCard },
  { key: 'dashboard.appointments', href: '/dashboard/appointments', icon: Calendar },
  { key: 'dashboard.reports', href: '/dashboard/reports', icon: BarChart3 },
  { key: 'dashboard.notifications', href: '/dashboard/notifications', icon: Bell },
  { key: 'dashboard.settings', href: '/dashboard/settings', icon: Settings },
];
export function Sidebar() {
  const pathname = usePathname();
  const { t, dir } = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={cn('flex flex-col border-l border-border bg-white transition-all duration-300', collapsed ? 'w-16' : 'w-60')} dir={dir}>
      <div className='flex h-16 items-center justify-between border-b border-border px-4'>
        {!collapsed && <Link href='/dashboard' className='font-display text-sm font-bold text-primary'>{t('dashboard.title')}</Link>}
        <button onClick={() => setCollapsed(!collapsed)} className='rounded-md p-1.5 text-muted hover:bg-muted/10 hover:text-primary'>{collapsed ? <ChevronLeft className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}</button>
      </div>
      <nav className='flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin'>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (<Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-muted/5 hover:text-foreground')}><Icon className='h-4 w-4 shrink-0' />{!collapsed && <span>{t(item.key)}</span>}</Link>);
        })}
      </nav>
      <div className='border-t border-border p-2'>
        <Link href='/' className='flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-muted/5 hover:text-foreground'><LogOut className='h-4 w-4 shrink-0' />{!collapsed && <span>الموقع العام</span>}</Link>
      </div>
    </aside>
  );
}
