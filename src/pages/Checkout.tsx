import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Lock, MapPin, Truck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatSom } from "@/lib/format";
import { checkoutSchema, errorMessage, regions } from "@/lib/marketplace";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const input = "mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary";
const steps = ["Aloqa", "Manzil", "Yetkazib berish", "Tasdiqlash"];
export default function Checkout() {
  const { items, total, loading: cartLoading, refresh } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState<Tables<"addresses">[]>([]);
  useEffect(() => { if (!user) return; supabase.from("addresses").select("*").eq("user_id", user.id).then(({ data }) => setAddresses(data ?? [])); }, [user]);
  const [busy, setBusy] = useState(false);
  const [coupon, setCoupon] = useState(() => sessionStorage.getItem("dtpi_coupon") ?? "");
  const [form, setForm] = useState({ name: "", phone: "+998", region: "", district: "", street: "", landmark: "" });
  const [checkoutKey] = useState(() => {
    const key = sessionStorage.getItem("dtpi_checkout_key") ?? crypto.randomUUID();
    sessionStorage.setItem("dtpi_checkout_key", key); return key;
  });
  if (authLoading || cartLoading) return <Layout><p className="container py-20">Yuklanmoqda...</p></Layout>;
  if (items.length === 0) return <Navigate to="/cart" replace />;
  const next = () => {
    const schema = step === 0 ? checkoutSchema.pick({ name: true, phone: true }) : checkoutSchema.pick({ region: true, district: true, street: true, landmark: true });
    if (step < 2) { const result = schema.safeParse(form); if (!result.success) { toast.error(result.error.issues[0].message); return; } }
    setStep(step + 1);
  };
  const submit = async () => {
    if (busy) return;
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (!user) { navigate("/auth?next=/checkout"); return; }
    setBusy(true);
    try {
      const value = parsed.data;
      const { error } = await supabase.rpc("place_order", {
        p_items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        p_name: value.name, p_phone: value.phone,
        p_address: [value.region, value.district, value.street, value.landmark].filter(Boolean).join(", "),
        p_checkout_key: checkoutKey,
        p_coupon: coupon.trim().toUpperCase(),
      });
      if (error) { toast.error(errorMessage(error)); return; }
      sessionStorage.removeItem("dtpi_checkout_key");
      sessionStorage.removeItem("dtpi_coupon");
      localStorage.removeItem("dtpi_guest_cart");
      toast.success("Buyurtmangiz muvaffaqiyatli qabul qilindi");
      navigate("/account/orders");
      await refresh();
    } catch { toast.error("Tarmoqqa ulanib bo‘lmadi. Qayta urinib ko‘ring."); }
    finally { setBusy(false); }
  };
  const field = (name: keyof typeof form, label: string, placeholder: string, type = "text") => <label className="block text-xs font-medium">{label}<input type={type} autoComplete={name === "name" ? "name" : name === "phone" ? "tel" : undefined} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} placeholder={placeholder} className={input} /></label>;
  return <Layout><div className="container py-9 md:py-12"><Link to="/cart" className="flex items-center gap-1 text-xs text-muted-foreground"><ChevronLeft size={14} /> Savatchaga qaytish</Link><h1 className="mt-4 text-3xl font-semibold">Buyurtmani rasmiylashtirish</h1>
    <div className="mt-7 grid grid-cols-4 gap-2">{steps.map((label, i) => <div key={label} className={`border-t-2 py-3 text-[11px] sm:text-sm ${i <= step ? "border-primary text-primary" : "border-border text-muted-foreground"}`}><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary">{i < step ? <Check size={13} /> : i + 1}</span>{label}</div>)}</div>
    <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1fr_360px]"><div className="rounded-2xl border bg-white p-6 md:p-8">
      {step === 0 && <><h2 className="text-xl font-semibold">Aloqa ma’lumotlari</h2><p className="mt-2 text-sm text-muted-foreground">Buyurtma bo‘yicha siz bilan bog‘lanamiz.</p><div className="mt-6 grid gap-5 sm:grid-cols-2">{field("name", "Ism va familiya", "Ism Familiya")}{field("phone", "Telefon raqami", "+998 90 123 45 67", "tel")}</div></>}
      {step === 1 && <><h2 className="text-xl font-semibold">Yetkazib berish manzili</h2>{addresses.length > 0 && <label className="mt-5 block text-xs">Saqlangan manzil<select aria-label="Saqlangan manzil" className={input} defaultValue="" onChange={e => { const address = addresses.find(a => a.id === e.target.value); if (address) setForm({ name: address.full_name, phone: address.phone, region: address.region, district: address.district, street: address.street, landmark: address.landmark }); }}><option value="">Manzilni tanlang</option>{addresses.map(a => <option key={a.id} value={a.id}>{a.label} — {a.street}</option>)}</select></label>}<div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="text-xs font-medium">Viloyat<select aria-label="Viloyat" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className={input}><option value="">Viloyatni tanlang</option>{regions.map(r => <option key={r}>{r}</option>)}</select></label>{field("district", "Tuman / shahar", "Denov tumani")}{field("street", "Ko‘cha, uy va xonadon", "Mustaqillik ko‘chasi, 12-uy")}{field("landmark", "Mo‘ljal (ixtiyoriy)", "Maktab yonida")}</div></>}
      {step === 2 && <><h2 className="text-xl font-semibold">Yetkazib berish va to‘lov</h2><div className="mt-6 flex gap-3 rounded-xl border border-primary bg-primary/5 p-5"><Truck className="text-primary" /><div><p className="text-sm font-semibold">Standart yetkazib berish</p><p className="mt-1 text-xs text-muted-foreground">Yetkazish vaqtini sotuvchi bilan aniqlashtiramiz. Hozircha bepul.</p></div></div><div className="mt-4 rounded-xl border p-5"><p className="text-sm font-semibold">Yetkazganda naqd to‘lov</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Mahsulotni olganingizda to‘laysiz. Karta va onlayn to‘lovlar ulanishi bilan qo‘shiladi.</p></div></>}
      {step === 3 && <><h2 className="text-xl font-semibold">Ma’lumotlarni tekshiring</h2><div className="mt-5 space-y-4 rounded-xl bg-secondary/50 p-5 text-sm"><p><b>{form.name}</b><br />{form.phone}</p><p className="flex gap-2"><MapPin size={17} className="shrink-0 text-primary" />{[form.region, form.district, form.street, form.landmark].filter(Boolean).join(", ")}</p><p>Standart yetkazib berish · Naqd to‘lov</p></div>{!user && <div className="mt-5 rounded-xl border p-4 text-sm"><p>Buyurtmani kuzatish uchun hisobingizga kiring. Savatchangiz saqlanadi.</p><Button asChild className="mt-3"><Link to="/auth?next=/checkout">Kirish / Ro‘yxatdan o‘tish</Link></Button></div>}<p className="mt-5 text-xs text-muted-foreground">Buyurtma berish orqali <Link className="text-primary underline" to="/info/terms">foydalanish shartlariga</Link> rozilik bildirasiz.</p></>}
      <div className="mt-8 flex justify-between gap-3">{step > 0 ? <Button variant="outline" disabled={busy} onClick={() => setStep(step - 1)}>Orqaga</Button> : <span />}{step < 3 ? <Button onClick={next}>Davom etish</Button> : <Button disabled={busy || !user} onClick={submit}>{busy ? "Yuborilmoqda..." : "Buyurtma berish"}</Button>}</div>
    </div><aside className="rounded-2xl border bg-white p-6 lg:sticky lg:top-48"><h2 className="text-lg font-semibold">Buyurtma xulosasi</h2><div className="mt-5 space-y-4">{items.map(item => <div key={item.id} className="flex gap-3"><img alt={item.product?.name ?? "Mahsulot"} src={item.product?.images[0] || "/placeholder.svg"} className="h-14 w-14 rounded-lg object-cover" /><div className="min-w-0"><p className="line-clamp-2 text-xs font-medium">{item.product?.name}</p><p className="mt-1 text-xs text-muted-foreground">{item.quantity} × {formatSom(item.product?.price ?? 0)}</p></div></div>)}</div><label className="mt-5 block text-xs font-medium">Promo kod<input value={coupon} onChange={e => { setCoupon(e.target.value); sessionStorage.setItem("dtpi_coupon", e.target.value); }} className={input} placeholder="Promo kodni kiriting" /></label><p className="mt-2 text-[10px] leading-4 text-muted-foreground">Chegirma buyurtma berilganda serverda tekshiriladi va jami summadan ayriladi.</p><div className="mt-6 space-y-3 border-t pt-4 text-sm"><p className="flex justify-between"><span className="text-muted-foreground">Mahsulotlar</span>{formatSom(total)}</p><p className="flex justify-between"><span className="text-muted-foreground">Yetkazib berish</span><span className="text-primary">Bepul</span></p><p className="flex justify-between border-t pt-4 font-semibold"><span>Jami</span>{formatSom(total)}</p></div><p className="mt-5 flex gap-2 text-[11px] leading-5 text-muted-foreground"><Lock size={15} className="shrink-0" />Yakuniy narx va ombor mavjudligi buyurtma berilganda tekshiriladi.</p></aside></div>
  </div></Layout>;
}
