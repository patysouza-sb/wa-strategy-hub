import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Resolve the current user's tenant_id from the server.
 * Tenant is enforced server-side via RLS — never trust a client-provided value.
 */
export function useTenantId(): string | null {
  const { user } = useAuth();
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setTenantId(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("users")
      .select("tenant_id")
      .eq("email", user.email)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setTenantId((data as any)?.tenant_id ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  return tenantId;
}
