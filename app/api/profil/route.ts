import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const kullanici = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!kullanici) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { image } = await req.json();
  if (!image) return NextResponse.json({ error: "Resim URL gerekli" }, { status: 400 });

  const guncellendi = await prisma.user.update({
    where: { id: kullanici.id },
    data: { image },
    select: { id: true, name: true, email: true, image: true, role: true, rozet: true },
  });

  return NextResponse.json(guncellendi);
}
