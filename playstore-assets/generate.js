/* eslint-disable */
// Köprü Gazetesi – Play Store icon + feature graphic generator
// Run: node playstore-assets/generate.js

const sharp = require("sharp");
const path = require("path");

const KOYU_YESIL = "#2f4f4f";
const ALTIN = "#c8a046";
const KREM = "#faf7f0";

// --- Icon 512x512 ---------------------------------------------------------
// Koyu yeşil kare zemin, merkezde altın köprü ikonu (MaterialCommunityIcons 'bridge' path)
function iconSvg() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#345656"/>
      <stop offset="1" stop-color="#2a4545"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" ry="96" fill="url(#bg)"/>

  <!-- Altın ince iç çerçeve -->
  <rect x="24" y="24" width="464" height="464" rx="80" ry="80"
        fill="none" stroke="${ALTIN}" stroke-width="3" opacity="0.5"/>

  <!-- Köprü: 3 kemer + sütunlar + geçiş yolu -->
  <g stroke="${ALTIN}" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Yol -->
    <line x1="72" y1="300" x2="440" y2="300"/>
    <!-- 3 kemer -->
    <path d="M 95 300 Q 156 205 217 300"/>
    <path d="M 217 300 Q 278 205 339 300"/>
    <path d="M 339 300 Q 400 205 461 300"/>
    <!-- Sütunlar -->
    <line x1="110" y1="300" x2="110" y2="390"/>
    <line x1="217" y1="300" x2="217" y2="390"/>
    <line x1="339" y1="300" x2="339" y2="390"/>
    <line x1="425" y1="300" x2="425" y2="390"/>
    <!-- Alt yer çizgisi -->
    <line x1="72" y1="395" x2="460" y2="395"/>
  </g>

  <!-- Üst kısa yazı -->
  <text x="256" y="150"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="56"
        font-weight="700"
        fill="${ALTIN}"
        letter-spacing="6">KG</text>
</svg>`;
}

// --- Feature Graphic 1024x500 ---------------------------------------------
function featureSvg() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2f4f4f"/>
      <stop offset="1" stop-color="#1f3535"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg2)"/>

  <!-- Altın üst şerit -->
  <rect x="0" y="0" width="1024" height="4" fill="${ALTIN}"/>
  <rect x="0" y="496" width="1024" height="4" fill="${ALTIN}"/>

  <!-- Sağda köprü ikonu -->
  <g transform="translate(720, 120)" stroke="${ALTIN}" stroke-width="8"
     fill="none" stroke-linecap="round" stroke-linejoin="round">
    <line x1="-10" y1="180" x2="260" y2="180"/>
    <path d="M 10 180 Q 55 115 100 180"/>
    <path d="M 100 180 Q 145 115 190 180"/>
    <path d="M 190 180 Q 235 115 280 180"/>
    <line x1="20" y1="180" x2="20" y2="245"/>
    <line x1="100" y1="180" x2="100" y2="245"/>
    <line x1="190" y1="180" x2="190" y2="245"/>
    <line x1="264" y1="180" x2="264" y2="245"/>
    <line x1="-10" y1="248" x2="270" y2="248"/>
  </g>

  <!-- Ana başlık -->
  <text x="70" y="200"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="82"
        font-weight="800"
        fill="${ALTIN}"
        letter-spacing="2">Köprü Gazetesi</text>

  <!-- Alt başlık -->
  <text x="70" y="258"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="30"
        font-weight="400"
        fill="${KREM}"
        opacity="0.85">Manisa · Köprübaşı · Yerel Haber</text>

  <!-- Üçüncü küçük yazı -->
  <g transform="translate(70, 330)">
    <rect x="0" y="0" width="8" height="40" fill="${ALTIN}"/>
    <text x="22" y="17" font-family="system-ui, -apple-system, sans-serif"
          font-size="16" fill="${KREM}" opacity="0.75">HABERLER · VEFAT İLANLARI · NÖBETÇİ ECZANE</text>
    <text x="22" y="38" font-family="system-ui, -apple-system, sans-serif"
          font-size="16" fill="${KREM}" opacity="0.75">ÇİFTÇİ HAVA DURUMU · ETKİNLİKLER</text>
  </g>
</svg>`;
}

async function main() {
  const out = __dirname;

  await sharp(Buffer.from(iconSvg()))
    .resize(512, 512)
    .png()
    .toFile(path.join(out, "icon-512.png"));

  await sharp(Buffer.from(iconSvg()))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(out, "icon-1024.png"));

  await sharp(Buffer.from(featureSvg()))
    .resize(1024, 500)
    .png()
    .toFile(path.join(out, "feature-graphic.png"));

  console.log("✓ icon-512.png");
  console.log("✓ icon-1024.png");
  console.log("✓ feature-graphic.png");
  console.log("Output:", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
