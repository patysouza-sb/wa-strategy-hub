
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.users u
SET auth_user_id = au.id
FROM auth.users au
WHERE u.auth_user_id IS NULL AND lower(u.email) = lower(au.email);

CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.tenant_id FROM public.users u WHERE u.auth_user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.role = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.current_user_subscription_active()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    JOIN public.users u ON u.tenant_id = s.tenant_id
    WHERE u.auth_user_id = auth.uid()
      AND s.status = 'active' AND s.blocked_at IS NULL
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID; v_starter_id UUID; v_company TEXT; v_subdomain TEXT;
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, avatar_url)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url')
  ON CONFLICT (user_id) DO NOTHING;

  v_company := COALESCE(NEW.raw_user_meta_data ->> 'company_name', split_part(NEW.email, '@', 1));
  v_subdomain := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '', 'g')) || '-' || substr(NEW.id::text, 1, 6);

  INSERT INTO public.tenants (company_name, subdomain, billing_email, status)
  VALUES (v_company, v_subdomain, NEW.email, 'active')
  RETURNING id INTO v_tenant_id;

  INSERT INTO public.users (tenant_id, auth_user_id, name, email, role)
  VALUES (v_tenant_id, NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email, 'admin');

  SELECT id INTO v_starter_id FROM public.plans WHERE slug = 'starter' LIMIT 1;

  INSERT INTO public.subscriptions (
    tenant_id, plan_name, plan_id, status, is_trial,
    expires_at, current_period_end, max_whatsapp_instances, max_ai_agent_tokens
  ) VALUES (
    v_tenant_id, 'Starter (Trial)', v_starter_id, 'active', true,
    now() + interval '7 days', now() + interval '7 days', 1, 0
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.current_tenant_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_subscription_active() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_subscription_active() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS users_self_update ON public.users;
CREATE POLICY users_self_update ON public.users FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (
    auth_user_id = auth.uid()
    AND role = (SELECT u.role FROM public.users u WHERE u.auth_user_id = auth.uid())
    AND tenant_id = (SELECT u.tenant_id FROM public.users u WHERE u.auth_user_id = auth.uid())
  );

CREATE POLICY tenants_no_insert ON public.tenants FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY tenants_no_delete ON public.tenants FOR DELETE TO authenticated USING (false);

DROP POLICY IF EXISTS tenant_select ON public.subscriptions;
DROP POLICY IF EXISTS tenant_insert ON public.subscriptions;
DROP POLICY IF EXISTS tenant_update ON public.subscriptions;
DROP POLICY IF EXISTS tenant_delete ON public.subscriptions;
CREATE POLICY subscriptions_admin_select ON public.subscriptions FOR SELECT
  USING (tenant_id = current_tenant_id() AND current_user_is_admin());
CREATE POLICY subscriptions_admin_write ON public.subscriptions FOR ALL
  USING (tenant_id = current_tenant_id() AND current_user_is_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND current_user_is_admin());

DROP POLICY IF EXISTS tenant_select ON public.channels;
DROP POLICY IF EXISTS tenant_insert ON public.channels;
DROP POLICY IF EXISTS tenant_update ON public.channels;
DROP POLICY IF EXISTS tenant_delete ON public.channels;
CREATE POLICY channels_admin_select ON public.channels FOR SELECT
  USING (tenant_id = current_tenant_id() AND current_user_is_admin());
CREATE POLICY channels_admin_write ON public.channels FOR ALL
  USING (tenant_id = current_tenant_id() AND current_user_is_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND current_user_is_admin());

DROP POLICY IF EXISTS tenant_select ON public.webhooks;
DROP POLICY IF EXISTS tenant_insert ON public.webhooks;
DROP POLICY IF EXISTS tenant_update ON public.webhooks;
DROP POLICY IF EXISTS tenant_delete ON public.webhooks;

DROP POLICY IF EXISTS tenant_select ON public.integrations;
DROP POLICY IF EXISTS tenant_insert ON public.integrations;
DROP POLICY IF EXISTS tenant_update ON public.integrations;
DROP POLICY IF EXISTS tenant_delete ON public.integrations;
CREATE POLICY integrations_admin_select ON public.integrations FOR SELECT
  USING (tenant_id = current_tenant_id() AND current_user_is_admin());
CREATE POLICY integrations_admin_write ON public.integrations FOR ALL
  USING (tenant_id = current_tenant_id() AND current_user_is_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND current_user_is_admin());

CREATE POLICY subscription_events_no_insert ON public.subscription_events FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY subscription_events_no_update ON public.subscription_events FOR UPDATE TO authenticated USING (false);
CREATE POLICY subscription_events_no_delete ON public.subscription_events FOR DELETE TO authenticated USING (false);
