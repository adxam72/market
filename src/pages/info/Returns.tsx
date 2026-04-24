import { useEffect } from "react";
import InfoPage from "@/components/InfoPage";

const Returns = () => {
  useEffect(() => { document.title = "Qaytarish — DTPI Market"; }, []);
  return (
    <InfoPage
      title="Qaytarish va almashtirish"
      subtitle="Qo'l mehnati mahsulotlarini qaytarish qoidalari"
      crumbs={[{ label: "Qaytarish" }]}
    >
      <Section title="Qaytarish muddati">
        <p className="text-muted-foreground">
          Mahsulotni qabul qilgandan keyin <b className="text-foreground">3 kun ichida</b> qaytarish mumkin,
          agar u o'zining dastlabki holatida saqlangan bo'lsa.
        </p>
      </Section>

      <Section title="Qaysi mahsulotlar qaytariladi?">
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Yaroqsiz holatda yetkazilgan (sinishi, dog'lar, kamchiliklar).</li>
          <li>Saytda ko'rsatilganidan boshqacha bo'lib chiqqan.</li>
          <li>Adashib boshqa mahsulot yuborilgan.</li>
        </ul>
      </Section>

      <Section title="Qaytarib bo'lmaydigan mahsulotlar">
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Buyurtma asosida shaxsiylashtirilgan mahsulotlar (ism, sana yozuvi va h.k).</li>
          <li>Foydalanilgan, ifloslangan yoki o'ramidan ochilgan mahsulotlar.</li>
          <li>Oziq-ovqat va shaxsiy gigiyena buyumlari.</li>
        </ul>
      </Section>

      <Section title="Qaytarish jarayoni">
        <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>Yordam markazi orqali yoki <b className="text-foreground">+998 90 123 45 67</b> raqamiga qo'ng'iroq qiling.</li>
          <li>Qaytarish sababini va buyurtma raqamini ayting.</li>
          <li>Kuryer mahsulotni qaytarib olish uchun keladi.</li>
          <li>Tekshiruvdan so'ng pul 3-7 ish kuni ichida qaytariladi.</li>
        </ol>
      </Section>
    </InfoPage>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="font-display text-xl font-semibold">{title}</h2>
    <div className="mt-3 leading-relaxed">{children}</div>
  </div>
);

export default Returns;
