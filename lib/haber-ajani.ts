import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";
import { haberYaz } from "@/lib/claude";
import { uploadImageFromUrl } from "@/lib/cloudinary";
import { rssKaynaklari, ilgiliMi, yerelKaynakMi, type RSSKaynak } from "@/lib/rss-kaynaklari";
import { bugununOzelGunu } from "@/lib/ozel-gunler";
import { Kategori } from "@/app/generated/prisma/client";

const AJAN_YAZAR_ADI = "Deniz Uysal";

interface RSSItem {
  baslik: string;
  link: string;
  aciklama: string;
  gorselUrl: string | null;
  kaynakAd: string;
  kaynakYerel: boolean;
}

// Deniz Uysal kullanıcısının ID'sini bul — var ise haberler onun profilinden yayımlanır.
async function ajanYazarId(): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { name: AJAN_YAZAR_ADI },
    select: { id: true },
  });
  return user?.id || null;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

// HTML etiketlerini temizle, fazla boşlukları kırp.
function htmlTemizle(metin: string): string {
  return metin
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function ilkImgSrc(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

// Verilen URL'deki HTML'i çek ve og:image meta tag'ini bul.
async function ogGorselCek(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "KopruGazeteBot/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function rssCek(kaynak: RSSKaynak): Promise<RSSItem[]> {
  try {
    const res = await fetch(kaynak.url, {
      headers: { "User-Agent": "KopruGazeteBot/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const data = xmlParser.parse(xml);

    const kanal = data?.rss?.channel || data?.feed;
    if (!kanal) return [];

    const itemler = Array.isArray(kanal.item) ? kanal.item : kanal.item ? [kanal.item] : [];
    const yerel = yerelKaynakMi(kaynak);

    return itemler.slice(0, 20).map((it: any): RSSItem => {
      const baslik = typeof it.title === "string" ? it.title : it.title?.["#text"] || "";
      const link = typeof it.link === "string" ? it.link : it.link?.["@_href"] || it.link?.["#text"] || "";
      const aciklama = typeof it.description === "string" ? it.description : it.description?.["#text"] || "";

      // Görsel kaynakları öncelik sırasıyla
      const enclosure = it.enclosure?.["@_url"] && /image/i.test(it.enclosure["@_type"] || "")
        ? it.enclosure["@_url"] : null;
      const mediaContent = it["media:content"]?.["@_url"] || null;
      const mediaThumb = it["media:thumbnail"]?.["@_url"] || null;
      const descImg = ilkImgSrc(aciklama);

      return {
        baslik: htmlTemizle(String(baslik)),
        link: String(link).trim(),
        aciklama: htmlTemizle(String(aciklama)),
        gorselUrl: enclosure || mediaContent || mediaThumb || descImg,
        kaynakAd: kaynak.ad,
        kaynakYerel: yerel,
      };
    }).filter((it: RSSItem) => it.baslik && it.link);
  } catch {
    return [];
  }
}

async function zatenVarMi(link: string): Promise<boolean> {
  const haber = await prisma.haber.findFirst({
    where: { hamIcerik: { contains: link } },
    select: { id: true },
  });
  return !!haber;
}

const KAYNAK_MARKER = "[AJAN-KAYNAK]";

async function haberOlustur(item: RSSItem, yazarId: string | null): Promise<string | null> {
  if (await zatenVarMi(item.link)) return null;

  const hamMetin = `${KAYNAK_MARKER} ${item.link}\n\n${item.baslik}\n\n${item.aciklama}`;

  const aiSonuc = await haberYaz({
    hamMetin,
    anonim: false,
    yazarAdi: AJAN_YAZAR_ADI,
  });

  // Görsel: RSS'te varsa onu, yoksa og:image, hiçbiri yoksa fotografsız haber
  let gorselCdnUrl: string | null = null;
  const kaynakGorsel = item.gorselUrl || (await ogGorselCek(item.link));
  if (kaynakGorsel) {
    gorselCdnUrl = await uploadImageFromUrl(kaynakGorsel);
  }

  const haber = await prisma.haber.create({
    data: {
      baslik: aiSonuc.baslik,
      icerik: aiSonuc.icerik,
      hamIcerik: hamMetin,
      fotografUrls: gorselCdnUrl ? [gorselCdnUrl] : [],
      fotografAlt: aiSonuc.fotografAlt || null,
      kategori: (aiSonuc.kategori as Kategori) || Kategori.GENEL,
      anonim: false,
      yazarAdi: AJAN_YAZAR_ADI,
      yazarId,
      yayinlandiMi: false,
      onayBekliyor: true,
      incelemeNedeni: `AI Ajan · ${item.kaynakAd} · ${item.link}`,
    },
  });

  return haber.id;
}

async function ozelGunHaberi(yazarId: string | null): Promise<string | null> {
  const ozel = bugununOzelGunu();
  if (!ozel) return null;

  // Bu özel gün için bugün zaten haber üretildi mi?
  const bugunBasi = new Date();
  bugunBasi.setHours(0, 0, 0, 0);
  const varmi = await prisma.haber.findFirst({
    where: {
      hamIcerik: { contains: `[AJAN-OZEL:${ozel.ad}]` },
      createdAt: { gte: bugunBasi },
    },
    select: { id: true },
  });
  if (varmi) return null;

  const hamMetin = `[AJAN-OZEL:${ozel.ad}]\n\n${ozel.prompt}`;

  const aiSonuc = await haberYaz({
    hamMetin,
    anonim: false,
    yazarAdi: AJAN_YAZAR_ADI,
  });

  let gorselCdnUrl: string | null = null;
  if (ozel.gorsel) {
    gorselCdnUrl = await uploadImageFromUrl(ozel.gorsel);
  }

  const haber = await prisma.haber.create({
    data: {
      baslik: aiSonuc.baslik,
      icerik: aiSonuc.icerik,
      hamIcerik: hamMetin,
      fotografUrls: gorselCdnUrl ? [gorselCdnUrl] : [],
      fotografAlt: aiSonuc.fotografAlt || null,
      kategori: (ozel.kategori as Kategori) || Kategori.GENEL,
      anonim: false,
      yazarAdi: AJAN_YAZAR_ADI,
      yazarId,
      yayinlandiMi: false,
      onayBekliyor: true,
      incelemeNedeni: `AI Ajan · Özel Gün: ${ozel.ad}`,
    },
  });

  return haber.id;
}

export interface AjanSonucu {
  uretilenler: string[]; // haber id listesi
  taranan: number;       // toplam RSS item sayısı
  aday: number;          // ilgili bulunan sayı
  ozelGunVar: boolean;
}

export async function haberAjaniniCalistir(hedefSayi: number = 1): Promise<AjanSonucu> {
  const uretilenler: string[] = [];
  const yazarId = await ajanYazarId();

  // 1) Özel gün varsa ilk önce onu üret
  const ozelId = await ozelGunHaberi(yazarId);
  const ozelGunVar = !!ozelId;
  if (ozelId) uretilenler.push(ozelId);

  // 2) RSS'lerden besle
  const tumItemler: RSSItem[] = [];
  for (const kaynak of [...rssKaynaklari].sort((a, b) => a.oncelik - b.oncelik)) {
    const items = await rssCek(kaynak);
    tumItemler.push(...items);
  }

  // Manisa/Köprübaşı ile ilgili olanlar + daha önce üretilmemiş olanlar
  const adaylar: RSSItem[] = [];
  for (const it of tumItemler) {
    const metin = `${it.baslik} ${it.aciklama}`;
    if (!ilgiliMi(metin, it.kaynakYerel)) continue;
    if (await zatenVarMi(it.link)) continue;
    adaylar.push(it);
  }

  // Köprübaşı geçenler en öne (ilçe önceliği)
  adaylar.sort((a, b) => {
    const aKopru = /köprübaşı|koprubasi/i.test(`${a.baslik} ${a.aciklama}`) ? 1 : 0;
    const bKopru = /köprübaşı|koprubasi/i.test(`${b.baslik} ${b.aciklama}`) ? 1 : 0;
    return bKopru - aKopru;
  });

  for (const it of adaylar.slice(0, hedefSayi)) {
    try {
      const id = await haberOlustur(it, yazarId);
      if (id) uretilenler.push(id);
    } catch (e) {
      console.error("Ajan haber üretim hatası:", it.link, e);
    }
  }

  return {
    uretilenler,
    taranan: tumItemler.length,
    aday: adaylar.length,
    ozelGunVar,
  };
}
