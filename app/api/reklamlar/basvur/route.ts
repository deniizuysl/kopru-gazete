import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushBildirimGonder } from "@/lib/push";
import { uploadImage } from "@/lib/cloudinary";

const GECERLI_SURELER = [7, 30, 90];
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const isletmeAdi = String(form.get("isletmeAdi") || "").trim();
  const iletisimAd = String(form.get("iletisimAd") || "").trim();
  const telefon = String(form.get("telefon") || "").trim();
  const baslik = String(form.get("baslik") || "").trim();
  const aciklama = String(form.get("aciklama") || "").trim();
  const tiklamaUrl = String(form.get("tiklamaUrl") || "").trim();
  const sureGun = Number(form.get("sureGun"));
  const dosya = form.get("resim") as File | null;

  if (!isletmeAdi || !iletisimAd || !telefon || !baslik || !sureGun || !dosya) {
    return NextResponse.json(
      { error: "İşletme adı, iletişim, telefon, başlık, süre ve görsel zorunlu" },
      { status: 400 }
    );
  }
  if (!GECERLI_SURELER.includes(sureGun)) {
    return NextResponse.json({ error: "Süre 7, 30 veya 90 gün olmalı" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(dosya.type)) {
    return NextResponse.json({ error: "Görsel JPG, PNG veya WebP olmalı" }, { status: 400 });
  }
  if (dosya.size > MAX_SIZE) {
    return NextResponse.json({ error: "Görsel 5 MB'dan büyük olamaz" }, { status: 400 });
  }

  const buffer = Buffer.from(await dosya.arrayBuffer());
  const { url } = await uploadImage(buffer, dosya.name);

  const reklam = await prisma.reklam.create({
    data: {
      baslik,
      resimUrl: url,
      tiklamaUrl: tiklamaUrl || null,
      isletmeAdi,
      iletisimAd,
      telefon,
      aciklama: aciklama || null,
      sureGun,
      durum: "BEKLEMEDE",
      aktif: false,
    },
  });

  const adminler = await prisma.user.findMany({
    where: { role: "ADMIN", pushToken: { not: null } },
    select: { pushToken: true },
  });
  const tokenlar = adminler.map((a) => a.pushToken!).filter(Boolean);
  if (tokenlar.length > 0) {
    pushBildirimGonder(
      tokenlar,
      "Yeni reklam başvurusu",
      `${isletmeAdi} — ${baslik}`,
      reklam.id
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true, id: reklam.id });
}
