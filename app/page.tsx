import { prisma } from "@/lib/prisma";
import HaberKarti from "@/components/HaberKarti";
import Link from "next/link";
import { Kategori } from "@/app/generated/prisma/client";

const KATEGORILER = [
  { key: "TUMU", label: "Tümü" },
  { key: "SPOR", label: "Spor" },
  { key: "EKONOMI", label: "Ekonomi" },
  { key: "KULTUR", label: "Kültür" },
  { key: "EGITIM", label: "Eğitim" },
  { key: "SAGLIK", label: "Sağlık" },
  { key: "DUYURU", label: "Duyurular" },
];

export default async function AnaSayfa({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; sayfa?: string }>;
}) {
  const params = await searchParams;
  const kategori = params.kategori as Kategori | undefined;
  const sayfa = parseInt(params.sayfa || "1");
  const limit = 12;

  const where = {
    yayinlandiMi: true,
    ...(kategori ? { kategori } : {}),
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
  const aktifKategori = kategori ?? "TUMU";

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {KATEGORILER.map((kat) => (
          <Link
            key={kat.key}
            href={kat.key === "TUMU" ? "/" : `/?kategori=${kat.key}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              aktifKategori === kat.key
                ? "bg-[#1a1a2e] text-yellow-400"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {kat.label}
          </Link>
        ))}
      </div>

      {haberler.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl mb-2">Henüz haber yok</p>
          <p className="text-sm">İlk haberi sen gönder!</p>
          <Link
            href="/haber-gonder"
            className="mt-4 inline-block bg-yellow-500 text-black font-semibold px-6 py-2 rounded hover:bg-yellow-400 transition-colors"
          >
            Haber Gönder
          </Link>
        </div>
      ) : (
        <>
          {sayfa === 1 && haberler.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <HaberKarti haber={haberler[0]} buyuk />
              </div>
              <div className="flex flex-col gap-4">
                {haberler.slice(1, 3).map((haber) => (
                  <HaberKarti key={haber.id} haber={haber} />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {haberler.slice(sayfa === 1 ? 3 : 0).map((haber) => (
              <HaberKarti key={haber.id} haber={haber} />
            ))}
          </div>

          {toplamSayfa > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              {sayfa > 1 && (
                <Link
                  href={`/?${kategori ? `kategori=${kategori}&` : ""}sayfa=${sayfa - 1}`}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  ← Önceki
                </Link>
              )}
              <span className="text-sm text-gray-600">
                {sayfa} / {toplamSayfa}
              </span>
              {sayfa < toplamSayfa && (
                <Link
                  href={`/?${kategori ? `kategori=${kategori}&` : ""}sayfa=${sayfa + 1}`}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Sonraki →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
