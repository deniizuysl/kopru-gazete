import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";
import { haberYaz } from "@/lib/claude";
import { uploadImage } from "@/lib/cloudinary";
import { icerikModere } from "@/lib/moderasyon";
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

    // Moderasyon kontrolü
    const moderasyon = await icerikModere(aiSonuc.baslik, aiSonuc.icerik);
    const spamMi = moderasyon.durum === "SPAM";
    const incelemedeMi = moderasyon.durum === "INCELE";

    const haber = await (prisma as any).haber.create({
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
        spam: spamMi,
        spamNedeni: spamMi ? moderasyon.neden : null,
        onayBekliyor: incelemedeMi,
        incelemeNedeni: incelemedeMi ? moderasyon.neden : null,
        yayinlandiMi: moderasyon.durum === "TEMIZ",
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

    return NextResponse.json(haber, { status: 201 });
  } catch (e) {
    console.error("Mobil haber hatası:", e);
    return NextResponse.json({ error: "Haber oluşturulamadı" }, { status: 500 });
  }
}
