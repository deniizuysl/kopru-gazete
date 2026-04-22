import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";

async function adminKontrol(req: NextRequest) {
  const k = await mobilTokenDogrula(req.headers.get("authorization"));
  if (!k || k.role !== "ADMIN") return null;
  return k;
}

// Spam veya incelemedeki haberleri listele. ?durum=spam | incele (default: spam)
export async function GET(req: NextRequest) {
  if (!await adminKontrol(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const durum = new URL(req.url).searchParams.get("durum") || "spam";
  const where = durum === "incele"
    ? { onayBekliyor: true, spam: false }
    : { spam: true };

  const haberler = await (prisma as any).haber.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      baslik: true,
      hamIcerik: true,
      icerik: true,
      spamNedeni: true,
      incelemeNedeni: true,
      onayBekliyor: true,
      spam: true,
      fotografUrls: true,
      kategori: true,
      createdAt: true,
      anonim: true,
      yazar: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(haberler);
}

// islem: "yayinla" (onayla/spam'den kurtar) | "spam" (incelemedekini spam'e taşı) | "sil"
export async function PATCH(req: NextRequest) {
  if (!await adminKontrol(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id, islem } = await req.json();
  if (!id || !islem) return NextResponse.json({ error: "id ve islem gerekli" }, { status: 400 });

  if (islem === "yayinla") {
    await (prisma as any).haber.update({
      where: { id },
      data: {
        spam: false,
        spamNedeni: null,
        onayBekliyor: false,
        incelemeNedeni: null,
        yayinlandiMi: true,
      },
    });
  } else if (islem === "spam") {
    await (prisma as any).haber.update({
      where: { id },
      data: {
        spam: true,
        onayBekliyor: false,
        incelemeNedeni: null,
        yayinlandiMi: false,
      },
    });
  } else if (islem === "sil") {
    await prisma.haber.delete({ where: { id } });
  } else {
    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
