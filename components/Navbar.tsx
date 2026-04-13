"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuAcik, setMenuAcik] = useState(false);

  return (
    <nav className="bg-[#2f4f4f] text-white shadow-lg">
      <div className="border-b border-yellow-600">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center">
          <Link href="/" className="block">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              Köprübaşı İlçesi
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-500 tracking-wide">
              KÖPRÜBAŞI GAZETESİ
            </h1>
            <div className="text-xs text-gray-400 mt-1">
              {new Date().toLocaleDateString("tr-TR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-amber-500 transition-colors">Ana Sayfa</Link>
            <Link href="/?kategori=SPOR" className="hover:text-amber-500 transition-colors">Spor</Link>
            <Link href="/?kategori=EKONOMI" className="hover:text-amber-500 transition-colors">Ekonomi</Link>
            <Link href="/?kategori=KULTUR" className="hover:text-amber-500 transition-colors">Kültür</Link>
            <Link href="/?kategori=EGITIM" className="hover:text-amber-500 transition-colors">Eğitim</Link>
            <Link href="/?kategori=SAGLIK" className="hover:text-amber-500 transition-colors">Sağlık</Link>
            <Link href="/?kategori=DUYURU" className="hover:text-amber-500 transition-colors">Duyurular</Link>
          </div>

          <div className="flex items-center space-x-3 text-sm ml-auto">
            {session ? (
              <>
                <Link
                  href="/haber-gonder"
                  className="bg-amber-500 hover:bg-amber-500 text-black font-semibold px-3 py-1.5 rounded transition-colors text-xs"
                >
                  + Haber Gönder
                </Link>
                {session.user?.role === "ADMIN" && (
                  <Link href="/admin" className="hover:text-amber-500 text-xs transition-colors">
                    Admin
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setMenuAcik(!menuAcik)}
                    className="flex items-center space-x-1 hover:text-amber-500 transition-colors"
                  >
                    <span className="text-xs">{session.user?.name?.split(" ")[0]}</span>
                    <span className="text-xs">▼</span>
                  </button>
                  {menuAcik && (
                    <div className="absolute right-0 mt-1 w-36 bg-white text-gray-800 rounded shadow-lg z-50">
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/giris" className="hover:text-amber-500 transition-colors text-xs">
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="bg-amber-500 hover:bg-amber-500 text-black font-semibold px-3 py-1.5 rounded transition-colors text-xs"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuAcik(!menuAcik)}
            className="md:hidden ml-4"
          >
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}
