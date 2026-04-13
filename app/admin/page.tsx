import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [haberler, yorumlar, reklamlar] = await Promise.all([
    prisma.haber.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        baslik: true,
        kategori: true,
        anonim: true,
        yazarAdi: true,
        yayinlandiMi: true,
        createdAt: true,
        goruntuSayisi: true,
        _count: { select: { yorumlar: true } },
        yazar: { select: { name: true } },
      },
    }),
    prisma.yorum.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        icerik: true,
        createdAt: true,
        haber: { select: { baslik: true } },
        yazar: { select: { name: true } },
      },
    }),
    prisma.reklam.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Admin Paneli</h1>
      <p className="text-gray-600 text-sm mb-8">Haber, yorum ve reklam yönetimi</p>
      <AdminPanel
        haberler={haberler.map((h) => ({
          ...h,
          createdAt: h.createdAt.toISOString(),
        }))}
        yorumlar={yorumlar.map((y) => ({
          id: y.id,
          icerik: y.icerik,
          anonim: false,
          yazarAdi: y.yazar?.name || null,
          createdAt: y.createdAt.toISOString(),
          haberBaslik: y.haber.baslik,
          yazar: y.yazar,
        }))}
        reklamlar={reklamlar.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
