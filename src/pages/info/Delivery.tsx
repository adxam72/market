import { useEffect } from "react";
import InfoPage from "@/components/InfoPage";
import { Truck, Clock, MapPin, Package } from "lucide-react";

const Delivery = () => {
  useEffect(() => { document.title = "Yetkazib berish — DTPI Market"; }, []);
  return (
    <InfoPage
      title="Yetkazib berish"
      subtitle="Buyurtmangizni qanday va qachon olishingiz mumkinligi haqida"
      crumbs={[{ label: "Yetkazib berish" }]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card icon={Package} title="Institut ichida" desc="Sotuvchi mahsulotni o'zi topshiradi" />
        <Card icon={MapPin} title="Denov tumani" desc="Sotuvchi bilan kelishib olindi" />
        <Card icon={Clock} title="Buyurtma vaqti" desc="Har kuni 09:00 dan 18:00 gacha" />
        <Card icon={Truck} title="Tezkor topshirish" desc="Buyurtmadan so'ng 1 kun ichida" />
      </div>

      <Section title="Qanday ishlaydi?">
        <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>Buyurtma berasiz va sotuvchi siz bilan bog'lanadi.</li>
          <li>Mahsulotni institut hududida yoki kelishilgan joyda qabul qilasiz.</li>
          <li>Mahsulotni ko'rib, tekshirib olgach to'lovni amalga oshirasiz.</li>
          <li>Mahsulotni qabul qilib olasiz va tasdiqlaysiz.</li>
        </ol>
      </Section>

      <Section title="Yetkazib berish narxi">
        <p className="text-muted-foreground">
          <b className="text-foreground">Institut hududida</b> — bepul, sotuvchi o'zi topshiradi.{" "}
          <b className="text-foreground">Denov tumani bo'ylab</b> — sotuvchi bilan alohida kelishiladi.
          Narx va usul har bir buyurtma uchun individual tarzda belgilanadi.
        </p>
      </Section>

      <Section title="Yetkazish vaqti">
        <p className="text-muted-foreground">
          Buyurtmalar har kuni 09:00 dan 18:00 gacha qabul qilinadi.
          Buyurtma berilgandan so'ng sotuvchi 2 soat ichida siz bilan bog'lanadi.
        </p>
      </Section>
    </InfoPage>
  );
};

const Card = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex gap-3 rounded-2xl border border-border bg-secondary/30 p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="font-display text-xl font-semibold">{title}</h2>
    <div className="mt-3 leading-relaxed">{children}</div>
  </div>
);

export default Delivery;
