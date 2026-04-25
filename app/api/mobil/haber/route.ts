import { NextRequest, NextResponse } from "next/server";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { prisma } from "@/lib/prisma";
import { haberYaz } from "@/lib/claude";
import { uploadImage } from "@/lib/cloudinary";
import { icerikModere } from "@/lib/moderasyon";
import { Kategori } from "@/app/generated/prisma/client";
import { bolgeGecerliMi } from "@/lib/bolgeler";

export async function POST(request: NextRequest) {
  const kullanici = await mobilTokenDogrula(request.headers.get("authorization"));
  if (!kullanici) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let icerik: string;
    let kategori: string;
    let anonim: boolean;
    let aiKullan: boolean;
    let baslikOneri: string;
    let bolgeRaw: unknown;
    let fotografUrls: string[] = [];

    if (contentType.includes("application/json")) {
      // Yeni mobil: fotoğrafları client-side Cloudinary'ye yükleyip URL gönderir
      const body = await request.json();
      icerik = (body.icerik as string) || "";
      kategori = (body.kategori as string) || "GENEL";
      anonim = body.anonim === true;
      aiKullan = body.aiKullan !== false;
      baslikOneri = ((body.baslikOneri as string) || "").trim();
      bolgeRaw = body.bolge;
      fotografUrls = Array.isArray(body.fotografUrls)
        ? (body.fotografUrls as unknown[]).filter((u): u is string => typeof u === "string")
        : [];
    } else {
      // Eski mobil APK: fotoğraflar FormData içinde, server upload eder
      const formData = await request.formData();
      icerik = (formData.get("icerik") as string) || "";
      kategori = (formData.get("kategori") as string) || "GENEL";
      anonim = formData.get("anonim") === "true";
      aiKullan = formData.get("aiKullan") !== "false";
      baslikOneri = ((formData.get("baslikOneri") as string) || "").trim();
      bolgeRaw = formData.get("bolge");
      const fotograflar = formData.getAll("fotograflar") as File[];
      for (const foto of fotograflar) {
        if (foto.size > 0) {
          const bytes = await foto.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const { url } = await uploadImage(buffer, foto.name);
          fotografUrls.push(url);
        }
      }
    }

    const bolge = bolgeGecerliMi(bolgeRaw) ? bolgeRaw : null;

    if (!icerik || icerik.trim().length < 20) {
      return NextResponse.json({ error: "İçerik en az 20 karakter olmalı" }, { status: 400 });
    }
    if (!aiKullan && baslikOneri.length < 5) {
      return NextResponse.json({ error: "Yapay zeka kapalıyken başlık zorunludur" }, { status: 400 });
    }

    // AI kullanılacaksa metni dönüştür, kullanılmayacaksa kullanıcının yazdığını koru
    const aiSonuc = aiKullan
      ? await haberYaz({
          hamMetin: icerik.trim(),
          anonim,
          yazarAdi: anonim ? undefined : kullanici.name,
          bolge: bolge || undefined,
        })
      : { baslik: baslikOneri, icerik: icerik.trim(), fotografAlt: null as string | null, kategori };

    // Moderasyon kontrolü
    const moderasyon = await icerikModere(aiSonuc.baslik, aiSonuc.icerik);
    const spamMi = moderasyon.durum === "SPAM";
    // AI kullanılmadıysa her zaman editör onayına gönder
    const incelemedeMi = !aiKullan || moderasyon.durum === "INCELE";

    const haber = await (prisma as any).haber.create({
      data: {
        baslik: aiSonuc.baslik,
        icerik: aiSonuc.icerik,
        hamIcerik: icerik.trim(),
        fotografUrls,
        fotografAlt: aiSonuc.fotografAlt || null,
        kategori: (kategori as Kategori) || Kategori.GENEL,
        bolge,
        anonim,
        yazarAdi: anonim ? null : kullanici.name,
        yazarId: anonim ? null : kullanici.id,
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

    return NextResponse.json(haber, { status: 201 });
  } catch (e) {
    console.error("Mobil haber hatası:", e);
    return NextResponse.json({ error: "Haber oluşturulamadı" }, { status: 500 });
  }
}
