import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import type { CartItemRow, Product } from "@/types/db";
import { toast } from "sonner";

type CartCtx = {
  items: CartItemRow[];
  count: number;
  total: number;
  loading: boolean;
  addToCart: (product: Product, qty?: number) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<CartCtx | null>(null);
const GUEST_KEY = "dtpi_guest_cart";

type GuestEntry = { product_id: string; quantity: number };

const readGuest = (): GuestEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]");
  } catch {
    return [];
  }
};
const writeGuest = (list: GuestEntry[]) =>
  localStorage.setItem(GUEST_KEY, JSON.stringify(list));

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItemRow[]>([]);
  const [loading, setLoading] = useState(false);
  const merged = useRef(false);

  const refreshGuest = useCallback(async () => {
    const guest = readGuest();
    if (guest.length === 0) {
      setItems([]);
      return;
    }
    const ids = guest.map((g) => g.product_id);
    const { data } = await supabase.from("products").select("*").in("id", ids);
    const products = (data ?? []) as Product[];
    setItems(
      guest
        .map((g) => {
          const product = products.find((p) => p.id === g.product_id);
          if (!product) return null;
          return {
            id: `guest-${g.product_id}`,
            user_id: "guest",
            product_id: g.product_id,
            quantity: g.quantity,
            product,
          } as CartItemRow;
        })
        .filter(Boolean) as CartItemRow[]
    );
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      await refreshGuest();
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("*, product:products(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as any);
    setLoading(false);
  }, [user, refreshGuest]);

  // Merge guest cart into DB when user logs in
  useEffect(() => {
    if (authLoading) return;
    (async () => {
      if (user && !merged.current) {
        merged.current = true;
        const guest = readGuest();
        if (guest.length > 0) {
          const { data: existing } = await supabase
            .from("cart_items")
            .select("product_id, quantity, id")
            .eq("user_id", user.id);
          const existingMap = new Map(
            (existing ?? []).map((e: any) => [e.product_id, e])
          );
          for (const g of guest) {
            const exist: any = existingMap.get(g.product_id);
            if (exist) {
              await supabase
                .from("cart_items")
                .update({ quantity: exist.quantity + g.quantity })
                .eq("id", exist.id);
            } else {
              await supabase.from("cart_items").insert({
                user_id: user.id,
                product_id: g.product_id,
                quantity: g.quantity,
              });
            }
          }
          writeGuest([]);
        }
      }
      if (!user) merged.current = false;
      await refresh();
    })();
  }, [user, authLoading, refresh]);

  const addToCart = async (product: Product, qty = 1) => {
    if (!user) {
      const guest = readGuest();
      const idx = guest.findIndex((g) => g.product_id === product.id);
      if (idx >= 0) guest[idx].quantity += qty;
      else guest.push({ product_id: product.id, quantity: qty });
      writeGuest(guest);
      toast.success(`${product.name} savatga qo'shildi`);
      await refreshGuest();
      return;
    }
    const existing = items.find((i) => i.product_id === product.id);
    if (existing) {
      await updateQty(existing.id, existing.quantity + qty);
      return;
    }
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: product.id,
      quantity: qty,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${product.name} savatga qo'shildi`);
    refresh();
  };

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return removeItem(id);
    if (!user || id.startsWith("guest-")) {
      const productId = id.replace("guest-", "");
      const guest = readGuest();
      const idx = guest.findIndex((g) => g.product_id === productId);
      if (idx >= 0) {
        guest[idx].quantity = qty;
        writeGuest(guest);
        await refreshGuest();
      }
      return;
    }
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: qty })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh();
  };

  const removeItem = async (id: string) => {
    if (!user || id.startsWith("guest-")) {
      const productId = id.replace("guest-", "");
      writeGuest(readGuest().filter((g) => g.product_id !== productId));
      await refreshGuest();
      return;
    }
    await supabase.from("cart_items").delete().eq("id", id);
    refresh();
  };

  const clear = async () => {
    if (!user) {
      writeGuest([]);
      setItems([]);
      return;
    }
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);

  return (
    <Ctx.Provider
      value={{ items, count, total, loading, addToCart, updateQty, removeItem, clear, refresh }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
};
