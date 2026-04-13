import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mobilTokenDogrula } from "@/lib/mobil-auth";

async function getKullanici(req: NextRequest) {
  const session = await auth();
  if (session?.user?.id) return { id: session.user.id };
  return await mobilTokenDogrula(req.headers.get("authorization"));
}

export async function POST(req: NextRequest) {
  const kullanici = await getKullanici(req);
  if (!kullanici) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { yorumId } = await req.json();
  if (!yorumId) return NextResponse.json({ error: "yorumId gerekli" }, { status: 400 });

  const mevcut = await prisma.yorumBegeni.findUnique({
    where: { yorumId_kullaniciId: { yorumId, kullaniciId: kullanici.id } },
  });

  if (mevcut) {
    await prisma.yorumBegeni.delete({ where: { id: mevcut.id } });
    const sayi = await prisma.yorumBegeni.count({ where: { yorumId } });
    return NextResponse.json({ begenildi: false, sayi });
  } else {
    await prisma.yorumBegeni.create({ data: { yorumId, kullaniciId: kullanici.id } });
    const sayi = await prisma.yorumBegeni.count({ where: { yorumId } });
    return NextResponse.json({ begenildi: true, sayi });
  }
}
