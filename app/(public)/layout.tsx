import { LocaleProvider } from "@/lib/LocaleContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PageTransition } from "@/components/layout/PageTransition";
import { Toaster } from "sonner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1"><PageTransition>{children}</PageTransition></main>
        <Footer />
        <WhatsAppFloat />
      </div>
      <Toaster position="top-center" richColors />
    </LocaleProvider>
  );
}
