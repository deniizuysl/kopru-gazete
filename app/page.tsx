import { prisma } from "@/lib/prisma";
import HaberKarti from "@/components/HaberKarti";
import Link from "next/link";
import { Kategori, Prisma } from "@/app/generated/prisma/client";
import { ArrowLeftIcon, ArrowRightIcon, NewspaperIcon } from "@/components/icons";

export default async function AnaSayfa({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; sayfa?: string; ara?: string }>;
}) {
  const params = await searchParams;
  const kategori = params.kategori as Kategori | undefined;
  const arama = params.ara?.trim();
  const sayfa = parseInt(params.sayfa || "1");
  const limit = 12;

  const where: Prisma.HaberWhereInput = {
    yayinlandiMi: true,
    ...(kategori ? { kategori } : {}),
    ...(arama
      ? {
          OR: [
            { baslik: { contains: arama, mode: "insensitive" } },
            { icerik: { contains: arama, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [haberler, toplam] = await Promise.all([
    prisma.haber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (sayfa - 1) * limit,
      take: limit,
      select: {
        id: true,
        baslik: true,
        icerik: true,
        fotografUrls: true,
        fotografAlt: true,
        kategori: true,
        anonim: true,
        yazarAdi: true,
        createdAt: true,
        _count: { select: { yorumlar: true } },
        yazar: { select: { name: true, image: true } },
      },
    }),
    prisma.haber.count({ where }),
  ]);

  const toplamSayfa = Math.ceil(toplam / limit);
  const sayfaQuery = (n: number) => {
    const qp = new URLSearchParams();
    if (kategori) qp.set("kategori", kategori);
    if (arama) qp.set("ara", arama);
    qp.set("sayfa", String(n));
    return `/?${qp.toString()}`;
  };

  const baslikMetni = arama
    ? `"${arama}" için sonuçlar`
    : kategori
      ? null
      : "Güncel Haberler";

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {(baslikMetni || arama) && (
        <div className="mb-6 flex items-end justify-between gap-3 flex-wrap">
          <div>
            {baslikMetni && (
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2f4f4f]">
                {baslikMetni}
              </h1>
            )}
            {arama && (
              <p className="text-sm text-gray-500 mt-1">
                {toplam} haber bulundu
              </p>
            )}
          </div>
          {arama && (
            <Link
              href="/"
              className="text-sm text-[#2f4f4f] hover:text-amber-600 underline underline-offset-4"
            >
              Aramayı temizle
            </Link>
          )}
        </div>
      )}

      {haberler.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#2f4f4f]/5 flex items-center justify-center text-[#2f4f4f]">
            <NewspaperIcon size={28} />
          </div>
          <p className="text-xl mb-2 font-serif text-[#2f4f4f]">
            {arama ? "Sonuç bulunamadı" : "Henüz haber yok"}
          </p>
          <p className="text-sm mb-4">
            {arama
              ? "Farklı bir kelime dene ya da kategoriye göz at."
              : "İlk haberi sen gönder!"}
          </p>
          {!arama && (
            <Link
              href="/haber-gonder"
              className="inline-block bg-amber-500 text-[#2f4f4f] font-semibold px-6 py-2 rounded-full hover:bg-amber-400 transition-colors"
            >
              Haber Gönder
            </Link>
          )}
        </div>
      ) : (
        <>
          {sayfa === 1 && !arama && haberler.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              <div className="lg:col-span-2">
                <HaberKarti haber={haberler[0]} buyuk />
              </div>
              <div className="flex flex-col gap-5">
                {haberler.slice(1, 3).map((haber) => (
                  <HaberKarti key={haber.id} haber={haber} />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {haberler.slice(sayfa === 1 && !arama ? 3 : 0).map((haber) => (
              <HaberKarti key={haber.id} haber={haber} />
            ))}
          </div>

          {toplamSayfa > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              {sayfa > 1 ? (
                <Link
                  href={sayfaQuery(sayfa - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-[#2f4f4f] hover:text-[#2f4f4f] text-sm transition-colors"
                >
                  <ArrowLeftIcon size={14} />
                  <span>Önceki</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-300">
                  <ArrowLeftIcon size={14} />
                  <span>Önceki</span>
                </span>
              )}
              <span className="text-sm text-gray-600 font-medium">
                {sayfa} / {toplamSayfa}
              </span>
              {sayfa < toplamSayfa ? (
                <Link
                  href={sayfaQuery(sayfa + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-[#2f4f4f] hover:text-[#2f4f4f] text-sm transition-colors"
                >
                  <span>Sonraki</span>
                  <ArrowRightIcon size={14} />
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-300">
                  <span>Sonraki</span>
                  <ArrowRightIcon size={14} />
                </span>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
