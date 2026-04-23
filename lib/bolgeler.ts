// Köprübaşı / Manisa bölge listesi
// Yeni mahalle/köy eklemek veya düzenlemek için bu dosyayı güncelle.
// Mobil uygulama `/api/bolgeler` üzerinden bu listeyi okur (cache'li).

export const BOLGELER = [
  "Merkez",
  "Beyoba",
  "Büyükbelen",
  "Çakırca",
  "Çaltılı",
  "Dazyurt",
  "Düşecek",
  "Gökçeler",
  "Gürlüce",
  "Hacıhaliller",
  "Hamzabeyli",
  "Kayacık",
  "Kızılçukur",
  "Koyunoba",
  "Sarıbeyli",
  "Sazoba",
  "Üçpınar",
  "Yeniceköy",
] as const;

export type Bolge = (typeof BOLGELER)[number];

export function bolgeGecerliMi(v: unknown): v is Bolge {
  return typeof v === "string" && (BOLGELER as readonly string[]).includes(v);
}
