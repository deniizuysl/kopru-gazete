export async function pushBildirimGonder(tokens: string[], baslik: string, icerik: string, haberId: string) {
  const mesajlar = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: baslik,
    body: icerik,
    data: { haberId },
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mesajlar),
  });
}

// Admin'lere onay bekleyen haber bildirimi. data.tip: "onay" → mobil tarafta admin paneline yönlendir.
export async function pushAdminOnayBildirimi(tokens: string[], sayi: number) {
  if (tokens.length === 0) return;
  const baslik = sayi === 1 ? "Yeni AI haberi onay bekliyor" : `${sayi} AI haberi onay bekliyor`;
  const mesajlar = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: baslik,
    body: "Köprü Haber Ajanı yeni içerik üretti — admin panelinden incele.",
    data: { tip: "onay", sayi },
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mesajlar),
  });
}

// Admin'lere yeni kullanıcı haberi geldiğinde push. Hem direkt yayınlananlar hem onay bekleyenler için.
export async function pushAdminYeniHaber(opts: {
  tokens: string[];
  baslik: string;
  yazar: string;
  haberId: string;
  onayBekliyor: boolean;
}) {
  if (opts.tokens.length === 0) return;
  const ustBaslik = opts.onayBekliyor ? "Yeni haber onay bekliyor" : "Yeni haber yayınlandı";
  const mesajlar = opts.tokens.map((token) => ({
    to: token,
    sound: "default",
    title: ustBaslik,
    body: `${opts.yazar}: ${opts.baslik}`,
    data: { tip: opts.onayBekliyor ? "onay" : "haber", haberId: opts.haberId },
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mesajlar),
  });
}
