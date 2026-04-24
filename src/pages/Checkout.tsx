import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatSom } from "@/lib/format";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Ism kamida 2 belgi").max(100),
  phone: z.string().trim().min(7, "Telefon noto'g'ri").max(20),
  address: z.string().trim().min(5, "Manzilni kiriting").max(500),
  payment: z.enum(["cod", "online"]),
});

const Checkout = () => {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [authPwd, setAuthPwd] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    payment: "cod" as "cod" | "online",
  });

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const placeOrder = async (uid: string) => {
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: uid,
        total,
        payment_method: form.payment,
        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_address: form.address,
      })
      .select()
      .single();

    if (error || !order) {
      toast.error(error?.message ?? "Xatolik yuz berdi");
      return false;
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((it) => ({
        order_id: order.id,
        product_id: it.product_id,
        product_name: it.product?.name ?? "",
        unit_price: it.product?.price ?? 0,
        quantity: it.quantity,
        seller_id: it.product?.seller_id ?? null,
      }))
    );
    if (itemsErr) {
      toast.error(itemsErr.message);
      return false;
    }
    await clear();
    toast.success("Buyurtma qabul qilindi!");
    navigate(`/account/orders`);
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (user) {
      if (form.payment === "online") {
        toast.error("Onlayn to'lov hali ishga tushmagan. Iltimos, 'Yetkazganda naqd to'lov' ni tanlang.");
        return;
      }
      setLoading(true);
      await placeOrder(user.id);
      setLoading(false);
      return;
    }
    if (form.payment === "online") {
      toast.error("Onlayn to'lov hali ishga tushmagan. Iltimos, 'Yetkazganda naqd to'lov' ni tanlang.");
      return;
    }
    setAuthMode("signup");
    setAuthPwd("");
    setAuthEmail("");
    setAuthOpen(true);
  };

  const finishWithAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authEmail.includes("@")) {
      toast.error("Email to'g'ri kiriting");
      return;
    }
    if (authPwd.length < 6) {
      toast.error("Parol kamida 6 belgi");
      return;
    }
    setLoading(true);
    let uid: string | undefined;
    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPwd,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: form.name },
        },
      });
      if (error) {
        if (error.message.toLowerCase().includes("already")) {
          setAuthMode("login");
          toast.error("Bu email ro'yxatdan o'tgan. Parolni kiriting.");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }
      uid = data.user?.id;
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPwd,
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      uid = data.user?.id;
    }
    if (!uid) {
      toast.error("Hisob yaratilmadi, qayta urining");
      setLoading(false);
      return;
    }
    await supabase
      .from("profiles")
      .update({ full_name: form.name, phone: form.phone })
      .eq("id", uid);

    const ok = await placeOrder(uid);
    setLoading(false);
    if (ok) setAuthOpen(false);
  };

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Buyurtmani rasmiylashtirish</h1>
        {!user && (
          <p className="mt-2 text-sm text-muted-foreground">
            Ma'lumotlarni to'ldiring — oxirida hisob yaratasiz.
          </p>
        )}

        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div>
              <h2 className="font-display text-lg font-semibold">Yetkazib berish ma'lumotlari</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="To'liq ism *">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                    placeholder="Ism Familiya"
                    required
                  />
                </Field>
                <Field label="Telefon *">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputCls}
                    placeholder="+998 90 ..."
                    required
                  />
                </Field>
                <Field label="Manzil *" full>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={inputCls}
                    placeholder="Shahar, ko'cha, uy"
                    required
                  />
                </Field>
              </div>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold">To'lov turi</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { v: "cod", t: "Yetkazganda", d: "Naqd to'lov" },
                  { v: "online", t: "Onlayn to'lov", d: "Karta orqali (demo)" },
                ].map((p) => (
                  <label
                    key={p.v}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                      form.payment === p.v
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      value={p.v}
                      checked={form.payment === p.v}
                      onChange={() => setForm({ ...form, payment: p.v as any })}
                      className="sr-only"
                    />
                    <div className="font-medium">{p.t}</div>
                    <div className="text-xs text-muted-foreground">{p.d}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-card lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-semibold">Buyurtma</h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-auto">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 text-sm">
                  <img
                    src={it.product?.images[0]}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg object-cover bg-secondary/40"
                  />
                  <div className="flex-1">
                    <p className="line-clamp-1">{it.product?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.quantity} × {formatSom(it.product?.price ?? 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mahsulotlar</span>
                <span>{formatSom(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yetkazib berish</span>
                <span className="text-success">Bepul</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-semibold">
                <span>Jami</span>
                <span className="font-display text-xl">{formatSom(total)}</span>
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="mt-6 w-full" disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Buyurtma berish"}
            </Button>
            {!user && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Oxirida hisob yaratasiz
              </p>
            )}
          </aside>
        </form>
      </div>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {authMode === "signup" ? "Hisob yaratish" : "Hisobingizga kiring"}
            </DialogTitle>
            <DialogDescription>
              {authMode === "signup"
                ? "Buyurtmangizni kuzatish uchun hisob oching."
                : "Bu email allaqachon ro'yxatdan o'tgan. Parolingizni kiriting."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={finishWithAuth} className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className={inputCls}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </Field>
            <Field label="Parol">
              <input
                type="password"
                value={authPwd}
                onChange={(e) => setAuthPwd(e.target.value)}
                className={inputCls}
                placeholder="Kamida 6 belgi"
                required
              />
            </Field>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading
                ? "Yuklanmoqda..."
                : authMode === "signup"
                ? "Hisob ochish va buyurtma berish"
                : "Kirish va buyurtma berish"}
            </Button>
            <button
              type="button"
              onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
              className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {authMode === "signup"
                ? "Hisobim bor — kirish"
                : "Yangi hisob ochish"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary";
const Field = ({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) => (
  <label className={`block ${full ? "sm:col-span-2" : ""}`}>
    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </label>
);

export default Checkout;
