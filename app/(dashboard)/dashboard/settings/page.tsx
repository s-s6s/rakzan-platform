'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, User, Building2, Bell, Shield, Users } from 'lucide-react';

const settingsTabs = [
  { key: 'company', label: 'إعدادات الشركة', icon: Building2 },
  { key: 'profile', label: 'الملف الشخصي', icon: User },
  { key: 'users', label: 'المستخدمين', icon: Users },
  { key: 'notifications', label: 'الإشعارات', icon: Bell },
] as const;

export default function SettingsPage() {
  const { dir } = useLocale();
  const [tab, setTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: '', company_phone: '', company_email: '',
    company_address: '', whatsapp_number: '', commission_rate: '',
    currency: 'SAR',
  });
  const [profile, setProfile] = useState({ full_name: '', phone: '', email: '' });
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: settingsData } = await supabase.from('settings').select('*');
      if (settingsData) {
        const map: Record<string, string> = {};
        settingsData.forEach(s => { map[s.key] = s.value; });
        setSettings(prev => ({ ...prev, ...map }));
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (prof) setProfile({ full_name: prof.full_name || '', phone: prof.phone || '', email: user.email || '' });
      }
      const { data: usersData } = await supabase.from('profiles').select('*');
      setUsers(usersData || []);
      setLoading(false);
    }
    load();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    const supabase = createClient();
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    }
    toast.success('تم حفظ الإعدادات');
    setSaving(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ full_name: profile.full_name, phone: profile.phone }).eq('id', user.id);
      toast.success('تم تحديث الملف الشخصي');
    }
    setSaving(false);
  };

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div dir={dir}>
      <h1 className='font-display text-2xl font-bold'>الإعدادات</h1>

      <div className='mt-6 flex gap-1 border-b overflow-x-auto'>
        {settingsTabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'border-b-2 border-primary text-primary' : 'text-muted hover:text-foreground'}`}>
              <Icon className='h-4 w-4' />{t.label}
            </button>
          );
        })}
      </div>

      <div className='mt-6 max-w-xl space-y-4'>
        {tab === 'company' && (
          <>
            <div><label className='block text-xs font-medium text-muted mb-1'>اسم الشركة</label><input value={settings.company_name} onChange={e => setSettings(s => ({ ...s, company_name: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>رقم الجوال</label><input value={settings.company_phone} onChange={e => setSettings(s => ({ ...s, company_phone: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>البريد الإلكتروني</label><input value={settings.company_email} onChange={e => setSettings(s => ({ ...s, company_email: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div><label className='block text-xs font-medium text-muted mb-1'>العنوان</label><input value={settings.company_address} onChange={e => setSettings(s => ({ ...s, company_address: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>رقم واتساب</label><input value={settings.whatsapp_number} onChange={e => setSettings(s => ({ ...s, whatsapp_number: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>نسبة العمولة (%)</label><input type='number' value={settings.commission_rate} onChange={e => setSettings(s => ({ ...s, commission_rate: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <button onClick={saveSettings} disabled={saving} className='flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60'>
              {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />} حفظ الإعدادات
            </button>
          </>
        )}

        {tab === 'profile' && (
          <>
            <div><label className='block text-xs font-medium text-muted mb-1'>الاسم</label><input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div><label className='block text-xs font-medium text-muted mb-1'>رقم الجوال</label><input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div><label className='block text-xs font-medium text-muted mb-1'>البريد الإلكتروني</label><input value={profile.email} disabled className='w-full rounded-md border border-border bg-muted/10 px-3 py-2 text-sm text-muted outline-none' /></div>
            <button onClick={saveProfile} disabled={saving} className='flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60'>
              {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />} حفظ الملف الشخصي
            </button>
          </>
        )}

        {tab === 'users' && (
          <div className='overflow-x-auto rounded-lg border'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/10'>
                <tr><th className='p-3 text-right font-medium'>الاسم</th><th className='p-3 text-right font-medium'>الجوال</th><th className='p-3 text-right font-medium'>الصلاحية</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className='border-t border-border'>
                    <td className='p-3'>{u.full_name || '-'}</td>
                    <td className='p-3 text-muted'>{u.phone || '-'}</td>
                    <td className='p-3'><span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'notifications' && (
          <p className='text-sm text-muted'>قريباً — إعدادات الإشعارات</p>
        )}
      </div>
    </div>
  );
}
