
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.email = (auth.jwt() ->> 'email') AND u.role = 'admin'
  )
$$;

-- USERS: prevent self role escalation
DROP POLICY IF EXISTS "users_self_update" ON public.users;
CREATE POLICY "users_self_update" ON public.users FOR UPDATE
  USING (email = (auth.jwt() ->> 'email'))
  WITH CHECK (
    email = (auth.jwt() ->> 'email')
    AND role = (SELECT u.role FROM public.users u WHERE u.email = (auth.jwt() ->> 'email'))
    AND tenant_id = (SELECT u.tenant_id FROM public.users u WHERE u.email = (auth.jwt() ->> 'email'))
  );

DROP POLICY IF EXISTS "users_admin_update" ON public.users;
CREATE POLICY "users_admin_update" ON public.users FOR UPDATE
  USING (tenant_id = public.current_tenant_id() AND public.current_user_is_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() AND public.current_user_is_admin());

-- TENANTS: admin-only updates, admin-only direct SELECT; safe view for others
DROP POLICY IF EXISTS "tenants_update_self" ON public.tenants;
CREATE POLICY "tenants_update_admin" ON public.tenants FOR UPDATE
  USING (id = public.current_tenant_id() AND public.current_user_is_admin())
  WITH CHECK (id = public.current_tenant_id() AND public.current_user_is_admin());

DROP POLICY IF EXISTS "tenants_select_self" ON public.tenants;
CREATE POLICY "tenants_select_admin" ON public.tenants FOR SELECT
  USING (id = public.current_tenant_id() AND public.current_user_is_admin());

DROP VIEW IF EXISTS public.tenants_safe;
CREATE VIEW public.tenants_safe WITH (security_invoker = true) AS
SELECT t.id, t.company_name, t.subdomain, t.status,
  CASE WHEN public.current_user_is_admin() THEN t.billing_email ELSE NULL END AS billing_email
FROM public.tenants t
WHERE t.id = public.current_tenant_id();
GRANT SELECT ON public.tenants_safe TO authenticated;

-- WEBHOOKS: admin-only access; safe view exposes everything except secret
DROP POLICY IF EXISTS "webhooks_tenant_all" ON public.webhooks;
DROP POLICY IF EXISTS "Allow all access to webhooks" ON public.webhooks;
CREATE POLICY "webhooks_admin_all" ON public.webhooks FOR ALL
  USING (tenant_id = public.current_tenant_id() AND public.current_user_is_admin())
  WITH CHECK (tenant_id = public.current_tenant_id() AND public.current_user_is_admin());

DROP VIEW IF EXISTS public.webhooks_safe;
CREATE VIEW public.webhooks_safe WITH (security_invoker = true) AS
SELECT w.id, w.tenant_id, w.url, w.events, w.status, w.created_at
FROM public.webhooks w
WHERE w.tenant_id = public.current_tenant_id();
GRANT SELECT ON public.webhooks_safe TO authenticated;

-- STORAGE: lock down flow-media bucket
UPDATE storage.buckets SET public = false WHERE id = 'flow-media';
DROP POLICY IF EXISTS "Anyone can view flow media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload flow media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update flow media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete flow media" ON storage.objects;

CREATE POLICY "flow_media_tenant_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'flow-media' AND (storage.foldername(name))[1] = public.current_tenant_id()::text);
CREATE POLICY "flow_media_tenant_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'flow-media' AND (storage.foldername(name))[1] = public.current_tenant_id()::text);
CREATE POLICY "flow_media_tenant_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'flow-media' AND (storage.foldername(name))[1] = public.current_tenant_id()::text);
CREATE POLICY "flow_media_tenant_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'flow-media' AND (storage.foldername(name))[1] = public.current_tenant_id()::text);

-- REALTIME: tenant-scoped topic subscriptions
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "realtime_tenant_topics" ON realtime.messages;
CREATE POLICY "realtime_tenant_topics" ON realtime.messages FOR SELECT TO authenticated
  USING ((realtime.topic()) LIKE (public.current_tenant_id()::text || '%'));
