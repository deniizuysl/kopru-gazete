"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface Yorum {
  id: string;
  icerik: string;
  anonim: boolean;
  yazarAdi?: string | null;
  createdAt: string;
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
  const [anonim, setAnonim] = useState(false);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState("");

  async function yorumGonder(e: React.FormEvent) {
    e.preventDefault();
    if (!icerik.trim()) return;

    setGonderiyor(true);
    setHata("");

    try {
      const res = await fetch("/api/yorumlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          icerik: icerik.trim(),
          haberId,
          anonim,
          yazarAdi: anonim ? undefined : session?.user?.name,
        }),
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

  return (
    <div className="mt-10 pt-8 border-t">
      <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">
        Yorumlar ({yorumlar.length})
      </h3>

      {session ? (
        <form onSubmit={yorumGonder} className="mb-8 bg-gray-50 rounded-lg p-4">
          <textarea
            value={icerik}
            onChange={(e) => setIcerik(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            maxLength={500}
            rows={3}
            className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={anonim}
                onChange={(e) => setAnonim(e.target.checked)}
                className="rounded"
              />
              Anonim olarak yorum yap
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{icerik.length}/500</span>
              <button
                type="submit"
                disabled={gonderiyor || !icerik.trim()}
                className="bg-[#1a1a2e] text-white text-sm px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
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
            className="inline-block bg-[#1a1a2e] text-white text-sm px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      )}

      {yorumlar.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">
          Henüz yorum yok. İlk yorumu sen yap!
        </p>
      ) : (
        <div className="space-y-4">
          {yorumlar.map((yorum) => {
            const yazarAdi = yorum.anonim
              ? "Anonim"
              : yorum.yazarAdi || yorum.yazar?.name || "Bilinmiyor";
            const tarih = formatDistanceToNow(new Date(yorum.createdAt), {
              addSuffix: true,
              locale: tr,
            });

            return (
              <div key={yorum.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-800">{yazarAdi}</span>
                  <span className="text-xs text-gray-400">{tarih}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{yorum.icerik}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
