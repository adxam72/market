import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Send, ChevronDown, ChevronUp, Package } from "lucide-react";
import type { Product } from "@/types/db";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  product_id: string | null;
  product_name: string | null;
  status: "open" | "answered" | "closed";
  created_at: string;
  admin_reply: string | null;
  replied_at: string | null;
};

const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    message: "",
    product_id: "",
  });

  useEffect(() => {
    document.title = "Yordam — DTPI Market";
  }, []);

  useEffect(() => {
    if (!user) return;
    loadTickets();
    supabase.from("products").select("id, name, slug").eq("is_active", true)
      .order("name").then(({ data }) => {
        if (data) setProducts(data as Product[]);
      });
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTickets((data as Ticket[]) ?? []);
    setLoading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Mavzu va xabarni to'ldiring");
      return;
    }
    setSubmitting(true);
    const selectedProduct = products.find(p => p.id === form.product_id);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: form.subject.trim(),
      message: form.message.trim(),
      product_id: form.product_id || null,
      product_name: selectedProduct?.name ?? null,
    });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    toast.success("Murojaat yuborildi! Admin tez orada javob beradi.");
    setForm({ subject: "", message: "", product_id: "" });
    setShowForm(false);
    setSubmitting(false);
    loadTickets();
  };

  if (!user) return <Navigate to="/auth" replace />;

  const statusLabel: Record<string, string> = {
    open: "Ochiq",
    answered: "Javob berilgan",
    closed: "Yopilgan",
  };
  const statusColor: Record<string, string> = {
    open: "bg-accent text-accent-foreground",
    answered: "bg-success/15 text-success",
    closed: "bg-secondary text-muted-foreground",
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">Yordam markazi</h1>
            <p className="mt-1 text-sm text-muted-foreground">Savollaringiz va shikoyatlaringiz uchun</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Yangi murojaat
          </Button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">Yangi murojaat</h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mahsulot (ixtiyoriy)</label>
                <select
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
                >
                  <option value="">Umumiy savol</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mavzu *</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
                  placeholder="Muammo nima haqida?"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Xabar *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Batafsil yozing..."
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button type="submit" disabled={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Yuborilmoqda..." : "Yuborish"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Bekor</Button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="mt-8 text-muted-foreground">Yuklanmoqda...</p>
        ) : tickets.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center shadow-soft">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Hozircha murojaatlar yo'q.</p>
            <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
              Yangi murojaat yuborish
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {tickets.map(t => {
              const isOpen = open === t.id;
              return (
                <div key={t.id} className="rounded-2xl border border-border bg-card shadow-soft">
                  <button
                    onClick={() => setOpen(isOpen ? null : t.id)}
                    className="flex w-full items-center gap-3 p-5 text-left"
                  >
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold">{t.subject}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t.product_name && <><Package className="inline h-3 w-3 mr-1" />{t.product_name} · </>}
                        {new Date(t.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusColor[t.status]}`}>
                      {statusLabel[t.status]}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="space-y-3 border-t border-border p-5">
                      <div className="rounded-xl bg-secondary/50 p-4 text-sm">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Sizning xabaringiz:</p>
                        <p>{t.message}</p>
                      </div>
                      {t.admin_reply ? (
                        <div className="rounded-xl bg-primary/10 p-4 text-sm">
                          <p className="text-xs font-medium text-primary mb-1">Admin javobi:</p>
                          <p>{t.admin_reply}</p>
                          {t.replied_at && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {new Date(t.replied_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Admin hali javob bermagan...</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Support;
