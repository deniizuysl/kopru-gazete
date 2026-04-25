import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { pushBildirimGonder } from "@/lib/push";
import { z } from "zod";

const yorumSchema = z.object({
  icerik: z.string().min(2, "Yorum en az 2 karakter olmalı").max(500, "Yorum en fazla 500 karakter olabilir"),
  haberId: z.string(),
  parentId: z.string().optional().nullable(),
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
    const { icerik, haberId, parentId } = yorumSchema.parse(body);

    const haber = await prisma.haber.findUnique({
      where: { id: haberId, yayinlandiMi: true },
      select: { id: true, baslik: true, anonim: true, yazarId: true },
    });

    if (!haber) {
      return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
    }

    let parent: { id: string; haberId: string; parentId: string | null; yazarId: string | null; gizli: boolean } | null = null;
    if (parentId) {
      parent = await prisma.yorum.findUnique({
        where: { id: parentId },
        select: { id: true, haberId: true, parentId: true, yazarId: true, gizli: true },
      });
      if (!parent || parent.haberId !== haberId) {
        return NextResponse.json({ error: "Yanıtlanan yorum bulunamadı" }, { status: 404 });
      }
      if (parent.gizli) {
        return NextResponse.json({ error: "Gizlenmiş yoruma yanıt veremezsiniz" }, { status: 400 });
      }
    }

    // Tek seviye nested: yanıta yanıt geldiyse kök yoruma bağla
    const effectiveParentId = parent ? (parent.parentId ?? parent.id) : null;

    const yorum = await prisma.yorum.create({
      data: {
        icerik,
        haberId,
        yazarId: kullanici.id,
        parentId: effectiveParentId,
      },
      include: {
        yazar: { select: { name: true, image: true } },
        _count: { select: { begeniler: true } },
      },
    });

    // Bildirim hedefi: yanıtsa yanıt sahibi, değilse haber sahibi
    const hedefId = parent?.yazarId ?? (haber.anonim ? null : haber.yazarId);
    const hedefMesaj = parent
      ? `"${haber.baslik.slice(0, 40)}..." haberindeki yorumunuza yanıt verildi.`
      : `"${haber.baslik.slice(0, 50)}..." haberinize yeni bir yorum yapıldı.`;
    const pushBaslik = parent ? "Yorumunuza Yanıt" : "Yeni Yorum";

    if (hedefId && hedefId !== kullanici.id) {
      try {
        const hedef = await (prisma as any).user.findUnique({
          where: { id: hedefId },
          select: { pushToken: true },
        });

        await (prisma as any).bildirim.create({
          data: {
            kullaniciId: hedefId,
            mesaj: hedefMesaj,
            haberId: haber.id,
            yorumId: yorum.id,
          },
        });

        if (hedef?.pushToken) {
          await pushBildirimGonder(
            [hedef.pushToken],
            pushBaslik,
            hedefMesaj,
            haber.id,
          );
        }
      } catch {}
    }

    return NextResponse.json(yorum, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Yorum eklenemedi" }, { status: 500 });
  }
}
