import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";
import { pushBildirimGonder } from "@/lib/push";

async function yetkiKontrol(req: NextRequest) {
  const kullanici = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!kullanici || kullanici.role !== "ADMIN") return null;
  return kullanici;
}

export async function GET(req: NextRequest) {
  if (!(await yetkiKontrol(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const vefatlar = await (prisma as any).vefat.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(vefatlar);
}

export async function POST(req: NextRequest) {
  if (!(await yetkiKontrol(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const {
    ad,
    yakinlari,
    vefatTarihi,
    cenazeTarihi,
    cenazeYeri,
    bolge,
    fotograf,
    ilaveBilgi,
  } = body;

  if (!ad || !vefatTarihi || !cenazeTarihi || !cenazeYeri) {
    return NextResponse.json(
      { error: "Ad, vefat tarihi, cenaze tarihi ve cenaze yeri zorunludur" },
      { status: 400 }
    );
  }

  const vefat = await (prisma as any).vefat.create({
    data: {
      ad,
      yakinlari: yakinlari || null,
      vefatTarihi: new Date(vefatTarihi),
      cenazeTarihi: new Date(cenazeTarihi),
      cenazeYeri,
      bolge: bolge || null,
      fotograf: fotograf || null,
      ilaveBilgi: ilaveBilgi || null,
    },
  });

  // Push bildirim
  const kullanicilar = await prisma.user.findMany({
    where: { pushToken: { not: null } },
    select: { pushToken: true },
  });
  const tokenlar = kullanicilar.map((k) => k.pushToken!).filter(Boolean);
  if (tokenlar.length > 0) {
    const bolgeYazi = bolge ? ` (${bolge})` : "";
    pushBildirimGonder(
      tokenlar,
      "Vefat İlanı",
      `${ad}${bolgeYazi} hayatını kaybetti. Allah rahmet eylesin.`,
      `vefat:${vefat.id}`
    ).catch(() => {});
  }

  return NextResponse.json(vefat, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await yetkiKontrol(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  await (prisma as any).vefat.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
