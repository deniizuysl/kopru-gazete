import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  let kullaniciId: string | undefined;

  const mobil = await mobilTokenDogrula(req.headers.get("authorization"));
  if (mobil) {
    kullaniciId = mobil.id;
  } else {
    const session = await auth();
    kullaniciId = session?.user?.id;
  }

  if (!kullaniciId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const haberler = await prisma.haber.findMany({
    where: { yazarId: kullaniciId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      baslik: true,
      kategori: true,
      anonim: true,
      createdAt: true,
      _count: { select: { yorumlar: true } },
    },
  });

  return NextResponse.json({ haberler });
}
