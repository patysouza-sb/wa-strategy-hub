
-- 1) Bloquear admins de auto-modificar a própria assinatura
DROP POLICY IF EXISTS subscriptions_admin_write ON public.subscriptions;

-- RPC restrita: admin pode apenas cancelar a própria assinatura
CREATE OR REPLACE FUNCTION public.cancel_my_subscription()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant uuid;
BEGIN
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Only admins can cancel the subscription';
  END IF;
  v_tenant := public.current_tenant_id();
  IF v_tenant IS NULL THEN
    RAISE EXCEPTION 'No tenant context';
  END IF;
  UPDATE public.subscriptions
     SET status = 'cancelled'
   WHERE tenant_id = v_tenant
     AND status <> 'cancelled';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_my_subscription() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.cancel_my_subscription() TO authenticated;

-- 2) Reforçar bloqueio de escalação de privilégios em users:
-- Remover policy users_self_update permissiva e recriar excluindo role/tenant/email/auth_user_id.
-- O trigger users_prevent_privilege_escalation continua como segunda camada.
DROP POLICY IF EXISTS users_self_update ON public.users;

CREATE POLICY users_self_update ON public.users
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (
  auth_user_id = auth.uid()
  AND role = (SELECT u.role FROM public.users u WHERE u.auth_user_id = auth.uid())
  AND tenant_id = (SELECT u.tenant_id FROM public.users u WHERE u.auth_user_id = auth.uid())
  AND email = (SELECT u.email FROM public.users u WHERE u.auth_user_id = auth.uid())
  AND NOT (team_id IS DISTINCT FROM (SELECT u.team_id FROM public.users u WHERE u.auth_user_id = auth.uid()))
  AND NOT (department_id IS DISTINCT FROM (SELECT u.department_id FROM public.users u WHERE u.auth_user_id = auth.uid()))
);
