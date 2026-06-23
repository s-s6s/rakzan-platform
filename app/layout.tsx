import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({ weight: ["400", "500", "600", "700"], subsets: ["arabic", "latin"], variable: "--font-arabic" });

export const metadata: Metadata = {
  title: "ركزان الأفق العقارية | Rakzan Al-Ufuq Real Estate",
  description: "شريكك الموثوق في العقارات — Your trusted real estate partner in Saudi Arabia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexSansArabic.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
