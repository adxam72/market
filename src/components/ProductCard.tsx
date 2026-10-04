import { Link } from "react-router-dom";
import { Star, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import type { Product } from "@/types/db";
import { formatSom } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/context/FavoritesContext";
import { cn } from "@/lib/utils";

const ProductCard = ({ product }: { product: Product }) => {
  const { isFavorite, toggle } = useFavorites();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const fav = isFavorite(product.id);

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id, product.name);
  };

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition duration-300 hover:border-primary/25 hover:shadow-card"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        <Link to={`/product/${product.slug}`} className="block h-full" tabIndex={-1} aria-hidden="true"><img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={e => { if (!e.currentTarget.src.endsWith('/placeholder.svg')) e.currentTarget.src = '/placeholder.svg'; }}
        /></Link>
        {discount > 0 && (
          <Badge className="pointer-events-none absolute left-2 top-2 border-0 bg-primary px-2.5 py-1 text-primary-foreground sm:left-3 sm:top-3">
            -{discount}%
          </Badge>
        )}
        <button
          type="button"
          onClick={onFav}
          aria-label={fav ? "Tanlanganlardan olib tashlash" : "Tanlanganlarga qo'shish"}
          aria-pressed={fav}
          className={cn(
            "absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition sm:right-3 sm:top-3",
            "bg-background/80 hover:bg-background shadow-soft",
            fav && "bg-primary text-primary-foreground hover:bg-primary"
          )}
        >
          <Heart className={cn("h-4 w-4 transition", fav && "fill-current")} />
        </button>
        {product.stock === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-full bg-foreground/90 px-4 py-1.5 text-xs font-medium text-background">Tugagan</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {(product.seller_name || product.seller?.full_name) && <p className="truncate text-[11px] text-muted-foreground">{product.seller_name || product.seller?.full_name}</p>}
        <h3 className="font-display text-sm font-semibold leading-snug line-clamp-2">
          <Link to={`/product/${product.slug}`} className="transition hover:text-primary">{product.name}</Link>
        </h3>
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span className="font-medium text-foreground">{Number(product.rating_avg).toFixed(1)}</span>
            <span>({product.rating_count})</span>
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-1">
          <span className="font-display text-sm font-semibold text-foreground sm:text-base">
            {formatSom(product.price)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {formatSom(product.compare_at_price)}
            </span>
          )}
        </div>
        <button type="button" disabled={adding || product.stock === 0} onClick={async e => {
          e.preventDefault(); e.stopPropagation(); setAdding(true);
          try { await addToCart(product); } finally { setAdding(false); }
        }} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-2 py-2.5 text-[11px] font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
          <ShoppingBag size={14} />{product.stock === 0 ? "Tugagan" : adding ? "Qo‘shilmoqda..." : "Savatchaga qo‘shish"}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
