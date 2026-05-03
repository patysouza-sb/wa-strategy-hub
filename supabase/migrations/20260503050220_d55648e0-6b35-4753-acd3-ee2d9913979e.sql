
DROP POLICY IF EXISTS users_admin_insert ON public.users;
DROP POLICY IF EXISTS users_admin_delete ON public.users;
CREATE POLICY users_admin_insert ON public.users FOR INSERT TO authenticated
  WITH CHECK (public.current_user_is_admin() AND tenant_id = public.current_tenant_id());
CREATE POLICY users_admin_delete ON public.users FOR DELETE TO authenticated
  USING (public.current_user_is_admin() AND tenant_id = public.current_tenant_id());

CREATE OR REPLACE FUNCTION public.prevent_user_privilege_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.current_user_is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
      RAISE EXCEPTION 'Not allowed to modify privileged fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS users_prevent_privilege_escalation ON public.users;
CREATE TRIGGER users_prevent_privilege_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_privilege_escalation();

DROP POLICY IF EXISTS conversations_tenant ON public.conversations;
CREATE POLICY conversations_tenant ON public.conversations FOR ALL TO authenticated
  USING (
    (
      (channel_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.channels c WHERE c.id = conversations.channel_id AND c.tenant_id = public.current_tenant_id()
      ))
      OR (channel_id IS NULL AND EXISTS (
        SELECT 1 FROM public.contacts ct WHERE ct.id = conversations.contact_id AND ct.tenant_id = public.current_tenant_id()
      ))
    )
    AND (
      public.current_user_is_admin()
      OR conversations.assigned_user_id IS NULL
      OR conversations.assigned_user_id = (SELECT u.id FROM public.users u WHERE u.auth_user_id = auth.uid() LIMIT 1)
    )
  )
  WITH CHECK (
    (channel_id IS NULL OR EXISTS (
      SELECT 1 FROM public.channels c WHERE c.id = conversations.channel_id AND c.tenant_id = public.current_tenant_id()
    ))
  );

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['broadcasts','campaigns','ai_agents'] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I_subscription_write ON public.%I', t, t);
      EXECUTE format('DROP POLICY IF EXISTS %I_subscription_update ON public.%I', t, t);
      EXECUTE format('CREATE POLICY %I_subscription_write ON public.%I FOR INSERT TO authenticated WITH CHECK (public.current_user_subscription_active())', t, t);
      EXECUTE format('CREATE POLICY %I_subscription_update ON public.%I FOR UPDATE TO authenticated USING (public.current_user_subscription_active()) WITH CHECK (public.current_user_subscription_active())', t, t);
    END IF;
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.current_tenant_id() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_user_is_admin() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_user_subscription_active() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_subscription_active() TO authenticated;
