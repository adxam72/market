import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Truck, ShieldCheck, HeartHandshake, Sparkles, ShoppingBag, Store } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types/db";
import heroImg from "@/assets/hero-handmade.jpg";
import { errorMessage } from "@/lib/marketplace";

const categoryColors = ["bg-blue-50", "bg-violet-50", "bg-amber-50", "bg-sky-50"];
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
    <section className="container pt-5 md:pt-8">
      <div className="hero-market hero-blue relative grid overflow-hidden rounded-3xl text-white lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 px-6 py-9 sm:p-12 lg:p-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-medium text-blue-100"><Sparkles size={14} /> Mahalliy ijod. Yangi imkoniyat.</span>
          <h1 className="mt-6 max-w-xl text-[2.5rem] font-semibold leading-[1.1] tracking-[-.045em] sm:text-5xl lg:text-[3.65rem]">Har bir buyumda<br /><span className="text-blue-200">bir hikoya bor.</span></h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-blue-100 sm:text-base">O‘ziga xos buyumlar, yangi g‘oyalar va mahalliy ijodkorlar. O‘zingizga yoqqanini DTPI Marketdan toping.</p>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8"><Button asChild size="lg" className="h-11 rounded-xl bg-white px-4 text-xs text-blue-900 shadow-lg hover:bg-blue-50 sm:h-12 sm:px-6 sm:text-sm"><Link to="/catalog">Xarid qilish <ArrowUpRight size={18} /></Link></Button><Button asChild variant="outline" size="lg" className="h-11 rounded-xl border-white/30 bg-transparent px-4 text-xs text-white hover:bg-white/10 hover:text-white sm:h-12 sm:px-6 sm:text-sm"><a href="#kategoriyalar">Kategoriyalar</a></Button></div>
          <div className="mt-8 flex items-center gap-3 text-xs text-blue-100"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><HeartHandshake size={19} /></span>Har bir xarid — mahalliy ijodkorga qo‘llab-quvvatlov.</div>
        </div>
        <div className="relative mx-5 mb-5 min-h-[245px] overflow-hidden rounded-2xl sm:min-h-[320px] lg:my-6 lg:ml-0 lg:mr-6">
          <img src={heroImg} width={1920} height={1080} fetchPriority="high" alt="Talabalar yaratgan sopol idishlar, to‘qilgan sharf va daftar" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-2 text-[11px] font-semibold text-blue-900">DTPI ijodkorlari to‘plami</span>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-medium uppercase tracking-[.18em] text-white/80">KICHIK DETALLAR. KATTA ILHOM.</p><p className="mt-2 max-w-xs text-xl font-semibold leading-tight sm:text-2xl">Har kuningizga<br />o‘zgacha bir buyum.</p></div><Link to="/catalog" aria-label="Saralangan mahsulotlarni ko‘rish" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-900 transition hover:bg-blue-100"><ArrowUpRight size={21} /></Link></div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[{ icon: Truck, title: "Qulay yetkazib berish", desc: "Shartlar buyurtmada ko‘rsatiladi" }, { icon: ShieldCheck, title: "Buyurtma nazorati", desc: "Xarid holatini hisobingizda kuzating" }, { icon: HeartHandshake, title: "Mahalliy ijodkorlar", desc: "Talabalar va sotuvchilar mahsulotlari" }].map(({ icon: Icon, title, desc }) => <div key={title} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white px-4 py-4 md:px-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary"><Icon size={21} strokeWidth={1.7} /></span><div><p className="text-[13px] font-semibold">{title}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{desc}</p></div></div>)}
      </div>
    </section>
    <section id="kategoriyalar" className="container scroll-mt-44 py-10 md:py-12">
      <SectionTitle eyebrow="NIMANI IZLAYAPSIZ?" title="Kategoriyalarni kashf eting" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {loading ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary" />) : categories.slice(0, 4).map((cat, i) => <Link key={cat.id} to={`/catalog?cat=${cat.slug}`} className="group flex min-h-28 items-center gap-3 overflow-hidden rounded-2xl border bg-white p-3 transition hover:border-primary/40 hover:shadow-soft md:gap-4"><span aria-hidden="true" className={`flex h-16 w-12 shrink-0 items-center justify-center rounded-xl text-3xl sm:w-16 ${categoryColors[i]}`}>{cat.icon || <ShoppingBag size={26} className="text-primary" />}</span><div className="min-w-0"><h3 className="text-xs font-semibold leading-5 sm:text-sm">{cat.name}</h3><span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">Ko‘rish <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span></div></Link>)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{categories.slice(4).map(cat => <Link key={cat.id} to={`/catalog?cat=${cat.slug}`} className="rounded-full border bg-white px-4 py-2.5 text-xs font-medium transition hover:border-primary hover:text-primary">{cat.icon} {cat.name}</Link>)}</div>
      {error && <div role="alert" className="mt-6 rounded-xl border p-5 text-sm">{error} <button onClick={load} className="ml-2 text-primary underline">Qayta urinish</button></div>}
    </section>
    <section className="container pb-12 md:pb-16">
      <SectionTitle eyebrow="YANGI TOPILMALAR" title="Sizga yoqishi mumkin" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">{loading ? Array.from({ length: 4 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-secondary" />) : featured.map(p => <ProductCard key={p.id} product={p} />)}</div>
      {!loading && !error && featured.length === 0 && <p className="py-12 text-center text-muted-foreground">Yangi mahsulotlar tez orada joylashtiriladi.</p>}
      {featured.length > 0 && <div className="mt-7 text-center"><Button asChild variant="outline" className="h-11 rounded-xl bg-white px-6"><Link to="/catalog"><ShoppingBag size={16} /> Barcha mahsulotlarni ko‘rish <ArrowRight size={16} /></Link></Button></div>}
    </section>
    <section className="container"><div className="relative grid gap-6 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-12"><div><span className="mb-4 inline-flex rounded-xl bg-white p-3 text-primary shadow-soft"><Store size={24} /></span><p className="text-[10px] font-semibold tracking-[.18em] text-primary">G‘OYANGIZGA YANGI IMKONIYAT</p><h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Siz yarating. Biz birga o‘samiz.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Qo‘l mehnatingiz yoki o‘z mahsulotingiz bormi? DTPI Marketda do‘kon oching va xaridorlaringizni toping.</p></div><Button asChild size="lg" className="h-12 rounded-xl px-6 shadow-soft"><Link to="/sell">Sotuvchi bo‘lish <ArrowRight size={17} /></Link></Button></div></section>
  </Layout>;
}
function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold tracking-[.18em] text-primary">{eyebrow}</p><h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">{title}</h2></div><Link to="/catalog" className="flex shrink-0 items-center gap-1 rounded-lg py-2 text-xs font-medium text-primary sm:text-sm">Barchasi <ArrowRight size={16} /></Link></div>;
}
