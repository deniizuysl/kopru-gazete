import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushBildirimGonder } from "@/lib/push";

// Her sabah kullanıcılara push — son yayınlanan haberi duyurur.
// Manuel tetikleme: ?haberId=<id> ile belirli bir haberi push'lar. ?zorla=1 → 24 saat filtresini atlar.
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const haberIdOverride = req.nextUrl.searchParams.get("haberId");
  const zorla = req.nextUrl.searchParams.get("zorla") === "1";

  let haber;
  if (haberIdOverride) {
    haber = await prisma.haber.findUnique({
      where: { id: haberIdOverride },
      select: { id: true, baslik: true, yazarAdi: true, yayinlandiMi: true, yazar: { select: { name: true } } },
    });
    if (!haber || !haber.yayinlandiMi) {
      return NextResponse.json({ gonderildi: 0, sebep: "Haber bulunamadı veya yayında değil" });
    }
  } else {
    const yirmiDortSaatOnce = new Date(Date.now() - 24 * 60 * 60 * 1000);
    haber = await prisma.haber.findFirst({
      where: {
        yayinlandiMi: true,
        spam: false,
        onayBekliyor: false,
        ...(zorla ? {} : { createdAt: { gte: yirmiDortSaatOnce } }),
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, baslik: true, yazarAdi: true, yayinlandiMi: true, yazar: { select: { name: true } } },
    });
    if (!haber) {
      return NextResponse.json({ gonderildi: 0, sebep: "Son 24 saatte yayımlanan haber yok" });
    }
  }

  const yazar = haber.yazarAdi || haber.yazar?.name || "";
  const baslik = "☀️ Günaydın · Köprü Gazetesi";
  const icerik = yazar
    ? `${yazar}'dan yeni haber: ${haber.baslik}`
    : `Yeni haber: ${haber.baslik}`;

  const kullanicilar = await prisma.user.findMany({
    where: { pushToken: { not: null } },
    select: { pushToken: true },
  });
  const tokenlar = kullanicilar.map((k) => k.pushToken!).filter(Boolean);

  if (tokenlar.length === 0) {
    return NextResponse.json({ gonderildi: 0, sebep: "Push token'ı olan kullanıcı yok" });
  }

  await pushBildirimGonder(tokenlar, baslik, icerik, haber.id);

  return NextResponse.json({
    gonderildi: tokenlar.length,
    haberId: haber.id,
    haberBaslik: haber.baslik,
    yazar,
  });
}
