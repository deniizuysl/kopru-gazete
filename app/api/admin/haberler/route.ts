import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const kullanici = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!kullanici || kullanici.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const haberler = await prisma.haber.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      baslik: true,
      kategori: true,
      yayinlandiMi: true,
      createdAt: true,
      goruntuSayisi: true,
      _count: { select: { yorumlar: true } },
      yazar: { select: { name: true } },
    },
  });

  return NextResponse.json(haberler);
}
