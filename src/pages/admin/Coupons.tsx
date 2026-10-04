import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/marketplace";
import { toast } from "sonner";
import { z } from "zod";
const schema = z.object({ code: z.string().trim().regex(/^[A-Z0-9]{3,30}$/, "Kodda 3–30 ta katta lotin harfi yoki raqam bo‘lsin"), percent: z.coerce.number().int().min(1).max(50, "Chegirma ko‘pi bilan 50%"), min_total: z.coerce.number().min(0), max_discount: z.coerce.number().positive("Maksimal chegirma noldan katta bo‘lsin"), usage_limit: z.coerce.number().int().positive(), expires_at: z.string().refine(v => new Date(v).getTime() > Date.now(), "Kelajakdagi sanani tanlang") });
export default function Coupons() {
  const [items, setItems] = useState<Tables<"coupons">[]>([]);
  const [form, setForm] = useState({ code: "", percent: "10", min_total: "0", max_discount: "50000", usage_limit: "100", expires_at: "" });
  const [busy, setBusy] = useState(false);
  const load = async () => { const { data, error } = await supabase.from("coupons").select("*").order("expires_at", { ascending: false }); if (error) toast.error(errorMessage(error)); else setItems(data ?? []); };
  useEffect(() => { void load(); }, []);
  const save = async (event: React.FormEvent) => { event.preventDefault(); if (busy) return; const result = schema.safeParse(form); if (!result.success) { toast.error(result.error.issues[0].message); return; } setBusy(true); const { error } = await supabase.from("coupons").insert({ code: result.data.code, percent: result.data.percent, min_total: result.data.min_total, max_discount: result.data.max_discount, usage_limit: result.data.usage_limit, expires_at: new Date(result.data.expires_at).toISOString() }); setBusy(false); if (error) toast.error(errorMessage(error)); else { toast.success("Promo kod yaratildi"); setForm({ ...form, code: "" }); await load(); } };
  const toggle = async (coupon: Tables<"coupons">) => { const { error } = await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id); if (error) toast.error(errorMessage(error)); else await load(); };
  return <AdminLayout title="Promo kodlar"><form onSubmit={save} className="grid gap-4 rounded-2xl border bg-white p-6 sm:grid-cols-2 xl:grid-cols-3">{([['code', 'Promo kod', 'text'], ['percent', 'Chegirma (%)', 'number'], ['min_total', 'Minimal buyurtma (so‘m)', 'number'], ['max_discount', 'Maksimal chegirma (so‘m)', 'number'], ['usage_limit', 'Foydalanish chegarasi', 'number'], ['expires_at', 'Amal qilish muddati', 'datetime-local']] as const).map(([key, label, type]) => <label key={key} className="block text-xs font-medium">{label}<input required type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: key === 'code' ? e.target.value.toUpperCase() : e.target.value })} className="mt-2 h-11 w-full rounded-xl border px-3 text-sm" /></label>)}<Button className="w-fit" disabled={busy}>{busy ? "Saqlanmoqda..." : "Promo kod yaratish"}</Button></form><div className="mt-6 space-y-3">{items.map(coupon => <article key={coupon.id} className="flex flex-wrap justify-between gap-3 rounded-2xl border bg-white p-5"><div><h2 className="font-semibold">{coupon.code} · {coupon.percent}%</h2><p className="mt-2 text-xs text-muted-foreground">Ishlatildi: {coupon.used}/{coupon.usage_limit} · Muddat: {new Date(coupon.expires_at).toLocaleString("uz-UZ")}</p></div><Button variant="outline" onClick={() => toggle(coupon)}>{coupon.is_active ? "O‘chirish" : "Faollashtirish"}</Button></article>)}</div></AdminLayout>;
}
