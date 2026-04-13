import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";
import { haberYaz } from "@/lib/claude";
import { uploadImage } from "@/lib/cloudinary";
import { Kategori } from "@/app/generated/prisma/client";

export async function POST(request: NextRequest) {
  const kullanici = await mobilTokenDogrula(request.headers.get("authorization"));
  if (!kullanici) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const icerik = formData.get("icerik") as string;
    const kategori = (formData.get("kategori") as string) || "GENEL";
    const anonim = formData.get("anonim") === "true";
    const fotograflar = formData.getAll("fotograflar") as File[];

    if (!icerik || icerik.trim().length < 20) {
      return NextResponse.json({ error: "İçerik en az 20 karakter olmalı" }, { status: 400 });
    }

    // Fotoğrafları Cloudinary'ye yükle
    const fotografUrls: string[] = [];
    for (const foto of fotograflar) {
      if (foto.size > 0) {
        const bytes = await foto.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const { url } = await uploadImage(buffer, foto.name);
        fotografUrls.push(url);
      }
    }

    // AI ile haber oluştur
    const aiSonuc = await haberYaz({
      hamMetin: icerik.trim(),
      anonim,
      yazarAdi: anonim ? undefined : kullanici.name,
    });

    const haber = await prisma.haber.create({
      data: {
        baslik: aiSonuc.baslik,
        icerik: aiSonuc.icerik,
        hamIcerik: icerik.trim(),
        fotografUrls,
        fotografAlt: aiSonuc.fotografAlt || null,
        kategori: (kategori as Kategori) || Kategori.GENEL,
        anonim,
        yazarAdi: anonim ? null : kullanici.name,
        yazarId: anonim ? null : kullanici.id,
      },
    });

    return NextResponse.json(haber, { status: 201 });
  } catch (e) {
    console.error("Mobil haber hatası:", e);
    return NextResponse.json({ error: "Haber oluşturulamadı" }, { status: 500 });
  }
}
