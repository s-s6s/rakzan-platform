'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LocaleProvider, useLocale } from '@/lib/LocaleContext';
import { createClient } from '@/lib/supabase/client';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function RegisterForm() {
  const { t, dir } = useLocale();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, phone: '' } },
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success(t('auth.register_success') || 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err?.message || 'حدث خطأ غير متوقع');
      setLoading(false);
    }
  };

  return (
    <div dir={dir} className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-sm rounded-lg border border-border bg-white p-8 shadow-sm'>
        <div className='mb-6 text-center'>
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
            <Building2 className='h-6 w-6 text-primary' />
          </div>
          <h1 className='font-display text-xl font-bold'>{t('auth.register_title')}</h1>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input required value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.register_name')} className='w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary' />
          <input required type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.login_email')} className='w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary' />
          <input required type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.login_password')} className='w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary' />
          <button type='submit' disabled={loading} className='flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-60'>
            {loading && <Loader2 className='h-4 w-4 animate-spin' />}
            {t('auth.register_btn')}
          </button>
        </form>
        <p className='mt-4 text-center text-xs text-muted'>
          {t('auth.register_have_account')}{' '}
          <Link href='/auth/login' className='text-primary hover:underline'>{t('nav.login')}</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (<LocaleProvider><RegisterForm /></LocaleProvider>);
}
