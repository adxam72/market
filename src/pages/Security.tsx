import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { errorMessage } from "@/lib/marketplace";
export default function Security() {
  const { user, loading } = useAuth(); const [params, setParams] = useSearchParams();
  const [password, setPassword] = useState(""); const [repeat, setRepeat] = useState("");
  const [current, setCurrent] = useState(""); const [busy, setBusy] = useState(false);
  if (loading) return <Layout><p className="container py-16">Yuklanmoqda...</p></Layout>;
  if (!user) return <Navigate to="/auth?next=/account/security" replace />;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    if (password.length < 8) { toast.error("Parol kamida 8 belgi bo‘lsin"); return; }
    if (password !== repeat) { toast.error("Parollar bir xil emas"); return; }
    setBusy(true);
    if (!params.has("reset")) {
      const { error } = await supabase.auth.signInWithPassword({ email: user.email ?? "", password: current });
      if (error) { toast.error(errorMessage(error)); setBusy(false); return; }
    }
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast.error(errorMessage(error)); else { toast.success("Parol yangilandi"); setPassword(""); setRepeat(""); setCurrent(""); setParams({}); }
  };
  return <Layout><div className="container max-w-xl py-12"><Link to="/account" className="text-xs text-primary">← Profilga qaytish</Link><h1 className="mt-4 text-3xl font-semibold">Xavfsizlik</h1><form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border bg-white p-6">{!params.has("reset") && <label className="block text-xs">Joriy parol<input required type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} className="mt-2 h-11 w-full rounded-xl border px-3" /></label>}<label className="block text-xs">Yangi parol<input required type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border px-3" /></label><label className="block text-xs">Yangi parolni takrorlang<input required type="password" autoComplete="new-password" value={repeat} onChange={e => setRepeat(e.target.value)} className="mt-2 h-11 w-full rounded-xl border px-3" /></label><Button disabled={busy}>{busy ? "Saqlanmoqda..." : "Parolni yangilash"}</Button></form></div></Layout>;
}
