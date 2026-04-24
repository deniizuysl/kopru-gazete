import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { ChatIcon, CameraIcon } from "@/components/icons";

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

const kategoriStil: Record<string, string> = {
  GENEL: "bg-[#2f4f4f] text-amber-400",
  SPOR: "bg-[#7b8b4a] text-white",
  KULTUR: "bg-[#c8a046] text-[#2f4f4f]",
  EKONOMI: "bg-[#2f4f4f] text-amber-400",
  EGITIM: "bg-[#5a6b3d] text-white",
  SAGLIK: "bg-[#b37a2e] text-white",
  DUYURU: "bg-amber-500 text-[#2f4f4f]",
  YASAM: "bg-[#a85a76] text-white",
  MANISA: "bg-[#3d5a7b] text-white",
  TARIM: "bg-[#6b8e23] text-white",
};

const kategoriIsimler: Record<string, string> = {
  GENEL: "Genel",
  SPOR: "Spor",
  KULTUR: "Kültür",
  EKONOMI: "Ekonomi",
  EGITIM: "Eğitim",
  SAGLIK: "Sağlık",
  DUYURU: "Duyuru",
  YASAM: "Yaşam",
  MANISA: "Manisa",
  TARIM: "Tarım",
};

export default function HaberKarti({ haber, buyuk = false }: HaberKartiProps) {
  const ozetMetin = haber.icerik.replace(/<[^>]*>/g, "").substring(0, buyuk ? 200 : 120) + "...";
  const yazarAdi = haber.anonim ? "Anonim" : (haber.yazarAdi || haber.yazar?.name || "Bilinmiyor");
  const tarih = formatDistanceToNow(new Date(haber.createdAt), { addSuffix: true, locale: tr });
  const kapakFoto = haber.fotografUrls?.[0];
  const kategoriCls = kategoriStil[haber.kategori] || kategoriStil.GENEL;
  const kategoriAd = kategoriIsimler[haber.kategori] || haber.kategori;

  if (buyuk && kapakFoto) {
    return (
      <Link href={`/haber/${haber.id}`} className="group block h-full">
        <article className="relative h-full min-h-[22rem] md:min-h-[28rem] rounded-xl overflow-hidden bg-[#2f4f4f] shadow-sm hover:shadow-xl transition-shadow">
          <Image
            src={kapakFoto}
            alt={haber.fotografAlt || haber.baslik}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          {haber.fotografUrls && haber.fotografUrls.length > 1 && (
            <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <CameraIcon size={12} />
              +{haber.fotografUrls.length - 1}
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded mb-3 ${kategoriCls}`}>
              {kategoriAd}
            </span>
            <h2 className="font-serif font-bold text-white text-2xl md:text-3xl leading-tight mb-2 group-hover:text-amber-300 transition-colors">
              {haber.baslik}
            </h2>
            <p className="hidden md:block text-gray-200 text-sm leading-relaxed mb-3 line-clamp-2">
              {ozetMetin}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span className="font-medium">{yazarAdi}</span>
              <div className="flex items-center gap-3">
                {haber._count && (
                  <span className="flex items-center gap-1.5">
                    <ChatIcon size={13} />
                    {haber._count.yorumlar}
                  </span>
                )}
                <span>{tarih}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/haber/${haber.id}`} className="group block h-full">
      <article className="h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-amber-300 transition-all flex flex-col">
        {kapakFoto ? (
          <div className={`relative overflow-hidden bg-gray-100 ${buyuk ? "h-56" : "h-44"}`}>
            <Image
              src={kapakFoto}
              alt={haber.fotografAlt || haber.baslik}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className={`absolute top-2.5 left-2.5 text-xs font-semibold px-2 py-0.5 rounded ${kategoriCls}`}>
              {kategoriAd}
            </span>
            {haber.fotografUrls && haber.fotografUrls.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <CameraIcon size={11} />
                +{haber.fotografUrls.length - 1}
              </span>
            )}
          </div>
        ) : (
          <div className="px-4 pt-4">
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${kategoriCls}`}>
              {kategoriAd}
            </span>
          </div>
        )}
        <div className="p-4 flex flex-col flex-1">
          <h2 className="font-serif font-bold text-gray-900 group-hover:text-[#2f4f4f] transition-colors leading-snug text-base mb-2">
            {haber.baslik}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2 flex-1">
            {ozetMetin}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2.5 mt-auto">
            <span className="truncate">{yazarAdi}</span>
            <div className="flex items-center gap-3 shrink-0">
              {haber._count && (
                <span className="flex items-center gap-1">
                  <ChatIcon size={12} />
                  {haber._count.yorumlar}
                </span>
              )}
              <span>{tarih}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
