"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function HaberGonderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [icerik, setIcerik] = useState("");
  const [anonim, setAnonim] = useState(false);
  const [yazarAdi, setYazarAdi] = useState(session?.user?.name || "");
  const [fotograflar, setFotograflar] = useState<{ onizleme: string; url: string }[]>([]);
  const [fotografYukleniyor, setFotografYukleniyor] = useState(false);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState("");
  const dosyaInputRef = useRef<HTMLInputElement>(null);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen text-gray-500">Yükleniyor...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Haber göndermek için giriş yapın</h2>
        <div className="flex gap-3 justify-center">
          <Link href="/giris" className="bg-[#2f4f4f] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">Giriş Yap</Link>
          <Link href="/kayit" className="bg-amber-500 text-black px-6 py-2.5 rounded-lg font-medium hover:bg-amber-500 transition-colors">Kayıt Ol</Link>
        </div>
      </div>
    );
  }

  async function fotografYukle(e: React.ChangeEvent<HTMLInputElement>) {
    const dosyalar = Array.from(e.target.files || []);
    if (!dosyalar.length) return;

    if (fotograflar.length + dosyalar.length > 5) {
      setHata("En fazla 5 fotoğraf yükleyebilirsiniz");
      return;
    }

    setFotografYukleniyor(true);
    setHata("");

    for (const dosya of dosyalar) {
      if (dosya.size > 5 * 1024 * 1024) {
        setHata(`${dosya.name} 5MB'dan büyük`);
        continue;
      }

      const onizleme = URL.createObjectURL(dosya);
      const formData = new FormData();
      formData.append("file", dosya);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          setFotograflar((prev) => [...prev, { onizleme, url: data.url }]);
        } else {
          setHata(data.error || "Fotoğraf yüklenemedi");
        }
      } catch {
        setHata("Fotoğraf yükleme hatası");
      }
    }

    setFotografYukleniyor(false);
    if (dosyaInputRef.current) dosyaInputRef.current.value = "";
  }

  function fotografSil(index: number) {
    setFotograflar((prev) => prev.filter((_, i) => i !== index));
  }

  async function haberGonder(e: React.FormEvent) {
    e.preventDefault();
    if (icerik.trim().length < 20) {
      setHata("Haber içeriği en az 20 karakter olmalı");
      return;
    }

    setGonderiyor(true);
    setHata("");

    try {
      const res = await fetch("/api/haberler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hamIcerik: icerik.trim(),
          fotografUrls: fotograflar.map((f) => f.url),
          anonim,
          yazarAdi: anonim ? undefined : yazarAdi,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setHata(data.error || "Haber gönderilemedi");
        setGonderiyor(false);
        return;
      }

      router.push(`/haber/${data.id}`);
    } catch {
      setHata("Bir hata oluştu. Tekrar deneyin.");
      setGonderiyor(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Haber Gönder</h1>
      <p className="text-gray-600 text-sm mb-8">Haberinizi yazın, yapay zeka profesyonel bir haber formatına dönüştürsün.</p>

      <form onSubmit={haberGonder} className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Nasıl çalışır?</strong> Ham metninizi yazın, yapay zeka otomatik olarak başlık ve profesyonel haber formatı oluşturacak.
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Haber İçeriği <span className="text-red-500">*</span>
          </label>
          <textarea
            value={icerik}
            onChange={(e) => setIcerik(e.target.value)}
            placeholder="Ne oldu? Nerede? Ne zaman? Kimler vardı? Detayları yazın..."
            rows={8}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{icerik.length} karakter</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotoğraflar (İsteğe Bağlı — max 5 adet)
          </label>

          {fotograflar.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {fotograflar.map((f, i) => (
                <div key={i} className="relative group">
                  <Image src={f.onizleme} alt={`Fotoğraf ${i + 1}`} width={200} height={150} className="w-full h-28 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => fotografSil(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {fotograflar.length < 5 && (
            <div
              onClick={() => dosyaInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 transition-colors"
            >
              {fotografYukleniyor ? (
                <p className="text-sm text-gray-500">Yükleniyor...</p>
              ) : (
                <>
                  <p className="text-gray-500 text-sm">+ Fotoğraf ekle</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — max 5MB — {5 - fotograflar.length} adet daha eklenebilir</p>
                </>
              )}
            </div>
          )}

          <input
            ref={dosyaInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={fotografYukle}
            className="hidden"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={anonim} onChange={(e) => setAnonim(e.target.checked)} className="rounded" />
            <div>
              <span className="text-sm font-medium text-gray-700">Anonim olarak gönder</span>
              <p className="text-xs text-gray-400">İsminiz haberde görünmeyecek</p>
            </div>
          </label>

          {!anonim && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Haberde görünecek isim</label>
              <input
                type="text"
                value={yazarAdi}
                onChange={(e) => setYazarAdi(e.target.value)}
                placeholder={session?.user?.name || "Ad Soyad"}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {hata && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded px-4 py-3">{hata}</p>
        )}

        <button
          type="submit"
          disabled={gonderiyor || fotografYukleniyor}
          className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-500 disabled:opacity-50 transition-colors text-sm"
        >
          {gonderiyor ? "Yapay Zeka Haberinizi Yazıyor..." : "Haber Gönder"}
        </button>
      </form>
    </main>
  );
}
