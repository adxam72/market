import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Brand from "@/components/Brand";
export default function Footer() {
  return <footer className="mt-20 border-t bg-white"><div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4"><div><Brand /><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">DTPI talabalari va mahalliy ijodkorlar uchun zamonaviy savdo maydoni. Kerakli mahsulotlar — bir joyda.</p></div>
    <FooterLinks title="Xarid qilish" links={[["Barcha mahsulotlar", "/catalog"], ["Yangi mahsulotlar", "/catalog?sort=newest"], ["Chegirmalar", "/catalog?sale=1"], ["Sevimlilar", "/account/favorites"]]} />
    <FooterLinks title="Yordam" links={[["Savol va javoblar", "/faq"], ["Yetkazib berish", "/info/delivery"], ["To‘lov", "/info/payment"], ["Qaytarish", "/info/returns"]]} />
    <FooterLinks title="DTPI bilan birga" links={[["Biz haqimizda", "/about"], ["Sotuvchi bo‘lish", "/sell"], ["Sotuvchi paneli", "/seller"], ["Murojaat yuborish", "/support"]]} />
  </div><div className="container flex flex-wrap justify-between gap-4 border-t py-5 text-xs text-muted-foreground"><span>© {new Date().getFullYear()} DTPI Market. Barcha huquqlar himoyalangan.</span><div className="flex gap-5"><Link to="/info/privacy">Maxfiylik siyosati</Link><Link to="/info/terms">Foydalanish shartlari</Link></div></div></footer>;
}
function FooterLinks({ title, links }: { title: string; links: string[][] }) { return <div><h3 className="text-sm font-semibold">{title}</h3><ul className="mt-5 space-y-3 text-sm text-muted-foreground">{links.map(([label, to]) => <li key={to}><Link className="inline-flex items-center gap-1 hover:text-primary" to={to}>{label}<ArrowUpRight size={12} /></Link></li>)}</ul></div>; }
