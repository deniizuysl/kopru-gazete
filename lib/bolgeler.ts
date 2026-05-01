// Köprübaşı / Manisa bölge listesi
// Yeni mahalle/köy eklemek veya düzenlemek için bu dosyayı güncelle.
// Mobil uygulama `/api/bolgeler` üzerinden bu listeyi okur (cache'li).

export const BOLGELER = [
  "Akçaalan",
  "Alanyolu",
  "Armağan",
  "Arpacı",
  "Atatürk",
  "Azimli",
  "Borlu",
  "Bozburun",
  "Cıcıklı",
  "Çarıklar",
  "Çavullar",
  "Çayköy",
  "Döğüşeren",
  "Esat",
  "Gökveliler",
  "Gölbaşı",
  "Gülpınar",
  "Gündoğdu",
  "İkizkuyu",
  "Karaelmacık",
  "Karyağdı",
  "Kasar",
  "Kavakyeri",
  "Kemhallı",
  "Kıdırcık",
  "Kınık",
  "Kıranşeyh",
  "Killik",
  "Kozaklı",
  "Kulalı",
  "Kurtlar",
  "Mehmet Akif Ersoy",
  "Mestanlı",
  "Namık Kemal",
  "Pınarbaşı",
  "Rağıllar",
  "Saraycık",
  "Sargaç",
  "Selviler",
  "Temrek",
  "Tokmaklı",
  "Uğurlu",
  "Yabacı",
  "Yardere",
  "Yenice",
  "Yeşilköy",
  "Yumuklar",
] as const;

export type Bolge = (typeof BOLGELER)[number];

export function bolgeGecerliMi(v: unknown): v is Bolge {
  return typeof v === "string" && (BOLGELER as readonly string[]).includes(v);
}
