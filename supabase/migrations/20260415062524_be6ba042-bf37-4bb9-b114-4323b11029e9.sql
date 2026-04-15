
-- ============================================================
-- DROP EXISTING TABLES
-- ============================================================
DROP TABLE IF EXISTS public.broadcast_recipients CASCADE;
DROP TABLE IF EXISTS public.broadcast_tag_filters CASCADE;
DROP TABLE IF EXISTS public.broadcasts CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.kanban_columns CASCADE;
DROP TABLE IF EXISTS public.flow_connections CASCADE;
DROP TABLE IF EXISTS public.flow_nodes CASCADE;
DROP TABLE IF EXISTS public.automation_flows CASCADE;
DROP TABLE IF EXISTS public.flow_folders CASCADE;
DROP TABLE IF EXISTS public.flows CASCADE;
DROP TABLE IF EXISTS public.automation_rules CASCADE;
DROP TABLE IF EXISTS public.ai_bots CASCADE;
DROP TABLE IF EXISTS public.whatsapp_connections CASCADE;
DROP TABLE IF EXISTS public.integration_logs CASCADE;
DROP TABLE IF EXISTS public.integrations CASCADE;
DROP TABLE IF EXISTS public.group_manager_members CASCADE;
DROP TABLE IF EXISTS public.group_manager_groups CASCADE;
DROP TABLE IF EXISTS public.remarketing_executions CASCADE;
DROP TABLE IF EXISTS public.remarketing_rules CASCADE;
DROP TABLE IF EXISTS public.campaign_contacts CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.automation_triggers CASCADE;
DROP TABLE IF EXISTS public.automations CASCADE;
DROP TABLE IF EXISTS public.dashboard_stats CASCADE;
DROP TABLE IF EXISTS public.webhooks CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.business_hours CASCADE;
DROP TABLE IF EXISTS public.libraries CASCADE;
DROP TABLE IF EXISTS public.quick_replies CASCADE;
DROP TABLE IF EXISTS public.global_variables CASCADE;
DROP TABLE IF EXISTS public.contact_custom_fields CASCADE;
DROP TABLE IF EXISTS public.custom_fields CASCADE;
DROP TABLE IF EXISTS public.contact_group_members CASCADE;
DROP TABLE IF EXISTS public.contact_groups CASCADE;
DROP TABLE IF EXISTS public.contact_tags CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.ai_agent_configs CASCADE;
DROP TABLE IF EXISTS public.ai_agents CASCADE;
DROP TABLE IF EXISTS public.whatsapp_instances CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- ============================================================
-- VALIDATION TRIGGER FUNCTION (replaces CHECK constraints)
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_enum_field()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  field_name TEXT;
  field_value TEXT;
  allowed TEXT[];
BEGIN
  field_name := TG_ARGV[0];
  allowed := TG_ARGV[1]::TEXT[];

  EXECUTE format('SELECT ($1).%I::TEXT', field_name) INTO field_value USING NEW;

  IF field_value IS NOT NULL AND NOT (field_value = ANY(allowed)) THEN
    RAISE EXCEPTION 'Invalid value "%" for field "%". Allowed: %', field_value, field_name, allowed;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================
-- 1. TENANTS
-- ============================================================
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  billing_email TEXT,
  accept_calls BOOLEAN NOT NULL DEFAULT FALSE,
  transcribe_audio BOOLEAN NOT NULL DEFAULT FALSE,
  separate_by_user BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to tenants" ON public.tenants FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_tenants_status BEFORE INSERT OR UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{active,suspended,cancelled}');

-- ============================================================
-- 2. SUBSCRIPTIONS
-- ============================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  max_whatsapp_instances INT NOT NULL DEFAULT 1,
  max_ai_agent_tokens INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to subscriptions" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_subscriptions_status BEFORE INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{active,expired,cancelled}');

-- ============================================================
-- 3. DEPARTMENTS, TEAMS, USERS
-- ============================================================
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_users_role BEFORE INSERT OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('role', '{admin,supervisor,agent}');

-- ============================================================
-- 4. WHATSAPP INSTANCES
-- ============================================================
CREATE TABLE public.whatsapp_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone_number TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  welcome_flow_id UUID,
  default_response_flow_id UUID,
  closed_flow_id UUID,
  default_response_delay_hours INT NOT NULL DEFAULT 24,
  qr_code TEXT,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.whatsapp_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to whatsapp_instances" ON public.whatsapp_instances FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_whatsapp_instances_status BEFORE INSERT OR UPDATE ON public.whatsapp_instances
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{connected,disconnected,pending}');

-- ============================================================
-- 5. AI AGENTS
-- ============================================================
CREATE TABLE public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  tokens_used INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to ai_agents" ON public.ai_agents FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_ai_agents_status BEFORE INSERT OR UPDATE ON public.ai_agents
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{active,inactive}');

CREATE TABLE public.ai_agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  system_prompt TEXT,
  temperature FLOAT NOT NULL DEFAULT 0.7,
  max_tokens INT NOT NULL DEFAULT 500,
  extra_config JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.ai_agent_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to ai_agent_configs" ON public.ai_agent_configs FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. CONTACTS & AUDIENCE
-- ============================================================
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  instance_id UUID REFERENCES public.whatsapp_instances(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, phone_number)
);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#888888',
  UNIQUE (tenant_id, name)
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to tags" ON public.tags FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.contact_tags (
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
);
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contact_tags" ON public.contact_tags FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.contact_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);
ALTER TABLE public.contact_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contact_groups" ON public.contact_groups FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.contact_group_members (
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.contact_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, group_id)
);
ALTER TABLE public.contact_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contact_group_members" ON public.contact_group_members FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text'
);
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to custom_fields" ON public.custom_fields FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_custom_fields_type BEFORE INSERT OR UPDATE ON public.custom_fields
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('field_type', '{text,number,date,boolean,select}');

CREATE TABLE public.contact_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  UNIQUE (contact_id, field_id)
);
ALTER TABLE public.contact_custom_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to contact_custom_fields" ON public.contact_custom_fields FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 7. SETTINGS
-- ============================================================
CREATE TABLE public.global_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT,
  UNIQUE (tenant_id, name)
);
ALTER TABLE public.global_variables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to global_variables" ON public.global_variables FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  shortcut TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  UNIQUE (tenant_id, shortcut)
);
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to quick_replies" ON public.quick_replies FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  media_type TEXT NOT NULL,
  media_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to libraries" ON public.libraries FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_libraries_media_type BEFORE INSERT OR UPDATE ON public.libraries
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('media_type', '{image,video,audio,document}');

CREATE TABLE public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  open_at TIME,
  close_at TIME,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (tenant_id, day_of_week)
);
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to business_hours" ON public.business_hours FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_business_hours_day BEFORE INSERT OR UPDATE ON public.business_hours
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('day_of_week', '{monday,tuesday,wednesday,thursday,friday,saturday,sunday}');

CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to api_keys" ON public.api_keys FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to webhooks" ON public.webhooks FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_webhooks_status BEFORE INSERT OR UPDATE ON public.webhooks
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{active,inactive}');

-- ============================================================
-- 8. FLOW SYSTEM
-- ============================================================
CREATE TABLE public.flow_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES public.flow_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.flow_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to flow_folders" ON public.flow_folders FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.automation_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.flow_folders(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  shortcut TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, shortcut)
);
ALTER TABLE public.automation_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to automation_flows" ON public.automation_flows FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_automation_flows_status BEFORE INSERT OR UPDATE ON public.automation_flows
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{active,inactive,paused}');

CREATE TABLE public.flow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES public.automation_flows(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  pos_x INT NOT NULL DEFAULT 0,
  pos_y INT NOT NULL DEFAULT 0
);
ALTER TABLE public.flow_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to flow_nodes" ON public.flow_nodes FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_flow_nodes_type BEFORE INSERT OR UPDATE ON public.flow_nodes
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('type', '{start,content,menu,randomizer,tag,chat_controller,department,save,remarketing,condition,flow_connection,smart_delay,ai_response,webhook}');

CREATE TABLE public.flow_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_node_id UUID NOT NULL REFERENCES public.flow_nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES public.flow_nodes(id) ON DELETE CASCADE,
  condition_label TEXT
);
ALTER TABLE public.flow_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to flow_connections" ON public.flow_connections FOR ALL USING (true) WITH CHECK (true);

-- Circular FKs for whatsapp_instances
ALTER TABLE public.whatsapp_instances
  ADD CONSTRAINT fk_welcome_flow FOREIGN KEY (welcome_flow_id) REFERENCES public.automation_flows(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_default_resp_flow FOREIGN KEY (default_response_flow_id) REFERENCES public.automation_flows(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_closed_flow FOREIGN KEY (closed_flow_id) REFERENCES public.automation_flows(id) ON DELETE SET NULL;

-- ============================================================
-- 9. KANBAN
-- ============================================================
CREATE TABLE public.kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  trigger_flow_id UUID REFERENCES public.automation_flows(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#888888'
);
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to kanban_columns" ON public.kanban_columns FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 10. CONVERSATIONS & MESSAGES
-- ============================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  kanban_column_id UUID REFERENCES public.kanban_columns(id) ON DELETE SET NULL,
  ai_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
  queue_status TEXT NOT NULL DEFAULT 'waiting',
  last_message_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_conversations_queue BEFORE INSERT OR UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('queue_status', '{attending,waiting,resolved}');

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  direction TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  is_audio_transcribed BOOLEAN NOT NULL DEFAULT FALSE,
  audio_transcript TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_messages_direction BEFORE INSERT OR UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('direction', '{inbound,outbound}');

CREATE TRIGGER validate_messages_type BEFORE INSERT OR UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('type', '{text,image,audio,video,document,sticker,location,reaction}');

CREATE TRIGGER validate_messages_status BEFORE INSERT OR UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{sent,delivered,read,failed}');

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================================
-- 11. BROADCAST
-- ============================================================
CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES public.whatsapp_instances(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES public.automation_flows(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'contact_list',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to broadcasts" ON public.broadcasts FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_broadcasts_type BEFORE INSERT OR UPDATE ON public.broadcasts
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('type', '{contact_list,tag,all_contacts}');

CREATE TRIGGER validate_broadcasts_status BEFORE INSERT OR UPDATE ON public.broadcasts
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{draft,scheduled,sending,sent,failed}');

CREATE TABLE public.broadcast_tag_filters (
  broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (broadcast_id, tag_id)
);
ALTER TABLE public.broadcast_tag_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to broadcast_tag_filters" ON public.broadcast_tag_filters FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.broadcast_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ
);
ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to broadcast_recipients" ON public.broadcast_recipients FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_broadcast_recipients_status BEFORE INSERT OR UPDATE ON public.broadcast_recipients
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{pending,sent,delivered,failed}');

-- ============================================================
-- 12. AUTOMATIONS
-- ============================================================
CREATE TABLE public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES public.automation_flows(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to automations" ON public.automations FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_automations_status BEFORE INSERT OR UPDATE ON public.automations
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{active,inactive}');

CREATE TABLE public.automation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  delay_hours INT NOT NULL DEFAULT 0
);
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to automation_triggers" ON public.automation_triggers FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_automation_triggers_type BEFORE INSERT OR UPDATE ON public.automation_triggers
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('trigger_type', '{new_contact,keyword,inactivity,kanban_column,schedule,webhook}');

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_campaigns_status BEFORE INSERT OR UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{draft,scheduled,running,done}');

CREATE TABLE public.campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
);
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to campaign_contacts" ON public.campaign_contacts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.remarketing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  days_since_last_contact INT NOT NULL DEFAULT 7,
  status TEXT NOT NULL DEFAULT 'active'
);
ALTER TABLE public.remarketing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to remarketing_rules" ON public.remarketing_rules FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_remarketing_rules_status BEFORE INSERT OR UPDATE ON public.remarketing_rules
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{active,inactive}');

CREATE TABLE public.remarketing_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.remarketing_rules(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.remarketing_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to remarketing_executions" ON public.remarketing_executions FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 13. GROUP MANAGER
-- ============================================================
CREATE TABLE public.group_manager_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES public.automation_flows(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  whatsapp_group_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.group_manager_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to group_manager_groups" ON public.group_manager_groups FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.group_manager_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.group_manager_groups(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, contact_id)
);
ALTER TABLE public.group_manager_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to group_manager_members" ON public.group_manager_members FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 14. INTEGRATIONS
-- ============================================================
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to integrations" ON public.integrations FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER validate_integrations_type BEFORE INSERT OR UPDATE ON public.integrations
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('type', '{n8n,google_sheets,crm,make,zapier,custom}');

CREATE TRIGGER validate_integrations_status BEFORE INSERT OR UPDATE ON public.integrations
FOR EACH ROW EXECUTE FUNCTION public.validate_enum_field('status', '{active,inactive,error}');

CREATE TABLE public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to integration_logs" ON public.integration_logs FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 15. DASHBOARD STATS
-- ============================================================
CREATE TABLE public.dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  attendances_done INT NOT NULL DEFAULT 0,
  leads_count INT NOT NULL DEFAULT 0,
  conversations_open INT NOT NULL DEFAULT 0,
  conversations_pending INT NOT NULL DEFAULT 0,
  conversations_resolved INT NOT NULL DEFAULT 0,
  messages_sent INT NOT NULL DEFAULT 0,
  UNIQUE (tenant_id, stat_date)
);
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to dashboard_stats" ON public.dashboard_stats FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 16. PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX idx_conversations_instance ON public.conversations (instance_id);
CREATE INDEX idx_conversations_contact ON public.conversations (contact_id);
CREATE INDEX idx_conversations_queue ON public.conversations (queue_status);
CREATE INDEX idx_messages_conversation ON public.messages (conversation_id);
CREATE INDEX idx_messages_sent_at ON public.messages (sent_at DESC);
CREATE INDEX idx_contacts_tenant_phone ON public.contacts (tenant_id, phone_number);
CREATE INDEX idx_flow_nodes_flow ON public.flow_nodes (flow_id);
CREATE INDEX idx_broadcast_recipients_bc ON public.broadcast_recipients (broadcast_id);
CREATE INDEX idx_dashboard_stats_tenant ON public.dashboard_stats (tenant_id, stat_date DESC);
