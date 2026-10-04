-- Repair the optional historical support migration if it previously failed.
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL, message text NOT NULL, product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text, status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','closed')),
  admin_reply text, replied_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'open' AND admin_reply IS NULL AND replied_at IS NULL);
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (length(label) BETWEEN 1 AND 60),
  full_name text NOT NULL CHECK (length(full_name) BETWEEN 2 AND 100),
  phone text NOT NULL CHECK (phone ~ '^\+998[0-9]{9}$'),
  region text NOT NULL, district text NOT NULL CHECK (length(district) BETWEEN 2 AND 100),
  street text NOT NULL CHECK (length(street) BETWEEN 3 AND 250),
  landmark text NOT NULL DEFAULT '' CHECK (length(landmark) <= 100),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX addresses_user ON public.addresses(user_id);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own addresses" ON public.addresses FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins moderate reviews" ON public.reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PostgREST needs a direct relation for the admin's ticket/profile join.
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_profile_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Public catalog rows contain only the seller's display name. Buyer phone numbers,
-- universities and personal profile fields are private to the buyer and admins.
ALTER TABLE public.products ADD COLUMN seller_name text;
UPDATE public.products p SET seller_name = s.full_name FROM public.profiles s WHERE p.seller_id = s.id;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Own profile and admin read" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.fill_product_seller_name() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  SELECT full_name INTO NEW.seller_name FROM public.profiles WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER fill_product_seller_name BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.fill_product_seller_name();
CREATE OR REPLACE FUNCTION public.sync_seller_display_name() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.products SET seller_name = NEW.full_name WHERE seller_id = NEW.id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER sync_seller_display_name AFTER UPDATE OF full_name ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_seller_display_name();
NOTIFY pgrst, 'reload schema';
