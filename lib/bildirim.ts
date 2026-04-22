import { prisma } from "@/lib/prisma";
import { pushBildirimGonder } from "@/lib/push";

export interface BildirimIcerik {
  baslik: string;
  icerik: string;
  haberId?: string | null;
}

// Push token'ı olan tüm kullanıcılara bildirim gönderir. Kaç kişiye gittiğini döner.
export async function herkeseGonder({ baslik, icerik, haberId }: BildirimIcerik): Promise<number> {
  const kullanicilar = await prisma.user.findMany({
    where: { pushToken: { not: null }, banli: false },
    select: { pushToken: true },
  });
  const tokenlar = kullanicilar.map((k) => k.pushToken!).filter(Boolean);
  if (tokenlar.length === 0) return 0;

  await pushBildirimGonder(tokenlar, baslik, icerik, haberId || "");
  return tokenlar.length;
}

// Zamanı gelmiş zamanlı push'ları işler. Sabah cron'u yedek olarak da çağırır (cron zinciri kopsa bile günlük işleniyor).
export async function zamanliPushlariIsle(): Promise<Array<{ id: string; gonderildi: number }>> {
  const simdi = new Date();
  const bekleyenler = await prisma.zamanliPush.findMany({
    where: { gonderildi: false, zamanlanan: { lte: simdi } },
    orderBy: { zamanlanan: "asc" },
    take: 20,
  });

  const sonuclar: Array<{ id: string; gonderildi: number }> = [];
  for (const p of bekleyenler) {
    try {
      const gonderildi = await herkeseGonder({
        baslik: p.baslik,
        icerik: p.icerik,
        haberId: p.haberId,
      });
      await prisma.zamanliPush.update({
        where: { id: p.id },
        data: { gonderildi: true, gonderimTarihi: new Date() },
      });
      sonuclar.push({ id: p.id, gonderildi });
    } catch (e) {
      console.error("Zamanlı push hatası:", p.id, e);
    }
  }
  return sonuclar;
}

// Verilen haber için varsayılan bildirim metni üretir.
export async function haberdenIcerikUret(haberId: string): Promise<BildirimIcerik | null> {
  const haber = await prisma.haber.findUnique({
    where: { id: haberId },
    select: { id: true, baslik: true, yazarAdi: true, yayinlandiMi: true, yazar: { select: { name: true } } },
  });
  if (!haber || !haber.yayinlandiMi) return null;

  const yazar = haber.yazarAdi || haber.yazar?.name || "";
  return {
    baslik: "📰 Köprü Gazetesi",
    icerik: yazar ? `${yazar}: ${haber.baslik}` : haber.baslik,
    haberId: haber.id,
  };
}
