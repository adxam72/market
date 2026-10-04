-- DTPI Market: transactional checkout and seller isolation.
-- Existing products and orders are preserved. Apply before deploying the new UI.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS checkout_key uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS inventory_reserved boolean NOT NULL DEFAULT false;
ALTER TABLE public.seller_applications DROP CONSTRAINT IF EXISTS seller_applications_status_check;
ALTER TABLE public.seller_applications ADD CONSTRAINT seller_applications_status_check
  CHECK (status IN ('pending','approved','rejected','blocked'));
CREATE UNIQUE INDEX IF NOT EXISTS orders_checkout_key ON public.orders(user_id, checkout_key);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code text;
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE,
  percent integer NOT NULL CHECK (percent BETWEEN 1 AND 50),
  min_total numeric(12,2) NOT NULL DEFAULT 0 CHECK (min_total >= 0),
  max_discount numeric(12,2) NOT NULL CHECK (max_discount > 0),
  expires_at timestamptz NOT NULL, usage_limit integer NOT NULL CHECK (usage_limit > 0),
  used integer NOT NULL DEFAULT 0 CHECK (used >= 0), is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'pending'
  CHECK (fulfillment_status IN ('pending','confirmed','preparing','shipped','delivered','cancelled'));
UPDATE public.order_items i SET fulfillment_status = o.status::text
  FROM public.orders o WHERE i.order_id = o.id AND o.checkout_key IS NULL;
CREATE INDEX IF NOT EXISTS order_items_seller_order ON public.order_items(seller_id, order_id);
CREATE INDEX IF NOT EXISTS orders_user_created ON public.orders(user_id, created_at DESC);

-- A buyer must never approve their own application or grant verification.
DROP POLICY IF EXISTS "Own application update while pending" ON public.seller_applications;
DROP POLICY IF EXISTS "Own application insert" ON public.seller_applications;
CREATE POLICY "Own pending application insert" ON public.seller_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending' AND admin_note IS NULL AND reviewed_by IS NULL AND reviewed_at IS NULL);
CREATE OR REPLACE FUNCTION public.protect_profile_verification() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.is_verified_seller IS DISTINCT FROM OLD.is_verified_seller
     AND current_user = 'authenticated' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Sotuvchi holatini faqat admin o‘zgartirishi mumkin';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_profile_verification BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_verification();
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users insert unverified profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND is_verified_seller = false);

-- Removing approval also revokes the seller role. The admin policy owns this change.
CREATE OR REPLACE FUNCTION public.handle_seller_application_approval() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'approved' THEN
      INSERT INTO public.user_roles(user_id, role) VALUES (NEW.user_id, 'seller') ON CONFLICT DO NOTHING;
    ELSE
      DELETE FROM public.user_roles WHERE user_id = NEW.user_id AND role = 'seller';
      UPDATE public.products SET is_active = false WHERE seller_id = NEW.user_id;
    END IF;
    UPDATE public.profiles SET is_verified_seller = (NEW.status = 'approved') WHERE id = NEW.user_id;
    NEW.reviewed_at = now(); NEW.reviewed_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE POLICY "Sellers read own products" ON public.products FOR SELECT TO authenticated
  USING (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'));
CREATE POLICY "Sellers insert own products" ON public.products FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller') AND is_featured = false AND rating_avg = 0 AND rating_count = 0);
CREATE POLICY "Sellers update own products" ON public.products FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'))
  WITH CHECK (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'));
CREATE POLICY "Sellers delete own products" ON public.products FOR DELETE TO authenticated
  USING (seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'));
CREATE OR REPLACE FUNCTION public.protect_product_metrics() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user = 'authenticated' AND NOT public.has_role(auth.uid(), 'admin')
    AND (NEW.seller_id IS DISTINCT FROM OLD.seller_id OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
      OR NEW.rating_avg IS DISTINCT FROM OLD.rating_avg OR NEW.rating_count IS DISTINCT FROM OLD.rating_count) THEN
    RAISE EXCEPTION 'Bu maydonlarni o‘zgartirishga ruxsat yo‘q';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_product_metrics BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.protect_product_metrics();

-- Only verified purchases can write reviews. Rating is derived, never supplied by a seller.
DROP POLICY IF EXISTS "Auth users post reviews" ON public.reviews;
CREATE POLICY "Delivered buyers post reviews" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.order_items i JOIN public.orders o ON o.id = i.order_id
    WHERE i.product_id = reviews.product_id AND o.user_id = auth.uid()
      AND (o.status = 'delivered' OR i.fulfillment_status = 'delivered')));
CREATE OR REPLACE FUNCTION public.refresh_product_rating() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE pid uuid;
BEGIN
  pid := CASE WHEN TG_OP = 'DELETE' THEN OLD.product_id ELSE NEW.product_id END;
  UPDATE public.products SET rating_avg = COALESCE((SELECT avg(rating) FROM public.reviews WHERE product_id = pid), 0),
    rating_count = (SELECT count(*) FROM public.reviews WHERE product_id = pid) WHERE id = pid;
  RETURN NULL;
END;
$$;
CREATE TRIGGER refresh_product_rating AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_product_rating();
CREATE OR REPLACE FUNCTION public.protect_review_identity() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF NEW.product_id IS DISTINCT FROM OLD.product_id OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Sharh egasi va mahsulotini o‘zgartirish mumkin emas';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_review_identity BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.protect_review_identity();

-- No direct browser inserts: all prices, stock and ownership are checked inside one transaction.
DROP POLICY IF EXISTS "Own orders insert" ON public.orders;
DROP POLICY IF EXISTS "Order items insert" ON public.order_items;
CREATE OR REPLACE FUNCTION public.place_order(
  p_items jsonb, p_name text, p_phone text, p_address text, p_checkout_key uuid, p_coupon text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  uid uuid := auth.uid(); oid uuid; item record; prod public.products%ROWTYPE;
  amount numeric := 0; item_count integer; coupon public.coupons%ROWTYPE; discount_amount numeric := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Avval tizimga kiring'; END IF;
  IF p_checkout_key IS NULL THEN RAISE EXCEPTION 'Buyurtma kaliti kerak'; END IF;
  -- Serialize retries for the same user/key; a lost response never creates a second order.
  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || p_checkout_key::text, 0));
  SELECT id INTO oid FROM public.orders WHERE user_id = uid AND checkout_key = p_checkout_key;
  IF oid IS NOT NULL THEN RETURN oid; END IF;
  IF p_name IS NULL OR length(trim(p_name)) NOT BETWEEN 2 AND 100
    OR p_phone IS NULL OR p_phone !~ '^\+998[0-9]{9}$'
    OR p_address IS NULL OR length(trim(p_address)) NOT BETWEEN 5 AND 500 THEN
    RAISE EXCEPTION 'Aloqa ma’lumotlari yoki manzil noto‘g‘ri';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN RAISE EXCEPTION 'Savatcha noto‘g‘ri'; END IF;
  item_count := jsonb_array_length(p_items);
  IF item_count NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Savatchada 1–100 mahsulot bo‘lishi kerak'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) v WHERE
    jsonb_typeof(v->'quantity') IS DISTINCT FROM 'number' OR (v->>'quantity')::numeric NOT BETWEEN 1 AND 999
    OR (v->>'quantity')::numeric <> trunc((v->>'quantity')::numeric) OR v->>'product_id' IS NULL) THEN
    RAISE EXCEPTION 'Mahsulot miqdori noto‘g‘ri';
  END IF;
  -- Sorted locks prevent deadlocks across carts. Duplicate entries are aggregated.
  FOR item IN SELECT (v->>'product_id')::uuid AS product_id, sum((v->>'quantity')::integer)::integer AS quantity
    FROM jsonb_array_elements(p_items) v GROUP BY 1 ORDER BY 1 LOOP
    SELECT * INTO prod FROM public.products WHERE id = item.product_id FOR UPDATE;
    IF NOT FOUND OR NOT prod.is_active THEN RAISE EXCEPTION 'Mahsulot sotuvda mavjud emas'; END IF;
    IF item.quantity > prod.stock OR item.quantity > 999 THEN RAISE EXCEPTION 'Omborda yetarli mahsulot yo‘q: %', prod.name; END IF;
    amount := amount + prod.price * item.quantity;
  END LOOP;
  IF nullif(trim(p_coupon), '') IS NOT NULL THEN
    SELECT * INTO coupon FROM public.coupons WHERE code = upper(trim(p_coupon)) FOR UPDATE;
    IF NOT FOUND OR NOT coupon.is_active OR coupon.expires_at <= now() OR coupon.used >= coupon.usage_limit THEN
      RAISE EXCEPTION 'Promo kod yaroqsiz yoki muddati tugagan';
    END IF;
    IF amount < coupon.min_total THEN RAISE EXCEPTION 'Promo kod uchun buyurtma summasi yetarli emas'; END IF;
    discount_amount := least(round(amount * coupon.percent / 100, 2), coupon.max_discount);
    UPDATE public.coupons SET used = used + 1 WHERE id = coupon.id;
  END IF;
  INSERT INTO public.orders(user_id, total, shipping_name, shipping_phone, shipping_address, payment_method, checkout_key, discount, coupon_code, inventory_reserved)
    VALUES(uid, amount - discount_amount, trim(p_name), p_phone, trim(p_address), 'cod', p_checkout_key, discount_amount, coupon.code, true) RETURNING id INTO oid;
  FOR item IN SELECT (v->>'product_id')::uuid AS product_id, sum((v->>'quantity')::integer)::integer AS quantity
    FROM jsonb_array_elements(p_items) v GROUP BY 1 ORDER BY 1 LOOP
    SELECT * INTO prod FROM public.products WHERE id = item.product_id;
    INSERT INTO public.order_items(order_id, product_id, product_name, unit_price, quantity, seller_id)
      VALUES(oid, prod.id, prod.name, prod.price, item.quantity, prod.seller_id);
    UPDATE public.products SET stock = stock - item.quantity WHERE id = prod.id;
  END LOOP;
  DELETE FROM public.cart_items WHERE user_id = uid AND product_id IN
    (SELECT (v->>'product_id')::uuid FROM jsonb_array_elements(p_items) v);
  RETURN oid;
END;
$$;
REVOKE ALL ON FUNCTION public.place_order(jsonb,text,text,text,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb,text,text,text,uuid,text) TO authenticated;

-- Sellers get only their own line items, not other sellers' products or order totals.
CREATE OR REPLACE FUNCTION public.seller_orders() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'seller') THEN RAISE EXCEPTION 'Sotuvchi huquqi kerak'; END IF;
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM (
    SELECT i.id, i.order_id, i.product_name, i.quantity, i.unit_price, i.fulfillment_status,
      o.order_number, o.shipping_name, o.shipping_phone, o.shipping_address, o.created_at
    FROM public.order_items i JOIN public.orders o ON o.id = i.order_id
    WHERE i.seller_id = auth.uid() ORDER BY o.created_at DESC) t), '[]'::jsonb);
END;
$$;
REVOKE ALL ON FUNCTION public.seller_orders() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seller_orders() TO authenticated;

CREATE OR REPLACE FUNCTION public.update_fulfillment(p_item_id uuid, p_status text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE line public.order_items%ROWTYPE; parent public.orders%ROWTYPE;
BEGIN
  SELECT * INTO line FROM public.order_items WHERE id = p_item_id;
  IF NOT FOUND OR NOT (public.has_role(auth.uid(), 'admin') OR
    (line.seller_id = auth.uid() AND public.has_role(auth.uid(), 'seller'))) THEN
    RAISE EXCEPTION 'Bu buyurtmani o‘zgartirishga ruxsat yo‘q';
  END IF;
  -- Always lock the parent first to serialize different sellers of the same order.
  SELECT * INTO parent FROM public.orders WHERE id = line.order_id FOR UPDATE;
  SELECT * INTO line FROM public.order_items WHERE id = p_item_id FOR UPDATE;
  IF parent.status IN ('cancelled','delivered') THEN RAISE EXCEPTION 'Buyurtma yakunlangan'; END IF;
  IF NOT ((line.fulfillment_status = 'pending' AND p_status IN ('confirmed','cancelled'))
    OR (line.fulfillment_status = 'confirmed' AND p_status IN ('preparing','cancelled'))
    OR (line.fulfillment_status = 'preparing' AND p_status IN ('shipped','cancelled'))
    OR (line.fulfillment_status = 'shipped' AND p_status = 'delivered')) THEN
    RAISE EXCEPTION 'Buyurtma holatini bu tartibda o‘zgartirish mumkin emas';
  END IF;
  UPDATE public.order_items SET fulfillment_status = p_status WHERE id = line.id;
  IF p_status = 'cancelled' AND parent.inventory_reserved THEN
    UPDATE public.products SET stock = stock + line.quantity WHERE id = line.product_id;
  END IF;
  UPDATE public.orders SET status = CASE
    WHEN NOT EXISTS (SELECT 1 FROM public.order_items WHERE order_id = line.order_id AND fulfillment_status <> 'cancelled') THEN 'cancelled'::public.order_status
    WHEN NOT EXISTS (SELECT 1 FROM public.order_items WHERE order_id = line.order_id AND fulfillment_status NOT IN ('delivered','cancelled')) THEN 'delivered'::public.order_status
    WHEN NOT EXISTS (SELECT 1 FROM public.order_items WHERE order_id = line.order_id AND fulfillment_status NOT IN ('shipped','delivered','cancelled')) THEN 'shipped'::public.order_status
    ELSE 'confirmed'::public.order_status END WHERE id = line.order_id;
END;
$$;
REVOKE ALL ON FUNCTION public.update_fulfillment(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_fulfillment(uuid,text) TO authenticated;

-- Admin cancellation returns inventory once, including existing orders.
CREATE OR REPLACE FUNCTION public.sync_order_cancellation() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE line record;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status <> 'cancelled' THEN
    FOR line IN SELECT * FROM public.order_items WHERE order_id = NEW.id AND fulfillment_status <> 'cancelled' FOR UPDATE LOOP
      IF NEW.inventory_reserved THEN UPDATE public.products SET stock = stock + line.quantity WHERE id = line.product_id; END IF;
      UPDATE public.order_items SET fulfillment_status = 'cancelled' WHERE id = line.id;
    END LOOP;
  ELSIF OLD.status IN ('cancelled','delivered') AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Yakunlangan buyurtmani qayta ochish mumkin emas';
  ELSIF NEW.status IN ('confirmed','shipped','delivered') AND NEW.status <> OLD.status THEN
    UPDATE public.order_items SET fulfillment_status = NEW.status::text
      WHERE order_id = NEW.id AND fulfillment_status NOT IN ('cancelled','delivered');
  END IF;
  RETURN NEW;
END;
$$;
-- Only cancel here; fulfillment RPC already computes individual line statuses.
CREATE TRIGGER sync_order_cancellation BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW WHEN (NEW.status = 'cancelled' OR OLD.status IN ('cancelled','delivered'))
  EXECUTE FUNCTION public.sync_order_cancellation();

DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE OR REPLACE FUNCTION public.set_order_status(p_order_id uuid, p_status public.order_status) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE parent public.orders%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Admin huquqi kerak'; END IF;
  SELECT * INTO parent FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Buyurtma topilmadi'; END IF;
  IF parent.status = p_status THEN RETURN; END IF;
  IF NOT ((parent.status = 'pending' AND p_status IN ('confirmed','cancelled'))
    OR (parent.status = 'confirmed' AND p_status IN ('shipped','cancelled'))
    OR (parent.status = 'shipped' AND p_status = 'delivered')) THEN
    RAISE EXCEPTION 'Buyurtma holatini bu tartibda o‘zgartirish mumkin emas';
  END IF;
  UPDATE public.orders SET status = p_status WHERE id = p_order_id;
  IF p_status <> 'cancelled' THEN
    UPDATE public.order_items SET fulfillment_status = p_status::text
      WHERE order_id = p_order_id AND fulfillment_status NOT IN ('cancelled','delivered');
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.set_order_status(uuid,public.order_status) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_order_status(uuid,public.order_status) TO authenticated;
