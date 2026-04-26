
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.tenant_id
  FROM public.users u
  WHERE u.email = (auth.jwt() ->> 'email')
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public._drop_all_policies(p_schema text, p_table text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = p_schema AND tablename = p_table
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, p_schema, p_table);
  END LOOP;
END $$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'ai_agents','api_keys','automation_flows','automations','broadcasts',
    'business_hours','campaigns','channels','contact_groups','contacts',
    'conversation_audit_logs','custom_fields','dashboard_stats',
    'departments','flow_folders','global_variables','group_manager_groups',
    'integrations','kanban_columns','libraries','quick_replies',
    'remarketing_rules','tags','teams','webhooks','subscriptions'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    PERFORM public._drop_all_policies('public', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY "tenant_select" ON public.%1$I FOR SELECT
        USING (tenant_id = public.current_tenant_id());
      CREATE POLICY "tenant_insert" ON public.%1$I FOR INSERT
        WITH CHECK (tenant_id = public.current_tenant_id());
      CREATE POLICY "tenant_update" ON public.%1$I FOR UPDATE
        USING (tenant_id = public.current_tenant_id())
        WITH CHECK (tenant_id = public.current_tenant_id());
      CREATE POLICY "tenant_delete" ON public.%1$I FOR DELETE
        USING (tenant_id = public.current_tenant_id());
    $f$, t);
  END LOOP;
END $$;

DO $$ BEGIN
  PERFORM public._drop_all_policies('public', 'subscription_events');
  ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "subscription_events_select" ON public.subscription_events FOR SELECT
    USING (tenant_id = public.current_tenant_id());

  PERFORM public._drop_all_policies('public', 'tenants');
  ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "tenants_select_self" ON public.tenants FOR SELECT
    USING (id = public.current_tenant_id());
  CREATE POLICY "tenants_update_self" ON public.tenants FOR UPDATE
    USING (id = public.current_tenant_id())
    WITH CHECK (id = public.current_tenant_id());

  PERFORM public._drop_all_policies('public', 'users');
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "users_same_tenant_select" ON public.users FOR SELECT
    USING (tenant_id = public.current_tenant_id());
  CREATE POLICY "users_self_update" ON public.users FOR UPDATE
    USING (email = (auth.jwt() ->> 'email'))
    WITH CHECK (email = (auth.jwt() ->> 'email'));

  PERFORM public._drop_all_policies('public', 'conversations');
  ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "conversations_tenant" ON public.conversations FOR ALL
    USING (
      (channel_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.channels ch WHERE ch.id = conversations.channel_id AND ch.tenant_id = public.current_tenant_id()))
      OR
      (EXISTS (SELECT 1 FROM public.contacts co WHERE co.id = conversations.contact_id AND co.tenant_id = public.current_tenant_id()))
    )
    WITH CHECK (
      (channel_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.channels ch WHERE ch.id = conversations.channel_id AND ch.tenant_id = public.current_tenant_id()))
      OR
      (EXISTS (SELECT 1 FROM public.contacts co WHERE co.id = conversations.contact_id AND co.tenant_id = public.current_tenant_id()))
    );

  PERFORM public._drop_all_policies('public', 'messages');
  ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "messages_tenant" ON public.messages FOR ALL
    USING (EXISTS (
      SELECT 1 FROM public.conversations c
      LEFT JOIN public.channels ch ON ch.id = c.channel_id
      LEFT JOIN public.contacts co ON co.id = c.contact_id
      WHERE c.id = messages.conversation_id
        AND COALESCE(ch.tenant_id, co.tenant_id) = public.current_tenant_id()
    ))
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.conversations c
      LEFT JOIN public.channels ch ON ch.id = c.channel_id
      LEFT JOIN public.contacts co ON co.id = c.contact_id
      WHERE c.id = messages.conversation_id
        AND COALESCE(ch.tenant_id, co.tenant_id) = public.current_tenant_id()
    ));

  PERFORM public._drop_all_policies('public', 'flow_nodes');
  ALTER TABLE public.flow_nodes ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "flow_nodes_tenant" ON public.flow_nodes FOR ALL
    USING (EXISTS (SELECT 1 FROM public.automation_flows f WHERE f.id = flow_nodes.flow_id AND f.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.automation_flows f WHERE f.id = flow_nodes.flow_id AND f.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'flow_connections');
  ALTER TABLE public.flow_connections ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "flow_connections_tenant" ON public.flow_connections FOR ALL
    USING (EXISTS (SELECT 1 FROM public.automation_flows f WHERE f.id = flow_connections.flow_id AND f.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.automation_flows f WHERE f.id = flow_connections.flow_id AND f.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'automation_triggers');
  ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "automation_triggers_tenant" ON public.automation_triggers FOR ALL
    USING (EXISTS (SELECT 1 FROM public.automations a WHERE a.id = automation_triggers.automation_id AND a.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.automations a WHERE a.id = automation_triggers.automation_id AND a.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'ai_agent_configs');
  ALTER TABLE public.ai_agent_configs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "ai_agent_configs_tenant" ON public.ai_agent_configs FOR ALL
    USING (EXISTS (SELECT 1 FROM public.ai_agents a WHERE a.id = ai_agent_configs.agent_id AND a.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.ai_agents a WHERE a.id = ai_agent_configs.agent_id AND a.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'broadcast_recipients');
  ALTER TABLE public.broadcast_recipients ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "broadcast_recipients_tenant" ON public.broadcast_recipients FOR ALL
    USING (EXISTS (SELECT 1 FROM public.broadcasts b WHERE b.id = broadcast_recipients.broadcast_id AND b.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.broadcasts b WHERE b.id = broadcast_recipients.broadcast_id AND b.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'broadcast_tag_filters');
  ALTER TABLE public.broadcast_tag_filters ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "broadcast_tag_filters_tenant" ON public.broadcast_tag_filters FOR ALL
    USING (EXISTS (SELECT 1 FROM public.broadcasts b WHERE b.id = broadcast_tag_filters.broadcast_id AND b.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.broadcasts b WHERE b.id = broadcast_tag_filters.broadcast_id AND b.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'campaign_contacts');
  ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "campaign_contacts_tenant" ON public.campaign_contacts FOR ALL
    USING (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_contacts.campaign_id AND c.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_contacts.campaign_id AND c.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'contact_group_members');
  ALTER TABLE public.contact_group_members ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "contact_group_members_tenant" ON public.contact_group_members FOR ALL
    USING (EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = contact_group_members.contact_id AND c.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = contact_group_members.contact_id AND c.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'contact_custom_fields');
  ALTER TABLE public.contact_custom_fields ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "contact_custom_fields_tenant" ON public.contact_custom_fields FOR ALL
    USING (EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = contact_custom_fields.contact_id AND c.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = contact_custom_fields.contact_id AND c.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'contact_tags');
  ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "contact_tags_tenant" ON public.contact_tags FOR ALL
    USING (EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = contact_tags.contact_id AND c.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = contact_tags.contact_id AND c.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'group_manager_members');
  ALTER TABLE public.group_manager_members ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "group_manager_members_tenant" ON public.group_manager_members FOR ALL
    USING (EXISTS (SELECT 1 FROM public.group_manager_groups g WHERE g.id = group_manager_members.group_id AND g.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.group_manager_groups g WHERE g.id = group_manager_members.group_id AND g.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'integration_logs');
  ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "integration_logs_tenant" ON public.integration_logs FOR ALL
    USING (EXISTS (SELECT 1 FROM public.integrations i WHERE i.id = integration_logs.integration_id AND i.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.integrations i WHERE i.id = integration_logs.integration_id AND i.tenant_id = public.current_tenant_id()));

  PERFORM public._drop_all_policies('public', 'remarketing_executions');
  ALTER TABLE public.remarketing_executions ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "remarketing_executions_tenant" ON public.remarketing_executions FOR ALL
    USING (EXISTS (SELECT 1 FROM public.remarketing_rules r WHERE r.id = remarketing_executions.rule_id AND r.tenant_id = public.current_tenant_id()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.remarketing_rules r WHERE r.id = remarketing_executions.rule_id AND r.tenant_id = public.current_tenant_id()));
END $$;

DROP FUNCTION public._drop_all_policies(text, text);
