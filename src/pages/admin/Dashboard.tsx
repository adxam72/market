import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatSom } from "@/lib/format";
import {
  ShoppingBag,
  Package,
  Users,
  UserCheck,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { statusLabels } from "@/lib/marketplace";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Stats = {
  totalRevenue: number;
  ordersCount: number;
  pendingOrders: number;
  productsCount: number;
  usersCount: number;
  pendingApplications: number;
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Tables<"orders">[]>([]);
  const [chart, setChart] = useState<{ day: string; total: number }[]>([]);

  useEffect(() => {
    document.title = "Boshqaruv paneli — DTPI Admin";
    (async () => {
      const [orders, pending, products, users, apps, recentOrders] = await Promise.all([
        supabase.from("orders").select("total, status, created_at"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("seller_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      const all = orders.data ?? [];
      const revenue = all
        .filter(o => o.status === "delivered")
        .reduce((s, o) => s + Number(o.total), 0);

      setStats({
        totalRevenue: revenue,
        ordersCount: all.length,
        pendingOrders: pending.count ?? 0,
        productsCount: products.count ?? 0,
        usersCount: users.count ?? 0,
        pendingApplications: apps.count ?? 0,
      });
      setRecent(recentOrders.data ?? []);
      setChart(Array.from({ length: 7 }, (_, i) => {
        const date = new Date(); date.setDate(date.getDate() - 6 + i);
        return { day: date.toLocaleDateString("uz-UZ", { day: "numeric", month: "short" }), total: all.filter(o => o.status === "delivered" && new Date(o.created_at).toDateString() === date.toDateString()).reduce((sum, o) => sum + Number(o.total), 0) };
      }));
    })();
  }, []);

  return (
    <AdminLayout title="Boshqaruv paneli">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          label="Umumiy daromad"
          value={stats ? formatSom(stats.totalRevenue) : "—"}
          tone="primary"
        />
        <StatCard
          icon={ShoppingBag}
          label="Buyurtmalar (jami)"
          value={stats?.ordersCount ?? "—"}
          to="/admin/orders"
        />
        <StatCard
          icon={Clock}
          label="Yangi buyurtmalar"
          value={stats?.pendingOrders ?? "—"}
          tone="warning"
          to="/admin/orders"
        />
        <StatCard
          icon={Package}
          label="Mahsulotlar"
          value={stats?.productsCount ?? "—"}
          to="/admin/products"
        />
        <StatCard
          icon={Users}
          label="Foydalanuvchilar"
          value={stats?.usersCount ?? "—"}
          to="/admin/users"
        />
        <StatCard
          icon={UserCheck}
          label="Sotuvchi arizalari"
          value={stats?.pendingApplications ?? "—"}
          tone={stats && stats.pendingApplications > 0 ? "warning" : undefined}
          to="/admin/applications"
        />
      </div>

      <section className="mt-8 rounded-2xl border bg-white p-6"><h2 className="text-lg font-semibold">Savdo analitikasi</h2><p className="mt-1 text-xs text-muted-foreground">Oxirgi 7 kunda berilgan va yetkazilgan buyurtmalar</p><div className="mt-6 h-60"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" fontSize={10} /><YAxis width={50} fontSize={10} tickFormatter={v => `${Number(v) / 1000} ming`} /><Tooltip formatter={v => [formatSom(Number(v)), "Savdo"]} /><Area type="monotone" dataKey="total" stroke="#235844" fill="#e2eee7" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></section>
      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">So'nggi buyurtmalar</h2>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline">
            Hammasini ko'rish →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">Hozircha buyurtmalar yo'q.</p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {recent.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{o.shipping_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-semibold">{formatSom(Number(o.total))}</p>
                  <p className="text-xs text-muted-foreground">{statusLabels[o.status]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone,
  to,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  tone?: "primary" | "warning";
  to?: string;
}) => {
  const card = (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            tone === "primary"
              ? "bg-primary text-primary-foreground"
              : tone === "warning"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
};

export default Dashboard;
