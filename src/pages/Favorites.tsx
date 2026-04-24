import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/db";
import ProductCard from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const { user } = useAuth();
  const { ids } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Tanlanganlar — DTPI Market";
  }, []);

  useEffect(() => {
    if (!user) return;
    const arr = Array.from(ids);
    if (arr.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .in("id", arr)
      .then(({ data }) => {
        if (data) setProducts(data as Product[]);
        setLoading(false);
      });
  }, [user, ids]);

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex items-center gap-3">
          <Heart className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-semibold md:text-4xl">Tanlanganlar</h1>
        </div>
        <p className="mt-2 text-muted-foreground">Sevimli mahsulotlaringiz to'plami</p>

        {loading ? (
          <p className="mt-12 text-center text-muted-foreground">Yuklanmoqda...</p>
        ) : products.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-semibold">Hali tanlanganlar yo'q</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Yoqgan mahsulotlarga yurakcha bosing — bu yerda yig'iladi.
            </p>
            <Button asChild variant="hero" className="mt-6">
              <Link to="/catalog">Katalogga o'tish</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
