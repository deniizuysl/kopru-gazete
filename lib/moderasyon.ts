import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export type ModerasyonDurum = "TEMIZ" | "INCELE" | "SPAM";

export interface ModerasyanSonuc {
  durum: ModerasyonDurum;
  neden: string;
  /** @deprecated Geriye uyum için; durum === "SPAM" ise true */
  spam: boolean;
}

export async function icerikModere(baslik: string, icerik: string): Promise<ModerasyanSonuc> {
  try {
    const mesaj = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Sen Köprübaşı (Manisa) yerel gazetesinin editörüsün. Aşağıdaki haber içeriğini değerlendir.

Üç durum döndür:

SPAM (kesin red, yayınlanmaz):
- Nefret söylemi, ırkçılık, ayrımcılık
- Müstehcen / cinsel içerik
- Şiddet tehdidi veya şiddeti özendirme
- Açık hakaret, küfür, iftira
- Ticari reklam: tek amacı tanıtım olan içerik (ürün/hizmet fiyatı, menü, kampanya, indirim, "bize ulaşın" vurgusu)
- Siyasi propaganda: parti/aday övgüsü-kötülemesi, seçim kampanyası, oy çağrısı
- Telefon numarası veya TC kimlik numarası paylaşımı (adres izinli)
- Tamamen anlamsız / bot içeriği
- Yasadışı faaliyet teşviki

INCELE (gri alan, editör onayı bekler):
- Yeni bir iş yeri/esnaf açılışı duyurusu (topluluk haberi olabilir, kontrol gerekir)
- Belirli bir kişi veya kurum hakkında ağır olmayan ama provokatif iddialar
- Kaynağı belirsiz önemli iddialar (yolsuzluk, kaza, olay)
- Siyasi nitelikli ama propaganda sayılamayacak yorum/analiz
- Üslubu sert ama hakaret eşiğinde olmayan eleştiri

TEMIZ (doğrudan yayınla):
- Normal yerel haber, olay, duyuru, etkinlik, kültür-sanat
- Spor, eğitim, tarım, hava koşulları, altyapı haberleri
- Resmi açıklamalar, kaymakamlık/belediye duyuruları

Sadece JSON formatında yanıt ver:
{"durum": "TEMIZ" | "INCELE" | "SPAM", "neden": "kısa açıklama (INCELE/SPAM ise zorunlu, TEMIZ ise boş)"}

Başlık: ${baslik}
İçerik: ${icerik.substring(0, 800)}`,
      }],
    });

    const yanit = (mesaj.content[0] as any).text?.trim();
    const sonuc = JSON.parse(yanit);
    const durum: ModerasyonDurum =
      sonuc.durum === "SPAM" || sonuc.durum === "INCELE" ? sonuc.durum : "TEMIZ";
    return {
      durum,
      neden: sonuc.neden || "",
      spam: durum === "SPAM",
    };
  } catch {
    // Moderasyon başarısız olursa temiz say (eski davranış)
    return { durum: "TEMIZ", neden: "", spam: false };
  }
}
