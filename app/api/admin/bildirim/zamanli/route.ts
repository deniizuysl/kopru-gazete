import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";
import { haberdenIcerikUret } from "@/lib/bildirim";

async function adminKontrol(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role === "ADMIN") return { id: session.user.id, role: "ADMIN" as const };
  const mobil = await mobilTokenDogrula(req.headers.get("authorization"));
  if (mobil?.role === "ADMIN") return { id: mobil.id, role: "ADMIN" as const };
  return null;
}

// Bekleyen zamanlanmış bildirimleri listele (henüz gönderilmemiş + yakın zamanda gönderilmişler).
export async function GET(req: NextRequest) {
  const admin = await adminKontrol(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const yediGunOnce = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const liste = await prisma.zamanliPush.findMany({
    where: {
      OR: [
        { gonderildi: false },
        { gonderimTarihi: { gte: yediGunOnce } },
      ],
    },
    orderBy: { zamanlanan: "asc" },
    take: 100,
    include: {
      haber: { select: { id: true, baslik: true } },
    },
  });
  return NextResponse.json(liste);
}

// Yeni zamanlı push oluştur.
// Body: { haberId?: string, baslik?: string, icerik?: string, zamanlanan: string (ISO) }
export async function POST(req: NextRequest) {
  const admin = await adminKontrol(req);
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const zamanlanan = body.zamanlanan ? new Date(body.zamanlanan) : null;
  if (!zamanlanan || isNaN(zamanlanan.getTime())) {
    return NextResponse.json({ error: "Geçerli zamanlanan tarihi gerekli" }, { status: 400 });
  }
  if (zamanlanan.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ error: "Zamanlama geçmişte olamaz" }, { status: 400 });
  }

  let baslik: string | undefined = body.baslik;
  let icerik: string | undefined = body.icerik;
  const haberId: string | undefined = body.haberId;

  if (!baslik || !icerik) {
    if (!haberId) {
      return NextResponse.json({ error: "baslik+icerik veya haberId gerekli" }, { status: 400 });
    }
    const uretilen = await haberdenIcerikUret(haberId);
    if (!uretilen) {
      return NextResponse.json({ error: "Haber bulunamadı veya yayında değil" }, { status: 404 });
    }
    baslik = uretilen.baslik;
    icerik = uretilen.icerik;
  }

  const kayit = await prisma.zamanliPush.create({
    data: {
      baslik: baslik!,
      icerik: icerik!,
      haberId: haberId || null,
      zamanlanan,
      olusturanId: admin.id,
    },
  });

  return NextResponse.json(kayit, { status: 201 });
}
