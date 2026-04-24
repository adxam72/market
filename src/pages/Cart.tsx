import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatSom } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, total, count, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-6 font-display text-3xl font-semibold">Savat bo'sh</h1>
          <p className="mt-2 text-muted-foreground">Mahsulotlarni qidirib, savatga qo'shing.</p>
          <Button variant="hero" size="lg" className="mt-6" asChild><Link to="/catalog">Katalogga o'tish</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Savatim ({count})</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            {items.map(it => (
              <div key={it.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <Link to={`/product/${it.product?.slug}`} className="shrink-0">
                  <img src={it.product?.images[0]} alt={it.product?.name} loading="lazy"
                       className="h-24 w-24 rounded-xl object-cover bg-secondary/40" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link to={`/product/${it.product?.slug}`} className="font-display text-base font-medium hover:text-primary">
                    {it.product?.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{formatSom(it.product?.price ?? 0)}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-input p-1">
                      <button onClick={() => updateQty(it.id, it.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondary">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{it.quantity}</span>
                      <button onClick={() => updateQty(it.id, it.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-secondary">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(it.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-semibold">{formatSom((it.product?.price ?? 0) * it.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-semibold">Buyurtma yakuni</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Mahsulotlar</span><span>{formatSom(total)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Yetkazib berish</span><span className="text-success">Bepul</span></div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>Jami</span>
                <span className="font-display text-xl">{formatSom(total)}</span>
              </div>
            </div>
            <Button variant="hero" size="lg" className="mt-6 w-full" asChild>
              <Link to="/checkout">Rasmiylashtirish</Link>
            </Button>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
