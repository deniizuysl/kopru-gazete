"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface Yorum {
  id: string;
  icerik: string;
  createdAt: string;
  gizli?: boolean;
  parentId?: string | null;
  yazar?: { name?: string | null; image?: string | null } | null;
}

interface YorumBolumuProps {
  haberId: string;
  yorumlar: Yorum[];
}

export default function YorumBolumu({ haberId, yorumlar: baslangicYorumlar }: YorumBolumuProps) {
  const { data: session } = useSession();
  const [yorumlar, setYorumlar] = useState(baslangicYorumlar);
  const [icerik, setIcerik] = useState("");
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState("");
  const [yanitlananId, setYanitlananId] = useState<string | null>(null);
  const [yanitIcerik, setYanitIcerik] = useState("");
  const [yanitGonderiyor, setYanitGonderiyor] = useState(false);
  const [bildiriliyor, setBildiriliyor] = useState<string | null>(null);
  const [bildirilenler, setBildirilenler] = useState<Set<string>>(new Set());

  const kokYorumlar = yorumlar.filter((y) => !y.parentId);
  const yanitlarMap = yorumlar.reduce<Record<string, Yorum[]>>((acc, y) => {
    if (y.parentId) {
      (acc[y.parentId] ||= []).push(y);
    }
    return acc;
  }, {});

  const toplamGorunen = yorumlar.length;

  async function yorumGonder(e: React.FormEvent) {
    e.preventDefault();
    if (!icerik.trim()) return;
    setGonderiyor(true);
    setHata("");
    try {
      const res = await fetch("/api/yorumlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icerik: icerik.trim(), haberId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHata(data.error || "Yorum gönderilemedi");
        return;
      }
      setYorumlar([data, ...yorumlar]);
      setIcerik("");
    } catch {
      setHata("Bir hata oluştu. Tekrar deneyin.");
    } finally {
      setGonderiyor(false);
    }
  }

  async function yanitGonder(parentId: string) {
    if (!yanitIcerik.trim()) return;
    setYanitGonderiyor(true);
    setHata("");
    try {
      const res = await fetch("/api/yorumlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icerik: yanitIcerik.trim(), haberId, parentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHata(data.error || "Yanıt gönderilemedi");
        return;
      }
      setYorumlar([...yorumlar, data]);
      setYanitIcerik("");
      setYanitlananId(null);
    } catch {
      setHata("Bir hata oluştu. Tekrar deneyin.");
    } finally {
      setYanitGonderiyor(false);
    }
  }

  async function yorumBildir(yorumId: string) {
    if (bildirilenler.has(yorumId)) return;
    const sebep = window.prompt("Bildiri sebebi (opsiyonel — spam, hakaret, vb.):") ?? undefined;
    setBildiriliyor(yorumId);
    try {
      const res = await fetch(`/api/yorumlar/${yorumId}/bildir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sebep }),
      });
      const data = await res.json();
      if (res.ok) {
        setBildirilenler(new Set([...bildirilenler, yorumId]));
        alert(data.message || "Bildiriniz alındı.");
      } else {
        alert(data.error || "Bildiri gönderilemedi.");
      }
    } finally {
      setBildiriliyor(null);
    }
  }

  function YorumKarti({ yorum, yanit = false }: { yorum: Yorum; yanit?: boolean }) {
    const yazarAdi = yorum.yazar?.name || "Bilinmiyor";
    const tarih = formatDistanceToNow(new Date(yorum.createdAt), { addSuffix: true, locale: tr });
    const benimMi = session?.user && (session.user as { id?: string }).id === (yorum as Yorum & { yazarId?: string }).yazarId;
    const bildirildi = bildirilenler.has(yorum.id);

    if (yorum.gizli) {
      return (
        <div className={`bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 ${yanit ? "ml-6 sm:ml-10" : ""}`}>
          <p className="text-gray-400 text-xs italic">
            Bu yorum yönetici tarafından gizlendi.
          </p>
        </div>
      );
    }

    return (
      <div className={`bg-white border rounded-lg p-4 ${yanit ? "ml-6 sm:ml-10 border-l-4 border-l-amber-100" : ""}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm text-gray-800">{yazarAdi}</span>
          <span className="text-xs text-gray-400">{tarih}</span>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{yorum.icerik}</p>
        {session && (
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
            {!yanit && (
              <button
                onClick={() => {
                  setYanitlananId(yanitlananId === yorum.id ? null : yorum.id);
                  setYanitIcerik("");
                }}
                className="text-xs text-[#2f4f4f] hover:underline"
              >
                {yanitlananId === yorum.id ? "Vazgeç" : "Yanıtla"}
              </button>
            )}
            {!benimMi && (
              <button
                onClick={() => yorumBildir(yorum.id)}
                disabled={bildiriliyor === yorum.id || bildirildi}
                className="text-xs text-gray-500 hover:text-red-600 disabled:opacity-50"
              >
                {bildirildi ? "Bildirildi" : bildiriliyor === yorum.id ? "Gönderiliyor..." : "Şikayet et"}
              </button>
            )}
          </div>
        )}
        {yanitlananId === yorum.id && session && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              yanitGonder(yorum.id);
            }}
            className="mt-3 bg-gray-50 rounded p-3"
          >
            <textarea
              value={yanitIcerik}
              onChange={(e) => setYanitIcerik(e.target.value)}
              placeholder={`${yazarAdi} kullanıcısına yanıt yaz...`}
              maxLength={500}
              rows={2}
              autoFocus
              className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">{yanitIcerik.length}/500</span>
              <button
                type="submit"
                disabled={yanitGonderiyor || !yanitIcerik.trim()}
                className="bg-[#2f4f4f] text-white text-xs px-3 py-1.5 rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {yanitGonderiyor ? "Gönderiliyor..." : "Yanıtla"}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="mt-10 pt-8 border-t">
      <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">
        Yorumlar ({toplamGorunen})
      </h3>

      {session ? (
        <form onSubmit={yorumGonder} className="mb-8 bg-gray-50 rounded-lg p-4">
          <textarea
            value={icerik}
            onChange={(e) => setIcerik(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            maxLength={500}
            rows={3}
            className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{icerik.length}/500</span>
              <button
                type="submit"
                disabled={gonderiyor || !icerik.trim()}
                className="bg-[#2f4f4f] text-white text-sm px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {gonderiyor ? "Gönderiliyor..." : "Yorum Yap"}
              </button>
            </div>
          </div>
          {hata && <p className="text-red-500 text-sm mt-2">{hata}</p>}
        </form>
      ) : (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-gray-700 text-sm mb-2">Yorum yapmak için giriş yapmanız gerekiyor.</p>
          <Link
            href="/giris"
            className="inline-block bg-[#2f4f4f] text-white text-sm px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      )}

      {kokYorumlar.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">
          Henüz yorum yok. İlk yorumu sen yap!
        </p>
      ) : (
        <div className="space-y-4">
          {kokYorumlar.map((yorum) => {
            const yanitlar = (yanitlarMap[yorum.id] || []).sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return (
              <div key={yorum.id} className="space-y-3">
                <YorumKarti yorum={yorum} />
                {yanitlar.map((y) => (
                  <YorumKarti key={y.id} yorum={y} yanit />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
