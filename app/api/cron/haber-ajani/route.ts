import { NextRequest, NextResponse } from "next/server";
import { haberAjaniniCalistir } from "@/lib/haber-ajani";
import { pushAdminOnayBildirimi } from "@/lib/push";
import { prisma } from "@/lib/prisma";

// Vercel Cron günlük tetikler. Haftada ~5 haber için haftanın 2 gününü atla.
// Özel gün varsa her gün çalışır (özel gün haberi + RSS haberi birlikte üretilebilir).
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function bugunAtlaMi(): boolean {
  // 0=Pazar, 1=Pazartesi ... 6=Cumartesi. Pazartesi ve Perşembe atla → 5 gün çalışır.
  const gun = new Date().getDay();
  return gun === 1 || gun === 4;
}

export async function GET(req: NextRequest) {
  // Vercel Cron `Authorization: Bearer CRON_SECRET` gönderir.
  const auth = req.headers.get("authorization");
  const beklenen = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== beklenen) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const zorla = req.nextUrl.searchParams.get("zorla") === "1";

  try {
    if (bugunAtlaMi() && !zorla) {
      return NextResponse.json({ atlandi: true, sebep: "Ajan bu gün kapalı" });
    }

    const sonuc = await haberAjaniniCalistir(1);

    // Onay bekleyen üretildiyse admin'lere push gönder
    if (sonuc.uretilenler.length > 0) {
      const adminler = await prisma.user.findMany({
        where: { role: "ADMIN", pushToken: { not: null } },
        select: { pushToken: true },
      });
      const tokenlar = adminler.map((a) => a.pushToken!).filter(Boolean);
      await pushAdminOnayBildirimi(tokenlar, sonuc.uretilenler.length).catch(() => {});
    }

    return NextResponse.json(sonuc);
  } catch (e: any) {
    console.error("Haber ajanı hatası:", e);
    return NextResponse.json({ error: e?.message || "Ajan hatası" }, { status: 500 });
  }
}
