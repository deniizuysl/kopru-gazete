import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { z } from "zod";

const bildiriSchema = z.object({
  sebep: z.string().max(200).optional(),
});

async function getKullanici(req: NextRequest) {
  const session = await auth();
  if (session?.user?.id) return { id: session.user.id };
  return await mobilTokenDogrula(req.headers.get("authorization"));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const kullanici = await getKullanici(request);
  if (!kullanici) {
    return NextResponse.json({ error: "Bildirmek için giriş yapmanız gerekiyor" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const { sebep } = bildiriSchema.parse(body);

    const yorum = await prisma.yorum.findUnique({
      where: { id },
      select: { id: true, yazarId: true },
    });
    if (!yorum) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }
    if (yorum.yazarId === kullanici.id) {
      return NextResponse.json({ error: "Kendi yorumunuzu bildiremezsiniz" }, { status: 400 });
    }

    await prisma.yorumBildiri.upsert({
      where: { yorumId_bildirenId: { yorumId: id, bildirenId: kullanici.id } },
      update: { sebep: sebep ?? null },
      create: { yorumId: id, bildirenId: kullanici.id, sebep: sebep ?? null },
    });

    return NextResponse.json({ message: "Bildiriniz alındı, en kısa sürede incelenecek." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Bildiri oluşturulamadı" }, { status: 500 });
  }
}
