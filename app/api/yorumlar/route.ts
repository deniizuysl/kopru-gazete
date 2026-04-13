import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { z } from "zod";

const yorumSchema = z.object({
  icerik: z.string().min(2, "Yorum en az 2 karakter olmalı").max(500, "Yorum en fazla 500 karakter olabilir"),
  haberId: z.string(),
});

async function getKullanici(req: NextRequest) {
  const session = await auth();
  if (session?.user?.id) return { id: session.user.id, name: session.user.name };
  return await mobilTokenDogrula(req.headers.get("authorization"));
}

export async function POST(request: NextRequest) {
  const kullanici = await getKullanici(request);
  if (!kullanici) {
    return NextResponse.json({ error: "Yorum yapmak için giriş yapmanız gerekiyor" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { icerik, haberId } = yorumSchema.parse(body);

    const haber = await prisma.haber.findUnique({
      where: { id: haberId, yayinlandiMi: true },
      select: { id: true, baslik: true, anonim: true, yazarId: true },
    });

    if (!haber) {
      return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
    }

    const yorum = await prisma.yorum.create({
      data: {
        icerik,
        haberId,
        yazarId: kullanici.id,
      },
      include: {
        yazar: { select: { name: true, image: true } },
        _count: { select: { begeniler: true } },
      },
    });

    // Haber sahibine bildirim gönder (anonim haber değilse ve farklı kullanıcıysa)
    if (!haber.anonim && haber.yazarId && haber.yazarId !== kullanici.id) {
      await prisma.bildirim.create({
        data: {
          kullaniciId: haber.yazarId,
          mesaj: `"${haber.baslik.slice(0, 50)}..." haberinize yeni bir yorum yapıldı.`,
          haberId: haber.id,
          yorumId: yorum.id,
        },
      });
    }

    return NextResponse.json(yorum, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Yorum eklenemedi" }, { status: 500 });
  }
}
