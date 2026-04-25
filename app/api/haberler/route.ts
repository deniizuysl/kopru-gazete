import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { haberYaz } from "@/lib/claude";
import { pushBildirimGonder } from "@/lib/push";
import { icerikModere } from "@/lib/moderasyon";
import { z } from "zod";
import { Kategori } from "@/app/generated/prisma/client";
import { BOLGELER } from "@/lib/bolgeler";

const haberSchema = z.object({
  hamIcerik: z.string().min(20, "Haber içeriği en az 20 karakter olmalı"),
  fotografUrls: z.array(z.string().url()).optional().default([]),
  anonim: z.boolean().default(false),
  yazarAdi: z.string().optional(),
  bolge: z.enum(BOLGELER).optional(),
  aiKullan: z.boolean().optional().default(true),
  baslikOneri: z.string().optional(),
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

  const [satirlar, toplam] = await Promise.all([
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

  const haberler = satirlar.map(({ icerik, ...h }) => ({
    ...h,
    ozet: icerik.replace(/<[^>]*>/g, "").slice(0, 240),
  }));

  return NextResponse.json({ haberler, toplam, sayfa, limit });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { hamIcerik, fotografUrls, anonim, yazarAdi, bolge, aiKullan, baslikOneri } = haberSchema.parse(body);

    const baslikOneriTrim = (baslikOneri || "").trim();
    if (!aiKullan && baslikOneriTrim.length < 5) {
      return NextResponse.json({ error: "Yapay zeka kapalıyken başlık zorunludur" }, { status: 400 });
    }

    const aiSonuc = aiKullan
      ? await haberYaz({
          hamMetin: hamIcerik,
          anonim,
          yazarAdi: anonim ? undefined : (yazarAdi || session.user.name || undefined),
          bolge,
        })
      : { baslik: baslikOneriTrim, icerik: hamIcerik, fotografAlt: null as string | null, kategori: Kategori.GENEL as string };

    const moderasyon = await icerikModere(aiSonuc.baslik, aiSonuc.icerik);
    const spamMi = moderasyon.durum === "SPAM";
    const incelemedeMi = !aiKullan || moderasyon.durum === "INCELE";

    const haber = await prisma.haber.create({
      data: {
        baslik: aiSonuc.baslik,
        icerik: aiSonuc.icerik,
        hamIcerik,
        fotografUrls: fotografUrls || [],
        fotografAlt: aiSonuc.fotografAlt || null,
        kategori: (aiSonuc.kategori as Kategori) || Kategori.GENEL,
        bolge: bolge || null,
        anonim,
        yazarAdi: anonim ? null : (yazarAdi || session.user.name || null),
        yazarId: anonim ? null : session.user.id,
        spam: spamMi,
        spamNedeni: spamMi ? moderasyon.neden : null,
        onayBekliyor: incelemedeMi,
        incelemeNedeni: incelemedeMi
          ? (moderasyon.durum === "INCELE" ? moderasyon.neden : "Yapay zeka kullanılmadan gönderildi")
          : null,
        yayinlandiMi: !spamMi && !incelemedeMi,
      },
    });

    if (spamMi) {
      return NextResponse.json(
        { error: "İçeriğiniz kurallara uygun bulunmadı.", spam: true },
        { status: 422 }
      );
    }

    if (incelemedeMi) {
      return NextResponse.json(
        {
          ...haber,
          mesaj: "Haberiniz editör onayına gönderildi, onaylandıktan sonra yayına çıkacak.",
          onayBekliyor: true,
        },
        { status: 202 }
      );
    }

    // Push bildirimi gönder (sadece yayınlanan haberler için)
    const kullanicilar = await prisma.user.findMany({
      where: { pushToken: { not: null } },
      select: { pushToken: true },
    });
    const tokenlar = kullanicilar.map((k) => k.pushToken!).filter(Boolean);
    if (tokenlar.length > 0) {
      pushBildirimGonder(tokenlar, "Köprü Gazetesi", aiSonuc.baslik, haber.id).catch(() => {});
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
