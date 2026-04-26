
-- 1) PLANS table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  max_channels INTEGER,           -- NULL = ilimitado
  max_users INTEGER,              -- NULL = ilimitado
  kiwify_product_id TEXT UNIQUE,  -- preencher depois
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are viewable by everyone"
  ON public.plans FOR SELECT USING (true);

INSERT INTO public.plans (slug, name, price_cents, max_channels, max_users, sort_order, features) VALUES
  ('starter',  'Starter',  9700,  1,    2,    1, '["1 canal WhatsApp","Até 2 usuários","Automações ilimitadas","Suporte por email"]'::jsonb),
  ('pro',      'Pro',      19700, 3,    10,   2, '["Até 3 canais","Até 10 usuários","IA de atendimento","Transmissões em massa","Suporte prioritário"]'::jsonb),
  ('business', 'Business', 39700, NULL, NULL, 3, '["Canais ilimitados","Usuários ilimitados","IA avançada","Webhooks customizados","API dedicada","Suporte 24/7"]'::jsonb);

-- 2) SUBSCRIPTIONS - extend
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id),
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kiwify_order_id TEXT,
  ADD COLUMN IF NOT EXISTS kiwify_customer_email TEXT,
  ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON public.subscriptions(kiwify_customer_email);

-- 3) SUBSCRIPTION EVENTS log
CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  tenant_id UUID,
  event_type TEXT NOT NULL,    -- purchase, renewal, refund, cancellation, expired, trial_started
  source TEXT NOT NULL DEFAULT 'kiwify',
  amount_cents INTEGER,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view their subscription events"
  ON public.subscription_events FOR SELECT
  USING (
    tenant_id IN (
      SELECT u.tenant_id FROM public.users u WHERE u.email = (auth.jwt() ->> 'email')
    )
  );

-- 4) Helper: is current user's subscription active?
CREATE OR REPLACE FUNCTION public.current_user_subscription_active()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    JOIN public.users u ON u.tenant_id = s.tenant_id
    WHERE u.email = (auth.jwt() ->> 'email')
      AND s.status = 'active'
      AND s.blocked_at IS NULL
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  );
$$;

-- 5) Updated_at trigger for plans
CREATE TRIGGER trg_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Replace handle_new_user to also create tenant + trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_starter_id UUID;
  v_company TEXT;
  v_subdomain TEXT;
BEGIN
  -- Profile
  INSERT INTO public.profiles (user_id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Tenant
  v_company := COALESCE(NEW.raw_user_meta_data ->> 'company_name', split_part(NEW.email, '@', 1));
  v_subdomain := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9]', '', 'g')) || '-' || substr(NEW.id::text, 1, 6);

  INSERT INTO public.tenants (company_name, subdomain, billing_email, status)
  VALUES (v_company, v_subdomain, NEW.email, 'active')
  RETURNING id INTO v_tenant_id;

  -- User row
  INSERT INTO public.users (tenant_id, name, email, role)
  VALUES (
    v_tenant_id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    'admin'
  );

  -- Trial 7 days on Starter
  SELECT id INTO v_starter_id FROM public.plans WHERE slug = 'starter' LIMIT 1;

  INSERT INTO public.subscriptions (
    tenant_id, plan_name, plan_id, status, is_trial,
    expires_at, current_period_end,
    max_whatsapp_instances, max_ai_agent_tokens
  )
  VALUES (
    v_tenant_id, 'Starter (Trial)', v_starter_id, 'active', true,
    now() + interval '7 days', now() + interval '7 days',
    1, 0
  );

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
