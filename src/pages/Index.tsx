import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Heart, Shield } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types/db";
import logoImg from "@/assets/logo.png";
import heroImg from "@/assets/hero-handmade.jpg";

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    document.title = "DTPI Market — Talabalardan qo'l mehnati mahsulotlari";
    (async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from("categories").select("*").order("display_order"),
        supabase.from("products").select("*").eq("is_featured", true).eq("is_active", true).limit(8),
      ]);
      if (cats) setCategories(cats as Category[]);
      if (prods) setFeatured(prods as Product[]);
    })();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <div className="container relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20 lg:py-24">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-4 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              DTPI talabalari tomonidan yaratilgan
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              Qo'l mehnati.<br />
              <span className="italic text-primary">Yurakdan</span> bevosita.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Universitet talabalarining noyob qo'lda yasalgan mahsulotlari — sharflar, sopol idishlar, ziynat buyumlari va ko'plab boshqalar.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-primary" />100+ talaba sotuvchi</span>
              <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Markaziy ombor & yetkazib berish</span>
            </div>
          </div>
          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-3xl" aria-hidden />
            <img
              src={heroImg}
              alt="Qo'lda yasalgan mahsulotlar — sharf, krujka, daftar"
              width={1600}
              height={1024}
              className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-card"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Toifalar</p>
            <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Nimani izlayapsiz?</h2>
          </div>
          <Link to="/catalog" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
            Barchasi →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/catalog?cat=${cat.slug}`}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-card hover:border-primary/40"
            >
              <span className="text-3xl transition-transform group-hover:scale-110">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container py-10 md:py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Tanlangan</p>
            <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Mahorat bilan yaratilgan</h2>
          </div>
          <Link to="/catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Barcha mahsulotlar →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16 md:py-24">
        <div className="rounded-3xl bg-foreground p-8 text-background shadow-card md:p-14">
          <p className="text-xs font-medium uppercase tracking-widest text-primary-glow">Qanday ishlaydi</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold md:text-4xl">
            Talaba sotuvchilari uchun oddiy yo'l
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Mahsulotni topshiring", d: "DTPI talabalari o'z qo'l mehnati mahsulotlarini omborimizga keltiradi." },
              { n: "02", t: "Biz e'lon qilamiz", d: "Jamoamiz suratga oladi, tavsif yozadi va platformaga joylaydi." },
              { n: "03", t: "Daromad oling", d: "Buyurtma kelganda biz yuboramiz. Siz daromadni hisobingizdan yechib olasiz." },
            ].map(s => (
              <div key={s.n} className="border-t border-background/20 pt-6">
                <span className="font-display text-3xl text-primary-glow">{s.n}</span>
                <h3 className="mt-3 font-display text-xl font-medium">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
