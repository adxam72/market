-- =================================================================
-- DTPI Market — Supabase migratsiya
-- Bu SQLni Supabase Dashboard → SQL Editor da ishlatish kerak
-- =================================================================

-- 1. support_tickets jadvali yaratish
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS yoqish
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Foydalanuvchi o'z ticketlarini ko'ra oladi
CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Foydalanuvchi ticket yarata oladi
CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin hamma ticketlarni ko'ra oladi
CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (public.has_role('admin', auth.uid()));

-- Admin ticketlarni yangilay oladi (javob berish)
CREATE POLICY "Admins can update tickets"
  ON public.support_tickets FOR UPDATE
  USING (public.has_role('admin', auth.uid()));

-- support_tickets jadvaliga profiles relation qo'shish (admin uchun)
-- Bu allaqachon foreign key orqali ishlaydi

-- 2. Admin rol berish — EMAIL bo'yicha
-- MUHIM: Bu SQL dan foydalanish uchun avval foydalanuvchi ro'yxatdan o'tgan bo'lishi kerak!

-- jurayevmirjalol71@gmail.com uchun
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'jurayevmirjalol71@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.users.id AND role = 'admin'
  );

-- adxam6819@gmail.com uchun
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'adxam6819@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.users.id AND role = 'admin'
  );

-- 3. Reviews jadvaliga foydalanuvchi faqat bir marta sharh yoza olishi uchun unique constraint
-- (Agar mavjud bo'lmasa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_product_unique'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_user_product_unique UNIQUE (user_id, product_id);
  END IF;
END $$;
