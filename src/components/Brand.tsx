import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
export default function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" aria-label="DTPI Market — Bosh sahifa" className="inline-flex shrink-0 items-center gap-2.5">
    <span className={`flex h-10 w-10 items-center justify-center rounded-[14px] shadow-sm ${light ? "bg-white/15 text-white" : "bg-gradient-primary text-white"}`}><ShoppingBag size={21} strokeWidth={1.7} /></span>
    <span className={`text-lg font-bold tracking-tight sm:text-xl ${light ? "text-white" : "text-foreground"}`}>DTPI<span className={`ml-1 font-medium ${light ? "text-white/75" : "text-primary"}`}>Market</span></span>
  </Link>;
}
