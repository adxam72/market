import { useEffect, useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { errorMessage } from "@/lib/marketplace";
const schema = z.object({ full_name: z.string().trim().min(2, "Nom kamida 2 belgi").max(100), bio: z.string().trim().max(2000), phone: z.string().regex(/^\+998\d{9}$/, "Telefonni +998 bilan to‘liq kiriting") });
export default function SellerSettings() {
  const { user } = useAuth(); const { isSeller } = useRole();
  const [form, setForm] = useState({ full_name: "", bio: "", phone: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!user || !isSeller) return; supabase.from("profiles").select("full_name,bio,phone").eq("id", user.id).single().then(({ data, error }) => { if (error) toast.error(errorMessage(error)); else if (data) setForm({ full_name: data.full_name ?? "", bio: data.bio ?? "", phone: data.phone ?? "" }); }); }, [user, isSeller]);
  const save = async (event: React.FormEvent) => { event.preventDefault(); if (!user || busy) return; const parsed = schema.safeParse(form); if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; } setBusy(true); const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id); setBusy(false); if (error) toast.error(errorMessage(error)); else toast.success("Ma’lumotlar saqlandi"); };
  return <SellerLayout title="Do‘kon ma’lumotlari"><form onSubmit={save} className="max-w-xl space-y-5 rounded-2xl border bg-white p-6"><p className="text-sm text-muted-foreground">Bu nom mahsulotlaringiz yonida sotuvchi nomi sifatida ko‘rinadi.</p>{([['full_name', 'Sotuvchi / Do‘kon nomi'], ['phone', 'Telefon'], ['bio', 'Do‘kon haqida']] as const).map(([key, label]) => <label key={key} className="block text-xs font-medium">{label}{key === 'bio' ? <textarea className="mt-2 min-h-28 w-full rounded-xl border p-3 text-sm" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /> : <input className="mt-2 h-11 w-full rounded-xl border px-3 text-sm" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />}</label>)}<Button disabled={busy}>{busy ? "Saqlanmoqda..." : "Saqlash"}</Button></form></SellerLayout>;
}
