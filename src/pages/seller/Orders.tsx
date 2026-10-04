import { useEffect, useState } from "react";
import SellerLayout from "@/components/seller/SellerLayout";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { errorMessage, statusLabels } from "@/lib/marketplace";
import { formatSom } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export type SellerOrder = { id: string; order_id: string; product_name: string; quantity: number; unit_price: number; fulfillment_status: string; order_number: string; shipping_name: string; shipping_phone: string; shipping_address: string; created_at: string };
export const nextStatuses: Record<string, string[]> = { pending: ["confirmed", "cancelled"], confirmed: ["preparing", "cancelled"], preparing: ["shipped", "cancelled"], shipped: ["delivered"] };
export default function SellerOrders() {
  const { isSeller } = useRole();
  const [items, setItems] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const load = async () => { setLoading(true); const result = await supabase.rpc("seller_orders"); setError(result.error ? errorMessage(result.error) : ""); if (!result.error) setItems(result.data as unknown as SellerOrder[]); setLoading(false); };
  useEffect(() => { document.title = "Buyurtmalar — DTPI sotuvchi"; if (isSeller) void load(); }, [isSeller]);
  const change = async (id: string, status: string) => {
    if (status === "cancelled" && !confirm("Ushbu mahsulot buyurtmasi bekor qilinsinmi?")) return;
    setBusy(id); const { error } = await supabase.rpc("update_fulfillment", { p_item_id: id, p_status: status });
    if (error) toast.error(errorMessage(error)); else { toast.success("Buyurtma holati yangilandi"); await load(); } setBusy(null);
  };
  return <SellerLayout title="Buyurtmalar">{error ? <p role="alert">{error}<Button onClick={load}>Qayta urinish</Button></p> : loading ? <p>Yuklanmoqda...</p> : items.length === 0 ? <div className="rounded-2xl border bg-white p-10 text-center text-muted-foreground">Hozircha buyurtmalar yo‘q. Mahsulotlaringizni joylashtiring.</div> : <div className="space-y-4">{items.map(item => <article key={item.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-muted-foreground">{item.order_number} · {new Date(item.created_at).toLocaleDateString("uz-UZ")}</p><h2 className="mt-2 text-base font-semibold">{item.product_name}</h2><p className="mt-1 text-sm">{item.quantity} × {formatSom(Number(item.unit_price))}</p></div><span className="h-fit rounded-full bg-secondary px-3 py-1.5 text-xs text-primary">{statusLabels[item.fulfillment_status]}</span></div><div className="mt-4 border-t pt-4 text-xs leading-6 text-muted-foreground"><b className="text-foreground">{item.shipping_name}</b> · <a className="text-primary" href={`tel:${item.shipping_phone}`}>{item.shipping_phone}</a><p>{item.shipping_address}</p></div><div className="mt-4 flex flex-wrap gap-2">{(nextStatuses[item.fulfillment_status] ?? []).map(status => <Button key={status} size="sm" variant={status === "cancelled" ? "outline" : "default"} disabled={busy === item.id} onClick={() => change(item.id, status)}>{statusLabels[status]}</Button>)}</div></article>)}</div>}</SellerLayout>;
}
