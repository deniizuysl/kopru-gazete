import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

async function adminKontrol(req: NextRequest) {
  const mobil = await mobilTokenDogrula(req.headers.get("authorization"));
  if (mobil) return mobil.role === "ADMIN";
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  const etkinlikler = await prisma.etkinlik.findMany({
    where: { tarih: { gte: new Date() } },
    orderBy: { tarih: "asc" },
  });
  return NextResponse.json(etkinlikler);
}

export async function POST(req: NextRequest) {
  if (!await adminKontrol(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { baslik, aciklama, tarih, konum } = await req.json();
  if (!baslik || !aciklama || !tarih) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }

  const etkinlik = await prisma.etkinlik.create({
    data: { baslik, aciklama, tarih: new Date(tarih), konum },
  });
  return NextResponse.json(etkinlik);
}

export async function DELETE(req: NextRequest) {
  if (!await adminKontrol(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.etkinlik.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
