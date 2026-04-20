import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/react";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Köprübaşı Gazetesi",
  description: "Köprübaşı ilçesinin yerel haber gazetesi",
  keywords: "Köprübaşı, haber, gazete, yerel haber",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <SessionProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <footer className="bg-[#2f4f4f] text-gray-400 text-center text-xs py-6 mt-10">
            <p>© {new Date().getFullYear()} Köprübaşı Gazetesi — Tüm hakları saklıdır</p>
          </footer>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
