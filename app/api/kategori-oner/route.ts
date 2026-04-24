import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const KATEGORILER = ["GENEL", "SPOR", "KULTUR", "EKONOMI", "EGITIM", "SAGLIK", "DUYURU", "YASAM", "MANISA", "TARIM"];

export async function POST(req: NextRequest) {
  try {
    const { icerik, baslik } = await req.json();
    if (!icerik) return NextResponse.json({ kategori: "GENEL" });

    const mesaj = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [{
        role: "user",
        content: `Aşağıdaki haber metnini şu kategorilerden birine ata: ${KATEGORILER.join(", ")}.
Sadece kategori adını yaz, başka hiçbir şey yazma.

Başlık: ${baslik || ""}
İçerik: ${icerik.substring(0, 300)}`,
      }],
    });

    const cevap = (mesaj.content[0] as any).text?.trim().toUpperCase();
    const kategori = KATEGORILER.includes(cevap) ? cevap : "GENEL";

    return NextResponse.json({ kategori });
  } catch {
    return NextResponse.json({ kategori: "GENEL" });
  }
}
