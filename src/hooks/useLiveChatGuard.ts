import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Pré-condições para habilitar o Bate Papo ao Vivo no client:
 *  1. Existe sessão autenticada válida no Supabase.
 *  2. Foi registrado pelo menos um evento de webhook Kiwify para o tenant
 *     (prova de que a assinatura `x-kiwify-signature` chegou e foi validada
 *     pela edge function — eventos só são persistidos após validação do header).
 */
export interface LiveChatGuardState {
  loading: boolean;
  authenticated: boolean;
  webhookVerified: boolean;
  enabled: boolean;
  reason: string | null;
}

export function useLiveChatGuard(): LiveChatGuardState {
  const [state, setState] = useState<LiveChatGuardState>({
    loading: true,
    authenticated: false,
    webhookVerified: false,
    enabled: false,
    reason: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session?.user) {
        if (!cancelled) {
          setState({
            loading: false,
            authenticated: false,
            webhookVerified: false,
            enabled: false,
            reason: "Sessão não autenticada. Faça login para usar o Bate Papo ao Vivo.",
          });
        }
        return;
      }

      const { count, error } = await (supabase as any)
        .from("subscription_events")
        .select("id", { count: "exact", head: true })
        .eq("source", "kiwify");

      if (cancelled) return;

      if (error) {
        setState({
          loading: false,
          authenticated: true,
          webhookVerified: false,
          enabled: false,
          reason: "Não foi possível validar o webhook Kiwify (acesso negado ou erro de rede).",
        });
        return;
      }

      const verified = (count ?? 0) > 0;
      setState({
        loading: false,
        authenticated: true,
        webhookVerified: verified,
        enabled: verified,
        reason: verified
          ? null
          : "Aguardando confirmação do webhook Kiwify (header x-kiwify-signature). O Bate Papo ao Vivo será liberado após o primeiro evento validado.",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
