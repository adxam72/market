import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Phone, GraduationCap, Check, X, Clock } from "lucide-react";

type App = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  university: string;
  product_type: string;
  bio: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
};

const STATUS_TABS: { v: "pending" | "approved" | "rejected" | "all"; l: string }[] = [
  { v: "pending", l: "Yangi" },
  { v: "approved", l: "Tasdiqlangan" },
  { v: "rejected", l: "Rad etilgan" },
  { v: "all", l: "Barchasi" },
];

const Applications = () => {
  const [items, setItems] = useState<App[]>([]);
  const [tab, setTab] = useState<typeof STATUS_TABS[number]["v"]>("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    let q = supabase
      .from("seller_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (tab !== "all") q = q.eq("status", tab);
    const { data } = await q;
    setItems((data as any) ?? []);
  };

  useEffect(() => {
    document.title = "Sotuvchi arizalari — DTPI Admin";
    load();
  }, [tab]);

  const decide = async (a: App, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("seller_applications")
      .update({ status, admin_note: notes[a.id] ?? a.admin_note })
      .eq("id", a.id);
    if (error) {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: status === "approved" ? "Ariza tasdiqlandi" : "Ariza rad etildi",
      description:
        status === "approved" ? `${a.full_name} endi sotuvchi.` : undefined,
    });
    load();
  };

  return (
    <AdminLayout title="Sotuvchi arizalari">
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
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

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground shadow-soft">
          Arizalar yo'q.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{a.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString("uz-UZ", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {a.phone}
                </p>
                <p className="flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5" /> {a.university}
                </p>
                <p>
                  <b className="text-foreground">Mahsulot turi:</b> {a.product_type}
                </p>
                <p className="rounded-xl bg-secondary/50 p-3 text-foreground">{a.bio}</p>
              </div>

              {a.status === "pending" ? (
                <>
                  <Textarea
                    placeholder="Admin izohi (ixtiyoriy)..."
                    value={notes[a.id] ?? ""}
                    onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })}
                    className="mt-4"
                  />
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => decide(a, "approved")}
                      className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Tasdiqlash
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => decide(a, "rejected")}
                      className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rad etish
                    </Button>
                  </div>
                </>
              ) : (
                a.admin_note && (
                  <p className="mt-4 rounded-xl border border-border bg-secondary/40 p-3 text-xs">
                    <b>Admin izohi:</b> {a.admin_note}
                  </p>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { l: string; c: string; i: any }> = {
    pending: { l: "Kutilmoqda", c: "bg-accent text-accent-foreground", i: Clock },
    approved: { l: "Tasdiqlangan", c: "bg-success/15 text-success", i: Check },
    rejected: { l: "Rad etilgan", c: "bg-destructive/15 text-destructive", i: X },
  };
  const m = map[status];
  if (!m) return null;
  const Icon = m.i;
  return (
    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${m.c}`}>
      <Icon className="h-3 w-3" /> {m.l}
    </span>
  );
};

export default Applications;
