<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Köprü Gazetesi — Web

Köprübaşı/Manisa yerel haber sitesi. Next.js 16 App Router + Turbopack, Prisma, Tailwind v4, NextAuth.

## Deploy
- Git push → Vercel otomatik deploy. `vercel --prod` elle gerekmiyor.
- Production: kopru-gazete.vercel.app (veya bağlı domain).

## Marka
- Renkler: `#2f4f4f` (koyu yeşil/ana), `#c8a046` (altın/aksent), `#faf7f0` (krem/bg), `#7b8b4a` (zeytin/spor), `#b37a2e` (sağlık).
- Font: editoryal başlıklar için Playfair Display (`font-serif`). Gövde Geist Sans.
- Logo: `KopruIcon` — köprü kemeri + sütunlar. Emoji KULLANMA, ikonlar `components/icons.tsx` içinde stroke-tabanlı SVG.

## Kategori paleti (`HaberKarti` içindeki `kategoriStil`)
GENEL `#2f4f4f` · SPOR `#7b8b4a` · KULTUR `#c8a046` · EKONOMI `#2f4f4f` · EGITIM `#5a6b3d` · SAGLIK `#b37a2e` · DUYURU `#c8a046`. Açık renkli pill'lerde (KULTUR/DUYURU) yazı koyu olmalı.

## Prisma
- Generated client path: `@/app/generated/prisma/client` (standart `@prisma/client` DEĞİL).
- Şema değişikliğinden sonra `npx prisma generate` zorunlu.

## Hava durumu (`components/HavaDurumu.tsx`)
- Open-Meteo API (key yok), Köprübaşı: 38.74°N 28.39°E.
- Server component + `next: { revalidate: 600 }` → 10dk ISR.
- `<Suspense fallback={null}>` ile sarılmalı (ana sayfa başlık satırında).

## Haber Ajanı (`lib/haber-ajani.ts`)
- RSS kaynaklarından (`lib/rss-kaynaklari.ts`) Manisa/Köprübaşı içerik çeker, `haberYaz` ile yeniden yazar, `onayBekliyor: true` + `yayinlandiMi: false` ile kaydeder.
- Türkiye özel günleri `lib/ozel-gunler.ts`'de (Ramazan/Kurban Bayramı tarihleri her yıl güncellenmeli).
- Cron: `vercel.json` → `/api/cron/haber-ajani` günlük 09:00 UTC. Pzt ve Per atlanır → haftada ~5 haber.
- `CRON_SECRET` env zorunlu. Manuel test: `GET /api/cron/haber-ajani?zorla=1` (atlamayı bypass eder).
- Görseller RSS enclosure > media:content > description img > og:image sırasıyla alınır, Cloudinary'ye `ajan/` klasörüne kopyalanır. Bulunamazsa foto'suz yayınlanır.
- Üretim tamamlanınca tüm `ADMIN` kullanıcılara push gider (`pushAdminOnayBildirimi`).
- Ajan haberi işareti: `hamIcerik` `[AJAN-KAYNAK]` veya `[AJAN-OZEL:...]` ile başlar. Dedupe link bazlıdır.

## Dikkat
- `useSearchParams` kullanan componentler Suspense sınırı ister (Next.js 16).
- Namaz vakti widget'ı istenmedi — ekleme.
