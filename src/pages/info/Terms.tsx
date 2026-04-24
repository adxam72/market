import { useEffect } from "react";
import InfoPage from "@/components/InfoPage";

const Terms = () => {
  useEffect(() => { document.title = "Foydalanish shartlari — DTPI Market"; }, []);
  return (
    <InfoPage
      title="Foydalanish shartlari"
      subtitle="Platformadan foydalanish qoidalari"
      crumbs={[{ label: "Shartnoma" }]}
    >
      <Section title="Umumiy qoidalar">
        <p className="text-muted-foreground">
          DTPI Market — universitet talabalari yaratgan qo'l mehnati mahsulotlarini sotish va sotib olish uchun
          mo'ljallangan platforma. Saytdan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz.
        </p>
      </Section>

      <Section title="Sotuvchilar uchun">
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Faqat universitet talabalari sotuvchi bo'lishi mumkin (talaba ID bilan tasdiqlanadi).</li>
          <li>Mahsulotlar haqiqiy va o'z ishlangan bo'lishi shart.</li>
          <li>Mahsulot rasmlari va tavsifi haqiqatga mos bo'lishi kerak.</li>
          <li>Buyurtmalar 24 soat ichida markaziy omborga topshirilishi shart.</li>
        </ul>
      </Section>

      <Section title="Xaridorlar uchun">
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Buyurtma berilganda to'g'ri ma'lumotlar kiritilishi kerak.</li>
          <li>Yetkazib berish vaqtida mahsulotni tekshirib qabul qilish tavsiya etiladi.</li>
          <li>Sharhlar halol va haqoratsiz bo'lishi shart.</li>
        </ul>
      </Section>

      <Section title="Mas'uliyat">
        <p className="text-muted-foreground">
          Platforma qoidabuzar foydalanuvchilarning hisobini bloklash huquqini saqlab qoladi.
          Qonunbuzarlik aniqlangan holatlarda tegishli organlarga xabar beriladi.
        </p>
      </Section>

      <Section title="O'zgarishlar">
        <p className="text-muted-foreground">
          Platforma ushbu shartlarni istalgan vaqt yangilash huquqiga ega. Muhim o'zgarishlar
          haqida foydalanuvchilar email orqali xabardor qilinadi.
        </p>
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

export default Terms;
