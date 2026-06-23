import { LocaleProvider } from '@/lib/LocaleContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { PageTransition } from '@/components/layout/PageTransition';
import { Toaster } from 'sonner';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div className='flex min-h-screen'>
        <Sidebar />
        <main className='flex-1 overflow-auto bg-background p-6'><PageTransition>{children}</PageTransition></main>
      </div>
      <Toaster position='top-center' richColors />
    </LocaleProvider>
  );
}
