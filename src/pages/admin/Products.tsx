import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { formatSom } from "@/lib/format";
import { Plus, Pencil, Trash2, Upload, X, Search, Star } from "lucide-react";
import type { Category, Product } from "@/types/db";

const slugify = (s: string) =>
  s.toLowerCase().replace(/['ʻ`]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

type Form = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  compare_at_price: string;
  stock: string;
  category_id: string;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
};

const empty: Form = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  price: "",
  compare_at_price: "",
  stock: "10",
  category_id: "",
  images: [],
  is_featured: false,
  is_active: true,
};

const AdminProducts = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("display_order"),
    ]);
    setItems((p as any) ?? []);
    setCats((c as any) ?? []);
  };

  useEffect(() => {
    document.title = "Mahsulotlar — DTPI Admin";
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, sku: `SKU-${Date.now().toString().slice(-6)}` });
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description ?? "",
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      stock: String(p.stock),
      category_id: p.category_id ?? "",
      images: p.images ?? [],
      is_featured: p.is_featured,
      is_active: p.is_active,
    });
    setOpen(true);
  };

  const upload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) {
        toast({ title: "Yuklash xatosi", description: error.message, variant: "destructive" });
        continue;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (url: string) =>
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));

  const save = async () => {
    if (!form.name || !form.price) {
      toast({ title: "Nom va narx kerak", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      sku: form.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      description: form.description.trim() || null,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id || null,
      images: form.images,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Yangilandi" : "Qo'shildi" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Mahsulot o'chirilsinmi?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "O'chirildi" });
    load();
  };

  const filtered = items.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Mahsulotlar">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Yangi mahsulot
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <div key={p.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="relative aspect-square bg-secondary">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Rasm yo'q
                </div>
              )}
              {!p.is_active && (
                <span className="absolute left-2 top-2 rounded-full bg-destructive/90 px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  Faolsiz
                </span>
              )}
              {p.is_featured && (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  <Star className="h-2.5 w-2.5 fill-current" /> Tanlangan
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="truncate font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.sku} · {p.stock} dona</p>
              <p className="mt-2 font-display font-semibold">{formatSom(p.price)}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}>
                  <Pencil className="mr-1 h-3 w-3" /> Tahrir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            Mahsulotlar yo'q.
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Rasmlar</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.images.map((url) => (
                  <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removeImage(url)}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "..." : "Yuklash"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => upload(e.target.files)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Nom</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editing ? form.slug : slugify(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div>
                <Label>Narx (so'm)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <Label>Eski narx (chegirma uchun)</Label>
                <Input
                  type="number"
                  value={form.compare_at_price}
                  onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                />
              </div>
              <div>
                <Label>Ombor (dona)</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <div>
                <Label>Kategoriya</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Tavsif</Label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <span className="text-sm">Faol</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                />
                <span className="text-sm">Tanlangan</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Bekor
            </Button>
            <Button onClick={save}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
