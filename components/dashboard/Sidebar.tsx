'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { useTheme, THEME_LABELS } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard, Building2, Users, MessageSquare, FileText,
  CreditCard, Calendar, BarChart3, Bell, Settings, ChevronLeft,
  ChevronRight, Activity, Mail, DollarSign, Sun, Moon, Sparkles,
  LogOut, Search
} from 'lucide-react';
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
  { separator: true, key: '' },
  { key: 'سجل النشاطات', href: '/dashboard/activity', icon: Activity },
  { key: 'قوالب الإشعارات', href: '/dashboard/email-templates', icon: Mail },
  { key: 'dashboard.notifications', href: '/dashboard/notifications', icon: Bell },
  { key: 'dashboard.settings', href: '/dashboard/settings', icon: Settings },
];

const themeIcons: Record<string, typeof Sun> = { light: Sun, dark: Moon, gold: Sparkles };

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLocale();
  const { theme, setTheme, cycleTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const ThemeIcon = themeIcons[theme];

  return (
    <aside
      className={cn(
        'flex flex-col border-l relative z-30 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
      style={{ background: 'var(--sidebar)', borderColor: 'var(--header-border)' }}
      dir="rtl"
    >
      {/* Brand */}
      <div className={cn('flex h-14 items-center border-b shrink-0', collapsed ? 'justify-center' : 'justify-between px-4')} style={{ borderColor: 'var(--header-border)' }}>
        {!collapsed && (
          <Link href='/dashboard' className='flex items-center gap-2.5 group'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm' style={{ background: 'var(--accent)', color: 'var(--sidebar)' }}>
              ر
            </div>
            <div>
              <span className='block text-sm font-bold leading-tight' style={{ color: 'var(--sidebar-fg-active)' }}>ركزان</span>
              <span className='block text-[10px] opacity-50 leading-tight' style={{ color: 'var(--sidebar-fg)' }}>الأفق العقارية</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className='rounded-md p-1.5 transition-colors'
          style={{ color: 'var(--sidebar-fg)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {collapsed ? <ChevronLeft className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className='px-3 pt-3 pb-1'>
          <div className='relative'>
            <Search className='absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5' style={{ color: 'var(--sidebar-fg)' }} />
            <input
              placeholder='بحث...'
              className='w-full rounded-lg border py-1.5 pr-8 text-xs outline-none transition-colors'
              style={{ background: 'var(--sidebar-hover)', borderColor: 'transparent', color: 'var(--sidebar-fg-active)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin'>
        {navItems.map((item, i) => {
          if ('separator' in item) {
            return !collapsed ? <div key={`sep-${i}`} className='my-2 mx-3 h-px' style={{ background: 'var(--header-border)' }} /> : null;
          }
          const Icon = item.icon!;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                active
                  ? 'text-white shadow-sm'
                  : 'hover:text-white'
              )}
              style={{
                background: active ? 'var(--sidebar-active)' : 'transparent',
                color: active ? 'var(--sidebar-fg-active)' : 'var(--sidebar-fg)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon className='h-4 w-4 shrink-0' style={{ color: active ? 'var(--accent)' : undefined }} />
              {!collapsed && <span className='truncate'>{item.key}</span>}
              {!collapsed && active && (
                <span className='mr-auto h-1.5 w-1.5 rounded-full shrink-0' style={{ background: 'var(--accent)' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Theme + Profile */}
      <div className='p-2 space-y-1 shrink-0' style={{ borderTop: '1px solid var(--header-border)' }}>
        {/* Theme Toggle */}
        <div className='relative'>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className='flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors'
            style={{ color: 'var(--sidebar-fg)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ThemeIcon className='h-4 w-4 shrink-0' />
            {!collapsed && (
              <>
                <span className='flex-1 text-right'>{THEME_LABELS[theme].label}</span>
                <ChevronLeft className='h-3 w-3 opacity-50' />
              </>
            )}
          </button>
          {showThemeMenu && (
            <div
              className='absolute bottom-full right-0 left-0 mx-2 mb-1 rounded-xl border p-1.5 shadow-lg'
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {(Object.entries(THEME_LABELS) as [string, typeof THEME_LABELS.light][]).map(([key, val]) => {
                const Icon = themeIcons[key];
                const isActive = theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => { setTheme(key as any); setShowThemeMenu(false); }}
                    className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all'
                    style={{
                      background: isActive ? 'var(--primary-glow)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--fg-secondary)',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-soft)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon className='h-3.5 w-3.5' />
                    <span>{val.label}</span>
                    {isActive && <span className='mr-auto h-1.5 w-1.5 rounded-full' style={{ background: 'var(--accent)' }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile */}
        {!collapsed && (
          <div className='flex items-center gap-3 rounded-lg px-3 py-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium' style={{ background: 'var(--accent)', color: 'var(--sidebar)' }}>
              م
            </div>
            <div className='text-xs'>
              <div className='font-medium' style={{ color: 'var(--sidebar-fg-active)' }}>محمد الأحمري</div>
              <div style={{ color: 'var(--sidebar-fg)' }}>مدير عام</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
