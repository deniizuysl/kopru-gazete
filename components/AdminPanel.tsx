"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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

interface Reklam {
  id: string;
  baslik: string;
  resimUrl: string;
  tiklamaUrl?: string | null;
  aktif: boolean;
  createdAt: string;
}

interface AdminPanelProps {
  haberler: AdminHaber[];
  yorumlar: AdminYorum[];
  reklamlar: Reklam[];
}

export default function AdminPanel({ haberler: baslangicHaberler, yorumlar: baslangicYorumlar, reklamlar: baslangicReklamlar }: AdminPanelProps) {
  const [haberler, setHaberler] = useState(baslangicHaberler);
  const [yorumlar, setYorumlar] = useState(baslangicYorumlar);
  const [reklamlar, setReklamlar] = useState(baslangicReklamlar);
  const [aktifTab, setAktifTab] = useState<"haberler" | "yorumlar" | "reklamlar">("haberler");
  const [siliniyor, setSiliniyor] = useState<string | null>(null);

  // Reklam form state
  const [reklamBaslik, setReklamBaslik] = useState("");
  const [reklamUrl, setReklamUrl] = useState("");
  const [reklamResim, setReklamResim] = useState<File | null>(null);
  const [reklamYukleniyor, setReklamYukleniyor] = useState(false);
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const dosyaRef = useRef<HTMLInputElement>(null);

  async function haberSil(id: string) {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;
    setSiliniyor(id);
    const res = await fetch(`/api/haberler/${id}`, { method: "DELETE" });
    if (res.ok) setHaberler(haberler.filter((h) => h.id !== id));
    setSiliniyor(null);
  }

  async function yorumSil(id: string) {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    setSiliniyor(id);
    const res = await fetch(`/api/yorumlar/${id}`, { method: "DELETE" });
    if (res.ok) setYorumlar(yorumlar.filter((y) => y.id !== id));
    setSiliniyor(null);
  }

  async function reklamSil(id: string) {
    if (!confirm("Bu reklamı silmek istediğinize emin misiniz?")) return;
    setSiliniyor(id);
    const res = await fetch("/api/reklamlar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setReklamlar(reklamlar.filter((r) => r.id !== id));
    setSiliniyor(null);
  }

  async function reklamEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!reklamBaslik || !reklamResim) return;
    setReklamYukleniyor(true);

    const formData = new FormData();
    formData.append("baslik", reklamBaslik);
    formData.append("tiklamaUrl", reklamUrl);
    formData.append("resim", reklamResim);

    const res = await fetch("/api/reklamlar", { method: "POST", body: formData });
    if (res.ok) {
      const yeni = await res.json();
      setReklamlar([yeni, ...reklamlar]);
      setReklamBaslik("");
      setReklamUrl("");
      setReklamResim(null);
      setOnizleme(null);
    }
    setReklamYukleniyor(false);
  }

  return (
    <div>
      <div className="flex gap-4 mb-6 border-b">
        {(["haberler", "yorumlar", "reklamlar"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAktifTab(tab)}
            className={`pb-3 px-1 text-sm font-medium transition-colors capitalize ${
              aktifTab === tab
                ? "border-b-2 border-yellow-500 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "haberler" ? `Haberler (${haberler.length})` : tab === "yorumlar" ? `Yorumlar (${yorumlar.length})` : `Reklamlar (${reklamlar.length})`}
          </button>
        ))}
      </div>

      {aktifTab === "haberler" && (
        <div className="space-y-3">
          {haberler.map((haber) => (
            <div key={haber.id} className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/haber/${haber.id}`} target="_blank" className="font-medium text-sm text-gray-900 hover:text-yellow-700 line-clamp-2">
                  {haber.baslik}
                </Link>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{haber.yazar?.name || "Bilinmiyor"}</span>
                  <span>👁 {haber.goruntuSayisi}</span>
                  <span>💬 {haber._count.yorumlar}</span>
                  <span>{formatDistanceToNow(new Date(haber.createdAt), { addSuffix: true, locale: tr })}</span>
                </div>
              </div>
              <button onClick={() => haberSil(haber.id)} disabled={siliniyor === haber.id} className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap">
                {siliniyor === haber.id ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          ))}
          {haberler.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Haber bulunamadı</p>}
        </div>
      )}

      {aktifTab === "yorumlar" && (
        <div className="space-y-3">
          {yorumlar.map((yorum) => (
            <div key={yorum.id} className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{yorum.icerik}</p>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{yorum.yazar?.name || "Bilinmiyor"}</span>
                  <span className="truncate max-w-xs">{yorum.haberBaslik}</span>
                  <span>{formatDistanceToNow(new Date(yorum.createdAt), { addSuffix: true, locale: tr })}</span>
                </div>
              </div>
              <button onClick={() => yorumSil(yorum.id)} disabled={siliniyor === yorum.id} className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap">
                {siliniyor === yorum.id ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          ))}
          {yorumlar.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Yorum bulunamadı</p>}
        </div>
      )}

      {aktifTab === "reklamlar" && (
        <div>
          {/* Reklam Ekleme Formu */}
          <form onSubmit={reklamEkle} className="bg-white border rounded-lg p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Yeni Reklam Ekle</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Reklam başlığı (örn: Köprübaşı Eczanesi)"
                value={reklamBaslik}
                onChange={(e) => setReklamBaslik(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <input
                type="url"
                placeholder="Tıklama URL'si (isteğe bağlı)"
                value={reklamUrl}
                onChange={(e) => setReklamUrl(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <div>
                <input
                  ref={dosyaRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setReklamResim(f);
                      setOnizleme(URL.createObjectURL(f));
                    }
                  }}
                />
                <button type="button" onClick={() => dosyaRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition-colors">
                  {reklamResim ? reklamResim.name : "Reklam resmi seç"}
                </button>
                {onizleme && (
                  <div className="mt-2 relative w-full h-32 rounded overflow-hidden">
                    <Image src={onizleme} alt="Önizleme" fill className="object-cover" />
                  </div>
                )}
              </div>
              <button type="submit" disabled={reklamYukleniyor || !reklamBaslik || !reklamResim} className="w-full bg-[#1a1a2e] text-white py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                {reklamYukleniyor ? "Yükleniyor..." : "Reklamı Ekle"}
              </button>
            </div>
          </form>

          {/* Mevcut Reklamlar */}
          <div className="space-y-3">
            {reklamlar.map((reklam) => (
              <div key={reklam.id} className="bg-white border rounded-lg p-4 flex items-center gap-4">
                <div className="relative w-20 h-14 rounded overflow-hidden flex-shrink-0">
                  <Image src={reklam.resimUrl} alt={reklam.baslik} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{reklam.baslik}</p>
                  {reklam.tiklamaUrl && <p className="text-xs text-gray-400 truncate">{reklam.tiklamaUrl}</p>}
                  <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(reklam.createdAt), { addSuffix: true, locale: tr })}</p>
                </div>
                <button onClick={() => reklamSil(reklam.id)} disabled={siliniyor === reklam.id} className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap">
                  {siliniyor === reklam.id ? "Siliniyor..." : "Sil"}
                </button>
              </div>
            ))}
            {reklamlar.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Henüz reklam eklenmedi</p>}
          </div>
        </div>
      )}
    </div>
  );
}
