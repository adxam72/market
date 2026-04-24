import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import logoImg from "@/assets/logo.png";

const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgi"),
});

const signupSchema = z.object({
  full_name: z.string().min(2, "Ism kamida 2 belgi"),
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgi"),
});

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      const parsed = signupSchema.safeParse(form);
      if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    } else {
      const parsed = loginSchema.safeParse(form);
      if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    }
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: form.full_name },
        },
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Xush kelibsiz!");
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Xush kelibsiz!");
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-warm p-6 paper-texture">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <img src={logoImg} alt="DTPI Market" className="h-10 w-10 rounded-full object-cover shadow-warm" />
          <span className="font-display text-2xl font-semibold">
            DTPI <span className="text-primary">Market</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <h1 className="font-display text-2xl font-semibold">
            {mode === "login" ? "Xush kelibsiz" : "Hisob yarating"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Email va parol bilan kiring" : "Ismingiz, email va parol yetarli"}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <Field label="To'liq ism">
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={inputCls}
                  placeholder="Ism Familiya"
                  required
                  autoFocus
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
                placeholder="you@example.com"
                required
                autoFocus={mode === "login"}
              />
            </Field>
            <Field label="Parol">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputCls}
                placeholder="••••••••"
                required
              />
            </Field>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Yuklanmoqda..." : mode === "login" ? "Kirish" : "Hisob yaratish"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Hisob yo'qmi?" : "Hisobingiz bormi?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "login" ? "Ro'yxatdan o'tish" : "Kirish"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const inputCls =
  "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </label>
);

export default Auth;
