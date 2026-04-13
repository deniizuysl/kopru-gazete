import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const haber = await prisma.haber.findUnique({
    where: { id, yayinlandiMi: true },
    include: {
      yazar: { select: { name: true, image: true } },
      yorumlar: {
        orderBy: { createdAt: "asc" },
        include: {
          yazar: { select: { name: true, image: true } },
          _count: { select: { begeniler: true } },
        },
      },
    },
  });

  if (!haber) {
    return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
  }

  await prisma.haber.update({
    where: { id },
    data: { goruntuSayisi: { increment: 1 } },
  });

  return NextResponse.json(haber);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.haber.delete({ where: { id } });

  return NextResponse.json({ message: "Haber silindi" });
}
