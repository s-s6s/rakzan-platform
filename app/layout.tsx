import type { Metadata } from "next";
import { DM_Sans, Outfit, IBM_Plex_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/lib/ThemeContext";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700", "800"] });
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({ weight: ["400", "500", "600", "700"], subsets: ["arabic", "latin"], variable: "--font-arabic" });

export const metadata: Metadata = {
  title: "ركزان الأفق العقارية | Rakzan Al-Ufuq Real Estate",
  description: "شريكك الموثوق في العقارات — Your trusted real estate partner in Saudi Arabia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${dmSans.variable} ${outfit.variable} ${ibmPlexSansArabic.variable}`}>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
