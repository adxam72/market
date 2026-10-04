import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Truck, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types/db";
import heroImg from "@/assets/hero-handmade.jpg";
import bowl from "@/assets/p-bowl.jpg";
import tote from "@/assets/p-tote.jpg";
import scarf from "@/assets/p-scarf.jpg";
import candle from "@/assets/p-candle.jpg";
import { errorMessage } from "@/lib/marketplace";

const categoryImages = [bowl, scarf, tote, candle];
export default function Index() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  useEffect(() => { document.title = "DTPI Market — Kerakli mahsulotlar, bir joyda"; void load(); }, []);
  return <Layout>
    <section className="container pt-6 md:pt-10">
      <div className="hero-market relative grid overflow-hidden rounded-[1.75rem] lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 p-7 sm:p-12 lg:p-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 px-3 py-1.5 text-xs font-medium text-primary"><Sparkles size={13} /> Mahalliy iste’dod. O‘ziga xos mahsulotlar.</span>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.6rem]">Har bir buyumda<br /><span className="text-primary">bir hikoya bor.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">O‘zingiz yoqtirgan mahsulotlarni kashf eting. DTPI talabalarining ijodi va mahalliy sotuvchilarning saralangan mahsulotlari — bir joyda.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="rounded-xl"><Link to="/catalog">Xarid qilish <ArrowUpRight size={17} /></Link></Button><Button asChild variant="outline" size="lg" className="rounded-xl bg-white/60"><a href="#kategoriyalar">Kategoriyalarni ko‘rish</a></Button></div>
          <div className="mt-9 flex items-center gap-3 border-t border-primary/15 pt-5 text-xs text-muted-foreground"><HeartHandshake className="text-primary" size={22} /><span>Har bir xaridingiz bilan<br /><b className="font-medium text-foreground">mahalliy ijodkorni qo‘llab-quvvatlang.</b></span></div>
        </div>
        <div className="relative min-h-[260px] lg:min-h-full"><img src={heroImg} alt="Talabalar yaratgan sopol idishlar, to‘qilgan sharf va daftar" className="h-full w-full object-cover" /><div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-card backdrop-blur"><div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Qo‘l mehnati to‘plami</p><p className="mt-1 text-sm font-semibold">Oddiy kunlar uchun noodatiy buyumlar</p></div><Link to="/catalog?featured=1" aria-label="Saralangan mahsulotlarni ko‘rish" className="rounded-full bg-primary p-3 text-white"><ArrowUpRight size={18} /></Link></div></div>
      </div>
      <div className="grid grid-cols-1 gap-5 border-b border-border py-7 sm:grid-cols-3">
        {[{ icon: Truck, title: "Qulay yetkazib berish", desc: "O‘zbekiston bo‘ylab buyurtma bering" }, { icon: ShieldCheck, title: "Ishonchli xarid", desc: "Buyurtma va holatlar bir hisobda" }, { icon: HeartHandshake, title: "Mahalliy sotuvchilar", desc: "Ijodkorlar bilan to‘g‘ridan-to‘g‘ri" }].map(({ icon: Icon, title, desc }) => <div key={title} className="flex items-center gap-3 sm:justify-center"><Icon size={24} className="text-primary" strokeWidth={1.5} /><div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{desc}</p></div></div>)}
      </div>
    </section>
    <section id="kategoriyalar" className="container scroll-mt-40 py-12 md:py-16">
      <SectionTitle eyebrow="SIZ UCHUN" title="Kategoriyalar bo‘yicha xarid qiling" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {categories.slice(0, 4).map((cat, i) => <Link key={cat.id} to={`/catalog?cat=${cat.slug}`} className="group relative h-44 overflow-hidden rounded-2xl md:h-56"><img src={categoryImages[i]} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" /><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white"><h3 className="text-sm font-semibold md:text-base">{cat.name}</h3><ArrowUpRight size={18} /></div></Link>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{categories.slice(4).map(cat => <Link key={cat.id} to={`/catalog?cat=${cat.slug}`} className="rounded-full border bg-white px-4 py-2 text-sm transition hover:border-primary hover:text-primary">{cat.icon} {cat.name}</Link>)}</div>
      {error && <div role="alert" className="mt-6 rounded-xl border p-5 text-sm">{error} <button onClick={load} className="ml-2 text-primary underline">Qayta urinish</button></div>}
    </section>
    <section className="container pb-14">
      <SectionTitle eyebrow="ILHOM BILAN TANLANGAN" title="Sizga yoqishi mumkin" />
      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">{loading ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-secondary" />) : featured.map(p => <ProductCard key={p.id} product={p} />)}</div>
      {!loading && !error && featured.length === 0 && <p className="py-12 text-center text-muted-foreground">Yangi mahsulotlar tez orada joylashtiriladi.</p>}
    </section>
    <section className="container"><div className="grid gap-6 rounded-3xl bg-primary p-8 text-white md:grid-cols-[1fr_auto] md:items-center md:p-12"><div><p className="text-xs tracking-widest text-white/65">G‘OYANGIZGA YANGI IMKONIYAT</p><h2 className="mt-3 text-3xl font-semibold">Iste’dodingizni daromadga aylantiring.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Do‘koningizni oching, mahsulotlaringizni joylang va xaridorlaringizni toping. Biz siz bilan birga o‘samiz.</p></div><Button asChild size="lg" className="bg-white text-primary hover:bg-white/90"><Link to="/sell">Sotuvchi bo‘lish <ArrowRight size={17} /></Link></Button></div></section>
  </Layout>;
}
function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold tracking-[.2em] text-primary">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2></div><Link to="/catalog" className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary sm:text-sm">Barchasi <ArrowRight size={16} /></Link></div>;
}
