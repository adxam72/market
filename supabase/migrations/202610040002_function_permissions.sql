-- Supabase grants EXECUTE directly to API roles by default; remove those grants.
REVOKE ALL ON FUNCTION public.place_order(jsonb,text,text,text,uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.seller_orders() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_fulfillment(uuid,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_order_status(uuid,public.order_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb,text,text,text,uuid,text), public.seller_orders(),
  public.update_fulfillment(uuid,text), public.set_order_status(uuid,public.order_status) TO authenticated;
REVOKE ALL ON FUNCTION public.fill_product_seller_name(), public.handle_new_user(),
  public.handle_seller_application_approval(), public.refresh_product_rating(),
  public.sync_order_cancellation(), public.sync_seller_display_name(),
  public.protect_product_metrics(), public.protect_profile_verification(),
  public.protect_review_identity(), public.update_updated_at() FROM PUBLIC, anon, authenticated;
NOTIFY pgrst, 'reload schema';
