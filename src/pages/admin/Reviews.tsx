import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/marketplace";
type Review = { id: string; rating: number; comment: string | null; created_at: string; products: { name: string } | null };
export default function Reviews() {
  const [items, setItems] = useState<Review[]>([]);
  const load = async () => { const { data, error } = await supabase.from("reviews").select("id,rating,comment,created_at,products(name)").order("created_at", { ascending: false }); if (error) toast.error(errorMessage(error)); else setItems(data ?? []); };
  useEffect(() => { void load(); }, []);
  const remove = async (id: string) => { if (!confirm("Sharh o‘chirilsinmi?")) return; const { error } = await supabase.from("reviews").delete().eq("id", id); if (error) toast.error(errorMessage(error)); else { toast.success("Sharh o‘chirildi"); await load(); } };
  return <AdminLayout title="Sharhlarni boshqarish"><div className="space-y-4">{items.length === 0 && <p className="rounded-2xl border bg-white p-8 text-muted-foreground">Hozircha sharhlar yo‘q.</p>}{items.map(item => <article key={item.id} className="rounded-2xl border bg-white p-5"><div className="flex justify-between"><h2 className="text-sm font-semibold">{item.products?.name ?? 'Mahsulot o‘chirilgan'}</h2><Button aria-label="Sharhni o‘chirish" size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 size={16} /></Button></div><p className="mt-2 flex items-center gap-1 text-xs text-primary"><Star size={14} />{item.rating}/5 · {new Date(item.created_at).toLocaleDateString("uz-UZ")}</p><p className="mt-3 text-sm">{item.comment}</p></article>)}</div></AdminLayout>;
}
