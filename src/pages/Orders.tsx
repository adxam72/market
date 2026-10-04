import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { statusLabels, errorMessage } from "@/lib/marketplace";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatSom } from "@/lib/format";
import { Package } from "lucide-react";
import OrderTimeline from "@/components/OrderTimeline";

type Order = {
  id: string; order_number: string; status: string; total: number;
  payment_method: string; created_at: string; discount?: number; coupon_code?: string;
  order_items: { product_name: string; quantity: number; unit_price: number; fulfillment_status?: string }[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Kutilmoqda", confirmed: "Tasdiqlandi",
  shipped: "Yo'lda", delivered: "Yetkazildi", cancelled: "Bekor qilingan",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-secondary text-foreground",
  confirmed: "bg-accent text-accent-foreground",
  shipped: "bg-primary/15 text-primary",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Buyurtmalarim — DTPI Market";
    if (!user) return;
    supabase.from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(errorMessage(error));
        if (data) setOrders(data as Order[]);
        setLoading(false);
      });
  }, [user]);

  if (authLoading) return <Layout><p className="container py-20">Yuklanmoqda...</p></Layout>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container max-w-4xl py-10">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Buyurtmalarim</h1>

        {error ? <p role="alert" className="mt-8">{error}</p> : loading ? (
          <p className="mt-8 text-muted-foreground">Yuklanmoqda...</p>
        ) : orders.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Siz hali buyurtma bermagansiz.</p>
            <Button asChild className="mt-5"><Link to="/catalog">Xarid qilish</Link></Button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map(o => (
              <div key={o.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-semibold">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[o.status] ?? ""}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
                <div className="mt-6 border-t border-border pt-6">
                  <OrderTimeline status={o.status} />
                </div>

                <div className="mt-6 space-y-1.5 border-t border-border pt-4 text-sm">
                  {o.order_items.map((it, i) => (
                    <div key={i} className="flex justify-between text-muted-foreground">
                      <span>{it.product_name} × {it.quantity}{it.fulfillment_status && <small className="block text-primary">{statusLabels[it.fulfillment_status]}</small>}</span>
                      <span>{formatSom(it.unit_price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                {Number(o.discount) > 0 && <p className="mt-3 text-xs text-primary">Promo kod: {o.coupon_code} · Chegirma: {formatSom(Number(o.discount))}</p>}<div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">{o.payment_method === "cod" ? "Yetkazganda to'lov" : "Onlayn to'lov"}</span>
                  <span className="font-display text-lg font-semibold">{formatSom(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
