import { useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQ_GROUPS = [
  {
    title: "Buyurtma va to'lov",
    items: [
      {
        q: "Qanday qilib buyurtma beraman?",
        a: "Mahsulotni tanlang, savatga qo'shing, savatdan 'Buyurtma rasmiylashtirish' tugmasini bosing va yetkazib berish ma'lumotlarini kiriting.",
      },
      {
        q: "Buyurtmani bekor qila olamanmi?",
        a: "Ha. Buyurtma 'Tasdiqlandi' holatiga o'tmaguncha siz bekor qilishingiz mumkin. Buning uchun bizga qo'ng'iroq qiling.",
      },
      {
        q: "To'lovni qanday amalga oshiraman?",
        a: "Hozircha mahsulotni qabul qilganda naqd to‘laysiz. Onlayn karta to‘lovlari hali ulanmagan.",
      },
    ],
  },
  {
    title: "Yetkazib berish",
    items: [
      {
        q: "Buyurtma qancha vaqtda yetib keladi?",
        a: "Hozircha DTPI hududi va Denovdagi yaqin atrofga xizmat qilamiz. Topshirish joyi va vaqti sotuvchi bilan kelishiladi. Respublika bo‘ylab yetkazib berish mavjud emas.",
      },
      {
        q: "Yetkazib berish bepulmi?",
        a: "Mahalliy topshirish shartlarini sotuvchi bilan oldindan aniqlashtiring. Checkoutda buyurtmaga hisoblangan summa ko‘rsatiladi.",
      },
    ],
  },
  {
    title: "Mahsulotlar va sotuvchilar",
    items: [
      {
        q: "Sotuvchilar kim?",
        a: "DTPI hamjamiyatidagi talabalar va tasdiqlangan mahalliy sotuvchilar. Mahsulotning tavsifi va sotuvchisi uning sahifasida ko‘rsatiladi.",
      },
      {
        q: "Mahsulot sifati qanday tekshiriladi?",
        a: "Tavsif va rasmlarni diqqat bilan ko‘ring, zarur savollarni sotuvchi bilan aniqlashtiring. Mahsulotni qabul qilayotganda tekshirib oling.",
      },
      {
        q: "Sotuvchi bo'lish uchun nima qilishim kerak?",
        a: "'Sotuvchi bo'lish' sahifasiga o'ting va talabalik ma'lumotlaringizni yuboring. Tasdiqlash 1-2 kun davom etadi.",
      },
    ],
  },
  {
    title: "Qaytarish va muammolar",
    items: [
      {
        q: "Mahsulot sinib yetib keldi, nima qilaman?",
        a: "Mahsulotdagi muammoni rasmga oling va Murojaat yuborish sahifasi orqali administratorga yozing. Buyurtma raqamini ham ko‘rsating.",
      },
      {
        q: "Pul qachon qaytariladi?",
        a: "Mahsulot qaytarib olingandan keyin 3-7 ish kuni ichida hisobingizga o'tkaziladi.",
      },
    ],
  },
];

const FAQ = () => {
  useEffect(() => { document.title = "Yordam markazi — DTPI Market"; }, []);

  return (
    <Layout>
      <div className="bg-gradient-warm paper-texture">
        <div className="container py-10 md:py-14">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold leading-tight md:text-5xl">Yordam markazi</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Eng ko'p beriladigan savollar va javoblar. Javob topa olmadingizmi? Bizga yozing.
          </p>
        </div>
      </div>

      <div className="container py-10 md:py-14">
        <div className="mx-auto max-w-3xl space-y-10">
          {FAQ_GROUPS.map((group) => (
            <section key={group.title}>
              <h2 className="font-display text-xl font-semibold md:text-2xl">{group.title}</h2>
              <Accordion type="single" collapsible className="mt-4 space-y-3">
                {group.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${group.title}-${i}`}
                    className="rounded-2xl border border-border bg-card px-5 shadow-soft"
                  >
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}

          <section className="rounded-3xl border border-border bg-gradient-warm p-8 text-center shadow-card">
            <MessageCircle className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">Hali ham savol bormi?</h2>
            <p className="mt-2 text-muted-foreground">Savolingizni hamjamiyat administratoriga yuboring.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-xl"><Link to="/support"><MessageCircle className="h-4 w-4" /> Murojaat yuborish</Link></Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Yoki <Link to="/info/delivery" className="text-primary hover:underline">yetkazib berish</Link>,{" "}
              <Link to="/info/payment" className="text-primary hover:underline">to'lov</Link>,{" "}
              <Link to="/info/returns" className="text-primary hover:underline">qaytarish</Link> sahifalarini ko'ring.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
