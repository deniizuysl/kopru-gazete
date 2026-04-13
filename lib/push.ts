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
