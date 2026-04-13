import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const kullanici = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!kullanici) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: kullanici.id },
    data: { pushToken: token },
  });

  return NextResponse.json({ ok: true });
}
