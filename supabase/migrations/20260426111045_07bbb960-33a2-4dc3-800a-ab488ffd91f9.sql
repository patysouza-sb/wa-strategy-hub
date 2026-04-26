CREATE TABLE public.conversation_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid,
  contact_id uuid,
  tenant_id uuid,
  action text NOT NULL,
  performed_by_user_id uuid,
  performed_by_name text,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_conversation ON public.conversation_audit_logs(conversation_id);
CREATE INDEX idx_audit_logs_contact ON public.conversation_audit_logs(contact_id);
CREATE INDEX idx_audit_logs_created_at ON public.conversation_audit_logs(created_at DESC);

ALTER TABLE public.conversation_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to conversation_audit_logs"
ON public.conversation_audit_logs
FOR ALL
USING (true)
WITH CHECK (true);