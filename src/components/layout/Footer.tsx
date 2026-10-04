import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Brand from "@/components/Brand";
export default function Footer() {
  return <footer className="mt-14 bg-[#0c1e46] text-white md:mt-20"><div className="container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 md:py-14"><div><Brand light /><p className="mt-5 max-w-xs text-sm leading-7 text-blue-100/80">Bilim, ijod va halol hamkorlikni qadrlaydigan DTPI hamjamiyati uchun mahalliy savdo maydoni.</p><p className="mt-3 text-xs text-blue-200">Xizmat hududi: DTPI va Denovdagi yaqin atrof.</p><Link to="/catalog" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-blue-200">O‘zingizga mosini toping <ArrowUpRight size={15} /></Link></div>
    <FooterLinks title="Xarid qilish" links={[["Barcha mahsulotlar", "/catalog"], ["Yangi mahsulotlar", "/catalog?sort=newest"], ["Chegirmalar", "/catalog?sale=1"], ["Sevimlilar", "/account/favorites"]]} />
    <FooterLinks title="Yordam" links={[["Savol va javoblar", "/faq"], ["Yetkazib berish", "/info/delivery"], ["To‘lov", "/info/payment"], ["Qaytarish", "/info/returns"]]} />
    <FooterLinks title="DTPI bilan birga" links={[["Biz haqimizda", "/about"], ["Sotuvchi bo‘lish", "/sell"], ["Sotuvchi paneli", "/seller"], ["Murojaat yuborish", "/support"]]} />
  </div><div className="container flex flex-wrap justify-between gap-4 border-t border-white/10 py-6 text-[11px] text-blue-100/75"><span>© {new Date().getFullYear()} DTPI Market. Barcha huquqlar himoyalangan.</span><div className="flex flex-wrap gap-5"><Link to="/info/privacy" className="hover:text-white">Maxfiylik siyosati</Link><Link to="/info/terms" className="hover:text-white">Foydalanish shartlari</Link></div></div></footer>;
}
function FooterLinks({ title, links }: { title: string; links: string[][] }) { return <div><h3 className="text-sm font-semibold">{title}</h3><ul className="mt-5 space-y-1 text-sm text-blue-100/80">{links.map(([label, to]) => <li key={to}><Link className="inline-flex items-center gap-1 py-2 transition hover:text-white" to={to}>{label}<ArrowUpRight size={12} /></Link></li>)}</ul></div>; }
