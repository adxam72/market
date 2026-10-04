import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Package, ShoppingBag, TrendingUp, Star } from "lucide-react";
import SellerLayout from "@/components/seller/SellerLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";
import { formatSom } from "@/lib/format";
import { errorMessage, statusLabels } from "@/lib/marketplace";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/db";
import type { SellerOrder } from "./Orders";
export default function SellerDashboard() {
  const { user } = useAuth(); const { isSeller } = useRole();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { document.title = "Sotuvchi paneli — DTPI Market"; if (!isSeller || !user) return; (async () => {
    const [p, o] = await Promise.all([supabase.from("products").select("*").eq("seller_id", user.id), supabase.rpc("seller_orders")]);
    if (p.error || o.error) setError(errorMessage(p.error || o.error)); else { setProducts(p.data ?? []); setOrders(o.data as unknown as SellerOrder[]); } setLoading(false);
  })(); }, [isSeller, user]);
  const delivered = orders.filter(o => o.fulfillment_status === "delivered");
  const revenue = delivered.reduce((s, o) => s + Number(o.unit_price) * o.quantity, 0);
  const reviewCount = products.reduce((s, p) => s + p.rating_count, 0);
  const rating = reviewCount ? products.reduce((s, p) => s + p.rating_avg * p.rating_count, 0) / reviewCount : 0;
  const chart = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - 6 + i); const day = date.toLocaleDateString("en-CA");
    return { day: date.toLocaleDateString("uz-UZ", { day: "numeric", month: "short" }), total: delivered.filter(o => new Date(o.created_at).toLocaleDateString("en-CA") === day).reduce((s, o) => s + Number(o.unit_price) * o.quantity, 0) };
  });
  return <SellerLayout title="Boshqaruv paneli">{error ? <p role="alert">{error}</p> : loading ? <p>Yuklanmoqda...</p> : <>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Do‘koningizning bugungi holati va savdo natijalari.</p><Button asChild><Link to="/seller/products"><Plus size={16} /> Mahsulot qo‘shish</Link></Button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Yetkazilgan savdo", value: formatSom(revenue), icon: TrendingUp }, { label: "Buyurtmalar", value: new Set(orders.map(o => o.order_id)).size, icon: ShoppingBag }, { label: "Mahsulotlar", value: products.length, icon: Package }, { label: "O‘rtacha reyting", value: reviewCount ? rating.toFixed(1) : "Hali sharh yo‘q", icon: Star }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border bg-white p-5"><div className="flex justify-between text-xs text-muted-foreground">{label}<Icon size={17} className="text-primary" /></div><p className="mt-4 text-xl font-semibold">{value}</p></div>)}</div>
    <section className="mt-6 rounded-2xl border bg-white p-5"><h2 className="text-base font-semibold">Savdo dinamikasi</h2><p className="mt-1 text-xs text-muted-foreground">Oxirgi 7 kunda berilgan va yetkazilgan buyurtmalar</p><div className="mt-6 h-60"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" fontSize={10} /><YAxis fontSize={10} width={50} tickFormatter={v => `${Number(v) / 1000} ming`} /><Tooltip formatter={v => [formatSom(Number(v)), "Savdo"]} /><Area type="monotone" dataKey="total" stroke="#235844" fill="#e2eee7" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></section>
    <section className="mt-6 rounded-2xl border bg-white p-5"><div className="flex justify-between"><h2 className="text-base font-semibold">So‘nggi buyurtmalar</h2><Link className="text-xs text-primary" to="/seller/orders">Barchasini ko‘rish →</Link></div>{orders.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Hozircha buyurtmalar yo‘q.</p> : orders.slice(0, 5).map(o => <div key={o.id} className="mt-4 flex justify-between gap-3 border-t pt-4 text-xs"><div><p className="font-medium">{o.product_name}</p><p className="mt-1 text-muted-foreground">{o.order_number}</p></div><div className="text-right"><p>{formatSom(Number(o.unit_price) * o.quantity)}</p><p className="mt-1 text-primary">{statusLabels[o.fulfillment_status]}</p></div></div>)}</section>
  </>}</SellerLayout>;
}
