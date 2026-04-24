import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/db";
import { toast } from "sonner";

const Account = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Profil — DTPI Market";
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile(data as Profile);
    });
  }, [user]);

  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) return <Layout><div className="container py-20 text-center text-muted-foreground">Yuklanmoqda...</div></Layout>;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      university: profile.university,
      phone: profile.phone,
      bio: profile.bio,
    }).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Saqlandi");
    setSaving(false);
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold md:text-4xl">Profilim</h1>
          <Button variant="outline" asChild><Link to="/account/orders">Buyurtmalarim</Link></Button>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><input value={user.email ?? ""} disabled className={`${inputCls} opacity-60`} /></Field>
            <Field label="Telefon"><input value={profile.phone ?? ""} onChange={e => setProfile({...profile, phone: e.target.value})} className={inputCls} placeholder="+998 ..." /></Field>
            <Field label="To'liq ism" full><input value={profile.full_name ?? ""} onChange={e => setProfile({...profile, full_name: e.target.value})} className={inputCls} /></Field>
            <Field label="Universitet" full><input value={profile.university ?? ""} onChange={e => setProfile({...profile, university: e.target.value})} className={inputCls} placeholder="DTPI" /></Field>
            <Field label="Bio" full><textarea value={profile.bio ?? ""} onChange={e => setProfile({...profile, bio: e.target.value})} className={`${inputCls} min-h-[100px] py-2.5`} placeholder="O'zingiz haqingizda..." /></Field>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="hero" onClick={save} disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
            <Button variant="outline" onClick={signOut}>Chiqish</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const inputCls = "h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary";
const Field = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <label className={`block ${full ? "sm:col-span-2" : ""}`}>
    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </label>
);

export default Account;
