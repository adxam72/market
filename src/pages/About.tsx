import Layout from "@/components/layout/Layout";
import { Heart, Sparkles, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import campusImg from "@/assets/campus-community.webp";

const About = () => (
  <Layout>
    <section className="bg-[#f4f7ff]">
      <div className="container grid items-center gap-8 py-10 md:grid-cols-[1.1fr_1fr] md:py-14"><div>
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Biz haqimizda</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
          Bilim birlashtiradi.<br /><span className="text-primary">Ijod oldinga boshlaydi.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          DTPI Market — talabalar va yaqinimizdagi ijodkorlarni birlashtiruvchi mahalliy savdo maydoni. O‘rganish, yaratish va o‘zaro ko‘mak bizning asosiy qadriyatlarimiz.
        </p>
        <Link to="/catalog" className="mt-6 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-white">Hamjamiyat mahsulotlarini ko‘rish</Link>
      </div><img src={campusImg} alt="Bilim va hamkorlikni ifodalovchi universitet hamjamiyati illustratsiyasi" width={1000} height={1000} className="mx-auto w-full max-w-md" /></div>
    </section>

    <section className="container py-12"><Reveal className="grid gap-6 md:grid-cols-3">
      {[
        { i: <Heart className="h-6 w-6" />, t: "O‘zaro hurmat", d: "Mehnatni qadrlash, ochiq muloqot va mas’uliyatli hamkorlik." },
        { i: <Sparkles className="h-6 w-6" />, t: "Ijodga imkoniyat", d: "Yangi g‘oyalarni mahalliy hamjamiyat bilan tanishtirish." },
        { i: <GraduationCap className="h-6 w-6" />, t: "Birga o‘rganish", d: "Universitetdagi bilimni amaliy tajriba bilan boyitish." },
      ].map(b => (
        <div key={b.t} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">{b.i}</div>
          <h3 className="mt-5 font-display text-xl font-semibold">{b.t}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.d}</p>
        </div>
      ))}
    </Reveal><div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-7"><h2 className="text-xl font-semibold">Yaqin hamjamiyat uchun.</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Hozircha DTPI hududi va Denovdagi yaqin atrofga xizmat qilamiz. Mahsulotni qabul qilish joyi va vaqti sotuvchi bilan kelishiladi.</p><Link to="/info/delivery" className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4">Mahalliy topshirish haqida</Link></div></section>
  </Layout>
);
export default About;
