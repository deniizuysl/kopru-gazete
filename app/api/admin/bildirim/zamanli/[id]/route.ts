import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

async function adminMi(req: NextRequest): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role === "ADMIN") return true;
  const mobil = await mobilTokenDogrula(req.headers.get("authorization"));
  return !!mobil && mobil.role === "ADMIN";
}

// Zamanlanmış bildirimi iptal et (gönderilmemişse siler, gönderilmişse 400).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await adminMi(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;

  const kayit = await prisma.zamanliPush.findUnique({ where: { id } });
  if (!kayit) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (kayit.gonderildi) {
    return NextResponse.json({ error: "Zaten gönderildi, iptal edilemez" }, { status: 400 });
  }

  await prisma.zamanliPush.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
