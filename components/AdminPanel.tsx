"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";
import { EyeIcon, ChatIcon } from "@/components/icons";

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
  haberId?: string;
  parentId?: string | null;
  gizli?: boolean;
  bildiriSayisi?: number;
  bildiriler?: { sebep: string | null; bildiren: { name: string | null } }[];
  yazar?: { name?: string | null } | null;
}

interface Reklam {
  id: string;
  baslik: string;
  resimUrl: string;
  tiklamaUrl?: string | null;
  aktif: boolean;
  createdAt: string;
  isletmeAdi?: string | null;
  iletisimAd?: string | null;
  telefon?: string | null;
  aciklama?: string | null;
  sureGun?: number | null;
  baslangic?: string | null;
  bitis?: string | null;
  durum?: "BEKLEMEDE" | "ONAYLANDI" | "REDDEDILDI" | "SURESI_DOLDU";
  odendi?: boolean;
  adminNotu?: string | null;
}

interface AdminPanelProps {
  haberler: AdminHaber[];
  yorumlar: AdminYorum[];
  reklamlar: Reklam[];
}

interface ZamanliPushKaydi {
  id: string;
  baslik: string;
  icerik: string;
  haberId: string | null;
  zamanlanan: string;
  gonderildi: boolean;
  gonderimTarihi: string | null;
  haber?: { id: string; baslik: string } | null;
}

export default function AdminPanel({ haberler: baslangicHaberler, yorumlar: baslangicYorumlar, reklamlar: baslangicReklamlar }: AdminPanelProps) {
  const [haberler, setHaberler] = useState(baslangicHaberler);
  const [yorumlar, setYorumlar] = useState(baslangicYorumlar);
  const [reklamlar, setReklamlar] = useState(baslangicReklamlar);
  const [aktifTab, setAktifTab] = useState<"haberler" | "yorumlar" | "reklamlar" | "bildirim">("haberler");
  const [siliniyor, setSiliniyor] = useState<string | null>(null);

  // Bildirim state
  const [pushYuklenen, setPushYuklenen] = useState<string | null>(null);
  const [zamanlaModal, setZamanlaModal] = useState<{ haberId?: string; baslik?: string } | null>(null);
  const [zamanlamalar, setZamanlamalar] = useState<ZamanliPushKaydi[]>([]);
  const [zamanlamaYukleniyor, setZamanlamaYukleniyor] = useState(false);
  const [customBaslik, setCustomBaslik] = useState("📰 Köprü Gazetesi");
  const [customIcerik, setCustomIcerik] = useState("");
  const [customGonderiliyor, setCustomGonderiliyor] = useState(false);
  const [bildirimMesaj, setBildirimMesaj] = useState<{ tip: "basari" | "hata"; metin: string } | null>(null);

  async function zamanlamalariYukle() {
    setZamanlamaYukleniyor(true);
    try {
      const res = await fetch("/api/admin/bildirim/zamanli");
      if (res.ok) setZamanlamalar(await res.json());
    } finally {
      setZamanlamaYukleniyor(false);
    }
  }

  useEffect(() => {
    if (aktifTab === "bildirim") zamanlamalariYukle();
  }, [aktifTab]);

  function mesajGoster(tip: "basari" | "hata", metin: string) {
    setBildirimMesaj({ tip, metin });
    setTimeout(() => setBildirimMesaj(null), 4000);
  }

  async function haberPushGonder(haberId: string) {
    if (!confirm("Bu haberi şimdi tüm kullanıcılara bildirim olarak göndermek istiyor musun?")) return;
    setPushYuklenen(haberId);
    try {
      const res = await fetch("/api/admin/bildirim/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haberId }),
      });
      const data = await res.json();
      if (res.ok) mesajGoster("basari", `${data.gonderildi} kullanıcıya gönderildi`);
      else mesajGoster("hata", data.error || "Gönderilemedi");
    } finally {
      setPushYuklenen(null);
    }
  }

  async function customPushGonder(e: React.FormEvent) {
    e.preventDefault();
    if (!customBaslik || !customIcerik) return;
    setCustomGonderiliyor(true);
    try {
      const res = await fetch("/api/admin/bildirim/gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik: customBaslik, icerik: customIcerik }),
      });
      const data = await res.json();
      if (res.ok) {
        mesajGoster("basari", `${data.gonderildi} kullanıcıya gönderildi`);
        setCustomIcerik("");
      } else {
        mesajGoster("hata", data.error || "Gönderilemedi");
      }
    } finally {
      setCustomGonderiliyor(false);
    }
  }

  async function zamanlamaSil(id: string) {
    if (!confirm("Bu zamanlı bildirimi iptal et?")) return;
    const res = await fetch(`/api/admin/bildirim/zamanli/${id}`, { method: "DELETE" });
    if (res.ok) setZamanlamalar(zamanlamalar.filter((z) => z.id !== id));
  }

  async function zamanlamaKaydet(zaman: string, baslik: string, icerik: string, haberId?: string) {
    const res = await fetch("/api/admin/bildirim/zamanli", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zamanlanan: zaman, baslik, icerik, haberId }),
    });
    const data = await res.json();
    if (res.ok) {
      mesajGoster("basari", "Bildirim zamanlandı");
      setZamanlaModal(null);
      zamanlamalariYukle();
    } else {
      mesajGoster("hata", data.error || "Kaydedilemedi");
    }
  }

  // Reklam form state
  const [reklamBaslik, setReklamBaslik] = useState("");
  const [reklamUrl, setReklamUrl] = useState("");
  const [reklamResim, setReklamResim] = useState<File | null>(null);
  const [reklamResimUrl, setReklamResimUrl] = useState("");
  const [reklamYukleniyor, setReklamYukleniyor] = useState(false);
  const [reklamHata, setReklamHata] = useState("");
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

  async function yorumGizleToggle(id: string, gizli: boolean) {
    const res = await fetch(`/api/yorumlar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gizli }),
    });
    if (res.ok) {
      setYorumlar(yorumlar.map((y) => (y.id === id ? { ...y, gizli } : y)));
    } else {
      mesajGoster("hata", "Yorum güncellenemedi");
    }
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

  async function cloudinaryYukle(dosya: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", dosya);
    formData.append("upload_preset", "koprugazete_unsigned");
    formData.append("folder", "reklamlar");
    const res = await fetch("https://api.cloudinary.com/v1_1/ddbj0qkxm/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error("Cloudinary yükleme hatası");
    return data.secure_url;
  }

  async function reklamEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!reklamBaslik || (!reklamResim && !reklamResimUrl)) return;
    setReklamYukleniyor(true);
    setReklamHata("");

    try {
      let finalUrl = reklamResimUrl;
      if (reklamResim && !reklamResimUrl) {
        finalUrl = await cloudinaryYukle(reklamResim);
      }

      const res = await fetch("/api/reklamlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik: reklamBaslik, tiklamaUrl: reklamUrl, resimUrl: finalUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setReklamlar([data, ...reklamlar]);
        setReklamBaslik("");
        setReklamUrl("");
        setReklamResim(null);
        setReklamResimUrl("");
        setOnizleme(null);
      } else {
        setReklamHata(data.error || `Hata: ${res.status}`);
      }
    } catch (err: any) {
      setReklamHata(err.message || "Yükleme hatası");
    }
    setReklamYukleniyor(false);
  }

  return (
    <div>
      {bildirimMesaj && (
        <div className={`mb-4 px-4 py-2 rounded text-sm ${bildirimMesaj.tip === "basari" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {bildirimMesaj.metin}
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b">
        {(["haberler", "yorumlar", "reklamlar", "bildirim"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAktifTab(tab)}
            className={`pb-3 px-1 text-sm font-medium transition-colors capitalize ${
              aktifTab === tab
                ? "border-b-2 border-amber-500 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "haberler" ? `Haberler (${haberler.length})` : tab === "yorumlar" ? `Yorumlar (${yorumlar.length})` : tab === "reklamlar" ? `Reklamlar (${reklamlar.length})` : "Bildirim"}
          </button>
        ))}
      </div>

      {aktifTab === "haberler" && (
        <div className="space-y-3">
          {haberler.map((haber) => (
            <div key={haber.id} className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/haber/${haber.id}`} target="_blank" className="font-medium text-sm text-gray-900 hover:text-amber-700 line-clamp-2">
                  {haber.baslik}
                </Link>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                  <span>{haber.yazar?.name || "Bilinmiyor"}</span>
                  <span className="flex items-center gap-1">
                    <EyeIcon size={12} />
                    {haber.goruntuSayisi}
                  </span>
                  <span className="flex items-center gap-1">
                    <ChatIcon size={12} />
                    {haber._count.yorumlar}
                  </span>
                  <span>{formatDistanceToNow(new Date(haber.createdAt), { addSuffix: true, locale: tr })}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {haber.yayinlandiMi && (
                  <>
                    <button onClick={() => haberPushGonder(haber.id)} disabled={pushYuklenen === haber.id} className="text-[#2f4f4f] hover:text-[#1f3333] text-xs font-medium px-3 py-1.5 border border-[#2f4f4f]/30 rounded hover:bg-[#2f4f4f]/5 disabled:opacity-50 transition-colors whitespace-nowrap">
                      {pushYuklenen === haber.id ? "Gönderiliyor..." : "Şimdi Gönder"}
                    </button>
                    <button onClick={() => setZamanlaModal({ haberId: haber.id, baslik: haber.baslik })} className="text-amber-700 hover:text-amber-800 text-xs font-medium px-3 py-1.5 border border-amber-200 rounded hover:bg-amber-50 transition-colors whitespace-nowrap">
                      Zamanla
                    </button>
                  </>
                )}
                <button onClick={() => haberSil(haber.id)} disabled={siliniyor === haber.id} className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap">
                  {siliniyor === haber.id ? "Siliniyor..." : "Sil"}
                </button>
              </div>
            </div>
          ))}
          {haberler.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Haber bulunamadı</p>}
        </div>
      )}

      {aktifTab === "yorumlar" && (
        <div className="space-y-3">
          {yorumlar.map((yorum) => {
            const bildirili = (yorum.bildiriSayisi || 0) > 0;
            return (
              <div
                key={yorum.id}
                className={`border rounded-lg p-4 flex items-start justify-between gap-4 ${
                  bildirili ? "bg-red-50 border-red-200" : yorum.gizli ? "bg-gray-100 border-gray-300" : "bg-white"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-1.5">
                    {yorum.parentId && (
                      <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded">YANIT</span>
                    )}
                    {yorum.gizli && (
                      <span className="text-[10px] font-medium bg-gray-200 text-gray-700 px-2 py-0.5 rounded">GİZLİ</span>
                    )}
                    {bildirili && (
                      <span className="text-[10px] font-medium bg-red-200 text-red-800 px-2 py-0.5 rounded">
                        {yorum.bildiriSayisi} ŞİKAYET
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{yorum.icerik}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="font-medium">{yorum.yazar?.name || "Bilinmiyor"}</span>
                    {yorum.haberId ? (
                      <Link href={`/haber/${yorum.haberId}`} target="_blank" className="truncate max-w-xs hover:underline">
                        {yorum.haberBaslik}
                      </Link>
                    ) : (
                      <span className="truncate max-w-xs">{yorum.haberBaslik}</span>
                    )}
                    <span>{formatDistanceToNow(new Date(yorum.createdAt), { addSuffix: true, locale: tr })}</span>
                  </div>
                  {bildirili && yorum.bildiriler && yorum.bildiriler.length > 0 && (
                    <div className="mt-2 text-xs text-red-700 space-y-0.5">
                      {yorum.bildiriler.map((b, i) => (
                        <div key={i}>
                          <span className="font-medium">{b.bildiren.name || "Bilinmiyor"}:</span>{" "}
                          <span className="italic">{b.sebep || "(sebep belirtilmedi)"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => yorumGizleToggle(yorum.id, !yorum.gizli)}
                    className="text-amber-700 hover:text-amber-800 text-xs font-medium px-3 py-1.5 border border-amber-200 rounded hover:bg-amber-50 transition-colors whitespace-nowrap"
                  >
                    {yorum.gizli ? "Göster" : "Gizle"}
                  </button>
                  <button
                    onClick={() => yorumSil(yorum.id)}
                    disabled={siliniyor === yorum.id}
                    className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {siliniyor === yorum.id ? "Siliniyor..." : "Sil"}
                  </button>
                </div>
              </div>
            );
          })}
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
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <input
                type="url"
                placeholder="Tıklama URL'si (isteğe bağlı)"
                value={reklamUrl}
                onChange={(e) => setReklamUrl(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div>
                <p className="text-xs text-gray-500 mb-1">Resim URL'si (Cloudinary, Google Drive vb.)</p>
                <input
                  type="url"
                  placeholder="https://... (resim URL'si)"
                  value={reklamResimUrl}
                  onChange={(e) => { setReklamResimUrl(e.target.value); setReklamResim(null); setOnizleme(e.target.value); }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-2"
                />
                <p className="text-xs text-gray-400 text-center mb-1">— veya bilgisayardan yükle —</p>
                <input
                  ref={dosyaRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setReklamResim(f); setReklamResimUrl(""); setOnizleme(URL.createObjectURL(f)); }
                  }}
                />
                <button type="button" onClick={() => dosyaRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-amber-500 hover:text-yellow-600 transition-colors">
                  {reklamResim ? reklamResim.name : "Dosya seç"}
                </button>
                {onizleme && (
                  <div className="mt-2 relative w-full h-32 rounded overflow-hidden">
                    <Image src={onizleme} alt="Önizleme" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>
              <button type="submit" disabled={reklamYukleniyor || !reklamBaslik || (!reklamResim && !reklamResimUrl)} className="w-full bg-[#2f4f4f] text-white py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                {reklamYukleniyor ? "Yükleniyor..." : "Reklamı Ekle"}
              </button>
              {reklamHata && <p className="text-red-500 text-sm mt-2">{reklamHata}</p>}
            </div>
          </form>

          {/* Reklamlar */}
          <ReklamListesi
            reklamlar={reklamlar}
            siliniyor={siliniyor}
            onSil={reklamSil}
            onGuncelle={async (id, payload) => {
              const res = await fetch("/api/admin/reklamlar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...payload }),
              });
              if (res.ok) {
                const guncel = await res.json();
                setReklamlar(reklamlar.map((r) => (r.id === id ? { ...r, ...guncel, createdAt: r.createdAt } : r)));
              }
            }}
          />
        </div>
      )}

      {aktifTab === "bildirim" && (
        <div className="space-y-6">
          <form onSubmit={customPushGonder} className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Özel Bildirim Gönder</h3>
            <p className="text-xs text-gray-500 mb-4">Tüm uygulama kullanıcılarına anında push bildirim gider.</p>
            <div className="space-y-3">
              <input type="text" placeholder="Başlık" value={customBaslik} onChange={(e) => setCustomBaslik(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" required maxLength={80} />
              <textarea placeholder="İçerik (mesaj metni)" value={customIcerik} onChange={(e) => setCustomIcerik(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows={3} required maxLength={240} />
              <div className="flex gap-2">
                <button type="submit" disabled={customGonderiliyor || !customBaslik || !customIcerik} className="flex-1 bg-[#2f4f4f] text-white py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  {customGonderiliyor ? "Gönderiliyor..." : "Şimdi Gönder"}
                </button>
                <button type="button" onClick={() => setZamanlaModal({ baslik: customBaslik })} disabled={!customBaslik || !customIcerik} className="flex-1 border border-amber-500 text-amber-700 py-2 rounded text-sm font-medium hover:bg-amber-50 disabled:opacity-50 transition-colors">
                  Zamanla
                </button>
              </div>
            </div>
          </form>

          <div className="bg-white border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Zamanlanmış Bildirimler</h3>
              <button onClick={zamanlamalariYukle} className="text-xs text-gray-500 hover:text-gray-700">Yenile</button>
            </div>
            {zamanlamaYukleniyor ? (
              <p className="text-sm text-gray-500 text-center py-6">Yükleniyor...</p>
            ) : zamanlamalar.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">Zamanlanmış bildirim yok</p>
            ) : (
              <div className="space-y-2">
                {zamanlamalar.map((z) => (
                  <div key={z.id} className={`border rounded p-3 flex items-start justify-between gap-3 ${z.gonderildi ? "bg-gray-50" : "bg-amber-50/30"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{z.baslik}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{z.icerik}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>{format(new Date(z.zamanlanan), "d MMM yyyy HH:mm", { locale: tr })}</span>
                        {z.haber && <span className="truncate max-w-xs">· {z.haber.baslik}</span>}
                        {z.gonderildi && <span className="text-green-700">· Gönderildi</span>}
                      </div>
                    </div>
                    {!z.gonderildi && (
                      <button onClick={() => zamanlamaSil(z.id)} className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors whitespace-nowrap">
                        İptal
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {zamanlaModal && (
        <ZamanlaDialog
          modal={zamanlaModal}
          customBaslik={customBaslik}
          customIcerik={customIcerik}
          onIptal={() => setZamanlaModal(null)}
          onKaydet={zamanlamaKaydet}
        />
      )}
    </div>
  );
}

function ZamanlaDialog({
  modal,
  customBaslik,
  customIcerik,
  onIptal,
  onKaydet,
}: {
  modal: { haberId?: string; baslik?: string };
  customBaslik: string;
  customIcerik: string;
  onIptal: () => void;
  onKaydet: (zaman: string, baslik: string, icerik: string, haberId?: string) => Promise<void>;
}) {
  const varsayilanZaman = new Date(Date.now() + 60 * 60 * 1000);
  varsayilanZaman.setSeconds(0, 0);
  const [zaman, setZaman] = useState(format(varsayilanZaman, "yyyy-MM-dd'T'HH:mm"));
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const haberMi = !!modal.haberId;

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setKaydediliyor(true);
    try {
      if (haberMi) {
        await onKaydet(new Date(zaman).toISOString(), "", "", modal.haberId);
      } else {
        await onKaydet(new Date(zaman).toISOString(), customBaslik, customIcerik);
      }
    } finally {
      setKaydediliyor(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onIptal}>
      <form onSubmit={kaydet} onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg p-5 max-w-md w-full">
        <h3 className="font-semibold text-gray-900 mb-3">Bildirimi Zamanla</h3>
        {haberMi ? (
          <p className="text-sm text-gray-600 mb-3">Haber: <span className="font-medium">{modal.baslik}</span></p>
        ) : (
          <p className="text-sm text-gray-600 mb-3"><span className="font-medium">{customBaslik}</span>: {customIcerik.substring(0, 60)}{customIcerik.length > 60 ? "..." : ""}</p>
        )}
        <label className="block text-xs text-gray-500 mb-1">Tarih ve Saat</label>
        <input
          type="datetime-local"
          value={zaman}
          min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => setZaman(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-2"
          required
        />
        <p className="text-xs text-gray-400 mb-4">Zamanlanmış bildirimler günde 2 kez (08:00 ve 15:00) kontrol edilir. Daha hassas zamanlama için harici cron gerekir.</p>
        <div className="flex gap-2">
          <button type="button" onClick={onIptal} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-50">
            Vazgeç
          </button>
          <button type="submit" disabled={kaydediliyor} className="flex-1 bg-[#2f4f4f] text-white py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
            {kaydediliyor ? "Kaydediliyor..." : "Zamanla"}
          </button>
        </div>
      </form>
    </div>
  );
}

const DURUM_ETIKET: Record<string, { label: string; cls: string }> = {
  BEKLEMEDE: { label: "Beklemede", cls: "bg-amber-100 text-amber-800" },
  ONAYLANDI: { label: "Onaylandı", cls: "bg-green-100 text-green-800" },
  REDDEDILDI: { label: "Reddedildi", cls: "bg-red-100 text-red-700" },
  SURESI_DOLDU: { label: "Süresi doldu", cls: "bg-gray-100 text-gray-600" },
};

interface ReklamListesiProps {
  reklamlar: Reklam[];
  siliniyor: string | null;
  onSil: (id: string) => void;
  onGuncelle: (id: string, payload: Record<string, unknown>) => Promise<void>;
}

function ReklamListesi({ reklamlar, siliniyor, onSil, onGuncelle }: ReklamListesiProps) {
  const [acikId, setAcikId] = useState<string | null>(null);
  const [sureSec, setSureSec] = useState<Record<string, number>>({});
  const [islem, setIslem] = useState<string | null>(null);

  const bekleyenler = reklamlar.filter((r) => r.durum === "BEKLEMEDE");
  const digerleri = reklamlar.filter((r) => r.durum !== "BEKLEMEDE");

  async function onayla(r: Reklam) {
    setIslem(r.id);
    const sure = sureSec[r.id] ?? r.sureGun ?? 30;
    await onGuncelle(r.id, { durum: "ONAYLANDI", sureGun: sure, odendi: true });
    setIslem(null);
    setAcikId(null);
  }
  async function reddet(r: Reklam) {
    if (!confirm("Başvuru reddedilsin mi?")) return;
    setIslem(r.id);
    await onGuncelle(r.id, { durum: "REDDEDILDI" });
    setIslem(null);
  }

  function ReklamKart({ r, bekleyen }: { r: Reklam; bekleyen: boolean }) {
    const acik = acikId === r.id;
    const durum = r.durum || "ONAYLANDI";
    const etiket = DURUM_ETIKET[durum];
    const bitisGosterilebilir = r.bitis && new Date(r.bitis) > new Date();
    return (
      <div className={`bg-white border rounded-lg ${bekleyen ? "border-amber-300" : ""}`}>
        <div className="p-4 flex items-center gap-4">
          <div className="relative w-20 h-14 rounded overflow-hidden flex-shrink-0">
            <Image src={r.resimUrl} alt={r.baslik} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm text-gray-900 truncate">{r.baslik}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${etiket.cls}`}>{etiket.label}</span>
              {r.odendi && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Ödendi</span>}
            </div>
            {r.isletmeAdi && <p className="text-xs text-gray-600">{r.isletmeAdi}{r.iletisimAd ? ` · ${r.iletisimAd}` : ""}</p>}
            {bitisGosterilebilir && <p className="text-xs text-gray-400">Bitiş: {format(new Date(r.bitis!), "d MMM yyyy", { locale: tr })}</p>}
            {!bitisGosterilebilir && <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: tr })}</p>}
          </div>
          <div className="flex gap-2">
            {bekleyen && (
              <button onClick={() => setAcikId(acik ? null : r.id)} className="text-amber-700 text-xs font-medium px-3 py-1.5 border border-amber-300 rounded hover:bg-amber-50">
                {acik ? "Kapat" : "İncele"}
              </button>
            )}
            <button onClick={() => onSil(r.id)} disabled={siliniyor === r.id} className="text-red-500 hover:text-red-700 text-xs font-medium px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50">
              {siliniyor === r.id ? "..." : "Sil"}
            </button>
          </div>
        </div>
        {acik && bekleyen && (
          <div className="border-t border-amber-200 bg-amber-50/50 px-4 py-3 space-y-2">
            <div className="text-sm text-gray-800 space-y-1">
              <p><span className="text-gray-500">İşletme:</span> {r.isletmeAdi}</p>
              <p><span className="text-gray-500">İletişim:</span> {r.iletisimAd}</p>
              <p>
                <span className="text-gray-500">Telefon:</span>{" "}
                <a href={`tel:${r.telefon}`} className="text-blue-600 underline">{r.telefon}</a>
                {" · "}
                <a href={`https://wa.me/${(r.telefon || "").replace(/\D/g, "")}`} target="_blank" rel="noopener" className="text-green-700 underline">WhatsApp</a>
              </p>
              <p><span className="text-gray-500">Talep süre:</span> {r.sureGun} gün</p>
              {r.tiklamaUrl && <p><span className="text-gray-500">Link:</span> <a href={r.tiklamaUrl} target="_blank" rel="noopener" className="text-blue-600 underline truncate">{r.tiklamaUrl}</a></p>}
              {r.aciklama && <p className="text-gray-700 whitespace-pre-line">{r.aciklama}</p>}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <label className="text-xs text-gray-600">Süre:</label>
              <select
                value={sureSec[r.id] ?? r.sureGun ?? 30}
                onChange={(e) => setSureSec({ ...sureSec, [r.id]: Number(e.target.value) })}
                className="border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value={7}>7 gün</option>
                <option value={30}>30 gün</option>
                <option value={90}>90 gün</option>
              </select>
              <button onClick={() => onayla(r)} disabled={islem === r.id} className="ml-auto bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50">
                {islem === r.id ? "..." : "Ödeme alındı, yayınla"}
              </button>
              <button onClick={() => reddet(r)} disabled={islem === r.id} className="bg-red-50 text-red-700 text-xs font-medium px-3 py-1.5 rounded border border-red-200 hover:bg-red-100 disabled:opacity-50">
                Reddet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bekleyenler.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-amber-800 mb-2">Bekleyen başvurular ({bekleyenler.length})</h4>
          <div className="space-y-3">
            {bekleyenler.map((r) => <ReklamKart key={r.id} r={r} bekleyen />)}
          </div>
        </div>
      )}
      <div>
        {bekleyenler.length > 0 && <h4 className="text-sm font-semibold text-gray-700 mb-2">Diğer reklamlar</h4>}
        <div className="space-y-3">
          {digerleri.map((r) => <ReklamKart key={r.id} r={r} bekleyen={false} />)}
        </div>
        {reklamlar.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Henüz reklam eklenmedi</p>}
      </div>
    </div>
  );
}
