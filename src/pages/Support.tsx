import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, MessageSquare } from "lucide-react";

type Ticket = {
  id: string;
  message: string;
  status: "open" | "answered" | "closed";
  created_at: string;
  admin_reply: string | null;
  replied_at: string | null;
};

const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Murojaat — DTPI Market";
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tickets]);

  const db = supabase as any;

  const load = async () => {
    if (!user) return;
    const { data } = await db
      .from("support_tickets")
      .select("id, message, status, created_at, admin_reply, replied_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setTickets((data as Ticket[]) ?? []);
    setLoading(false);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setSending(true);
    const { error } = await db.from("support_tickets").insert({
      user_id: user.id,
      subject: "Murojaat",
      message: text.trim(),
      product_id: null,
      product_name: null,
    });
    if (error) {
      toast.error("Xabar yuborilmadi: " + error.message);
      setSending(false);
      return;
    }
    setText("");
    setSending(false);
    load();
  };

  if (!user) return <Navigate to="/auth" replace />;

  const fmt = (d: string) =>
    new Date(d).toLocaleString("uz-UZ", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Layout>
      <div className="container max-w-2xl py-10">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-semibold">Murojaat</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Savol, taklif yoki murojaatlaringizni yuboring
          </p>
        </div>

        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          {/* Chat messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5 min-h-[400px] max-h-[500px]">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground">Yuklanmoqda...</p>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">
                  Hozircha murojaatlar yo'q.<br />Birinchi xabarni yuboring!
                </p>
              </div>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="space-y-3">
                  {/* User message — right */}
                  <div className="flex justify-end">
                    <div className="max-w-[75%]">
                      <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground">
                        {t.message}
                      </div>
                      <p className="mt-1 text-right text-[11px] text-muted-foreground">{fmt(t.created_at)}</p>
                    </div>
                  </div>

                  {/* Admin reply — left */}
                  {t.admin_reply && (
                    <div className="flex justify-start">
                      <div className="max-w-[75%]">
                        <p className="mb-1 text-[11px] font-medium text-muted-foreground">Admin</p>
                        <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm">
                          {t.admin_reply}
                        </div>
                        {t.replied_at && (
                          <p className="mt-1 text-[11px] text-muted-foreground">{fmt(t.replied_at)}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={send}
            className="flex items-end gap-3 border-t border-border bg-background p-4"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(e as any);
                }
              }}
              placeholder="Xabar yozing... (Enter — yuborish)"
              rows={2}
              className="flex-1 resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <Button type="submit" disabled={sending || !text.trim()} size="icon" className="h-11 w-11 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Support;
