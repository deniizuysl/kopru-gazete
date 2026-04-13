import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

export async function GET() {
  const reklamlar = await prisma.reklam.findMany({
    where: { aktif: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reklamlar);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { baslik, tiklamaUrl, resimUrl } = await req.json();

  if (!baslik || !resimUrl) {
    return NextResponse.json({ error: "Baslik ve resim zorunlu" }, { status: 400 });
  }

  const reklam = await prisma.reklam.create({
    data: { baslik, resimUrl, tiklamaUrl: tiklamaUrl || null },
  });

  return NextResponse.json(reklam);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.reklam.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
