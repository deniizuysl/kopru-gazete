import { NextRequest, NextResponse } from "next/server";
import { zamanliPushlariIsle } from "@/lib/bildirim";

// Zamanlanmış bildirimleri işler — zamanı gelenleri gönderir, işaretler.
// Vercel Cron ya da harici cron-job.org tarafından tetiklenir.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const sonuclar = await zamanliPushlariIsle();
  return NextResponse.json({ islenen: sonuclar.length, sonuclar });
}
