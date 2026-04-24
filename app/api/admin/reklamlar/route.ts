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

export async function GET(req: NextRequest) {
  if (!await adminKontrol(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const reklamlar = await prisma.reklam.findMany({
    orderBy: [{ durum: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(reklamlar);
}

export async function PATCH(req: NextRequest) {
  if (!await adminKontrol(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id, durum, odendi, adminNotu, baslangic, sureGun } = await req.json();
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const guncelleme: Record<string, unknown> = {};
  if (durum) guncelleme.durum = durum;
  if (typeof odendi === "boolean") guncelleme.odendi = odendi;
  if (adminNotu !== undefined) guncelleme.adminNotu = adminNotu;

  if (durum === "ONAYLANDI") {
    const baslangicTarihi = baslangic ? new Date(baslangic) : new Date();
    const mevcut = await prisma.reklam.findUnique({ where: { id } });
    const sure = sureGun ?? mevcut?.sureGun ?? 30;
    const bitisTarihi = new Date(baslangicTarihi);
    bitisTarihi.setDate(bitisTarihi.getDate() + sure);
    guncelleme.baslangic = baslangicTarihi;
    guncelleme.bitis = bitisTarihi;
    guncelleme.aktif = true;
    if (sureGun) guncelleme.sureGun = sureGun;
  }
  if (durum === "REDDEDILDI" || durum === "SURESI_DOLDU") {
    guncelleme.aktif = false;
  }

  const reklam = await prisma.reklam.update({ where: { id }, data: guncelleme });
  return NextResponse.json(reklam);
}
