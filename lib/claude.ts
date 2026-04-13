import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface HaberGirdisi {
  hamMetin: string;
  fotografAciklamasi?: string;
  yazarAdi?: string;
  anonim: boolean;
}

export interface HaberCiktisi {
  baslik: string;
  icerik: string;
  fotografAlt?: string;
  kategori: string;
}

export async function haberYaz(girdi: HaberGirdisi): Promise<HaberCiktisi> {
  const fotografBilgisi = girdi.fotografAciklamasi
    ? `\n\nFotoğraf açıklaması: ${girdi.fotografAciklamasi}`
    : "";

  const yazarBilgisi = girdi.anonim
    ? "Haber anonim olarak gönderilmiştir."
    : `Haberi gönderen: ${girdi.yazarAdi || "Bilinmiyor"}`;

  const prompt = `Sen Köprübaşı ilçesinin yerel gazetesinin editörüsün. Sana gelen ham haber içeriğini profesyonel bir gazete haberi formatına dönüştür.

Ham haber içeriği:
${girdi.hamMetin}
${fotografBilgisi}

${yazarBilgisi}

Lütfen aşağıdaki JSON formatında yanıt ver:
{
  "baslik": "Haber başlığı (dikkat çekici, kısa ve öz, 60 karakteri geçmesin)",
  "icerik": "Tam haber metni (paragraflar halinde, gazetecilik kurallarına uygun, 5W1H prensibi: Kim, Ne, Nerede, Ne Zaman, Neden, Nasıl)",
  "fotografAlt": "Fotoğraf varsa açıklayıcı alt metin",
  "kategori": "GENEL | SPOR | KULTUR | EKONOMI | EGITIM | SAGLIK | DUYURU"
}

Önemli kurallar:
- Türkçe yaz, dil bilgisi hatası yapma
- Haber dilini kullan, birinci şahıs kullanma
- Abartı ve spekülatif ifadelerden kaçın
- Ham metni temizle ve profesyonelleştir
- Sadece JSON döndür, başka bir şey yazma`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2048,
  });

  const responseText = completion.choices[0]?.message?.content || "";

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI yanıtı geçersiz format döndürdü");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    baslik: parsed.baslik || "Başlık oluşturulamadı",
    icerik: parsed.icerik || girdi.hamMetin,
    fotografAlt: parsed.fotografAlt,
    kategori: parsed.kategori || "GENEL",
  };
}
