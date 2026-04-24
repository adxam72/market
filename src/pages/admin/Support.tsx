import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Send, X } from "lucide-react";

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  product_id: string | null;
  product_name: string | null;
  status: "open" | "answered" | "closed";
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  profiles?: { full_name: string | null; phone: string | null } | null;
};

const STATUS_TABS = [
  { v: "open" as const, l: "Ochiq" },
  { v: "answered" as const, l: "Javob berilgan" },
  { v: "closed" as const, l: "Yopilgan" },
  { v: "all" as const, l: "Barchasi" },
];

const AdminSupport = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tab, setTab] = useState<"open" | "answered" | "closed" | "all">("open");
  const [replies, setReplies] = useState<Record<string, string>>({});

  const db = supabase as any;

  const load = async () => {
    let q = db
      .from("support_tickets")
      .select("*, profiles(full_name, phone)")
      .order("created_at", { ascending: false });
    if (tab !== "all") q = q.eq("status", tab);
    const { data } = await q;
    setTickets((data as any) ?? []);
  };

  useEffect(() => {
    document.title = "Shikoyatlar — DTPI Admin";
    load();
  }, [tab]);

  const reply = async (t: Ticket) => {
    const text = replies[t.id]?.trim();
    if (!text) { toast({ title: "Javob yozing", variant: "destructive" }); return; }
    const { error } = await db
      .from("support_tickets")
      .update({
        admin_reply: text,
        status: "answered",
        replied_at: new Date().toISOString(),
      })
      .eq("id", t.id);
    if (error) { toast({ title: "Xatolik", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Javob yuborildi" });
    setReplies(r => ({ ...r, [t.id]: "" }));
    load();
  };

  const close = async (id: string) => {
    const { error } = await db.from("support_tickets").update({ status: "closed" }).eq("id", id);
    if (error) { toast({ title: "Xatolik", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Murojaat yopildi" });
    load();
  };

  const statusColor: Record<string, string> = {
    open: "bg-accent text-accent-foreground",
    answered: "bg-success/15 text-success",
    closed: "bg-secondary text-muted-foreground",
  };

  return (
    <AdminLayout title="Shikoyatlar">
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map(t => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.v
                ? "bg-primary text-primary-foreground shadow-warm"
                : "bg-secondary text-foreground hover:bg-secondary/70"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground shadow-soft">
          <MessageSquare className="mx-auto h-10 w-10 mb-3" />
          Murojaatlar yo'q.
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map(t => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{t.subject}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {(t.profiles as any)?.full_name ?? "Noma'lum"} ·{" "}
                    {new Date(t.created_at).toLocaleString("uz-UZ", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusColor[t.status]}`}>
                  {STATUS_TABS.find(s => s.v === t.status)?.l ?? t.status}
                </span>
              </div>

              {t.product_name && (
                <p className="mt-2 flex items-center gap-1 text-sm text-primary">
                  <Package className="h-3.5 w-3.5" /> {t.product_name}
                </p>
              )}

              <div className="mt-3 rounded-xl bg-secondary/50 p-4 text-sm">{t.message}</div>

              {t.admin_reply && (
                <div className="mt-3 rounded-xl bg-primary/10 p-4 text-sm">
                  <p className="text-xs font-medium text-primary mb-1">Sizning javobingiz:</p>
                  <p>{t.admin_reply}</p>
                </div>
              )}

              {t.status === "open" && (
                <div className="mt-4">
                  <Textarea
                    placeholder="Javob yozing..."
                    value={replies[t.id] ?? ""}
                    onChange={(e) => setReplies(r => ({ ...r, [t.id]: e.target.value }))}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button onClick={() => reply(t)} className="flex-1">
                      <Send className="mr-2 h-4 w-4" /> Javob berish
                    </Button>
                    <Button variant="outline" onClick={() => close(t.id)}>
                      <X className="mr-2 h-4 w-4" /> Yopish
                    </Button>
                  </div>
                </div>
              )}

              {t.status === "answered" && (
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => close(t.id)}>
                    Murojaatni yopish
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSupport;
