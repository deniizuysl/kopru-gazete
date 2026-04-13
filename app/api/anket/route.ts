import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const anketler = await prisma.anket.findMany({
    where: { aktif: true },
    orderBy: { createdAt: "desc" },
    take: 1,
    include: {
      secenekler: {
        include: { _count: { select: { oylar: true } } },
      },
    },
  });
  return NextResponse.json(anketler[0] || null);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { soru, secenekler } = await req.json();
  if (!soru || !secenekler || secenekler.length < 2) {
    return NextResponse.json({ error: "Soru ve en az 2 seçenek gerekli" }, { status: 400 });
  }

  const anket = await prisma.anket.create({
    data: {
      soru,
      secenekler: {
        create: secenekler.map((metin: string) => ({ metin })),
      },
    },
    include: { secenekler: true },
  });
  return NextResponse.json(anket);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.anket.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
