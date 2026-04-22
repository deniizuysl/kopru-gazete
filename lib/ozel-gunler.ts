// Türkiye özel günleri — milli bayramlar, anma günleri, dini günler.
// Ajan bu tarihlerde özel haber üretir. Dini tarihler (Kandil, Bayram) her yıl değişir — yılda bir güncelle.

export interface OzelGun {
  // "AA-GG" formatı (her yıl), YYYY-AA-GG ise o yıla özel (dini tarihler gibi).
  tarih: string;
  ad: string;
  prompt: string;
  gorsel: string; // Cloudinary URL — istersen boş bırak, fallback'e düşer
  kategori: "GENEL" | "KULTUR" | "DUYURU";
}

export const ozelGunler: OzelGun[] = [
  // Sabit milli bayramlar ve anma günleri
  {
    tarih: "01-01",
    ad: "Yılbaşı",
    prompt: "Yeni yılın Köprübaşı halkı için barış, sağlık ve bereket getirmesi dileklerini içeren kısa bir haber yaz.",
    gorsel: "",
    kategori: "KULTUR",
  },
  {
    tarih: "02-10",
    ad: "Mehmet Akif Ersoy'u Anma Günü",
    prompt: "İstiklal Marşı'mızın şairi Mehmet Akif Ersoy'un vefat yıldönümünde anma haberi yaz. Manisa'nın Köprübaşı ilçesi halkına hitap eden üslupta olsun.",
    gorsel: "",
    kategori: "KULTUR",
  },
  {
    tarih: "03-18",
    ad: "Çanakkale Zaferi ve Şehitleri Anma Günü",
    prompt: "18 Mart Çanakkale Zaferi ve Şehitleri Anma Günü için saygı içerikli anma haberi yaz. Köprübaşı halkına hitap eden üslupta, şehitlerimizin aziz hatırasını yad eden.",
    gorsel: "",
    kategori: "GENEL",
  },
  {
    tarih: "04-23",
    ad: "Ulusal Egemenlik ve Çocuk Bayramı",
    prompt: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı için kutlama haberi yaz. TBMM'nin açılışı, Atatürk'ün çocuklara armağanı vurgusuyla. Köprübaşı'ndaki çocuklara hitap eden sıcak bir kutlama olsun.",
    gorsel: "",
    kategori: "GENEL",
  },
  {
    tarih: "05-19",
    ad: "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
    prompt: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı için kutlama haberi yaz. Atatürk'ün Samsun'a çıkışı, Kurtuluş Savaşı'nın başlangıcı vurgulansın. Köprübaşı gençliğine hitap etsin.",
    gorsel: "",
    kategori: "GENEL",
  },
  {
    tarih: "07-15",
    ad: "Demokrasi ve Milli Birlik Günü",
    prompt: "15 Temmuz Demokrasi ve Milli Birlik Günü için anma haberi yaz. Darbe girişimine karşı halkın direnişi, şehitler ve demokrasiye sahip çıkış vurgulansın. Köprübaşı halkına hitap etsin.",
    gorsel: "",
    kategori: "GENEL",
  },
  {
    tarih: "08-30",
    ad: "Zafer Bayramı",
    prompt: "30 Ağustos Zafer Bayramı için kutlama haberi yaz. Büyük Taarruz, Dumlupınar Meydan Muharebesi ve Başkomutan Atatürk vurgulansın. Köprübaşı halkına hitap etsin.",
    gorsel: "",
    kategori: "GENEL",
  },
  {
    tarih: "09-06",
    ad: "Manisa'nın Kurtuluşu",
    prompt: "6 Eylül Manisa'nın Kurtuluşu için kutlama haberi yaz. Manisa'nın Yunan işgalinden kurtuluşu, şehrin tarihsel önemi vurgulansın. Köprübaşı dahil tüm Manisa halkına hitap etsin.",
    gorsel: "",
    kategori: "GENEL",
  },
  {
    tarih: "10-29",
    ad: "Cumhuriyet Bayramı",
    prompt: "29 Ekim Cumhuriyet Bayramı için kutlama haberi yaz. Cumhuriyetin ilanı, Atatürk'ün armağanı, çağdaş Türkiye vurgulansın. Köprübaşı halkına coşkulu ve gururlu bir kutlama.",
    gorsel: "",
    kategori: "GENEL",
  },
  {
    tarih: "11-10",
    ad: "Atatürk'ü Anma Günü",
    prompt: "10 Kasım Mustafa Kemal Atatürk'ü anma haberi yaz. Saat 09:05'te saygı duruşu, Ata'nın hayatı ve ilkeleri vurgulansın. Köprübaşı halkına hitap eden, saygılı ve duygusal bir üslupta.",
    gorsel: "",
    kategori: "GENEL",
  },
  {
    tarih: "11-24",
    ad: "Öğretmenler Günü",
    prompt: "24 Kasım Öğretmenler Günü için kutlama haberi yaz. Başöğretmen Atatürk, öğretmenlerin emeği, Köprübaşı'ndaki eğitim kahramanları vurgulansın.",
    gorsel: "",
    kategori: "EGITIM" as any,
  },

  // 2026 yılına özel dini günler (yaklaşık tarihler — yılda bir güncelle)
  {
    tarih: "2026-02-25",
    ad: "Regaib Kandili",
    prompt: "Regaib Kandili için kısa bir tebrik haberi yaz. Köprübaşı halkına hayırlara vesile olması dileği.",
    gorsel: "",
    kategori: "KULTUR",
  },
  {
    tarih: "2026-03-16",
    ad: "Miraç Kandili",
    prompt: "Miraç Kandili için kısa bir tebrik haberi yaz. Köprübaşı halkına hayırlara vesile olması dileği.",
    gorsel: "",
    kategori: "KULTUR",
  },
  {
    tarih: "2026-03-20",
    ad: "Ramazan Bayramı Arifesi",
    prompt: "Ramazan Bayramı arifesi için Köprübaşı halkına hitap eden bayram hazırlığı haberi yaz.",
    gorsel: "",
    kategori: "KULTUR",
  },
  {
    tarih: "2026-03-21",
    ad: "Ramazan Bayramı 1. Gün",
    prompt: "Ramazan Bayramı 1. gün için Köprübaşı halkına hitap eden bayram kutlama haberi yaz. Yardımlaşma, kardeşlik, aile vurgulansın.",
    gorsel: "",
    kategori: "KULTUR",
  },
  {
    tarih: "2026-05-26",
    ad: "Kurban Bayramı 1. Gün",
    prompt: "Kurban Bayramı 1. gün için Köprübaşı halkına hitap eden bayram kutlama haberi yaz. İhtiyaç sahipleriyle paylaşım, kardeşlik vurgulansın.",
    gorsel: "",
    kategori: "KULTUR",
  },
  {
    tarih: "2026-06-23",
    ad: "Mevlid Kandili",
    prompt: "Mevlid Kandili için kısa bir tebrik haberi yaz. Köprübaşı halkına hayırlara vesile olması dileği.",
    gorsel: "",
    kategori: "KULTUR",
  },
];

export function bugununOzelGunu(tarih: Date = new Date()): OzelGun | null {
  const yil = tarih.getFullYear();
  const ay = String(tarih.getMonth() + 1).padStart(2, "0");
  const gun = String(tarih.getDate()).padStart(2, "0");
  const tamTarih = `${yil}-${ay}-${gun}`;
  const kisaTarih = `${ay}-${gun}`;

  return (
    ozelGunler.find((o) => o.tarih === tamTarih) ||
    ozelGunler.find((o) => o.tarih === kisaTarih) ||
    null
  );
}
