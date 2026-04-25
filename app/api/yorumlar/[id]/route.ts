import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.yorum.delete({ where: { id } });

  return NextResponse.json({ message: "Yorum silindi" });
}

const patchSchema = z.object({
  gizli: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { gizli } = patchSchema.parse(await request.json());

    const yorum = await prisma.yorum.update({
      where: { id },
      data: { gizli },
      select: { id: true, gizli: true },
    });

    return NextResponse.json(yorum);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Yorum güncellenemedi" }, { status: 500 });
  }
}
