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
    <Link
      to={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-card hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/40">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {discount > 0 && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground border-0 shadow-warm">
            -{discount}%
          </Badge>
        )}
        <button
          type="button"
          onClick={onFav}
          aria-label={fav ? "Tanlanganlardan olib tashlash" : "Tanlanganlarga qo'shish"}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
            "bg-background/80 hover:bg-background shadow-soft",
            fav && "bg-primary text-primary-foreground hover:bg-primary"
          )}
        >
          <Heart className={cn("h-4 w-4 transition", fav && "fill-current")} />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <span className="rounded-full bg-foreground/90 px-4 py-1.5 text-xs font-medium text-background">Tugagan</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {(product.seller_name || product.seller?.full_name) && <p className="truncate text-[11px] text-muted-foreground">{product.seller_name || product.seller?.full_name}</p>}
        <h3 className="font-display text-sm font-semibold leading-snug line-clamp-2">
          {product.name}
        </h3>
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-medium text-foreground">{Number(product.rating_avg).toFixed(1)}</span>
            <span>({product.rating_count})</span>
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-1">
          <span className="font-display text-sm font-semibold text-foreground sm:text-base">
            {formatSom(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatSom(product.compare_at_price)}
            </span>
          )}
        </div>
        <button type="button" disabled={adding || product.stock === 0} onClick={async e => {
          e.preventDefault(); e.stopPropagation(); setAdding(true);
          try { await addToCart(product); } finally { setAdding(false); }
        }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-2 py-2.5 text-[11px] font-medium text-primary transition hover:bg-primary hover:text-white disabled:opacity-50">
          <ShoppingBag size={14} />{product.stock === 0 ? "Tugagan" : adding ? "Qo‘shilmoqda..." : "Savatchaga qo‘shish"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
