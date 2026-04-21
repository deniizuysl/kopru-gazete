"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const KATEGORILER = [
  { key: "TUMU", label: "Ana Sayfa", href: "/" },
  { key: "SPOR", label: "Spor", href: "/?kategori=SPOR" },
  { key: "EKONOMI", label: "Ekonomi", href: "/?kategori=EKONOMI" },
  { key: "KULTUR", label: "Kültür", href: "/?kategori=KULTUR" },
  { key: "EGITIM", label: "Eğitim", href: "/?kategori=EGITIM" },
  { key: "SAGLIK", label: "Sağlık", href: "/?kategori=SAGLIK" },
  { key: "DUYURU", label: "Duyurular", href: "/?kategori=DUYURU" },
];

function KopruIkon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 24" fill="none" className={className} aria-hidden>
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
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobilAcik, setMobilAcik] = useState(false);
  const [profilAcik, setProfilAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState(searchParams.get("ara") || "");
  const profilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobilAcik(false);
    setProfilAcik(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profilRef.current && !profilRef.current.contains(e.target as Node)) {
        setProfilAcik(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const aktifKategori = searchParams.get("kategori") || (pathname === "/" ? "TUMU" : "");

  function aramaYap(e: React.FormEvent) {
    e.preventDefault();
    const q = aramaMetni.trim();
    router.push(q ? `/?ara=${encodeURIComponent(q)}` : "/");
  }

  return (
    <nav className="sticky top-0 z-40 bg-[#2f4f4f] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 h-14">
          <button
            onClick={() => setMobilAcik(!mobilAcik)}
            className="md:hidden p-1.5 -ml-1.5 rounded hover:bg-white/10"
            aria-label="Menü"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <KopruIkon className="w-8 h-3 text-amber-500" />
            <span className="font-serif font-bold text-amber-500 text-lg md:text-xl tracking-wide">
              KÖPRÜBAŞI
              <span className="hidden sm:inline"> GAZETESİ</span>
            </span>
          </Link>

          <form
            onSubmit={aramaYap}
            className="hidden md:flex flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                placeholder="Haberlerde ara..."
                className="w-full bg-white/10 border border-white/20 focus:border-amber-500 focus:bg-white/15 rounded-full pl-9 pr-3 py-1.5 text-sm placeholder:text-gray-300 outline-none transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </div>
          </form>

          <div className="flex items-center gap-2 text-sm ml-auto">
            {session ? (
              <>
                <Link
                  href="/haber-gonder"
                  className="bg-amber-500 hover:bg-amber-400 text-[#2f4f4f] font-semibold px-3 py-1.5 rounded-full transition-colors text-xs"
                >
                  + Haber
                </Link>
                <div className="relative" ref={profilRef}>
                  <button
                    onClick={() => setProfilAcik(!profilAcik)}
                    className="flex items-center gap-1.5 hover:text-amber-500 transition-colors px-2 py-1 rounded"
                  >
                    {session.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-[#2f4f4f] font-bold text-xs flex items-center justify-center">
                        {session.user?.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                    <span className="hidden sm:inline text-xs">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                  </button>
                  {profilAcik && (
                    <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
                      {session.user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          Admin Paneli
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-t border-gray-100"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/giris"
                  className="hover:text-amber-500 transition-colors text-xs px-2"
                >
                  Giriş
                </Link>
                <Link
                  href="/kayit"
                  className="bg-amber-500 hover:bg-amber-400 text-[#2f4f4f] font-semibold px-3 py-1.5 rounded-full transition-colors text-xs"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>

        <form onSubmit={aramaYap} className="md:hidden pb-2">
          <div className="relative">
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="Haberlerde ara..."
              className="w-full bg-white/10 border border-white/20 focus:border-amber-500 rounded-full pl-9 pr-3 py-1.5 text-sm placeholder:text-gray-300 outline-none"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </div>
        </form>
      </div>

      <div className="hidden md:block border-t border-white/10 bg-[#263f3f]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 h-10 overflow-x-auto">
            {KATEGORILER.map((kat) => {
              const aktif = aktifKategori === kat.key;
              return (
                <Link
                  key={kat.key}
                  href={kat.href}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    aktif
                      ? "bg-amber-500 text-[#2f4f4f]"
                      : "text-gray-200 hover:text-amber-500 hover:bg-white/5"
                  }`}
                >
                  {kat.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 bg-[#263f3f] ${
          mobilAcik ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 py-2 flex flex-col">
          {KATEGORILER.map((kat) => {
            const aktif = aktifKategori === kat.key;
            return (
              <Link
                key={kat.key}
                href={kat.href}
                className={`text-sm py-2.5 px-2 rounded border-b border-white/5 last:border-0 ${
                  aktif ? "text-amber-500 font-semibold" : "text-gray-200"
                }`}
              >
                {kat.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div
        aria-hidden
        className="h-1.5 bg-gradient-to-r from-[#2f4f4f] via-amber-500 to-[#2f4f4f]"
      />
    </nav>
  );
}
