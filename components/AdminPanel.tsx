"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface AdminHaber {
  id: string;
  baslik: string;
  kategori: string;
  anonim: boolean;
  yazarAdi?: string | null;
  yayinlandiMi: boolean;
  createdAt: string;
  goruntuSayisi: number;
  _count: { yorumlar: number };
  yazar?: { name?: string | null } | null;
}

interface AdminYorum {
  id: string;
  icerik: string;
  anonim: boolean;
  yazarAdi?: string | null;
  createdAt: string;
  haberBaslik: string;
  yazar?: { name?: string | null } | null;
}

interface AdminPanelProps {
  haberler: AdminHaber[];
  yorumlar: AdminYorum[];
}

export default function AdminPanel({ haberler: baslangicHaberler, yorumlar: baslangicYorumlar }: AdminPanelProps) {
  const [haberler, setHaberler] = useState(baslangicHaberler);
  const [yorumlar, setYorumlar] = useState(baslangicYorumlar);
  const [aktifTab, setAktifTab] = useState<"haberler" | "yorumlar">("haberler");
  const [siliniyor, setSiliniyor] = useState<string | null>(null);

  async function haberSil(id: string) {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;

    setSiliniyor(id);
    const res = await fetch(`/api/haberler/${id}`, { method: "DELETE" });

    if (res.ok) {
      setHaberler(haberler.filter((h) => h.id !== id));
    }
    setSiliniyor(null);
  }

  async function yorumSil(id: string) {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;

    setSiliniyor(id);
    const res = await fetch(`/api/yorumlar/${id}`, { method: "DELETE" });

    if (res.ok) {
      setYorumlar(yorumlar.filter((y) => y.id !== id));
    }
    setSiliniyor(null);
  }

  return (
    <div>
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setAktifTab("haberler")}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            aktifTab === "haberler"
              ? "border-b-2 border-yellow-500 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Haberler ({haberler.length})
        </button>
        <button
          onClick={() => setAktifTab("yorumlar")}
          className={`pb-3 px-1 text-sm font-medium transition-colors ${
            aktifTab === "yorumlar"
              ? "border-b-2 border-yellow-500 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Yorumlar ({yorumlar.length})
        </button>
      </div>

      {aktifTab === "haberler" && (
        <div className="space-y-3">
          {haberler.map((haber) => (
            <div
              key={haber.id}
              className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/haber/${haber.id}`}
                  target="_blank"
                  className="font-medium text-sm text-gray-900 hover:text-yellow-700 line-clamp-2"
                >
                  {haber.baslik}
                </Link>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{haber.anonim ? "Anonim" : haber.yazarAdi || haber.yazar?.name || "Bilinmiyor"}</span>
                  <span>👁 {haber.goruntuSayisi}</span>
                  <span>💬 {haber._count.yorumlar}</span>
                  <span>{formatDistanceToNow(new Date(haber.createdAt), { addSuffix: true, locale: tr })}</span>
                </div>
              </div>
              <button
                onClick={() => haberSil(haber.id)}
                disabled={siliniyor === haber.id}
                className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {siliniyor === haber.id ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          ))}
          {haberler.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">Haber bulunamadı</p>
          )}
        </div>
      )}

      {aktifTab === "yorumlar" && (
        <div className="space-y-3">
          {yorumlar.map((yorum) => (
            <div
              key={yorum.id}
              className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{yorum.icerik}</p>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{yorum.anonim ? "Anonim" : yorum.yazarAdi || yorum.yazar?.name || "Bilinmiyor"}</span>
                  <span className="truncate max-w-xs">{yorum.haberBaslik}</span>
                  <span>{formatDistanceToNow(new Date(yorum.createdAt), { addSuffix: true, locale: tr })}</span>
                </div>
              </div>
              <button
                onClick={() => yorumSil(yorum.id)}
                disabled={siliniyor === yorum.id}
                className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {siliniyor === yorum.id ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          ))}
          {yorumlar.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">Yorum bulunamadı</p>
          )}
        </div>
      )}
    </div>
  );
}
