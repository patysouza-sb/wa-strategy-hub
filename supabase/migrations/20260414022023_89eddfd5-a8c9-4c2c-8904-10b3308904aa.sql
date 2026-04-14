
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.flow_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flow_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to flow_folders" ON public.flow_folders FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_flow_folders_updated_at BEFORE UPDATE ON public.flow_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  folder_id UUID REFERENCES public.flow_folders(id) ON DELETE SET NULL,
  shortcut TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'paused' CHECK (status IN ('active', 'paused')),
  nodes JSONB NOT NULL DEFAULT '[]',
  connections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to flows" ON public.flows FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON public.flows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL DEFAULT '',
  trigger_type TEXT NOT NULL DEFAULT 'keyword',
  action TEXT NOT NULL DEFAULT 'send_message',
  status TEXT NOT NULL DEFAULT 'paused' CHECK (status IN ('active', 'paused')),
  message TEXT DEFAULT '',
  flow_name TEXT DEFAULT '',
  delay TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to automation_rules" ON public.automation_rules FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.whatsapp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting')),
  welcome_flow TEXT DEFAULT '',
  default_flow TEXT DEFAULT '',
  inactivity_time TEXT DEFAULT '24h',
  closed_flow TEXT DEFAULT '',
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to whatsapp_connections" ON public.whatsapp_connections FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_whatsapp_connections_updated_at BEFORE UPDATE ON public.whatsapp_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ai_bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  conversations INT NOT NULL DEFAULT 0,
  welcome_message TEXT DEFAULT '',
  keywords TEXT[] DEFAULT '{}',
  training TEXT DEFAULT '',
  auto_transfer BOOLEAN DEFAULT false,
  transfer_after INT DEFAULT 3,
  assigned_flow TEXT DEFAULT '',
  response_delay INT DEFAULT 2,
  max_simultaneous INT DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_bots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to ai_bots" ON public.ai_bots FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_ai_bots_updated_at BEFORE UPDATE ON public.ai_bots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('flow-media', 'flow-media', true);
CREATE POLICY "Anyone can view flow media" ON storage.objects FOR SELECT USING (bucket_id = 'flow-media');
CREATE POLICY "Anyone can upload flow media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'flow-media');
CREATE POLICY "Anyone can update flow media" ON storage.objects FOR UPDATE USING (bucket_id = 'flow-media');
CREATE POLICY "Anyone can delete flow media" ON storage.objects FOR DELETE USING (bucket_id = 'flow-media');
