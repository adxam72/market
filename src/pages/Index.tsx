import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, MapPin, GraduationCap, HeartHandshake, Sparkles, ShoppingBag, Store, Pause, Play, BookOpen, Palette } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types/db";
import campusImg from "@/assets/campus-community.webp";
import { errorMessage } from "@/lib/marketplace";

const categoryColors = ["bg-blue-50", "bg-violet-50", "bg-amber-50", "bg-sky-50"];
const values = [
  { icon: BookOpen, title: "Bilimdan imkoniyatga", text: "O‘rganganimizni amaliyotga, g‘oyalarimizni yangi imkoniyatlarga aylantiramiz.", number: "01" },
  { icon: Palette, title: "Ijodga e’tibor", text: "Talaba mehnati va mahalliy ijodning o‘ziga xosligini qadrlaymiz.", number: "02" },
  { icon: HeartHandshake, title: "Halol hamkorlik", text: "Ochiq muloqot, o‘zaro hurmat va mas’uliyatli savdoni qo‘llab-quvvatlaymiz.", number: "03" },
];
export default function Index() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);
  const load = async () => {
    setLoading(true); setError("");
    const [cats, products] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("products").select("*").eq("is_active", true).order("is_featured", { ascending: false }).order("created_at", { ascending: false }).limit(8),
    ]);
    if (cats.error || products.error) setError(errorMessage(cats.error || products.error));
    else { setCategories(cats.data ?? []); setFeatured(products.data ?? []); }
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);
  return <Layout><div className={`campus-page ${paused ? "motion-paused" : ""}`}>
    <section className="campus-hero relative isolate overflow-hidden">
      <div className="campus-ambient pointer-events-none absolute inset-0 -z-10" aria-hidden="true"><div className="ambient-orb ambient-orb-one" /><div className="ambient-orb ambient-orb-two" /><div className="campus-grid absolute inset-0" /></div>
      <div className="container relative pb-7 pt-8 md:pb-10 md:pt-10">
        <div className="grid items-center gap-1 lg:grid-cols-[1fr_1.04fr] lg:gap-8">
          <div className="hero-copy relative z-10 py-2 lg:py-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/80 px-3 py-2 text-[10px] font-semibold text-primary shadow-soft sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> DTPI va yaqin atrof uchun</span>
            <p className="mt-6 text-[10px] font-semibold tracking-[.2em] text-muted-foreground md:mt-8">BILIM. IJOD. HAMKORLIK.</p>
            <h1 className="campus-title mt-4 text-[clamp(2.55rem,6vw,5.5rem)] font-extrabold leading-[1.04] tracking-[-.055em]"><span className="campus-gradient-text">Katta g‘oyalar.</span><br />Yaqin insonlar.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground md:text-base">Talabalar ijodi va mahalliy mahsulotlar bir joyda. O‘zingizga yoqqanini toping, yoningizdagi ijodkorni qo‘llab-quvvatlang.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Button asChild size="lg" className="motion-button h-12 rounded-2xl bg-primary px-5 text-sm shadow-[0_8px_24px_-8px_rgba(37,99,235,.6)]"><Link to="/catalog">Katalogni kashf etish <ArrowUpRight size={18} /></Link></Button><Button asChild variant="outline" size="lg" className="motion-button h-12 rounded-2xl border-blue-200 bg-white/70 px-4 text-sm"><a href="#hamjamiyat">Bizning qadriyatlar</a></Button></div>
            <div className="mt-7 flex items-center gap-3 text-xs text-muted-foreground"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white"><MapPin size={18} className="text-primary" /></span><span><b className="font-semibold text-foreground">Kichik hudud. Yaqin hamjamiyat.</b><br /><span className="mt-1 inline-block">DTPI hududi va Denovdagi yaqin atrof.</span></span></div>
          </div>
          <div className="campus-art relative mx-auto w-full max-w-[630px]">
            <div aria-hidden="true" className="campus-orbit campus-orbit-one" /><div aria-hidden="true" className="campus-orbit campus-orbit-two" />
            <img src={campusImg} alt="Bilim, ijod va hamkorlikni ifodalovchi universitet hamjamiyati illustratsiyasi" width={1000} height={1000} fetchPriority="high" className="campus-illustration relative z-10 h-auto w-full object-contain" />
            <div className="campus-float campus-float-one absolute left-0 top-[22%] z-20 flex items-center gap-2.5 rounded-2xl border border-white/90 bg-white/90 px-3 py-3 shadow-card backdrop-blur-md sm:px-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-primary"><GraduationCap size={20} /></span><div><p className="text-[10px] text-muted-foreground">Birga o‘samiz</p><p className="mt-0.5 text-xs font-semibold">Talabalar hamjamiyati</p></div></div>
            <div className="campus-float campus-float-two absolute bottom-[15%] right-0 z-20 flex items-center gap-2.5 rounded-2xl border border-white/90 bg-white/90 px-3 py-3 shadow-card backdrop-blur-md sm:px-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Sparkles size={19} /></span><div><p className="text-[10px] text-muted-foreground">G‘oyadan mahsulotgacha</p><p className="mt-0.5 text-xs font-semibold">Mahalliy ijodga e’tibor</p></div></div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-blue-200/50 pt-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-2"><GraduationCap size={15} className="text-primary" /> DTPI Market · Mahalliy savdo maydoni</span><button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)} className="flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-3 transition hover:bg-white">{paused ? <Play size={13} /> : <Pause size={13} />}{paused ? "Harakatni yoqish" : "Harakatni to‘xtatish"}</button></div>
      </div>
    </section>
    <section id="kategoriyalar" className="container scroll-mt-44 py-10 md:py-14">
      <Reveal><SectionTitle eyebrow="SIZGA YAQIN TANLOVLAR" title="Nimani izlayapsiz?" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {loading ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-secondary" />) : categories.slice(0, 4).map((cat, i) => <Link key={cat.id} to={`/catalog?cat=${cat.slug}`} className="motion-category group flex min-h-28 items-center gap-3 rounded-3xl border border-blue-100/80 bg-white p-3 sm:p-5"><span aria-hidden="true" className={`flex h-14 w-11 shrink-0 items-center justify-center rounded-2xl text-3xl sm:h-16 sm:w-16 ${categoryColors[i]}`}>{cat.icon || <ShoppingBag size={26} className="text-primary" />}</span><div className="min-w-0"><h3 className="text-xs font-semibold leading-5 sm:text-sm">{cat.name}</h3><span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">Kashf etish <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span></div></Link>)}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{categories.slice(4).map(cat => <Link key={cat.id} to={`/catalog?cat=${cat.slug}`} className="rounded-full border bg-white px-4 py-2.5 text-xs font-medium transition hover:border-primary hover:text-primary">{cat.icon} {cat.name}</Link>)}</div>
        {error && <div role="alert" className="mt-6 rounded-xl border p-5 text-sm">{error} <button onClick={load} className="ml-2 text-primary underline">Qayta urinish</button></div>}
      </Reveal>
    </section>
    <section className="container pb-12 md:pb-16">
      <Reveal><SectionTitle eyebrow="YONINGIZDAGI IJODKORLARDAN" title="Sizga yoqishi mumkin" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">{loading ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-secondary" />) : featured.map(p => <ProductCard key={p.id} product={p} />)}</div>
        {!loading && !error && featured.length === 0 && <p className="py-12 text-center text-muted-foreground">Yangi mahsulotlar tez orada joylashtiriladi.</p>}
        {featured.length > 0 && <div className="mt-7 text-center"><Button asChild variant="outline" className="motion-button h-12 rounded-2xl bg-white px-6"><Link to="/catalog">Barcha mahsulotlarni ko‘rish <ArrowUpRight size={17} /></Link></Button></div>}
      </Reveal>
    </section>
    <section id="hamjamiyat" className="container scroll-mt-44 pb-12 md:pb-16">
      <Reveal><SectionTitle eyebrow="UNIVERSITET RUHI" title="Savdodan ko‘ra ko‘proq." /><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Bizni faqat mahsulotlar emas, birga o‘rganish, yaratish va bir-birimizga yordam berish istagi birlashtiradi.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">{values.map(({ icon: Icon, title, text, number }) => <article key={title} className="motion-category relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 md:p-8"><span className="absolute right-6 top-5 text-4xl font-semibold tracking-tight text-blue-100" aria-hidden="true">{number}</span><span className="inline-flex rounded-2xl bg-blue-50 p-3 text-primary"><Icon size={23} strokeWidth={1.6} /></span><h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p></article>)}</div>
      </Reveal>
    </section>
    <section className="container pb-5"><Reveal><div className="campus-local-panel relative grid gap-6 overflow-hidden rounded-[2rem] p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-10"><div className="relative z-10"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-[10px] text-blue-100"><MapPin size={13} /> MAHALLIY HUDUD</span><h2 className="mt-5 text-2xl font-semibold tracking-tight md:text-3xl">Yaqin joydan. Qulay kelishuv bilan.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-blue-100">Hozircha DTPI va Denovdagi yaqin hududlarga xizmat qilamiz. Mahsulotni topshirish joyi va vaqti sotuvchi bilan kelishiladi.</p></div><Button asChild variant="outline" className="relative z-10 h-12 rounded-2xl border-white/25 bg-white/10 px-5 text-white hover:bg-white hover:text-blue-900"><Link to="/info/delivery">Qanday qabul qilaman? <ArrowUpRight size={17} /></Link></Button></div></Reveal></section>
    <section className="container pt-5"><Reveal><div className="flex flex-col justify-between gap-6 rounded-3xl border border-blue-100 bg-white p-7 md:flex-row md:items-center md:p-10"><div className="flex items-start gap-4"><span className="hidden rounded-2xl bg-blue-50 p-4 text-primary sm:inline-flex"><Store size={28} strokeWidth={1.5} /></span><div><p className="text-[10px] font-semibold tracking-[.16em] text-primary">O‘Z G‘OYANGIZ BORMI?</p><h2 className="mt-3 text-2xl font-semibold">Ijodingizga imkoniyat bering.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Mahsulotingizni yoningizdagi hamjamiyatga tanishtiring. Birinchi qadamni birga qo‘yamiz.</p></div></div><Button asChild size="lg" className="motion-button h-12 shrink-0 rounded-2xl px-6"><Link to="/sell">Sotuvchi bo‘lish <ArrowRight size={17} /></Link></Button></div></Reveal></section>
  </div></Layout>;
}
function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold tracking-[.18em] text-primary">{eyebrow}</p><h2 className="campus-title mt-2 text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">{title}</h2></div><Link to="/catalog" className="flex shrink-0 items-center gap-1 rounded-lg py-2 text-xs font-medium text-primary sm:text-sm">Barchasi <ArrowRight size={16} /></Link></div>;
}
