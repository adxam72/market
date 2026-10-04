import { useEffect } from "react";
import InfoPage from "@/components/InfoPage";
import { Truck, Clock, MapPin, Package } from "lucide-react";

const Delivery = () => {
  useEffect(() => { document.title = "Yetkazib berish — DTPI Market"; }, []);
  return (
    <InfoPage
      title="Yetkazib berish"
      subtitle="DTPI hududi va Denovdagi yaqin atrofda mahsulotni qabul qilish"
      crumbs={[{ label: "Yetkazib berish" }]}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card icon={Package} title="Institut ichida" desc="Sotuvchi mahsulotni o'zi topshiradi" />
        <Card icon={MapPin} title="Yaqin hudud" desc="DTPI va Denovdagi yaqin atrof" />
        <Card icon={Clock} title="Qulay vaqt" desc="Sotuvchi bilan oldindan kelishiladi" />
        <Card icon={Truck} title="Mahalliy topshirish" desc="Respublika bo‘ylab yetkazish mavjud emas" />
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
          <b className="text-foreground">Denovdagi yaqin atrofda</b> — sotuvchi bilan alohida kelishiladi.
          Narx va usul har bir buyurtma uchun individual tarzda belgilanadi.
        </p>
      </Section>

      <Section title="Yetkazish vaqti">
        <p className="text-muted-foreground">
          Topshirish vaqti mahsulotning mavjudligi va sotuvchi bilan kelishuvga bog‘liq.
          Buyurtmani rasmiylashtirishdan oldin hudud va qabul qilish joyini aniqlashtiring.
        </p>
      </Section>
    </InfoPage>
  );
};

const Card = ({ icon: Icon, title, desc }: { icon: typeof import("lucide-react").Truck; title: string; desc: string }) => (
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
