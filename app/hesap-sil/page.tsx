import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hesap Silme — Köprü Gazetesi",
  description: "Köprü Gazetesi hesabınızı ve ilişkili verilerinizi nasıl silersiniz.",
};

export default function HesapSilPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-[#2f4f4f]">
      <h1 className="font-serif text-4xl font-bold mb-2">Hesap Silme</h1>
      <p className="text-sm text-gray-600 mb-8">
        Köprü Gazetesi hesabınızı ve ilişkili verilerinizi silmek için aşağıdaki
        adımları izleyin.
      </p>

      <section className="space-y-6 leading-relaxed">
        <div>
          <h2 className="font-serif text-2xl font-bold mb-3">Nasıl Silebilirim?</h2>
          <p>
            Hesabınızı silmek için{" "}
            <a
              href="mailto:xproyn@gmail.com?subject=Hesap%20Silme%20Talebi"
              className="text-[#c8a046] underline font-semibold"
            >
              xproyn@gmail.com
            </a>{" "}
            adresine, hesabınızla ilişkili <strong>e-posta adresinden</strong> bir
            e-posta gönderin. Konu kısmına &quot;Hesap Silme Talebi&quot; yazmanız
            yeterlidir.
          </p>
          <p className="mt-3">
            Talebi aldıktan sonra hesabınız ve bağlı verileriniz en geç{" "}
            <strong>30 gün içinde</strong> tamamen silinir.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold mb-3">
            Hangi Veriler Silinir?
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kullanıcı profiliniz (ad, e-posta, profil fotoğrafı)</li>
            <li>Yorumlarınız ve beğenileriniz</li>
            <li>Kaydettiğiniz haberler</li>
            <li>Bildirim tercihleri ve push token</li>
            <li>Gönderdiğiniz haberler (anonim olarak yayında kalabilir)</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold mb-3">
            Hangi Veriler Saklanabilir?
          </h2>
          <p>
            Basın yayın mevzuatı gereği, yayınlanmış olan haberler arşiv amaçlı
            saklanmaya devam edebilir. Ancak bu haberler sizinle kişisel olarak
            ilişkilendirilmez; yazar bilgisi &quot;anonim&quot; olarak güncellenir.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold mb-3">Süre ve Onay</h2>
          <p>
            Silme işlemi tamamlandığında size onay e-postası gönderilir. Süreç
            ortalama 1-7 iş günü sürer, en geç 30 gün içinde tamamlanır.
          </p>
        </div>

        <div className="mt-8 p-4 bg-[#faf7f0] border-l-4 border-[#c8a046] rounded">
          <p className="text-sm">
            <strong>Uygulama içinden silme:</strong> Ayrıca mobil uygulamada{" "}
            <em>Profil → Ayarlar → Hesabı Sil</em> menüsünden silme talebi
            oluşturabilirsiniz.
          </p>
        </div>
      </section>
    </main>
  );
}
