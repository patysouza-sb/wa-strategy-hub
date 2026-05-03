
DROP POLICY IF EXISTS tenant_select ON public.api_keys;
DROP POLICY IF EXISTS tenant_insert ON public.api_keys;
DROP POLICY IF EXISTS tenant_update ON public.api_keys;
DROP POLICY IF EXISTS tenant_delete ON public.api_keys;
CREATE POLICY api_keys_admin_select ON public.api_keys FOR SELECT
  USING (tenant_id = current_tenant_id() AND current_user_is_admin());
CREATE POLICY api_keys_admin_write ON public.api_keys FOR ALL
  USING (tenant_id = current_tenant_id() AND current_user_is_admin())
  WITH CHECK (tenant_id = current_tenant_id() AND current_user_is_admin());

DROP POLICY IF EXISTS subscription_events_select ON public.subscription_events;
CREATE POLICY subscription_events_admin_select ON public.subscription_events FOR SELECT
  USING (tenant_id = current_tenant_id() AND current_user_is_admin());

-- Strengthen users self-update: lock immutable identity fields
DROP POLICY IF EXISTS users_self_update ON public.users;
CREATE POLICY users_self_update ON public.users FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (
    auth_user_id = auth.uid()
    AND tenant_id  = (SELECT u.tenant_id  FROM public.users u WHERE u.auth_user_id = auth.uid())
    AND role       = (SELECT u.role       FROM public.users u WHERE u.auth_user_id = auth.uid())
    AND team_id   IS NOT DISTINCT FROM (SELECT u.team_id       FROM public.users u WHERE u.auth_user_id = auth.uid())
    AND department_id IS NOT DISTINCT FROM (SELECT u.department_id FROM public.users u WHERE u.auth_user_id = auth.uid())
    AND email      = (SELECT u.email      FROM public.users u WHERE u.auth_user_id = auth.uid())
  );
