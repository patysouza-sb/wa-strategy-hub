import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Pré-condições para habilitar o Bate Papo ao Vivo no client:
 *  1. Existe sessão autenticada válida no Supabase.
 *  2. Foi registrado pelo menos um evento de webhook Kiwify para o tenant
 *     (prova de que a assinatura `x-kiwify-signature` chegou e foi validada
 *     pela edge function — eventos só são persistidos após validação do header).
 *
 * Enquanto o webhook não for confirmado, o guard é revalidado automaticamente
 * a cada 10 segundos, sem necessidade de recarregar a página.
 */
export interface LiveChatGuardState {
  loading: boolean;
  authenticated: boolean;
  webhookVerified: boolean;
  enabled: boolean;
  reason: string | null;
}

const REVALIDATE_INTERVAL_MS = 10_000;

export function useLiveChatGuard(): LiveChatGuardState {
  const [state, setState] = useState<LiveChatGuardState>({
    loading: true,
    authenticated: false,
    webhookVerified: false,
    enabled: false,
    reason: null,
  });

  const cancelledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    cancelledRef.current = false;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleNext = () => {
      clearTimer();
      timerRef.current = setTimeout(check, REVALIDATE_INTERVAL_MS);
    };

    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (cancelledRef.current) return;

      if (!session?.user) {
        setState({
          loading: false,
          authenticated: false,
          webhookVerified: false,
          enabled: false,
          reason: "Sessão não autenticada. Faça login para usar o Bate Papo ao Vivo.",
        });
        scheduleNext();
        return;
      }

      const { count, error } = await (supabase as any)
        .from("subscription_events")
        .select("id", { count: "exact", head: true })
        .eq("source", "kiwify");

      if (cancelledRef.current) return;

      if (error) {
        setState({
          loading: false,
          authenticated: true,
          webhookVerified: false,
          enabled: false,
          reason: "Não foi possível validar o webhook Kiwify (acesso negado ou erro de rede). Nova tentativa em 10s.",
        });
        scheduleNext();
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
          : "Aguardando confirmação do webhook Kiwify (header x-kiwify-signature). Verificando novamente a cada 10s...",
      });

      if (!verified) {
        scheduleNext();
      } else {
        clearTimer();
      }
    };

    check();

    return () => {
      cancelledRef.current = true;
      clearTimer();
    };
  }, []);

  return state;
}
