import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus, MapPin, Pencil, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { checkoutSchema, errorMessage, regions } from "@/lib/marketplace";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
type Address = Tables<"addresses">;
const empty = { name: "", phone: "+998", region: "", district: "", street: "", landmark: "", label: "Uy" };
const input = "mt-2 h-11 w-full rounded-xl border px-3 text-sm";
export default function Addresses() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Address[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async () => { if (!user) return; const { data, error } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at"); if (error) setError(errorMessage(error)); else { setItems(data ?? []); setError(""); } };
  useEffect(() => { document.title = "Manzillarim — DTPI Market"; void load(); }, [user]);
  if (loading) return <Layout><p className="container py-16">Yuklanmoqda...</p></Layout>;
  if (!user) return <Navigate to="/auth?next=/account/addresses" replace />;
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    const result = checkoutSchema.safeParse(form);
    if (!result.success) { toast.error(result.error.issues[0].message); return; }
    if (!form.label.trim() || form.label.length > 60) { toast.error("Manzil nomini kiriting (60 belgigacha)"); return; }
    const payload = { user_id: user.id, label: form.label.trim(), full_name: result.data.name, phone: result.data.phone, region: result.data.region, district: result.data.district, street: result.data.street, landmark: result.data.landmark };
    setBusy(true); const { error } = editing ? await supabase.from("addresses").update({ label: payload.label, full_name: payload.full_name, phone: payload.phone, region: payload.region, district: payload.district, street: payload.street, landmark: payload.landmark }).eq("id", editing) : await supabase.from("addresses").insert(payload); setBusy(false);
    if (error) toast.error(errorMessage(error)); else { toast.success("Manzil saqlandi"); setOpen(false); await load(); }
  };
  const remove = async (id: string) => { if (!confirm("Manzil o‘chirilsinmi?")) return; const { error } = await supabase.from("addresses").delete().eq("id", id); if (error) toast.error(errorMessage(error)); else { toast.success("Manzil o‘chirildi"); await load(); } };
  return <Layout><div className="container max-w-3xl py-10"><Link to="/account" className="text-xs text-primary">← Profilga qaytish</Link><div className="mt-4 flex flex-wrap justify-between gap-3"><h1 className="text-3xl font-semibold">Manzillarim</h1><Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus size={16} /> Manzil qo‘shish</Button></div>{error && <p role="alert" className="mt-5">{error}</p>}
    {open && <form onSubmit={save} className="mt-6 space-y-5 rounded-2xl border bg-white p-6"><div className="grid gap-4 sm:grid-cols-2">{([['label', 'Manzil nomi'], ['name', 'Ism va familiya'], ['phone', 'Telefon'], ['district', 'Tuman / shahar'], ['street', 'Ko‘cha va uy'], ['landmark', 'Mo‘ljal']] as const).map(([key, label]) => <label key={key} className="text-xs font-medium">{label}<input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className={input} /></label>)}<label className="text-xs font-medium">Viloyat<select aria-label="Viloyat" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className={input}><option value="">Tanlang</option>{regions.map(r => <option key={r}>{r}</option>)}</select></label></div><div className="flex gap-3"><Button disabled={busy}>{busy ? "Saqlanmoqda..." : "Saqlash"}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button></div></form>}
    <div className="mt-6 space-y-4">{items.length === 0 && !error && <div className="rounded-2xl border bg-white p-10 text-center"><MapPin className="mx-auto text-primary" /><p className="mt-3 text-muted-foreground">Saqlangan manzillaringiz hali yo‘q.</p></div>}{items.map(address => <article key={address.id} className="rounded-2xl border bg-white p-5"><div className="flex justify-between"><h2 className="font-semibold">{address.label}</h2><div className="flex gap-4"><button aria-label="Manzilni tahrirlash" onClick={() => { setEditing(address.id); setForm({ label: address.label, name: address.full_name, phone: address.phone, region: address.region, district: address.district, street: address.street, landmark: address.landmark }); setOpen(true); }}><Pencil size={16} /></button><button aria-label="Manzilni o‘chirish" onClick={() => remove(address.id)}><Trash2 size={16} /></button></div></div><p className="mt-2 text-sm">{address.full_name} · {address.phone}</p><p className="mt-2 text-xs text-muted-foreground">{[address.region, address.district, address.street, address.landmark].filter(Boolean).join(", ")}</p></article>)}</div>
  </div></Layout>;
}
