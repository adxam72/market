import { ReactNode } from "react";
import { Navigate, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  UserCheck,
  Users,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

const nav = [
  { to: "/admin", label: "Boshqaruv paneli", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Buyurtmalar", icon: ShoppingBag },
  { to: "/admin/products", label: "Mahsulotlar", icon: Package },
  { to: "/admin/categories", label: "Kategoriyalar", icon: Tags },
  { to: "/admin/applications", label: "Sotuvchi arizalari", icon: UserCheck },
  { to: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { to: "/admin/support", label: "Shikoyatlar", icon: MessageSquare },
];

const AdminLayout = ({ title, children }: { title: string; children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading } = useRole();
  const location = useLocation();

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <img src={logoImg} alt="DTPI" className="h-8 w-8 rounded-full object-cover shadow-warm" />
          <div>
            <p className="font-display text-base font-semibold leading-none">DTPI Admin</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Boshqaruv markazi</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-warm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Saytga qaytish
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/85 px-5 backdrop-blur-xl md:px-8">
          <h1 className="font-display text-xl font-semibold md:text-2xl">{title}</h1>
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground md:hidden"
          >
            ← Sayt
          </Link>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-20 flex justify-around border-t border-border bg-card/95 backdrop-blur-xl md:hidden">
          {nav.slice(0, 5).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label.split(" ")[0]}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminLayout;
