import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

type FavoritesCtx = {
  ids: Set<string>;
  count: number;
  loading: boolean;
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string, name?: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<FavoritesCtx | null>(null);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id")
      .eq("user_id", user.id);
    if (!error && data) setIds(new Set(data.map((r) => r.product_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const isFavorite = (productId: string) => ids.has(productId);

  const toggle = async (productId: string, name?: string) => {
    if (!user) {
      toast.error("Tanlanganlarga qo'shish uchun tizimga kiring");
      return;
    }
    const exists = ids.has(productId);
    if (exists) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) { toast.error(error.message); return; }
      setIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id: productId });
      if (error) { toast.error(error.message); return; }
      setIds((prev) => new Set(prev).add(productId));
      if (name) toast.success(`${name} tanlanganlarga qo'shildi`);
    }
  };

  return (
    <Ctx.Provider value={{ ids, count: ids.size, loading, isFavorite, toggle, refresh }}>
      {children}
    </Ctx.Provider>
  );
};

export const useFavorites = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFavorites must be used within FavoritesProvider");
  return c;
};
