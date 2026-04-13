import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface HaberKartiProps {
  haber: {
    id: string;
    baslik: string;
    icerik: string;
    fotografUrls?: string[];
    fotografAlt?: string | null;
    kategori: string;
    anonim: boolean;
    yazarAdi?: string | null;
    createdAt: string | Date;
    _count?: { yorumlar: number };
    yazar?: { name?: string | null; image?: string | null } | null;
  };
  buyuk?: boolean;
}

const kategoriRenkler: Record<string, string> = {
  GENEL: "bg-gray-500",
  SPOR: "bg-green-600",
  KULTUR: "bg-purple-600",
  EKONOMI: "bg-blue-600",
  EGITIM: "bg-orange-500",
  SAGLIK: "bg-red-500",
  DUYURU: "bg-yellow-500 text-black",
};

const kategoriIsimler: Record<string, string> = {
  GENEL: "Genel",
  SPOR: "Spor",
  KULTUR: "Kültür",
  EKONOMI: "Ekonomi",
  EGITIM: "Eğitim",
  SAGLIK: "Sağlık",
  DUYURU: "Duyuru",
};

export default function HaberKarti({ haber, buyuk = false }: HaberKartiProps) {
  const ozetMetin = haber.icerik.replace(/<[^>]*>/g, "").substring(0, buyuk ? 200 : 120) + "...";
  const yazarAdi = haber.anonim ? "Anonim" : (haber.yazarAdi || haber.yazar?.name || "Bilinmiyor");
  const tarih = formatDistanceToNow(new Date(haber.createdAt), { addSuffix: true, locale: tr });
  const kapakFoto = haber.fotografUrls?.[0];

  return (
    <Link href={`/haber/${haber.id}`}>
      <article className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group ${buyuk ? "h-full" : ""}`}>
        {kapakFoto && (
          <div className={`relative overflow-hidden bg-gray-100 ${buyuk ? "h-64" : "h-48"}`}>
            <Image
              src={kapakFoto}
              alt={haber.fotografAlt || haber.baslik}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
            {haber.fotografUrls && haber.fotografUrls.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                +{haber.fotografUrls.length - 1} fotoğraf
              </span>
            )}
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded text-white ${kategoriRenkler[haber.kategori] || "bg-gray-500"}`}>
              {kategoriIsimler[haber.kategori] || haber.kategori}
            </span>
          </div>
          <h2 className={`font-serif font-bold text-gray-900 group-hover:text-yellow-700 transition-colors leading-snug ${buyuk ? "text-xl mb-3" : "text-base mb-2"}`}>
            {haber.baslik}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{ozetMetin}</p>
          <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-2">
            <span>{yazarAdi}</span>
            <div className="flex items-center gap-3">
              {haber._count && <span>💬 {haber._count.yorumlar}</span>}
              <span>{tarih}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
