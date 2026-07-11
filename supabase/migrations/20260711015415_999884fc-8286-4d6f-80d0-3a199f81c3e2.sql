UPDATE public.subscriptions
SET status = 'active',
    is_trial = false,
    plan_name = 'Business (Owner)',
    current_period_end = now() + interval '100 years',
    expires_at = now() + interval '100 years',
    blocked_at = NULL
WHERE tenant_id = 'a2cd6ae3-be82-4762-9c5e-6fe765d917f2';