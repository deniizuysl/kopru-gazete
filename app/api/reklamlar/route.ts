import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

async function adminKontrol(req: NextRequest) {
  const mobil = await mobilTokenDogrula(req.headers.get("authorization"));
  if (mobil) return mobil.role === "ADMIN";
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  const simdi = new Date();
  const reklamlar = await prisma.reklam.findMany({
    where: {
      aktif: true,
      durum: "ONAYLANDI",
      OR: [{ bitis: null }, { bitis: { gt: simdi } }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      baslik: true,
      resimUrl: true,
      tiklamaUrl: true,
    },
  });
  return NextResponse.json(reklamlar);
}

export async function POST(req: NextRequest) {
  if (!await adminKontrol(req)) {
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
  if (!await adminKontrol(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.reklam.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
