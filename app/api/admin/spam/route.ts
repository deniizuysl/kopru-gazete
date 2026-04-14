import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

async function adminKontrol(req: NextRequest) {
  const k = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!k || k.role !== "ADMIN") return null;
  return k;
}

// Spam haberleri listele
export async function GET(req: NextRequest) {
  if (!await adminKontrol(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const haberler = await (prisma as any).haber.findMany({
    where: { spam: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      baslik: true,
      hamIcerik: true,
      spamNedeni: true,
      createdAt: true,
      anonim: true,
      yazar: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(haberler);
}

// Spam'den kurtar (yayınla) veya kalıcı sil
export async function PATCH(req: NextRequest) {
  if (!await adminKontrol(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id, islem } = await req.json();
  if (!id || !islem) return NextResponse.json({ error: "id ve islem gerekli" }, { status: 400 });

  if (islem === "yayinla") {
    await (prisma as any).haber.update({
      where: { id },
      data: { spam: false, spamNedeni: null, yayinlandiMi: true },
    });
  } else if (islem === "sil") {
    await prisma.haber.delete({ where: { id } });
  } else {
    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
