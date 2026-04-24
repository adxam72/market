import { useEffect } from "react";
import InfoPage from "@/components/InfoPage";
import { Wallet, CreditCard, Shield } from "lucide-react";

const Payment = () => {
  useEffect(() => { document.title = "To'lov — DTPI Market"; }, []);
  return (
    <InfoPage
      title="To'lov usullari"
      subtitle="Sizga qulay bo'lgan usulni tanlang"
      crumbs={[{ label: "To'lov" }]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Method
          icon={Wallet}
          title="Yetkazib berganda naqd"
          text="Mahsulotni qabul qilganda kuryerga naqd to'lashingiz mumkin. Eng oddiy va xavfsiz usul."
        />
        <Method
          icon={CreditCard}
          title="Onlayn karta orqali"
          text="UzCard, Humo va xalqaro kartalar qabul qilinadi. (MVP bosqichida demo rejimda)"
        />
      </div>

      <Section title="Xavfsizlik">
        <div className="flex gap-3 rounded-2xl border border-border bg-success/5 p-4">
          <Shield className="h-5 w-5 shrink-0 text-success" />
          <p className="text-sm text-muted-foreground">
            Karta ma'lumotlaringiz hech qachon serverlarimizda saqlanmaydi.
            Barcha to'lovlar shifrlangan kanal orqali amalga oshiriladi.
          </p>
        </div>
      </Section>

      <Section title="Pul qaytarish">
        <p className="text-muted-foreground">
          Agar mahsulot sizga yetib bormagan yoki yaroqsiz holatda yetkazilgan bo'lsa,
          to'liq pulingiz <b className="text-foreground">3-7 ish kuni</b> ichida qaytariladi.
          Batafsil — <a href="/info/returns" className="text-primary hover:underline">Qaytarish shartlari</a>.
        </p>
      </Section>
    </InfoPage>
  );
};

const Method = ({ icon: Icon, title, text }: { icon: any; title: string; text: string }) => (
  <div className="rounded-2xl border border-border bg-secondary/30 p-5">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{text}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="font-display text-xl font-semibold">{title}</h2>
    <div className="mt-3 leading-relaxed">{children}</div>
  </div>
);

export default Payment;
