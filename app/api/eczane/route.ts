import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Haftalık rotasyon anchor tarihi - bir Pazartesi. Bu tarihten itibaren her hafta
// nöbetSirasi 1, 2, 3, 1, 2, 3 ... şeklinde döner. Anchor değiştirme nedeni yok,
// admin sıra atamasıyla istediği döngüyü kurabilir.
const ROTASYON_ANCHOR = new Date("2026-01-05T00:00:00.000Z"); // Pazartesi
const HAFTA_MS = 7 * 24 * 60 * 60 * 1000;

function aktifNobetci(eczaneler: any[], simdi: Date): any | null {
  // Manuel override: nobetBaslangic-nobetBitis aralığındaysa o öncelikli
  const manuel = eczaneler.find((e) => {
    if (!e.nobetBaslangic || !e.nobetBitis) return false;
    return new Date(e.nobetBaslangic) <= simdi && simdi <= new Date(e.nobetBitis);
  });
  if (manuel) return manuel;

  // Rotasyon: nobetSirasi atanmış eczaneleri sıraya göre dizip mod ile seç
  const rotasyondakiler = eczaneler
    .filter((e) => typeof e.nobetSirasi === "number")
    .sort((a, b) => a.nobetSirasi - b.nobetSirasi);
  if (rotasyondakiler.length === 0) return null;

  const haftaFarki = Math.floor((simdi.getTime() - ROTASYON_ANCHOR.getTime()) / HAFTA_MS);
  const aktifIndex = ((haftaFarki % rotasyondakiler.length) + rotasyondakiler.length) % rotasyondakiler.length;
  return rotasyondakiler[aktifIndex];
}

export async function GET() {
  const eczaneler = await (prisma as any).eczane.findMany({
    orderBy: { ad: "asc" },
  });

  const nobetci = aktifNobetci(eczaneler, new Date());

  return NextResponse.json({ eczaneler, nobetci: nobetci || null });
}
