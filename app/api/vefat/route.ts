import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const birHaftaOnce = new Date();
  birHaftaOnce.setDate(birHaftaOnce.getDate() - 7);

  const vefatlar = await (prisma as any).vefat.findMany({
    where: { cenazeTarihi: { gte: birHaftaOnce } },
    orderBy: { cenazeTarihi: "asc" },
    take: 50,
  });

  return NextResponse.json(vefatlar);
}
