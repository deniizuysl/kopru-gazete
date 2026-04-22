import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Köprübaşı Gazetesi",
  description: "Köprübaşı Gazetesi gizlilik politikası ve kişisel veri işleme esasları.",
};

export default function GizlilikPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-[#2f4f4f]">
      <h1 className="font-serif text-4xl font-bold mb-2">Gizlilik Politikası</h1>
      <p className="text-sm text-gray-600 mb-8">
        Son güncelleme: 22 Nisan 2026
      </p>

      <section className="space-y-6 leading-relaxed">
        <p>
          Köprübaşı Gazetesi (&quot;Uygulama&quot;, &quot;biz&quot;), Manisa&apos;nın
          Köprübaşı ilçesine özel bir yerel haber platformudur. Bu gizlilik
          politikası, web sitemiz ({" "}
          <span className="font-medium">kopru-gazete.vercel.app</span>) ve
          Android uygulamamız (&quot;Köprü Gazetesi&quot;,{" "}
          <span className="font-medium">com.koprubasigazete.app</span>) üzerinden
          topladığımız verileri ve bunları nasıl kullandığımızı açıklar.
        </p>

        <div>
          <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
            Topladığımız Veriler
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Hesap bilgileri:</strong> E-posta adresi, ad-soyad ve
              (isteğe bağlı) profil fotoğrafı. Google ile giriş kullanıldığında
              Google hesabınızdan yalnızca e-posta ve ad bilgisi alınır.
            </li>
            <li>
              <strong>Kullanıcı içerikleri:</strong> Gönderdiğiniz haberler,
              yorumlar, beğeniler, kaydettiğiniz içerikler.
            </li>
            <li>
              <strong>Bildirim token&apos;ı:</strong> Yeni haber ve yorum
              bildirimleri gönderebilmek için Expo push token&apos;ınız
              saklanır.
            </li>
            <li>
              <strong>Teknik veriler:</strong> Anonim kullanım istatistikleri
              (Vercel Analytics) — IP adresi veya kişisel tanımlayıcı
              saklanmaz.
            </li>
            <li>
              <strong>Yüklediğiniz medya:</strong> Haber fotoğrafları ve profil
              fotoğrafları Cloudinary üzerinde saklanır.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
            Verileri Nasıl Kullanıyoruz
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hesabınızı oluşturmak ve yönetmek,</li>
            <li>Haberleri, yorumları ve etkinlikleri size göstermek,</li>
            <li>Bildirim göndermek (yeni haber, yorumunuza gelen cevap),</li>
            <li>Spam ve kötüye kullanım tespiti (AI moderasyon),</li>
            <li>Uygulamayı iyileştirmek için toplu/anonim analiz.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
            Üçüncü Taraf Servisler
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Google OAuth</strong> — kimlik doğrulama
            </li>
            <li>
              <strong>Vercel</strong> — barındırma ve analitik
            </li>
            <li>
              <strong>Cloudinary</strong> — medya depolama
            </li>
            <li>
              <strong>Expo Push Notifications</strong> — bildirim iletimi
            </li>
            <li>
              <strong>Anthropic Claude</strong> — AI moderasyon ve haber
              özetleme (kullanıcı kimliğiyle eşleştirilmez)
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
            Veri Saklama ve Silme
          </h2>
          <p>
            Hesabınızı silmek isterseniz{" "}
            <a
              href="mailto:xproyn@gmail.com"
              className="text-[#c8a046] underline"
            >
              xproyn@gmail.com
            </a>{" "}
            adresine bir e-posta gönderin. Hesabınız ve ilgili kişisel verileriniz
            en geç 30 gün içinde silinir. Yasal yükümlülüklerimiz gereği
            saklanması gereken veriler (ör. yayın kayıtları) bu süreden sonra da
            arşivlenebilir.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
            Çocukların Gizliliği
          </h2>
          <p>
            Uygulama 13 yaş altı kullanıcılara yönelik değildir. 13 yaşından
            küçük olduğunuzu öğrenirsek hesabınızı sileriz.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold mt-8 mb-3">
            Haklarınız (KVKK)
          </h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında verilerinize
            erişme, düzeltme, silme ve işlenmesine itiraz etme haklarına
            sahipsiniz. Başvurularınızı{" "}
            <a
              href="mailto:xproyn@gmail.com"
              className="text-[#c8a046] underline"
            >
              xproyn@gmail.com
            </a>{" "}
            adresine iletebilirsiniz.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold mt-8 mb-3">İletişim</h2>
          <p>
            Sorularınız için:{" "}
            <a
              href="mailto:xproyn@gmail.com"
              className="text-[#c8a046] underline"
            >
              xproyn@gmail.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
