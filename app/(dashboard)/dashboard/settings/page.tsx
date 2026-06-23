'use client';
import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/dashboard/Modal';
import { UserForm } from '@/components/dashboard/UserForm';
import { CurrencyManager } from '@/components/dashboard/CurrencyManager';
import { toast } from 'sonner';
import { Loader2, Save, User, Building2, Bell, Shield, Users, DollarSign, Pencil, Trash2, Key, Eye, EyeOff } from 'lucide-react';
import type { Profile, Setting } from '@/types/property';

const settingsTabs = [
  { key: 'company', label: 'إعدادات الشركة', icon: Building2 },
  { key: 'profile', label: 'الملف الشخصي', icon: User },
  { key: 'users', label: 'المستخدمين', icon: Users },
  { key: 'currencies', label: 'العملات', icon: DollarSign },
  { key: 'notifications', label: 'الإشعارات', icon: Bell },
  { key: 'security', label: 'الأمان', icon: Shield },
] as const;

export default function SettingsPage() {
  const { dir } = useLocale();
  const [tab, setTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Company settings
  const [settings, setSettings] = useState({
    company_name: '', company_phone: '', company_email: '',
    company_address: '', whatsapp_number: '', commission_rate: '',
    currency: 'SAR', currency_symbol: 'ر.س', timezone: 'Asia/Riyadh',
    date_format: 'YYYY/MM/DD', default_property_image: '', favicon_url: '',
  });

  // Profile
  const [profile, setProfile] = useState({ full_name: '', phone: '', email: '' });

  // Users
  const [users, setUsers] = useState<Profile[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    notify_on_inquiry: 'true', notify_on_contract: 'true',
    notify_on_payment: 'true', notify_on_appointment: 'true',
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: settingsData } = await supabase.from('settings').select('*');
      if (settingsData) {
        const map: Record<string, string> = {};
        settingsData.forEach(s => { map[s.key] = s.value; });
        setSettings(prev => ({ ...prev, ...map }));
        setNotifSettings(prev => ({
          ...prev, notify_on_inquiry: map.notify_on_inquiry || 'true',
          notify_on_contract: map.notify_on_contract || 'true',
          notify_on_payment: map.notify_on_payment || 'true',
          notify_on_appointment: map.notify_on_appointment || 'true',
        }));
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (prof) setProfile({ full_name: prof.full_name || '', phone: prof.phone || '', email: user.email || '' });
      }
      const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
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
    toast.success('تم حفظ إعدادات الشركة');
    setSaving(false);
  };

  const saveNotifSettings = async () => {
    setSaving(true);
    const supabase = createClient();
    for (const [key, value] of Object.entries(notifSettings)) {
      await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    }
    toast.success('تم حفظ إعدادات الإشعارات');
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

  const deleteUser = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) { toast.error('فشل حذف المستخدم'); return; }
    setUsers(prev => prev.filter(u => u.id !== id));
    setShowDeleteConfirm(null);
    toast.success('تم حذف المستخدم');
  };

  const changePassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
    if (error) { toast.error(error.message); return; }
    setChangingPassword(null); setNewPassword(''); toast.success('تم تغيير كلمة المرور');
  };

  const toggleUserStatus = async (user: Profile) => {
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', user.id);
    if (error) { toast.error('فشل التحديث'); return; }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !user.is_active } : u));
    toast.success(user.is_active ? 'تم تعطيل المستخدم' : 'تم تفعيل المستخدم');
  };

  const openUserForm = (user?: Profile) => {
    setEditUser(user || null);
    setShowUserModal(true);
  };

  if (loading) return <div className='flex items-center justify-center py-20'><Loader2 className='h-8 w-8 animate-spin text-muted' /></div>;

  return (
    <div dir={dir} className='space-y-6'>
      <h1 className='font-display text-2xl font-bold'>الإعدادات</h1>

      <div className='flex gap-1 border-b overflow-x-auto'>
        {settingsTabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'border-b-2 border-primary text-primary' : 'text-muted hover:text-foreground'}`}>
              <Icon className='h-4 w-4' />{t.label}
            </button>
          );
        })}
      </div>

      {/* Company Settings */}
      {tab === 'company' && (
        <div className='max-w-2xl space-y-4'>
          <div className='rounded-xl border p-5 space-y-4'>
            <h3 className='font-display text-sm font-semibold'>معلومات الشركة</h3>
            <div><label className='block text-xs font-medium text-muted mb-1'>اسم الشركة</label><input value={settings.company_name} onChange={e => setSettings(s => ({ ...s, company_name: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>رقم الجوال</label><input value={settings.company_phone} onChange={e => setSettings(s => ({ ...s, company_phone: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>البريد الإلكتروني</label><input value={settings.company_email} onChange={e => setSettings(s => ({ ...s, company_email: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
            <div><label className='block text-xs font-medium text-muted mb-1'>العنوان</label><input value={settings.company_address} onChange={e => setSettings(s => ({ ...s, company_address: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
          </div>

          <div className='rounded-xl border p-5 space-y-4'>
            <h3 className='font-display text-sm font-semibold'>معلومات التواصل والعمولة</h3>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>رقم واتساب</label><input value={settings.whatsapp_number} onChange={e => setSettings(s => ({ ...s, whatsapp_number: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>نسبة العمولة (%)</label><input type='number' value={settings.commission_rate} onChange={e => setSettings(s => ({ ...s, commission_rate: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
          </div>

          <div className='rounded-xl border p-5 space-y-4'>
            <h3 className='font-display text-sm font-semibold'>الإعدادات المتقدمة</h3>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div><label className='block text-xs font-medium text-muted mb-1'>المنطقة الزمنية</label><select value={settings.timezone} onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='Asia/Riyadh'>الرياض</option><option value='Asia/Dubai'>دبي</option><option value='Asia/Kuwait'>الكويت</option><option value='Asia/Qatar'>قطر</option><option value='Asia/Amman'>الأردن</option><option value='Africa/Cairo'>مصر</option></select></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>صيغة التاريخ</label><select value={settings.date_format} onChange={e => setSettings(s => ({ ...s, date_format: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='YYYY/MM/DD'>2024/01/01</option><option value='DD/MM/YYYY'>01/01/2024</option><option value='MM/DD/YYYY'>01/01/2024</option></select></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>العملة الافتراضية</label><select value={settings.currency} onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary'><option value='SAR'>ريال سعودي</option><option value='USD'>دولار</option><option value='AED'>درهم</option><option value='EGP'>جنيه</option></select></div>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div><label className='block text-xs font-medium text-muted mb-1'>رابط أيقونة الموقع (Favicon)</label><input value={settings.favicon_url} onChange={e => setSettings(s => ({ ...s, favicon_url: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
              <div><label className='block text-xs font-medium text-muted mb-1'>صورة العقار الافتراضية</label><input value={settings.default_property_image} onChange={e => setSettings(s => ({ ...s, default_property_image: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            </div>
          </div>

          <button onClick={saveSettings} disabled={saving} className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60 transition-all'>
            {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />} حفظ الإعدادات
          </button>
        </div>
      )}

      {/* Profile */}
      {tab === 'profile' && (
        <div className='max-w-lg space-y-4'>
          <div className='rounded-xl border p-5 space-y-4'>
            <h3 className='font-display text-sm font-semibold'>بيانات الملف الشخصي</h3>
            <div><label className='block text-xs font-medium text-muted mb-1'>الاسم</label><input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div><label className='block text-xs font-medium text-muted mb-1'>رقم الجوال</label><input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary' /></div>
            <div><label className='block text-xs font-medium text-muted mb-1'>البريد الإلكتروني</label><input value={profile.email} disabled className='w-full rounded-md border border-border bg-muted/10 px-3 py-2 text-sm text-muted outline-none' /></div>
            <button onClick={saveProfile} disabled={saving} className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60 transition-all'>
              {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />} حفظ الملف الشخصي
            </button>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted'>إدارة المستخدمين ({users.length})</p>
            <button onClick={() => openUserForm()} className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light'>
              <Users className='h-4 w-4' />إضافة مستخدم
            </button>
          </div>

          <div className='overflow-x-auto rounded-xl border border-border'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/5'>
                <tr><th className='p-3 text-right font-medium'>الاسم</th><th className='p-3 text-right font-medium'>الجوال</th><th className='p-3 text-right font-medium'>الصلاحية</th><th className='p-3 text-right font-medium'>الحالة</th><th className='p-3 text-right font-medium'>آخر دخول</th><th className='p-3 text-right font-medium'></th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className='border-t border-border'>
                    <td className='p-3 font-medium'>{u.full_name || '-'}</td>
                    <td className='p-3 text-muted'>{u.phone || '-'}</td>
                    <td className='p-3'><span className='rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary'>{u.role}</span></td>
                    <td className='p-3'><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{u.is_active ? 'نشط' : 'معطل'}</span></td>
                    <td className='p-3 text-muted text-xs'>{u.last_login ? new Date(u.last_login).toLocaleDateString('ar-SA') : '-'}</td>
                    <td className='p-3'>
                      <div className='flex items-center gap-1'>
                        <button onClick={() => openUserForm(u)} className='rounded-md p-1.5 text-primary hover:bg-primary/5' title='تعديل'><Pencil className='h-3.5 w-3.5' /></button>
                        <button onClick={() => toggleUserStatus(u)} className='rounded-md p-1.5 text-amber-600 hover:bg-amber-50' title={u.is_active ? 'تعطيل' : 'تفعيل'}><Shield className='h-3.5 w-3.5' /></button>
                        <button onClick={() => { setChangingPassword(u.id); setNewPassword(''); }} className='rounded-md p-1.5 text-blue-600 hover:bg-blue-50' title='تغيير كلمة المرور'><Key className='h-3.5 w-3.5' /></button>
                        <button onClick={() => setShowDeleteConfirm(u.id)} className='rounded-md p-1.5 text-red-600 hover:bg-red-50' title='حذف'><Trash2 className='h-3.5 w-3.5' /></button>
                      </div>

                      {changingPassword === u.id && (
                        <div className='mt-2 flex items-center gap-2'>
                          <div className='relative'>
                            <input type={showPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder='كلمة المرور الجديدة' className='rounded-md border border-border px-3 py-1.5 text-xs outline-none focus:border-primary w-44' />
                            <button onClick={() => setShowPw(!showPw)} className='absolute left-2 top-1/2 -translate-y-1/2 text-muted'>{showPw ? <EyeOff className='h-3.5 w-3.5' /> : <Eye className='h-3.5 w-3.5' />}</button>
                          </div>
                          <button onClick={() => changePassword(u.id)} className='rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-light'>تغيير</button>
                          <button onClick={() => setChangingPassword(null)} className='text-xs text-muted hover:underline'>إلغاء</button>
                        </div>
                      )}

                      {showDeleteConfirm === u.id && (
                        <div className='mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2'>
                          <p className='text-xs text-red-700'>تأكيد حذف {u.full_name}؟</p>
                          <button onClick={() => deleteUser(u.id)} className='rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700'>حذف</button>
                          <button onClick={() => setShowDeleteConfirm(null)} className='text-xs text-muted hover:underline'>إلغاء</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal open={showUserModal} onClose={() => setShowUserModal(false)} title={editUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'} size='md'>
            <UserForm
              existingUser={editUser ? { id: editUser.id, full_name: editUser.full_name || '', email: '', phone: editUser.phone || '', role: editUser.role } : undefined}
              onClose={() => setShowUserModal(false)}
              onSuccess={() => { setShowUserModal(false); (async () => { const supabase = createClient(); const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); setUsers(data || []); })(); }}
            />
          </Modal>
        </div>
      )}

      {/* Currencies */}
      {tab === 'currencies' && (
        <div className='rounded-xl border p-5'>
          <CurrencyManager />
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className='max-w-lg space-y-4'>
          <div className='rounded-xl border p-5 space-y-4'>
            <h3 className='font-display text-sm font-semibold'>إعدادات الإشعارات</h3>
            <p className='text-xs text-muted'>تحكم في الإشعارات التي ترسلها النظام عند حدوث أحداث معينة</p>
            <div className='space-y-3'>
              {[
                { key: 'notify_on_inquiry', label: 'إشعار عند استفسار جديد', desc: 'عند تقديم عميل استفسار عن عقار' },
                { key: 'notify_on_contract', label: 'إشعار عند إنشاء عقد', desc: 'عند إنشاء عقد جديد في النظام' },
                { key: 'notify_on_payment', label: 'إشعار عند استلام دفعة', desc: 'عند تسجيل دفعة جديدة أو استلامها' },
                { key: 'notify_on_appointment', label: 'إشعار عند موعد جديد', desc: 'عند حجز موعد جديد' },
              ].map(item => (
                <label key={item.key} className='flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/5'>
                  <div>
                    <p className='text-sm font-medium'>{item.label}</p>
                    <p className='text-xs text-muted mt-0.5'>{item.desc}</p>
                  </div>
                  <div className={`relative h-6 w-11 rounded-full transition-colors ${notifSettings[item.key as keyof typeof notifSettings] === 'true' ? 'bg-primary' : 'bg-gray-200'}`}>
                    <input
                      type='checkbox' className='sr-only'
                      checked={notifSettings[item.key as keyof typeof notifSettings] === 'true'}
                      onChange={e => setNotifSettings(s => ({ ...s, [item.key]: e.target.checked ? 'true' : 'false' }))}
                    />
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifSettings[item.key as keyof typeof notifSettings] === 'true' ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              ))}
            </div>
            <button onClick={saveNotifSettings} disabled={saving} className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60 transition-all'>
              {saving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Save className='h-4 w-4' />} حفظ الإعدادات
            </button>
          </div>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className='max-w-lg space-y-4'>
          <div className='rounded-xl border p-5 space-y-4'>
            <h3 className='font-display text-sm font-semibold'>إعدادات الأمان</h3>
            <p className='text-xs text-muted'>إعدادات الأمان والحماية للنظام</p>

            <div className='space-y-4'>
              <div className='flex items-center justify-between rounded-lg border p-3'>
                <div><p className='text-sm font-medium'>التحقق بخطوتين</p><p className='text-xs text-muted mt-0.5'>قم بتفعيل التحقق بخطوتين لحماية حسابك</p></div>
                <span className='rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600'>قريباً</span>
              </div>
              <div className='flex items-center justify-between rounded-lg border p-3'>
                <div><p className='text-sm font-medium'>سجل النشاطات</p><p className='text-xs text-muted mt-0.5'>سجل بجميع النشاطات على حسابك</p></div>
                <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600'>مفعل</span>
              </div>
              <div className='flex items-center justify-between rounded-lg border p-3'>
                <div><p className='text-sm font-medium'>جلساتي النشطة</p><p className='text-xs text-muted mt-0.5'>الأجهزة المسجل دخولها حالياً</p></div>
                <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600'>نشط</span>
              </div>
              <div className='flex items-center justify-between rounded-lg border p-3'>
                <div><p className='text-sm font-medium'>تصدير البيانات</p><p className='text-xs text-muted mt-0.5'>تصدير جميع بيانات النظام كملف</p></div>
                <span className='rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600'>قريباً</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
