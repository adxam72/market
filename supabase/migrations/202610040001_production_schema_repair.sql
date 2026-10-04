-- Repair differences found in the existing DTPI production database.
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
DROP POLICY IF EXISTS "Users create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can read all support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update support tickets" ON public.support_tickets;

DROP TRIGGER IF EXISTS trg_seller_application_approval ON public.seller_applications;
CREATE TRIGGER trg_seller_application_approval BEFORE UPDATE ON public.seller_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_seller_application_approval();

CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS trg_orders_updated ON public.orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS trg_seller_applications_updated_at ON public.seller_applications;
CREATE TRIGGER trg_seller_applications_updated_at BEFORE UPDATE ON public.seller_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_support_updated BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
NOTIFY pgrst, 'reload schema';
