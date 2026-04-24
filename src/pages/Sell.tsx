import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, Clock, X, ShieldCheck } from "lucide-react";

const steps = [
  { n: "01", t: "Ariza yuboring", d: "Quyidagi formani to'ldiring va ariza yuboring." },
  { n: "02", t: "Admin ko'rib chiqadi", d: "Arizangiz 1-2 kun ichida tekshiriladi." },
  { n: "03", t: "Tasdiqlanasiz", d: "Tasdiqlangach sotuvchi paneli ochiladi." },
  { n: "04", t: "Mahsulot qo'shing", d: "Rasm va tavsif bilan mahsulotlaringizni joylang." },
  { n: "05", t: "Daromad oling", d: "Buyurtmalar tushadi va daromad to'planadi." },
];

const Sell = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [existing, setExisting] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    university: "",
    product_type: "",
    bio: "",
  });

  useEffect(() => {
    document.title = "Sotuvchi bo'lish — DTPI Market";
  }, []);

  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }
    (async () => {
      const [{ data: app }, { data: profile }] = await Promise.all([
        supabase
          .from("seller_applications")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);
      setExisting(app);
      if (profile) {
        setForm((f) => ({
          ...f,
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
          university: profile.university ?? "",
        }));
      }
      setLoaded(true);
    })();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name || !form.phone || !form.university || !form.product_type || !form.bio) {
      toast({ title: "Barcha maydonlarni to'ldiring", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("seller_applications").insert({
      user_id: user.id,
      ...form,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Ariza yuborildi",
      description: "Admin tasdiqini kuting. Sizga xabar beramiz.",
    });
    const { data } = await supabase
      .from("seller_applications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setExisting(data);
  };

  return (
    <Layout>
      <section className="bg-gradient-warm">
        <div className="container py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Talabalar uchun
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
            Hunaringizni <span className="italic text-primary">daromadga</span> aylantiring.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            DTPI talabasi sifatida o'z mahsulotlaringizni sotishni boshlang. Ariza tasdiqlanganidan keyin sotuvchi paneli ochiladi.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="font-display text-xl font-semibold text-primary">{s.n}</span>
              <h3 className="mt-2 font-display font-semibold">{s.t}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <div className="mx-auto max-w-2xl">
          {!loaded || loading ? (
            <p className="text-center text-muted-foreground">Yuklanmoqda...</p>
          ) : !user ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
              <h2 className="font-display text-2xl font-semibold">Avval tizimga kiring</h2>
              <p className="mt-2 text-muted-foreground">
                Sotuvchi bo'lish uchun hisob ochishingiz kerak.
              </p>
              <Button asChild variant="hero" className="mt-6">
                <Link to="/auth">Kirish / Ro'yxatdan o'tish</Link>
              </Button>
            </div>
          ) : existing ? (
            <StatusCard application={existing} onAdmin={() => navigate("/admin")} />
          ) : (
            <form
              onSubmit={submit}
              className="rounded-3xl border border-border bg-card p-8 shadow-soft md:p-10"
            >
              <h2 className="font-display text-2xl font-semibold">Sotuvchi arizasi</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ma'lumotlaringizni to'liq kiriting — admin ko'rib chiqadi.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <Label>To'liq ism</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Ism Familiya"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                  <div>
                    <Label>Universitet</Label>
                    <Input
                      value={form.university}
                      onChange={(e) => setForm({ ...form, university: e.target.value })}
                      placeholder="DTPI"
                    />
                  </div>
                </div>
                <div>
                  <Label>Mahsulot turi</Label>
                  <Input
                    value={form.product_type}
                    onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                    placeholder="Sopol idishlar, to'qilgan kiyim..."
                  />
                </div>
                <div>
                  <Label>O'zingiz va mahsulotingiz haqida</Label>
                  <Textarea
                    rows={5}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Nima ishlab chiqarasiz, qancha vaqtdan beri, qaysi materiallar ishlatasiz..."
                  />
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" disabled={submitting} className="mt-6 w-full">
                {submitting ? "Yuborilmoqda..." : "Arizani yuborish"}
              </Button>
            </form>
          )}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-3xl bg-foreground p-8 text-background md:p-10">
          <h2 className="font-display text-2xl font-semibold">Nimalarni sotish mumkin?</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {[
              "To'qilgan kiyim",
              "Sopol idishlar",
              "Charm buyumlar",
              "Ziynat va aksessuar",
              "Uy bezagi",
              "Daftar va kanstovar",
              "Shamlar va sovunlar",
              "Xushbo'y mahsulotlar",
              "Maxsus sovg'alar",
            ].map((x) => (
              <li key={x} className="flex items-center gap-2 text-sm text-background/85">
                <CheckCircle2 className="h-4 w-4 text-primary-glow" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
};

const StatusCard = ({
  application,
  onAdmin,
}: {
  application: any;
  onAdmin: () => void;
}) => {
  if (application.status === "approved") {
    return (
      <div className="rounded-3xl border border-success/30 bg-success/5 p-10 text-center shadow-soft">
        <ShieldCheck className="mx-auto h-12 w-12 text-success" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Tabriklaymiz! Sotuvchisiz</h2>
        <p className="mt-2 text-muted-foreground">
          Arizangiz tasdiqlangan. Endi mahsulot qo'shishingiz mumkin.
        </p>
        {application.admin_note && (
          <p className="mt-4 rounded-xl bg-card p-3 text-sm">
            <b>Admin izohi:</b> {application.admin_note}
          </p>
        )}
        <Button onClick={onAdmin} variant="hero" className="mt-6">
          Sotuvchi paneliga o'tish
        </Button>
      </div>
    );
  }
  if (application.status === "rejected") {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-10 text-center shadow-soft">
        <X className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Ariza rad etilgan</h2>
        {application.admin_note && (
          <p className="mt-4 rounded-xl bg-card p-4 text-sm text-left">
            <b>Sabab:</b> {application.admin_note}
          </p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          Qayta ariza yuborish uchun admin bilan bog'laning.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-accent bg-accent/20 p-10 text-center shadow-soft">
      <Clock className="mx-auto h-12 w-12 text-foreground" />
      <h2 className="mt-4 font-display text-2xl font-semibold">Arizangiz ko'rib chiqilmoqda</h2>
      <p className="mt-2 text-muted-foreground">
        Admin 1-2 kun ichida arizangizni tekshirib, javob beradi.
      </p>
      <div className="mt-6 rounded-xl bg-card p-4 text-left text-sm">
        <p>
          <b>Ariza:</b> {new Date(application.created_at).toLocaleDateString("uz-UZ")}
        </p>
        <p className="mt-1">
          <b>Mahsulot turi:</b> {application.product_type}
        </p>
      </div>
    </div>
  );
};

export default Sell;
