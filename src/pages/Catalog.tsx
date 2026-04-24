import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Category, Product } from "@/types/db";
import { Search } from "lucide-react";

const Catalog = () => {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") ?? "");

  const cat = params.get("cat");
  const featured = params.get("featured") === "1";

  useEffect(() => {
    document.title = "Katalog — DTPI Market";
    supabase.from("categories").select("*").order("display_order").then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  useEffect(() => {
    if (categories.length === 0 && cat) return; // wait for categories to load if filtering by cat
    setLoading(true);
    let query = supabase.from("products").select("*").eq("is_active", true);
    if (featured) query = query.eq("is_featured", true);
    if (params.get("q")) query = query.ilike("name", `%${params.get("q")}%`);
    if (cat) {
      const c = categories.find(x => x.slug === cat);
      if (c) query = query.eq("category_id", c.id);
    }
    query.order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setProducts(data as Product[]);
      setLoading(false);
    });
  }, [params, cat, featured, categories]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const np = new URLSearchParams(params);
    if (q.trim()) np.set("q", q.trim()); else np.delete("q");
    setParams(np);
  };

  const setCat = (slug: string | null) => {
    const np = new URLSearchParams(params);
    if (slug) np.set("cat", slug); else np.delete("cat");
    setParams(np);
  };

  return (
    <Layout>
      <section className="bg-gradient-warm">
        <div className="container py-12 md:py-16">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">Katalog</h1>
          <p className="mt-2 text-muted-foreground">DTPI talabalarining barcha mahsulotlari</p>
          <form onSubmit={onSearch} className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mahsulot nomi..."
              className="h-12 w-full rounded-full border border-input bg-background pl-11 pr-4 text-sm outline-none focus:border-primary"
            />
          </form>
        </div>
      </section>

      <section className="container py-10">
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setCat(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !cat ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-secondary/70"
            }`}
          >Barchasi</button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                cat === c.slug ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-secondary/70"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary/40" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p>Mahsulot topilmadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Catalog;
