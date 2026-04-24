import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/db";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { formatSom } from "@/lib/format";
import { Star, Minus, Plus, ShoppingBag, Truck, Shield, Package, Heart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Review = { id: string; rating: number; comment: string | null; created_at: string; user_id: string };

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qty, setQty] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (data) {
        setProduct(data as Product);
        document.title = `${data.name} — DTPI Market`;
        const { data: rel } = await supabase
          .from("products").select("*").eq("category_id", data.category_id).neq("id", data.id).limit(4);
        if (rel) setRelated(rel as Product[]);
        const { data: rev } = await supabase
          .from("reviews").select("*").eq("product_id", data.id).order("created_at", { ascending: false });
        if (rev) setReviews(rev as Review[]);
      }
    })();
  }, [slug]);

  // Check if user can review (must have delivered order with this product)
  useEffect(() => {
    if (!user || !product) return;
    (async () => {
      // Check if already reviewed
      const { data: existingReview } = await supabase
        .from("reviews").select("id").eq("product_id", product.id).eq("user_id", user.id).maybeSingle();
      if (existingReview) { setAlreadyReviewed(true); return; }

      // Check if has delivered order with this product
      const { data: orders } = await supabase
        .from("orders").select("id, order_items(product_id)")
        .eq("user_id", user.id).eq("status", "delivered");
      if (orders) {
        const hasProduct = orders.some((o: any) =>
          o.order_items?.some((it: any) => it.product_id === product.id)
        );
        setCanReview(hasProduct);
      }
    })();
  }, [user, product]);

  const submitReview = async () => {
    if (!user || !product) return;
    if (!reviewComment.trim()) { toast.error("Sharh matnini yozing"); return; }
    setReviewSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: product.id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewComment.trim(),
    });
    if (error) { toast.error(error.message); setReviewSubmitting(false); return; }
    toast.success("Sharh qo'shildi!");
    setAlreadyReviewed(true);
    setCanReview(false);
    setReviewComment("");
    // Reload reviews
    const { data: rev } = await supabase
      .from("reviews").select("*").eq("product_id", product.id).order("created_at", { ascending: false });
    if (rev) setReviews(rev as Review[]);
    setReviewSubmitting(false);
  };

  if (!product) {
    return <Layout><div className="container py-20 text-center text-muted-foreground">Yuklanmoqda...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container py-8">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Bosh sahifa</Link> /{" "}
          <Link to="/catalog" className="hover:text-foreground">Katalog</Link> /{" "}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-3xl bg-secondary/40 shadow-card">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                width={800}
                height={800}
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">SKU: {product.sku}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl">{product.name}</h1>

            {product.rating_count > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating_avg) ? "fill-primary text-primary" : "text-muted"}`} />
                  ))}
                </div>
                <span className="font-medium">{Number(product.rating_avg).toFixed(1)}</span>
                <span className="text-muted-foreground">({product.rating_count} sharh)</span>
              </div>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl font-semibold">{formatSom(product.price)}</span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">{formatSom(product.compare_at_price)}</span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-full border border-input bg-background p-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                variant="hero"
                className="flex-1"
                disabled={product.stock === 0}
                onClick={() => addToCart(product, qty)}
              >
                <ShoppingBag className="h-4 w-4" />
                {product.stock === 0 ? "Tugagan" : "Savatga qo'shish"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                aria-label="Tanlanganlarga qo'shish"
                onClick={() => toggle(product.id, product.name)}
                className={cn(
                  "h-12 w-12 shrink-0 rounded-full p-0",
                  isFavorite(product.id) && "border-primary bg-primary/10 text-primary"
                )}
              >
                <Heart className={cn("h-5 w-5", isFavorite(product.id) && "fill-current")} />
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {product.stock > 0 ? `${product.stock} dona mavjud` : "Hozircha mavjud emas"}
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-center text-xs">
              <div className="flex flex-col items-center gap-2"><Truck className="h-5 w-5 text-primary" /><span>Tezkor yetkazish</span></div>
              <div className="flex flex-col items-center gap-2"><Package className="h-5 w-5 text-primary" /><span>Markaziy ombor</span></div>
              <div className="flex flex-col items-center gap-2"><Shield className="h-5 w-5 text-primary" /><span>Sifat kafolati</span></div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold">Sharhlar ({reviews.length})</h2>

          {/* Review form — only for users who received this product */}
          {user && canReview && !alreadyReviewed && (
            <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-6">
              <h3 className="font-display text-lg font-semibold">Sharh qoldiring</h3>
              <p className="mt-1 text-sm text-muted-foreground">Siz bu mahsulotni sotib olgan va qabul qilgansiz — fikringizni bildiring!</p>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(i + 1)}
                    className="p-0.5"
                  >
                    <Star className={cn(
                      "h-7 w-7 transition",
                      (hoverRating || reviewRating) > i
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40"
                    )} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium">{reviewRating}/5</span>
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Mahsulot haqida fikringiz..."
                className="mt-3 min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <Button
                onClick={submitReview}
                disabled={reviewSubmitting}
                className="mt-3"
              >
                {reviewSubmitting ? "Yuborilmoqda..." : "Sharh yuborish"}
              </Button>
            </div>
          )}
          {user && alreadyReviewed && (
            <p className="mt-4 text-sm text-success font-medium">✓ Siz sharh qoldirgansiz. Rahmat!</p>
          )}

          {reviews.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Hozircha sharhlar yo'q. Birinchi bo'lib sharh qoldiring!</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reviews.map(r => (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-primary text-primary" : "text-muted"}`} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-semibold">O'xshash mahsulotlar</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
