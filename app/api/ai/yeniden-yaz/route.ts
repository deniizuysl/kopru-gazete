import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { haberYaz } from "@/lib/claude";
import { bolgeGecerliMi } from "@/lib/bolgeler";

// Önizleme amaçlı: AI ile yeniden yazılmış başlık + içerik döner, hiçbir şey kaydetmez.
// Yazar bu çıktıyı düzenleyip aiKullan: false ile asıl gönderim endpoint'ine yollar.
export async function POST(request: NextRequest) {
  const session = await auth();
  const mobil = session?.user
    ? null
    : await mobilTokenDogrula(request.headers.get("authorization"));
  const kullanici = session?.user
    ? { name: session.user.name || undefined }
    : mobil
    ? { name: mobil.name }
    : null;

  if (!kullanici) {
    return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const hamMetin = ((body.hamIcerik as string) || (body.icerik as string) || "").trim();
    const anonim = body.anonim === true;
    const yazarAdi = (body.yazarAdi as string | undefined) || kullanici.name;
    const bolgeRaw = body.bolge;
    const bolge = bolgeGecerliMi(bolgeRaw) ? bolgeRaw : undefined;

    if (hamMetin.length < 20) {
      return NextResponse.json({ error: "İçerik en az 20 karakter olmalı" }, { status: 400 });
    }

    const sonuc = await haberYaz({
      hamMetin,
      anonim,
      yazarAdi: anonim ? undefined : yazarAdi,
      bolge,
    });

    return NextResponse.json({
      baslik: sonuc.baslik,
      icerik: sonuc.icerik,
      kategori: sonuc.kategori,
      fotografAlt: sonuc.fotografAlt || null,
    });
  } catch (e) {
    console.error("AI yeniden-yaz hatası:", e);
    return NextResponse.json({ error: "Önizleme oluşturulamadı" }, { status: 500 });
  }
}
