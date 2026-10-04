import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, LogOut, Package, Heart, Shield, Store, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useRole } from "@/hooks/useRole";
import { useState } from "react";
import Brand from "@/components/Brand";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [{ to: "/", label: "Bosh sahifa" }, { to: "/catalog", label: "Mahsulotlar" }, { to: "/catalog?sort=newest", label: "Yangi mahsulotlar" }, { to: "/catalog?featured=1", label: "Saralanganlar" }, { to: "/catalog?sale=1", label: "Chegirmalar" }];
export default function Header() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const { isAdmin, isSeller } = useRole();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const onSearch = (e: React.FormEvent) => { e.preventDefault(); navigate(`/catalog${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); };
  return <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl">
    <div className="bg-primary text-white"><div className="container flex items-center justify-between gap-3 py-2 text-[11px]"><span>Kerakli mahsulotlar — bir joyda.</span><Link to="/sell" className="flex items-center gap-1.5"><Store size={13} /> Sotuvchi bo‘lish</Link></div></div>
    <div className="container flex h-20 items-center gap-3 sm:gap-7">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetTrigger asChild><Button aria-label="Menyuni ochish" variant="ghost" size="icon" className="md:hidden"><Menu size={21} /></Button></SheetTrigger><SheetContent side="left" className="w-72"><nav className="mt-10 flex flex-col gap-2">{navLinks.map(l => <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 hover:bg-secondary">{l.label}</Link>)}<Link to="/sell" onClick={() => setMenuOpen(false)} className="px-3 py-3 text-primary">Sotuvchi bo‘lish</Link></nav></SheetContent></Sheet>
      <Brand />
      <form onSubmit={onSearch} className="relative hidden flex-1 md:block"><input aria-label="Mahsulotlarni qidirish" value={q} onChange={e => setQ(e.target.value)} placeholder="Mahsulot, kategoriya yoki sotuvchi qidiring..." className="h-11 w-full rounded-xl border bg-secondary/40 pl-4 pr-12 text-sm outline-none focus:border-primary" /><button aria-label="Qidirish" className="absolute right-1 top-1 rounded-lg bg-primary p-2.5 text-white"><Search size={16} /></button></form>
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
        <Link to="/account/favorites" aria-label="Sevimlilar" className="relative rounded-xl p-2.5 hover:bg-secondary"><Heart size={21} />{favCount > 0 && <Counter value={favCount} />}</Link>
        <Link to="/cart" aria-label="Savatcha" className="relative rounded-xl p-2.5 hover:bg-secondary"><ShoppingBag size={21} />{count > 0 && <Counter value={count} />}</Link>
        {user ? <DropdownMenu><DropdownMenuTrigger asChild><Button aria-label="Profil menyusi" variant="ghost" size="icon"><User size={21} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem asChild><Link to="/account"><User className="mr-2 h-4 w-4" />Profil</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/account/orders"><Package className="mr-2 h-4 w-4" />Buyurtmalarim</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/account/favorites"><Heart className="mr-2 h-4 w-4" />Sevimlilar</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/support"><MessageSquare className="mr-2 h-4 w-4" />Yordam</Link></DropdownMenuItem>
          {isSeller && <DropdownMenuItem asChild><Link to="/seller"><Store className="mr-2 h-4 w-4" />Sotuvchi paneli</Link></DropdownMenuItem>}
          {isAdmin && <DropdownMenuItem asChild><Link to="/admin"><Shield className="mr-2 h-4 w-4" />Admin panel</Link></DropdownMenuItem>}
          <DropdownMenuSeparator /><DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Chiqish</DropdownMenuItem>
        </DropdownMenuContent></DropdownMenu> : <Link to="/auth" aria-label="Tizimga kirish" className="rounded-xl p-2.5 hover:bg-secondary"><User size={21} /></Link>}
      </div>
    </div>
    <div className="border-y border-border/70"><div className="container hidden h-11 items-center gap-7 text-xs md:flex">{navLinks.map(l => <NavLink key={l.to} end to={l.to} className="font-medium text-muted-foreground hover:text-primary">{l.label}</NavLink>)}<Link to="/about" className="ml-auto text-muted-foreground hover:text-primary">Biz haqimizda</Link></div><form onSubmit={onSearch} className="container flex gap-2 py-2 md:hidden"><input aria-label="Mahsulotlarni qidirish" value={q} onChange={e => setQ(e.target.value)} placeholder="Mahsulot qidiring..." className="h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm" /><Button aria-label="Qidirish" size="icon"><Search size={18} /></Button></form></div>
  </header>;
}
function Counter({ value }: { value: number }) { return <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{value}</span>; }
