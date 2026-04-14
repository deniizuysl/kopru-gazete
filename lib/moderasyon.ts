import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface ModerasyanSonuc {
  spam: boolean;
  neden: string;
}

export async function icerikModere(baslik: string, icerik: string): Promise<ModerasyanSonuc> {
  try {
    const mesaj = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `Sen bir Türk yerel gazete editörüsün. Aşağıdaki haber içeriğini incele.

Şu durumlarda SPAM olarak işaretle:
- Nefret söylemi, ırkçılık, ayrımcılık
- Müstehcen veya cinsel içerik
- Şiddet tehdidi veya şiddeti özendirme
- Reklam/tanıtım amaçlı spam
- Hakaret veya iftira içeriği
- Tamamen anlamsız/bot içeriği
- Yasadışı faaliyet teşviki

Sadece JSON formatında yanıt ver:
{"spam": true/false, "neden": "kısa açıklama veya boş string"}

Başlık: ${baslik}
İçerik: ${icerik.substring(0, 500)}`,
      }],
    });

    const yanit = (mesaj.content[0] as any).text?.trim();
    const sonuc = JSON.parse(yanit);
    return {
      spam: Boolean(sonuc.spam),
      neden: sonuc.neden || "",
    };
  } catch {
    // Moderasyon başarısız olursa spam değil say
    return { spam: false, neden: "" };
  }
}
