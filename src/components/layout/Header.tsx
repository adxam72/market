import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, LogOut, Package, Heart, Shield, Store, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useRole } from "@/hooks/useRole";
import { useState } from "react";
import logoImg from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/catalog?q=${encodeURIComponent(q.trim())}`);
  };

  const navLinks = [
    { to: "/catalog", label: "Katalog" },
    { to: "/sell", label: "Sotuvchi bo'lish" },
    { to: "/about", label: "Biz haqimizda" },
    { to: "/faq", label: "Yordam" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-4 md:gap-6">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="mt-8 flex flex-col gap-1">
              {navLinks.map(l => (
                <NavLink key={l.to} to={l.to} className="rounded-lg px-3 py-2.5 text-base hover:bg-accent">
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logoImg} alt="DTPI Market" className="h-9 w-9 rounded-full object-cover shadow-warm" />
          <span className="font-display text-xl font-semibold tracking-tight">
            DTPI <span className="text-primary">Market</span>
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={onSearch} className="relative hidden flex-1 max-w-xl md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Qo'l mehnati mahsulotlarini qidiring..."
            className="h-11 w-full rounded-full border border-input bg-secondary/40 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background"
          />
        </form>

        {/* Desktop nav */}
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          {user && (
            <Button variant="ghost" size="icon" asChild className="relative hidden sm:inline-flex">
              <Link to="/account/favorites" aria-label="Tanlanganlar">
                <Heart className="h-5 w-5" />
                {favCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-warm">
                    {favCount}
                  </span>
                )}
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart" aria-label="Savat">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-warm">
                  {count}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild><Link to="/account"><User className="mr-2 h-4 w-4" />Profil</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/account/orders"><Package className="mr-2 h-4 w-4" />Buyurtmalarim</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/account/favorites"><Heart className="mr-2 h-4 w-4" />Tanlanganlar</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/support"><MessageSquare className="mr-2 h-4 w-4" />Yordam / Shikoyat</Link></DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin panel</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Chiqish</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Kirish</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
