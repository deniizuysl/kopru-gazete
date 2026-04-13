import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { haberYaz } from "@/lib/claude";
import { pushBildirimGonder } from "@/lib/push";
import { z } from "zod";
import { Kategori } from "@/app/generated/prisma/client";

const haberSchema = z.object({
  hamIcerik: z.string().min(20, "Haber içeriği en az 20 karakter olmalı"),
  fotografUrls: z.array(z.string().url()).optional().default([]),
  anonim: z.boolean().default(false),
  yazarAdi: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sayfa = parseInt(searchParams.get("sayfa") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const kategori = searchParams.get("kategori") as Kategori | null;

  const where = {
    yayinlandiMi: true,
    ...(kategori ? { kategori } : {}),
  };

  const [haberler, toplam] = await Promise.all([
    prisma.haber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (sayfa - 1) * limit,
      take: limit,
      select: {
        id: true,
        baslik: true,
        icerik: true,
        fotografUrls: true,
        fotografAlt: true,
        kategori: true,
        anonim: true,
        yazarAdi: true,
        createdAt: true,
        _count: { select: { yorumlar: true } },
        yazar: { select: { name: true, image: true } },
      },
    }),
    prisma.haber.count({ where }),
  ]);

  return NextResponse.json({ haberler, toplam, sayfa, limit });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { hamIcerik, fotografUrls, anonim, yazarAdi } = haberSchema.parse(body);

    const aiSonuc = await haberYaz({
      hamMetin: hamIcerik,
      anonim,
      yazarAdi: anonim ? undefined : (yazarAdi || session.user.name || undefined),
    });

    const haber = await prisma.haber.create({
      data: {
        baslik: aiSonuc.baslik,
        icerik: aiSonuc.icerik,
        hamIcerik,
        fotografUrls: fotografUrls || [],
        fotografAlt: aiSonuc.fotografAlt || null,
        kategori: (aiSonuc.kategori as Kategori) || Kategori.GENEL,
        anonim,
        yazarAdi: anonim ? null : (yazarAdi || session.user.name || null),
        yazarId: anonim ? null : session.user.id,
      },
    });

    // Push bildirimi gönder
    const kullanicilar = await prisma.user.findMany({
      where: { pushToken: { not: null } },
      select: { pushToken: true },
    });
    const tokenlar = kullanicilar.map((k) => k.pushToken!).filter(Boolean);
    if (tokenlar.length > 0) {
      pushBildirimGonder(tokenlar, "📰 Yeni Haber", aiSonuc.baslik, haber.id).catch(() => {});
    }

    return NextResponse.json(haber, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Haber oluşturma hatası:", error);
    return NextResponse.json({ error: "Haber oluşturulamadı" }, { status: 500 });
  }
}
