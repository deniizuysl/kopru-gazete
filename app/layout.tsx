import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/react";

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
                <svg viewBox="0 0 64 24" fill="none" className="w-10 h-4 text-amber-500" aria-hidden>
                  <path
                    d="M2 20 L62 20 M8 20 L8 14 M20 20 L20 10 M32 20 L32 6 M44 20 L44 10 M56 20 L56 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2 20 Q32 2 62 20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
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
