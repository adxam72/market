import { Link, NavLink, Navigate } from "react-router-dom";
import { Store, LayoutDashboard, Package, ShoppingBag, Settings } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
const links = [{ to: "/seller", label: "Boshqaruv paneli", icon: LayoutDashboard }, { to: "/seller/products", label: "Mahsulotlar", icon: Package }, { to: "/seller/orders", label: "Buyurtmalar", icon: ShoppingBag }, { to: "/seller/settings", label: "Do‘kon ma’lumotlari", icon: Settings }];
export default function SellerLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { user } = useAuth();
  const { isSeller, loading } = useRole();
  if (loading) return <Layout><p className="container py-20">Yuklanmoqda...</p></Layout>;
  if (!user) return <Navigate to="/auth?next=/seller" replace />;
  if (!isSeller) return <Layout><div className="container py-16 text-center"><Store className="mx-auto text-primary" size={38} /><h1 className="mt-4 text-2xl font-semibold">Sotuvchi paneli</h1><p className="mt-3 text-muted-foreground">Panelga kirish uchun sotuvchi arizangiz tasdiqlangan bo‘lishi kerak.</p><Button asChild className="mt-6"><Link to="/sell">Ariza yuborish / Holatini ko‘rish</Link></Button></div></Layout>;
  return <Layout><div className="container grid items-start gap-7 py-8 lg:grid-cols-[220px_1fr]"><aside className="rounded-2xl border bg-white p-4"><div className="mb-4 flex items-center gap-2 px-2 py-2 text-sm font-semibold text-primary"><Store size={18} /> Sotuvchi paneli</div><nav className="flex flex-wrap gap-1 lg:flex-col">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} end to={to} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-3 text-xs font-medium ${isActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"}`}><Icon size={16} />{label}</NavLink>)}</nav></aside><main className="min-w-0"><h1 className="mb-6 text-2xl font-semibold">{title}</h1>{children}</main></div></Layout>;
}
