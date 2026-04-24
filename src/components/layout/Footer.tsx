import { Link } from "react-router-dom";
import { Instagram, Send, Phone, Mail } from "lucide-react";
import logoImg from "@/assets/logo.png";

const Footer = () => (
  <footer className="mt-24 border-t border-border bg-secondary/30 paper-texture">
    <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold">DTPI Market</span>
        </div>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
          Universitet talabalari tomonidan qo'lda yaratilgan noyob mahsulotlar bozori.
          Har bir buyum ortida talabaning hikoyasi va mehnati turadi.
        </p>
        <div className="mt-5 flex gap-3">
          <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="#" aria-label="Telegram" className="flex h-9 w-9 items-center justify-center rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition">
            <Send className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div>
        <h4 className="font-display text-sm font-semibold">Bozor</h4>
        <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
          <li><Link to="/catalog" className="hover:text-foreground">Barcha mahsulotlar</Link></li>
          <li><Link to="/catalog?featured=1" className="hover:text-foreground">Tanlangan</Link></li>
          <li><Link to="/about" className="hover:text-foreground">Biz haqimizda</Link></li>
          <li><Link to="/sell" className="hover:text-foreground">Sotuvchi bo'lish</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display text-sm font-semibold">Yordam</h4>
        <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
          <li><Link to="/faq" className="hover:text-foreground">Yordam markazi</Link></li>
          <li><Link to="/info/delivery" className="hover:text-foreground">Yetkazib berish</Link></li>
          <li><Link to="/info/payment" className="hover:text-foreground">To'lov</Link></li>
          <li><Link to="/info/returns" className="hover:text-foreground">Qaytarish</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display text-sm font-semibold">Aloqa</h4>
        <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +998 90 123 45 67</li>
          <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@dtpi.market</li>
          <li><Link to="/info/privacy" className="hover:text-foreground">Maxfiylik siyosati</Link></li>
          <li><Link to="/info/terms" className="hover:text-foreground">Foydalanish shartlari</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/60">
      <div className="container flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} DTPI Market. Barcha huquqlar himoyalangan.</span>
        <span>Toshkentda muhabbat bilan yaratildi 💜</span>
      </div>
    </div>
  </footer>
);

export default Footer;
