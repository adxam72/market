import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { formatSom } from "@/lib/format";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Phone, MapPin } from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  notes: string | null;
  created_at: string;
  user_id: string;
  order_items: { product_name: string; quantity: number; unit_price: number }[];
};

const STATUS = [
  { value: "pending", label: "Kutilmoqda" },
  { value: "confirmed", label: "Tasdiqlandi" },
  { value: "shipped", label: "Yo'lda" },
  { value: "delivered", label: "Yetkazildi" },
  { value: "cancelled", label: "Bekor qilingan" },
];
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-secondary text-foreground",
  confirmed: "bg-accent text-accent-foreground",
  shipped: "bg-primary/15 text-primary",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    let q = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as any);
    const { data } = await q;
    setOrders((data as any) ?? []);
  };

  useEffect(() => {
    document.title = "Buyurtmalar — DTPI Admin";
    load();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status yangilandi" });
    load();
  };

  return (
    <AdminLayout title="Buyurtmalar">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha statuslar</SelectItem>
            {STATUS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">Topildi: {orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground shadow-soft">
          Buyurtmalar yo'q.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const isOpen = open === o.id;
            return (
              <div key={o.id} className="rounded-2xl border border-border bg-card shadow-soft">
                <div className="flex flex-wrap items-center gap-3 p-4 md:p-5">
                  <button
                    onClick={() => setOpen(isOpen ? null : o.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold">{o.order_number}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.shipping_name} ·{" "}
                        {new Date(o.created_at).toLocaleDateString("uz-UZ", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </button>
                  <span className="font-display font-semibold">{formatSom(Number(o.total))}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[o.status]}`}
                  >
                    {STATUS.find((s) => s.value === o.status)?.label ?? o.status}
                  </span>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isOpen && (
                  <div className="space-y-4 border-t border-border p-5 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <a href={`tel:${o.shipping_phone}`} className="hover:text-primary">
                          {o.shipping_phone}
                        </a>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span>{o.shipping_address}</span>
                      </div>
                    </div>
                    {o.notes && (
                      <div className="rounded-xl bg-secondary/50 p-3 text-muted-foreground">
                        <b className="text-foreground">Izoh:</b> {o.notes}
                      </div>
                    )}
                    <div className="space-y-1.5 border-t border-border pt-3">
                      {o.order_items.map((it, i) => (
                        <div key={i} className="flex justify-between text-muted-foreground">
                          <span>
                            {it.product_name} × {it.quantity}
                          </span>
                          <span>{formatSom(Number(it.unit_price) * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      To'lov: {o.payment_method === "cod" ? "Yetkazganda naqd" : "Onlayn"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
