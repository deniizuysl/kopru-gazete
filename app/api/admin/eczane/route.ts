import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

async function yetkiKontrol(req: NextRequest) {
  const kullanici = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!kullanici || kullanici.role !== "ADMIN") return null;
  return kullanici;
}

export async function GET(req: NextRequest) {
  if (!(await yetkiKontrol(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const eczaneler = await (prisma as any).eczane.findMany({
    orderBy: { ad: "asc" },
  });
  return NextResponse.json(eczaneler);
}

export async function POST(req: NextRequest) {
  if (!(await yetkiKontrol(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { ad, telefon, adres } = await req.json();
  if (!ad) return NextResponse.json({ error: "Ad gerekli" }, { status: 400 });

  const eczane = await (prisma as any).eczane.create({
    data: { ad, telefon: telefon || null, adres: adres || null },
  });
  return NextResponse.json(eczane, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await yetkiKontrol(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id, ad, telefon, adres, nobetBaslangic, nobetBitis } = await req.json();
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  const eczane = await (prisma as any).eczane.update({
    where: { id },
    data: {
      ...(ad !== undefined ? { ad } : {}),
      ...(telefon !== undefined ? { telefon } : {}),
      ...(adres !== undefined ? { adres } : {}),
      ...(nobetBaslangic !== undefined
        ? { nobetBaslangic: nobetBaslangic ? new Date(nobetBaslangic) : null }
        : {}),
      ...(nobetBitis !== undefined
        ? { nobetBitis: nobetBitis ? new Date(nobetBitis) : null }
        : {}),
    },
  });
  return NextResponse.json(eczane);
}

export async function DELETE(req: NextRequest) {
  if (!(await yetkiKontrol(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  await (prisma as any).eczane.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
