import Layout from "@/components/layout/Layout";
import { Heart, Sparkles, GraduationCap } from "lucide-react";

const About = () => (
  <Layout>
    <section className="bg-gradient-warm">
      <div className="container py-16 md:py-24">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Biz haqimizda</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
          Talabalarning <span className="italic text-primary">qo'l mehnati</span> yashashga loyiq.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          DTPI Market — universitet talabalari uchun mo'ljallangan qo'l mehnati mahsulotlari bozori. Biz ijodkor talabalarning daromad topishlariga ko'maklashamiz.
        </p>
      </div>
    </section>

    <section className="container grid gap-6 py-16 md:grid-cols-3">
      {[
        { i: <Heart className="h-6 w-6" />, t: "Yurakdan", d: "Har bir mahsulot talaba qo'li bilan, mehr bilan yaratilgan." },
        { i: <Sparkles className="h-6 w-6" />, t: "Noyob", d: "Ommaviy emas — har biri o'ziga xos va cheklangan miqdorda." },
        { i: <GraduationCap className="h-6 w-6" />, t: "Tasdiqlangan", d: "Faqat tekshirilgan DTPI talabalari sotishlari mumkin." },
      ].map(b => (
        <div key={b.t} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">{b.i}</div>
          <h3 className="mt-5 font-display text-xl font-semibold">{b.t}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.d}</p>
        </div>
      ))}
    </section>
  </Layout>
);
export default About;
