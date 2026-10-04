import { useState } from "react";
import { useNavigate, Navigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import Brand from "@/components/Brand";
import { errorMessage } from "@/lib/marketplace";

const emailSchema = z.string().trim().email("Emailni to‘g‘ri kiriting");
const passwordSchema = z.string().min(8, "Parol kamida 8 belgi bo‘lsin");
export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/account";
  const target = /^\/(?!\/)[^\\]*$/.test(next) ? next : "/account";
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  if (authLoading) return <div className="p-12 text-center">Yuklanmoqda...</div>;
  if (user) return <Navigate to={target} replace />;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (busy) return;
    const email = emailSchema.safeParse(form.email);
    if (!email.success) { toast.error(email.error.issues[0].message); return; }
    if (mode === "signup") { const password = passwordSchema.safeParse(form.password); if (!password.success) { toast.error(password.error.issues[0].message); return; } }
    if (mode === "login" && !form.password) { toast.error("Parolingizni kiriting"); return; }
    if (mode === "signup" && form.full_name.trim().length < 2) { toast.error("Ism kamida 2 belgi bo‘lsin"); return; }
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${window.location.origin}/account/security?reset=1` });
        if (error) toast.error(errorMessage(error)); else toast.success("Hisob mavjud bo‘lsa, parolni tiklash havolasi emailingizga yuborildi.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: email.data, password: form.password, options: { emailRedirectTo: `${window.location.origin}${target}`, data: { full_name: form.full_name.trim() } } });
        if (error) toast.error(errorMessage(error));
        else if (!data.session) { toast.success("Emailingizga tasdiqlash havolasi yuborildi. Havolani ochib, tizimga kiring."); setMode("login"); }
        else { toast.success("Xush kelibsiz!"); navigate(target); }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.data, password: form.password });
        if (error) toast.error(errorMessage(error)); else { toast.success("Xush kelibsiz!"); navigate(target); }
      }
    } catch { toast.error("Tarmoqqa ulanib bo‘lmadi. Qayta urinib ko‘ring."); }
    finally { setBusy(false); }
  };
  return <div className="flex min-h-screen items-center justify-center bg-gradient-warm p-5"><div className="w-full max-w-md"><div className="mb-8 flex justify-center"><Brand /></div><div className="rounded-3xl border bg-white p-7 shadow-card sm:p-9"><h1 className="text-2xl font-semibold">{mode === "login" ? "Tizimga kirish" : mode === "signup" ? "Ro‘yxatdan o‘tish" : "Parolni tiklash"}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{mode === "forgot" ? "Emailingizga parolni tiklash havolasini yuboramiz." : "Xaridlaringiz, sevimlilaringiz va buyurtmalaringiz bir hisobda."}</p><form onSubmit={submit} className="mt-6 space-y-5">
    {mode === "signup" && <Field label="Ism va familiya"><input autoComplete="name" maxLength={100} required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className={input} /></Field>}
    <Field label="Email"><input type="email" autoComplete="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={input} placeholder="ism@example.com" /></Field>
    {mode !== "forgot" && <Field label="Parol"><input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={input} placeholder="Kamida 8 belgi" /></Field>}
    {mode === "login" && <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">Parolni unutdingizmi?</button>}
    <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Yuklanmoqda..." : mode === "login" ? "Kirish" : mode === "signup" ? "Hisob yaratish" : "Havola yuborish"}</Button>
  </form><p className="mt-6 text-center text-xs text-muted-foreground">{mode === "signup" ? "Hisobingiz bormi?" : "Hisob yo‘qmi?"} <button disabled={busy} onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="text-primary hover:underline">{mode === "signup" ? "Kirish" : "Ro‘yxatdan o‘tish"}</button></p>{mode === "forgot" && <button onClick={() => setMode("login")} className="mt-4 w-full text-center text-xs text-primary">Kirishga qaytish</button>}</div><Link to="/catalog" className="mt-6 block text-center text-xs text-muted-foreground">Mahsulotlarni ko‘rish →</Link></div></div>;
}
const input = "mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-medium">{label}{children}</label>; }
