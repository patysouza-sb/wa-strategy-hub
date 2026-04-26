
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
DECLARE t text; node_tables text[] := ARRAY[
  'node_action_configs','node_content_items','node_menu_options',
  'node_randomizer_options','node_save_configs'
];
BEGIN
  FOREACH t IN ARRAY node_tables LOOP
    PERFORM public._drop_all_policies('public', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY "node_child_tenant" ON public.%1$I FOR ALL
        USING (EXISTS (
          SELECT 1 FROM public.flow_nodes n
          JOIN public.automation_flows f ON f.id = n.flow_id
          WHERE n.id = %1$I.node_id AND f.tenant_id = public.current_tenant_id()
        ))
        WITH CHECK (EXISTS (
          SELECT 1 FROM public.flow_nodes n
          JOIN public.automation_flows f ON f.id = n.flow_id
          WHERE n.id = %1$I.node_id AND f.tenant_id = public.current_tenant_id()
        ));
    $f$, t);
  END LOOP;
END $$;

-- plans: catálogo público (somente leitura)
DO $$ BEGIN
  PERFORM public._drop_all_policies('public', 'plans');
  ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "plans_public_read" ON public.plans FOR SELECT USING (true);
END $$;

DROP FUNCTION public._drop_all_policies(text, text);
