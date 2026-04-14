import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

async function adminKontrol(req: NextRequest) {
  const k = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!k || k.role !== "ADMIN") return null;
  return k;
}

// Kullanıcı listesi
export async function GET(req: NextRequest) {
  if (!await adminKontrol(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const kullanicilar = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      banli: true,
      rozet: true,
      createdAt: true,
      _count: { select: { haberler: true, yorumlar: true } },
    },
  });

  return NextResponse.json(kullanicilar);
}

// Ban / rozet / foto sil
export async function PATCH(req: NextRequest) {
  if (!await adminKontrol(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id, islem, deger } = await req.json();
  if (!id || !islem) return NextResponse.json({ error: "id ve islem gerekli" }, { status: 400 });

  let data: Record<string, any> = {};

  if (islem === "ban") data = { banli: true };
  else if (islem === "unban") data = { banli: false };
  else if (islem === "fotoSil") data = { image: null };
  else if (islem === "rozetVer") data = { rozet: deger || null };
  else return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });

  const guncellendi = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, image: true, banli: true, rozet: true },
  });

  return NextResponse.json(guncellendi);
}
