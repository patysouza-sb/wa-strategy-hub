-- 1) Subscription gate on sensitive write paths
CREATE POLICY "messages_subscription_write"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_subscription_active());

CREATE POLICY "messages_subscription_update"
ON public.messages
FOR UPDATE
TO authenticated
USING (public.current_user_subscription_active())
WITH CHECK (public.current_user_subscription_active());

CREATE POLICY "contacts_subscription_write"
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_subscription_active());

CREATE POLICY "contacts_subscription_update"
ON public.contacts
FOR UPDATE
TO authenticated
USING (public.current_user_subscription_active())
WITH CHECK (public.current_user_subscription_active());

CREATE POLICY "conversations_subscription_write"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (public.current_user_subscription_active());

CREATE POLICY "conversations_subscription_update"
ON public.conversations
FOR UPDATE
TO authenticated
USING (public.current_user_subscription_active())
WITH CHECK (public.current_user_subscription_active());

-- 2) Helper to fetch the current user's department (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.current_user_department_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.department_id
  FROM public.users u
  WHERE u.auth_user_id = auth.uid()
  LIMIT 1
$$;

-- 3) Tighten conversations visibility: non-admins only see conversations
--    assigned to them, unassigned within their own department, or with no department set.
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
  channel_id IS NULL OR EXISTS (
    SELECT 1 FROM public.channels c
    WHERE c.id = conversations.channel_id AND c.tenant_id = public.current_tenant_id()
  )
);

-- 4) Revoke EXECUTE on trigger-only SECURITY DEFINER functions from API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.prevent_user_privilege_escalation() FROM anon, authenticated, public;