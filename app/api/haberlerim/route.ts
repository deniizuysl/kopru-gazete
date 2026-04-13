import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const haberler = await prisma.haber.findMany({
    where: { yazarId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      baslik: true,
      kategori: true,
      createdAt: true,
      _count: { select: { yorumlar: true } },
    },
  });

  return NextResponse.json({ haberler });
}
