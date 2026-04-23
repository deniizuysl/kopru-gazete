import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const eczaneler = await (prisma as any).eczane.findMany({
    orderBy: { ad: "asc" },
  });

  const simdi = new Date();
  const nobetci = eczaneler.find((e: any) => {
    if (!e.nobetBaslangic || !e.nobetBitis) return false;
    return new Date(e.nobetBaslangic) <= simdi && simdi <= new Date(e.nobetBitis);
  });

  return NextResponse.json({ eczaneler, nobetci: nobetci || null });
}
