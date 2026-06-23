'use client';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { toast } from 'sonner';
export default function AddClientPage() {
  const { t, dir } = useLocale();
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); toast.success('تم إضافة العميل بنجاح'); router.push('/dashboard/clients'); };
  return (
    <div dir={dir}>
      <h1 className='font-display text-2xl font-bold'>{t('dashboard.add_client')}</h1>
      <form onSubmit={handleSubmit} className='mt-6 max-w-lg space-y-4'>
        <input required placeholder='الاسم' className='w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary' />
        <input required placeholder='الجوال' className='w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-primary' />
        <button type='submit' className='rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-light'>{t('common.save')}</button>
      </form>
    </div>
  );
}
