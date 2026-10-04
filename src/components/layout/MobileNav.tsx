import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const { pathname } = useLocation();
  const { count } = useCart();
  const { user } = useAuth();
  const items = [
    { to: "/", label: "Bosh sahifa", icon: Home },
    { to: "/catalog", label: "Katalog", icon: LayoutGrid },
    { to: "/account/favorites", label: "Sevimlilar", icon: Heart },
    { to: "/cart", label: "Savatcha", icon: ShoppingBag },
    { to: user ? "/account" : "/auth", label: "Profil", icon: User },
  ];
  return <nav aria-label="Mobil navigatsiya" className="mobile-dock fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-blue-100 bg-white/95 px-2 pt-2 shadow-[0_-4px_24px_rgba(16,44,115,0.06)] backdrop-blur-xl md:hidden">
    {items.map(({ to, label, icon: Icon }) => {
      const active = to === "/" ? pathname === "/" : to === "/account" ? pathname === "/account" || (pathname.startsWith("/account/") && pathname !== "/account/favorites") : pathname === to || (to === "/catalog" && pathname.startsWith("/product/"));
      return <Link key={to} to={to} aria-label={`Mobil ${label.toLowerCase()}`} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium ${active ? "bg-blue-50 text-primary" : "text-muted-foreground"}`}><span className="relative"><Icon size={20} strokeWidth={active ? 2.2 : 1.7} />{to === "/cart" && count > 0 && <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-white">{count}</span>}</span>{label}</Link>;
    })}
  </nav>;
}
