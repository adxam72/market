import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
export default function Brand({ light = false }: { light?: boolean }) {
  return <Link to="/" aria-label="DTPI Market — Bosh sahifa" className="inline-flex shrink-0 items-center gap-2.5">
    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${light ? "bg-white/15 text-white" : "bg-primary text-white"}`}><ShoppingBag size={21} strokeWidth={1.7} /></span>
    <span className={`text-xl font-bold tracking-tight ${light ? "text-white" : "text-foreground"}`}>DTPI<span className={`ml-1 font-normal ${light ? "text-white/75" : "text-primary"}`}>Market</span></span>
  </Link>;
}
