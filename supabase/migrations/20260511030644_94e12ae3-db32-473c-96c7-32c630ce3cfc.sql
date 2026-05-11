-- 1) integration_logs: restrict to admins (mirror integrations policy)
DROP POLICY IF EXISTS integration_logs_tenant ON public.integration_logs;

CREATE POLICY "integration_logs_admin_select"
ON public.integration_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.integrations i
    WHERE i.id = integration_logs.integration_id
      AND i.tenant_id = public.current_tenant_id()
  )
  AND public.current_user_is_admin()
);

CREATE POLICY "integration_logs_admin_write"
ON public.integration_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.integrations i
    WHERE i.id = integration_logs.integration_id
      AND i.tenant_id = public.current_tenant_id()
  )
  AND public.current_user_is_admin()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.integrations i
    WHERE i.id = integration_logs.integration_id
      AND i.tenant_id = public.current_tenant_id()
  )
  AND public.current_user_is_admin()
);

-- 2) conversations: tighten INSERT WITH CHECK to also validate contact_id tenant ownership
DROP POLICY IF EXISTS conversations_tenant ON public.conversations;

CREATE POLICY "conversations_tenant"
ON public.conversations
FOR ALL
TO authenticated
USING (
  (
    (channel_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.channels c
      WHERE c.id = conversations.channel_id AND c.tenant_id = public.current_tenant_id()
    ))
    OR
    (channel_id IS NULL AND EXISTS (
      SELECT 1 FROM public.contacts ct
      WHERE ct.id = conversations.contact_id AND ct.tenant_id = public.current_tenant_id()
    ))
  )
  AND (
    public.current_user_is_admin()
    OR assigned_user_id = (SELECT u.id FROM public.users u WHERE u.auth_user_id = auth.uid() LIMIT 1)
    OR (
      assigned_user_id IS NULL
      AND (
        department_id IS NULL
        OR department_id = public.current_user_department_id()
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contacts ct
    WHERE ct.id = conversations.contact_id AND ct.tenant_id = public.current_tenant_id()
  )
  AND (
    channel_id IS NULL OR EXISTS (
      SELECT 1 FROM public.channels c
      WHERE c.id = conversations.channel_id AND c.tenant_id = public.current_tenant_id()
    )
  )
);