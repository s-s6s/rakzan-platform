import { LocaleProvider } from '@/lib/LocaleContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div className='flex min-h-screen'>
        <Sidebar />
        <main className='flex-1 overflow-auto'>
          <div className='mx-auto max-w-[1400px] p-6 lg:p-8'>{children}</div>
        </main>
      </div>
      <Toaster position='top-center' richColors />
    </LocaleProvider>
  );
}
