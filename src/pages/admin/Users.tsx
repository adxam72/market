import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Shield, Store, User as UserIcon, Pencil } from "lucide-react";

type Row = {
  id: string;
  full_name: string | null;
  phone: string | null;
  university: string | null;
  bio: string | null;
  is_verified_seller: boolean;
  created_at: string;
  roles: string[];
};

const AdminUsers = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", university: "", bio: "" });
  const [roleToAdd, setRoleToAdd] = useState<"admin" | "seller" | "">("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const byUser: Record<string, string[]> = {};
    (roles ?? []).forEach((r: any) => {
      byUser[r.user_id] = [...(byUser[r.user_id] ?? []), r.role];
    });
    setRows(
      (profiles ?? []).map((p: any) => ({ ...p, roles: byUser[p.id] ?? ["customer"] }))
    );
  };

  useEffect(() => { document.title = "Foydalanuvchilar — DTPI Admin"; load(); }, []);

  const openEdit = (r: Row) => {
    setEditing(r);
    setEditForm({ full_name: r.full_name ?? "", phone: r.phone ?? "", university: r.university ?? "", bio: r.bio ?? "" });
    setRoleToAdd("");
    setEditOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { error: profileErr } = await supabase.from("profiles").update({
      full_name: editForm.full_name || null,
      phone: editForm.phone || null,
      university: editForm.university || null,
      bio: editForm.bio || null,
    }).eq("id", editing.id);
    if (profileErr) { toast({ title: "Xatolik", description: profileErr.message, variant: "destructive" }); setSaving(false); return; }
    if (roleToAdd && !editing.roles.includes(roleToAdd)) {
      const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: editing.id, role: roleToAdd as any });
      if (roleErr) toast({ title: "Rol qo'shishda xatolik", description: roleErr.message, variant: "destructive" });
    }
    toast({ title: "Saqlandi" });
    setSaving(false);
    setEditOpen(false);
    load();
  };

  const removeRole = async (userId: string, role: string) => {
    if (!confirm(`"${role}" rolini olib tashlamoqchimisiz?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    if (error) { toast({ title: "Xatolik", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Rol olib tashlandi" });
    load();
  };

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return !s || (r.full_name ?? "").toLowerCase().includes(s) || (r.phone ?? "").includes(s) || (r.university ?? "").toLowerCase().includes(s);
  });

  return (
    <AdminLayout title="Foydalanuvchilar">
      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ism, telefon yoki universitet..." className="pl-9" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Foydalanuvchi</th>
              <th className="px-4 py-3 text-left">Telefon</th>
              <th className="px-4 py-3 text-left">Universitet</th>
              <th className="px-4 py-3 text-left">Rollar</th>
              <th className="px-4 py-3 text-left">Sana</th>
              <th className="px-4 py-3 text-left">Amal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">
                  {r.full_name ?? "—"}
                  {r.is_verified_seller && (
                    <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">✓ Sotuvchi</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.phone ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.university ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.roles.map((role) => (
                      <span key={role} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${role === "admin" ? "bg-primary/15 text-primary" : role === "seller" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>
                        {role === "admin" ? <Shield className="h-2.5 w-2.5" /> : role === "seller" ? <Store className="h-2.5 w-2.5" /> : <UserIcon className="h-2.5 w-2.5" />}
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                    <Pencil className="mr-1 h-3 w-3" /> Tahrir
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Hech narsa topilmadi.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Foydalanuvchini tahrirlash</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>To'liq ism</Label><Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Telefon</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
              <div><Label>Universitet</Label><Input value={editForm.university} onChange={(e) => setEditForm({ ...editForm, university: e.target.value })} /></div>
            </div>
            <div>
              <Label>Bio</Label>
              <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="min-h-[80px] w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <Label>Rollar</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {editing?.roles.map((role) => (
                  <span key={role} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${role === "admin" ? "bg-primary/15 text-primary" : role === "seller" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>
                    {role}
                    {role !== "customer" && (
                      <button onClick={() => { removeRole(editing.id, role); setEditOpen(false); }} className="ml-1 hover:text-destructive" title="Olib tashlash">×</button>
                    )}
                  </span>
                ))}
              </div>
              <div className="mt-3">
                <select value={roleToAdd} onChange={(e) => setRoleToAdd(e.target.value as any)} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary">
                  <option value="">Rol qo'shish...</option>
                  {!editing?.roles.includes("admin") && <option value="admin">Admin</option>}
                  {!editing?.roles.includes("seller") && <option value="seller">Sotuvchi</option>}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Bekor</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saqlanmoqda..." : "Saqlash"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
