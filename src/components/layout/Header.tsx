import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, LogOut, Package, Heart, Shield, Store, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useRole } from "@/hooks/useRole";
import { useState } from "react";
import Brand from "@/components/Brand";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const navLinks = [{ to: "/", label: "Bosh sahifa" }, { to: "/catalog", label: "Mahsulotlar" }, { to: "/catalog?sort=newest", label: "Yangi mahsulotlar" }, { to: "/catalog?featured=1", label: "Saralanganlar" }, { to: "/catalog?sale=1", label: "Chegirmalar" }];
export default function Header() {
  const { user, signOut } = useAuth();
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const { isAdmin, isSeller } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (to: string) => `${location.pathname}${location.search}` === to;
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const onSearch = (e: React.FormEvent) => { e.preventDefault(); navigate(`/catalog${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`); };
  return <header className="sticky top-0 z-40 border-b border-border/70 bg-white/95 shadow-soft backdrop-blur-xl">
    <div className="bg-[#102c73] text-white"><div className="container flex items-center justify-between gap-3 py-2 text-[10px] sm:text-[11px]"><span>Mahalliy ijodkorlarni birga qo‘llab-quvvatlaymiz.</span><Link to="/sell" className="hidden items-center gap-1.5 sm:flex"><Store size={13} /> Sotuvchi bo‘lish</Link></div></div>
    <div className="container flex h-[72px] items-center gap-2 sm:gap-7">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetTrigger asChild><Button aria-label="Menyuni ochish" variant="ghost" size="icon" className="shrink-0 md:hidden"><Menu size={21} /></Button></SheetTrigger><SheetContent side="left" className="w-72"><SheetTitle>DTPI Market</SheetTitle><SheetDescription>Mahsulotlar va hisobingizga tezkor o‘tish.</SheetDescription><nav className="mt-6 flex flex-col gap-2">{navLinks.map(l => <Link key={l.to} to={l.to} aria-current={isActive(l.to) ? "page" : undefined} onClick={() => setMenuOpen(false)} className={`rounded-xl px-3 py-3 ${isActive(l.to) ? "bg-blue-50 font-semibold text-primary" : "hover:bg-secondary"}`}>{l.label}</Link>)}<Link to="/sell" onClick={() => setMenuOpen(false)} className="px-3 py-3 text-primary">Sotuvchi bo‘lish</Link></nav></SheetContent></Sheet>
      <Brand />
      <form onSubmit={onSearch} className="relative hidden flex-1 md:block"><input type="search" aria-label="Mahsulotlarni qidirish" value={q} onChange={e => setQ(e.target.value)} placeholder="Siz izlagan mahsulot shu yerda..." className="h-12 w-full rounded-xl border border-blue-100 bg-blue-50/60 pl-4 pr-14 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /><button aria-label="Qidirish" className="absolute right-1 top-1 flex h-10 w-11 items-center justify-center rounded-lg bg-primary text-white"><Search size={18} /></button></form>
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
        <Link to="/account/favorites" aria-label="Sevimlilar" className="relative hidden rounded-xl p-2.5 hover:bg-secondary sm:block"><Heart size={21} />{favCount > 0 && <Counter value={favCount} />}</Link>
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
    <div className="border-t border-border/60"><nav aria-label="Asosiy navigatsiya" className="container hidden h-12 items-center gap-7 text-xs md:flex">{navLinks.map(l => <Link key={l.to} to={l.to} aria-current={isActive(l.to) ? "page" : undefined} className={`relative flex h-full items-center font-medium transition hover:text-primary ${isActive(l.to) ? "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary" : "text-muted-foreground"}`}>{l.label}</Link>)}<Link to="/about" className="ml-auto text-muted-foreground hover:text-primary">Biz haqimizda</Link></nav><form onSubmit={onSearch} className="container flex gap-2 pb-3 pt-2 md:hidden"><input type="search" aria-label="Mahsulotlarni qidirish" value={q} onChange={e => setQ(e.target.value)} placeholder="Mahsulot qidiring..." className="h-11 min-w-0 flex-1 rounded-xl border border-blue-100 bg-blue-50/60 px-3 text-sm" /><Button aria-label="Qidirish" className="h-11 w-11 rounded-xl" size="icon"><Search size={18} /></Button></form></div>
  </header>;
}
function Counter({ value }: { value: number }) { return <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{value}</span>; }
