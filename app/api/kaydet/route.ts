import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const kullanici = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!kullanici) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const kaydedilenler = await prisma.kaydedilenHaber.findMany({
    where: { kullaniciId: kullanici.id },
    orderBy: { createdAt: "desc" },
    include: {
      haber: {
        select: {
          id: true,
          baslik: true,
          fotografUrls: true,
          kategori: true,
          createdAt: true,
          _count: { select: { yorumlar: true } },
          yazar: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json(kaydedilenler.map((k) => k.haber));
}

export async function POST(req: NextRequest) {
  const kullanici = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!kullanici) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { haberId } = await req.json();

  const mevcut = await prisma.kaydedilenHaber.findUnique({
    where: { kullaniciId_haberId: { kullaniciId: kullanici.id, haberId } },
  });

  if (mevcut) {
    await prisma.kaydedilenHaber.delete({ where: { id: mevcut.id } });
    return NextResponse.json({ kaydedildi: false });
  } else {
    await prisma.kaydedilenHaber.create({
      data: { kullaniciId: kullanici.id, haberId },
    });
    return NextResponse.json({ kaydedildi: true });
  }
}
