import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mobilTokenDogrula } from "@/lib/mobil-auth";
import { herkeseGonder, haberdenIcerikUret } from "@/lib/bildirim";

async function adminMi(req: NextRequest): Promise<boolean> {
  const session = await auth();
  if (session?.user?.role === "ADMIN") return true;
  const mobil = await mobilTokenDogrula(req.headers.get("authorization"));
  return !!mobil && mobil.role === "ADMIN";
}

// Anında bildirim gönder.
// Body: { haberId: string } → haber bilgilerinden üretilir
// veya { baslik: string, icerik: string, haberId?: string } → özel metin
export async function POST(req: NextRequest) {
  if (!(await adminMi(req))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  let baslik: string | undefined = body.baslik;
  let icerik: string | undefined = body.icerik;
  const haberId: string | undefined = body.haberId;

  if (!baslik || !icerik) {
    if (!haberId) {
      return NextResponse.json({ error: "baslik+icerik veya haberId gerekli" }, { status: 400 });
    }
    const uretilen = await haberdenIcerikUret(haberId);
    if (!uretilen) {
      return NextResponse.json({ error: "Haber bulunamadı veya yayında değil" }, { status: 404 });
    }
    baslik = uretilen.baslik;
    icerik = uretilen.icerik;
  }

  const gonderildi = await herkeseGonder({ baslik, icerik, haberId });
  return NextResponse.json({ ok: true, gonderildi });
}
