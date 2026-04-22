// Köprü Haber Ajanı — RSS kaynakları.
// Ajan bu listeden besleniyor. Yeni kaynak eklerken: RSS çalışıyor mu + kategori ön tahmini + öncelik.
// Öncelik: düşük sayı = daha çok önem (aynı anda bulunursa düşük öncelikli tercih edilir).

export interface RSSKaynak {
  ad: string;
  url: string;
  onSekKategori?: "GENEL" | "SPOR" | "KULTUR" | "EKONOMI" | "EGITIM" | "SAGLIK" | "DUYURU";
  oncelik: number;
}

export const rssKaynaklari: RSSKaynak[] = [
  // Manisa / Köprübaşı odaklı
  { ad: "İHA Manisa", url: "https://www.iha.com.tr/rss/manisa-rss.xml", oncelik: 1 },
  { ad: "Manisa Haber", url: "https://www.manisahaber.com.tr/rss.xml", oncelik: 1 },
  { ad: "Manisa Postası", url: "https://www.manisapostasi.com/rss", oncelik: 2 },
  { ad: "Manisa Gazetesi", url: "https://www.manisagazetesi.com.tr/rss/rss.xml", oncelik: 2 },

  // Genel Türkiye — filtreleme ile Manisa/Köprübaşı içerikleri yakalanır
  { ad: "AA Yerel Haberler", url: "https://www.aa.com.tr/tr/rss/default?cat=yerel-haberler", oncelik: 3 },
  { ad: "AA Türkiye", url: "https://www.aa.com.tr/tr/rss/default?cat=guncel", oncelik: 4 },
];

// Manisa/Köprübaşı ile ilgisi var mı? Genel kaynaklarda filtreleme için.
const KOPRU_ANAHTAR = /köprübaşı|koprubasi|köprü başı/i;
const MANISA_ANAHTAR = /manisa/i;

export function ilgiliMi(metin: string, yerelMi: boolean): boolean {
  // Yerel kaynaktan (İHA Manisa gibi) gelen her şey ilgili sayılır.
  if (yerelMi) return true;
  return KOPRU_ANAHTAR.test(metin) || MANISA_ANAHTAR.test(metin);
}

export function yerelKaynakMi(kaynak: RSSKaynak): boolean {
  return /manisa/i.test(kaynak.ad);
}
