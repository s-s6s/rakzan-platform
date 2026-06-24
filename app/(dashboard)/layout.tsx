import { LocaleProvider } from '@/lib/LocaleContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div className='flex min-h-screen' style={{ background: 'var(--bg)' }}>
        <Sidebar />
        <main className='flex-1 overflow-auto' style={{ background: 'var(--bg)' }}>
          <div className='mx-auto max-w-[1440px] p-5 lg:p-8 xl:p-10'>{children}</div>
        </main>
      </div>
      <Toaster position='top-center' richColors closeButton />
    </LocaleProvider>
  );
}
