import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types/db";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { errorMessage, filterProducts } from "@/lib/marketplace";

const input = "h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";
export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const load = async () => {
    setLoading(true); setError("");
    const cats = await supabase.from("categories").select("*").order("display_order");
    if (cats.error) { setError(errorMessage(cats.error)); setLoading(false); return; }
    setCategories(cats.data ?? []);
    // Fetch every page rather than silently truncating at Supabase's 1000-row default.
    const all: Product[] = [];
    for (let offset = 0; ; offset += 500) {
      const result = await supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }).order("id").range(offset, offset + 499);
      if (result.error) { setError(errorMessage(result.error)); break; }
      all.push(...(result.data ?? []));
      if ((result.data?.length ?? 0) < 500) break;
    }
    setProducts(all); setLoading(false);
  };
  useEffect(() => { document.title = "Mahsulotlar — DTPI Market"; void load(); }, []);
  useEffect(() => { setQ(params.get("q") ?? ""); setPage(1); }, [params]);
  const results = useMemo(() => filterProducts(products, categories, params), [products, categories, params]);
  const setFilter = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next); };
  return <Layout>
    <section className="container pb-6 pt-7 md:pt-10"><div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 md:p-8"><p className="text-[10px] font-semibold tracking-[.18em] text-primary">SIZNING YANGI TOPILMANGIZ</p><h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">O‘zingizga mosini toping.</h1><p className="mt-3 text-sm text-muted-foreground">Mahalliy ijodkorlardan saralangan mahsulotlar.</p><form onSubmit={e => { e.preventDefault(); setFilter("q", q.trim()); }} className="mt-6 flex max-w-xl gap-2"><input type="search" aria-label="Mahsulot, kategoriya yoki sotuvchi qidirish" value={q} onChange={e => setQ(e.target.value)} placeholder="Mahsulot, kategoriya yoki sotuvchi..." className={input} /><Button aria-label="Qidirish" className="h-11 rounded-xl" type="submit"><Search size={18} /></Button></form></div></section>
    <section className="container pb-12">
      <div aria-label="Mahsulot kategoriyalari" className="mb-6 flex gap-2 overflow-x-auto pb-2 md:flex-wrap"><button aria-pressed={!params.get("cat")} onClick={() => setFilter("cat", "")} className={`min-h-11 shrink-0 rounded-xl border px-4 text-xs font-medium ${!params.get("cat") ? "border-primary bg-primary text-white" : "bg-white"}`}>Barchasi</button>{categories.map(cat => <button key={cat.id} aria-pressed={params.get("cat") === cat.slug} onClick={() => setFilter("cat", cat.slug)} className={`min-h-11 shrink-0 rounded-xl border px-4 text-xs font-medium transition ${params.get("cat") === cat.slug ? "border-primary bg-primary text-white" : "bg-white hover:border-primary"}`}>{cat.icon} {cat.name}</button>)}</div>
      {Array.from(params).some(([key]) => key !== "sort") && <div className="mb-5 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-muted-foreground">Tanlangan filtrlar:</span>{Array.from(params).filter(([key]) => key !== "sort").map(([key, value]) => <button key={key} aria-label={`${key} filtrini olib tashlash`} onClick={() => setFilter(key, "")} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs text-primary">{key === "cat" ? categories.find(cat => cat.slug === value)?.name || value : key === "q" ? `Qidiruv: ${value}` : key === "min" ? `Narx: ${value} dan` : key === "max" ? `Narx: ${value} gacha` : key === "stock" ? "Omborda mavjud" : key === "sale" ? "Chegirmali" : key === "featured" ? "Saralangan" : `Reyting: ${value}+`}<X size={13} /></button>)}</div>}
      <div className="grid items-start gap-7 lg:grid-cols-[220px_1fr]">
        <Button className="h-11 rounded-xl lg:hidden" variant="outline" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> {filtersOpen ? "Filtrlarni yopish" : "Filtrlar"}</Button>
        <aside id="catalog-filters" className={`${filtersOpen ? "block" : "hidden"} rounded-2xl border bg-white p-5 lg:sticky lg:top-44 lg:block`}><div className="flex justify-between"><h2 className="text-sm font-semibold">Filtrlar</h2><button aria-label="Filtrlarni tozalash" className="rounded-lg p-2 text-muted-foreground hover:bg-blue-50" onClick={() => setParams({})}><X size={16} /></button></div>
          <label className="mt-6 block text-xs font-medium">Minimal narx (so‘m)<input type="number" min="0" value={params.get("min") ?? ""} onChange={e => setFilter("min", e.target.value)} className={`${input} mt-2`} placeholder="0" /></label>
          <label className="mt-4 block text-xs font-medium">Maksimal narx (so‘m)<input type="number" min="0" value={params.get("max") ?? ""} onChange={e => setFilter("max", e.target.value)} className={`${input} mt-2`} placeholder="Cheklanmagan" /></label>
          <label className="mt-5 block text-xs font-medium">Minimal reyting<select value={params.get("rating") ?? ""} onChange={e => setFilter("rating", e.target.value)} className={`${input} mt-2`}><option value="">Barchasi</option><option value="5">5 yulduz</option><option value="4">4+ yulduz</option><option value="3">3+ yulduz</option></select></label>
          <label className="mt-5 flex items-center gap-2 text-xs"><input type="checkbox" checked={params.get("stock") === "1"} onChange={e => setFilter("stock", e.target.checked ? "1" : "")} /> Omborda mavjud</label>
          <label className="mt-4 flex items-center gap-2 text-xs"><input type="checkbox" checked={params.get("sale") === "1"} onChange={e => setFilter("sale", e.target.checked ? "1" : "")} /> Chegirmali mahsulotlar</label>
          <button onClick={() => setParams({})} className="mt-6 text-xs text-primary underline">Barcha filtrlarni tozalash</button>
        </aside>
        <div className="min-w-0"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{loading ? "Yuklanmoqda..." : `${results.length} ta mahsulot`}</p><select aria-label="Saralash" value={params.get("sort") ?? "newest"} onChange={e => setFilter("sort", e.target.value)} className="h-10 max-w-full rounded-lg border bg-white px-3 text-xs"><option value="newest">Eng yangi</option><option value="price-asc">Arzonidan qimmatiga</option><option value="price-desc">Qimmatidan arzoniga</option><option value="rating">Eng yuqori baholangan</option></select></div>
          {error ? <div role="alert" className="rounded-xl border p-6">{error}<Button onClick={load} variant="outline" className="ml-3">Qayta urinish</Button></div> : loading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-secondary" />)}</div> : results.length === 0 ? <div className="rounded-2xl border bg-white py-16 text-center"><Search className="mx-auto text-muted-foreground" size={32} /><h2 className="mt-4 text-xl font-semibold">Hech narsa topilmadi</h2><p className="mt-2 text-sm text-muted-foreground">Boshqa so‘z bilan qidiring yoki filtrlarni tozalang.</p><Button className="mt-5" variant="outline" onClick={() => setParams({})}>Filtrlarni tozalash</Button></div> : <><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{results.slice((page - 1) * 12, page * 12).map(p => <ProductCard key={p.id} product={p} />)}</div>{results.length > 12 && <div className="mt-7 flex justify-center gap-4"><Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="self-center text-sm">{page} / {Math.ceil(results.length / 12)}</span><Button variant="outline" disabled={page * 12 >= results.length} onClick={() => setPage(page + 1)}>Keyingi</Button></div>}</>}
        </div>
      </div>
    </section>
  </Layout>;
}
