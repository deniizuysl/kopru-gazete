import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import YorumBolumu from "@/components/YorumBolumu";
import FotoGaleri from "@/components/FotoGaleri";
import { PenIcon, ClockIcon, EyeIcon, ChatIcon } from "@/components/icons";

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

export default async function HaberDetay({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const haber = await prisma.haber.findUnique({
    where: { id, yayinlandiMi: true },
    include: {
      yazar: { select: { name: true, image: true } },
      yorumlar: {
        where: { gizli: false },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          yazar: { select: { name: true, image: true } },
        },
      },
    },
  });

  if (!haber) notFound();

  await prisma.haber.update({
    where: { id },
    data: { goruntuSayisi: { increment: 1 } },
  });

  const yazarAdi = haber.anonim
    ? "Anonim"
    : haber.yazarAdi || haber.yazar?.name || "Bilinmiyor";

  const tarih = formatDistanceToNow(new Date(haber.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <article>
        <div className="mb-4">
          <span className="text-xs font-semibold bg-[#2f4f4f] text-amber-500 px-3 py-1 rounded-full uppercase tracking-wide">
            {kategoriIsimler[haber.kategori] || haber.kategori}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight mb-4">
          {haber.baslik}
        </h1>

        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500 mb-6 pb-4 border-b border-gray-200">
          <span className="flex items-center gap-1.5">
            <PenIcon size={14} />
            {yazarAdi}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon size={14} />
            {tarih}
          </span>
          <span className="flex items-center gap-1.5">
            <EyeIcon size={14} />
            {haber.goruntuSayisi} görüntülenme
          </span>
          <span className="flex items-center gap-1.5">
            <ChatIcon size={14} />
            {haber.yorumlar.length} yorum
          </span>
        </div>

        {/* Fotoğraf galerisi */}
        <FotoGaleri
          fotografUrls={haber.fotografUrls}
          fotografAlt={haber.fotografAlt}
          baslik={haber.baslik}
        />

        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
          {haber.icerik.split("\n\n").map((paragraf: string, i: number) => (
            <p key={i} className="mb-4">
              {paragraf}
            </p>
          ))}
        </div>
      </article>

      <YorumBolumu
        haberId={haber.id}
        yorumlar={haber.yorumlar.map((y) => ({
          id: y.id,
          icerik: y.icerik,
          createdAt: y.createdAt.toISOString(),
          gizli: y.gizli,
          parentId: y.parentId,
          yazarId: y.yazarId,
          yazar: y.yazar,
        }))}
      />
    </main>
  );
}
