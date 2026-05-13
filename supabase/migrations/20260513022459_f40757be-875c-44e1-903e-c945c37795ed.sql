
-- 1) messages_tenant: aplicar mesmo escopo de conversations_tenant
DROP POLICY IF EXISTS messages_tenant ON public.messages;

CREATE POLICY messages_tenant ON public.messages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations c
    LEFT JOIN public.channels ch ON ch.id = c.channel_id
    LEFT JOIN public.contacts co ON co.id = c.contact_id
    WHERE c.id = messages.conversation_id
      AND COALESCE(ch.tenant_id, co.tenant_id) = public.current_tenant_id()
      AND (
        public.current_user_is_admin()
        OR c.assigned_user_id = (SELECT u.id FROM public.users u WHERE u.auth_user_id = auth.uid() LIMIT 1)
        OR (c.assigned_user_id IS NULL AND (c.department_id IS NULL OR c.department_id = public.current_user_department_id()))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conversations c
    LEFT JOIN public.channels ch ON ch.id = c.channel_id
    LEFT JOIN public.contacts co ON co.id = c.contact_id
    WHERE c.id = messages.conversation_id
      AND COALESCE(ch.tenant_id, co.tenant_id) = public.current_tenant_id()
      AND (
        public.current_user_is_admin()
        OR c.assigned_user_id = (SELECT u.id FROM public.users u WHERE u.auth_user_id = auth.uid() LIMIT 1)
        OR (c.assigned_user_id IS NULL AND (c.department_id IS NULL OR c.department_id = public.current_user_department_id()))
      )
  )
);

-- 2) realtime_tenant_topics: exigir prefixo tenant_id:user_id ou tenant_id:admin
DROP POLICY IF EXISTS realtime_tenant_topics ON realtime.messages;

CREATE POLICY realtime_tenant_topics ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() LIKE (public.current_tenant_id()::text || ':' ||
    COALESCE((SELECT u.id::text FROM public.users u WHERE u.auth_user_id = auth.uid() LIMIT 1), '')
    || '%')
  OR (
    public.current_user_is_admin()
    AND realtime.topic() LIKE (public.current_tenant_id()::text || ':%')
  )
);
