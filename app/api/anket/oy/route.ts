import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const { secenekId, anketId } = await req.json();

  const mevcutOy = await prisma.anketOyu.findUnique({
    where: { anketId_kullaniciId: { anketId, kullaniciId: session.user.id! } },
  });

  if (mevcutOy) {
    return NextResponse.json({ error: "Zaten oy kullandınız" }, { status: 400 });
  }

  await prisma.anketOyu.create({
    data: { secenekId, anketId, kullaniciId: session.user.id! },
  });

  return NextResponse.json({ ok: true });
}
