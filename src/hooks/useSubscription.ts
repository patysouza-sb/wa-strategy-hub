import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SubscriptionInfo {
  id: string;
  tenant_id: string;
  plan_name: string;
  plan_id: string | null;
  status: string;
  is_trial: boolean;
  current_period_end: string | null;
  expires_at: string | null;
  blocked_at: string | null;
}

export interface SubscriptionState {
  loading: boolean;
  subscription: SubscriptionInfo | null;
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user?.email) {
      setLoading(false);
      setSubscription(null);
      return;
    }

    (async () => {
      const { data: userRow } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("email", user.email!)
        .maybeSingle();

      if (!userRow?.tenant_id) {
        if (!cancelled) {
          setSubscription(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("id, tenant_id, plan_name, plan_id, status, is_trial, current_period_end, expires_at, blocked_at")
        .eq("tenant_id", userRow.tenant_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setSubscription(data as SubscriptionInfo | null);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const periodEnd = subscription?.current_period_end || subscription?.expires_at || null;
  const periodEndDate = periodEnd ? new Date(periodEnd) : null;
  const now = new Date();

  const isExpired = !!periodEndDate && periodEndDate <= now;
  const isBlocked = !!subscription?.blocked_at;
  const isActive = !!subscription && subscription.status === "active" && !isExpired && !isBlocked;

  const daysRemaining = periodEndDate
    ? Math.max(0, Math.ceil((periodEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return { loading, subscription, isActive, isExpired, daysRemaining };
}
