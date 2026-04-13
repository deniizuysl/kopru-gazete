import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mobilTokenDogrula } from "@/lib/mobil-auth";

async function getKullanici(req: NextRequest) {
  const session = await auth();
  if (session?.user?.id) return session.user.id;
  const mobil = await mobilTokenDogrula(req.headers.get("authorization"));
  return mobil?.id || null;
}

export async function GET(req: NextRequest) {
  const kullaniciId = await getKullanici(req);
  if (!kullaniciId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const bildirimler = await prisma.bildirim.findMany({
    where: { kullaniciId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const okunmamisSayisi = bildirimler.filter(b => !b.okundu).length;
  return NextResponse.json({ bildirimler, okunmamisSayisi });
}

export async function PATCH(req: NextRequest) {
  const kullaniciId = await getKullanici(req);
  if (!kullaniciId) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  await prisma.bildirim.updateMany({
    where: { kullaniciId, okundu: false },
    data: { okundu: true },
  });

  return NextResponse.json({ ok: true });
}
