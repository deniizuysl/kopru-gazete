import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  const yorumlar = await prisma.yorum.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      icerik: true,
      gizli: true,
      parentId: true,
      createdAt: true,
      haber: { select: { id: true, baslik: true } },
      yazar: { select: { id: true, name: true } },
      _count: { select: { bildiriler: true, yanitlar: true } },
      bildiriler: {
        select: { sebep: true, bildiren: { select: { name: true } } },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  yorumlar.sort((a, b) => {
    const af = a._count.bildiriler;
    const bf = b._count.bildiriler;
    if (af !== bf) return bf - af;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return NextResponse.json(yorumlar);
}
