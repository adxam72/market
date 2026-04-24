import { useEffect } from "react";
import InfoPage from "@/components/InfoPage";

const Privacy = () => {
  useEffect(() => { document.title = "Maxfiylik siyosati — DTPI Market"; }, []);
  return (
    <InfoPage
      title="Maxfiylik siyosati"
      subtitle="Sizning shaxsiy ma'lumotlaringizni qanday himoya qilamiz"
      crumbs={[{ label: "Maxfiylik" }]}
    >
      <Section title="Qanday ma'lumotlar yig'iladi?">
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Ism, telefon raqam va elektron pochta — buyurtmani yetkazish uchun.</li>
          <li>Yetkazib berish manzili — kuryer xizmati uchun.</li>
          <li>Buyurtma tarixi — sizga yaxshiroq xizmat ko'rsatish uchun.</li>
        </ul>
      </Section>

      <Section title="Ma'lumotlar qanday ishlatiladi?">
        <p className="text-muted-foreground">
          Yig'ilgan ma'lumotlar faqat buyurtmani amalga oshirish, mijozni qo'llab-quvvatlash
          va xizmat sifatini yaxshilash uchun ishlatiladi. Hech qanday tarzda
          uchinchi shaxslarga sotilmaydi.
        </p>
      </Section>

      <Section title="Ma'lumotlarni himoya qilish">
        <p className="text-muted-foreground">
          Barcha ma'lumotlar shifrlangan holda saqlanadi. Faqat siz va vakolatli
          xodimlar (faqat zaruriyat tug'ilganda) ma'lumotlaringizni ko'ra oladi.
        </p>
      </Section>

      <Section title="Sizning huquqlaringiz">
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Profilingizdagi ma'lumotlarni istalgan vaqt o'zgartirishingiz mumkin.</li>
          <li>Hisobingizni o'chirishni so'rashingiz mumkin.</li>
          <li>Qanday ma'lumotlaringiz saqlanayotganini bilishingiz mumkin.</li>
        </ul>
      </Section>

      <p className="text-sm text-muted-foreground">
        Savollar uchun: <a href="mailto:hello@dtpi.market" className="text-primary hover:underline">hello@dtpi.market</a>
      </p>
    </InfoPage>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="font-display text-xl font-semibold">{title}</h2>
    <div className="mt-3 leading-relaxed">{children}</div>
  </div>
);

export default Privacy;
