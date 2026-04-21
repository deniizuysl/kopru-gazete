import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/react";
import { KopruIcon } from "@/components/icons";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Köprübaşı Gazetesi",
  description: "Köprübaşı ilçesinin yerel haber gazetesi",
  keywords: "Köprübaşı, haber, gazete, yerel haber, Manisa",
};

function NavbarFallback() {
  return (
    <div className="sticky top-0 z-40 bg-[#2f4f4f] h-14 shadow-md">
      <div className="h-1.5 bg-gradient-to-r from-[#2f4f4f] via-amber-500 to-[#2f4f4f] absolute bottom-0 inset-x-0" />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geist.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#faf7f0]">
        <SessionProvider>
          <Suspense fallback={<NavbarFallback />}>
            <Navbar />
          </Suspense>
          <div className="flex-1">{children}</div>
          <footer className="mt-12 bg-[#2f4f4f] text-gray-300">
            <div
              aria-hidden
              className="h-1.5 bg-gradient-to-r from-[#2f4f4f] via-amber-500 to-[#2f4f4f]"
            />
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <KopruIcon size={18} className="text-amber-500" />
                <span className="font-serif text-amber-500 text-lg font-bold tracking-wide">
                  KÖPRÜBAŞI GAZETESİ
                </span>
              </div>
              <p className="text-xs">
                © {new Date().getFullYear()} Köprübaşı Gazetesi — Tüm hakları
                saklıdır
              </p>
            </div>
          </footer>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
