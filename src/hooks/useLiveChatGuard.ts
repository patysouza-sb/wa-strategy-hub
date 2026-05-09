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
 * a cada 10 segundos, até o limite de MAX_REVALIDATIONS tentativas, para
 * evitar polling infinito caso o webhook nunca chegue.
 */
export interface LiveChatGuardState {
  loading: boolean;
  authenticated: boolean;
  webhookVerified: boolean;
  enabled: boolean;
  reason: string | null;
  attempts: number;
  exhausted: boolean;
}

const INITIAL_INTERVAL_MS = 10_000;
const MAX_INTERVAL_MS = 5 * 60_000; // 5 minutos
const BACKOFF_FACTOR = 1.5;
const MAX_REVALIDATIONS = 30;

/** Backoff exponencial: 10s, 15s, 22s, 33s, ... limitado a 5min. */
function nextDelay(attempt: number): number {
  const delay = INITIAL_INTERVAL_MS * Math.pow(BACKOFF_FACTOR, Math.max(0, attempt - 1));
  return Math.min(delay, MAX_INTERVAL_MS);
}

export function useLiveChatGuard(): LiveChatGuardState {
  const [state, setState] = useState<LiveChatGuardState>({
    loading: true,
    authenticated: false,
    webhookVerified: false,
    enabled: false,
    reason: null,
    attempts: 0,
    exhausted: false,
  });

  const cancelledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    cancelledRef.current = false;
    attemptsRef.current = 0;

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleNext = () => {
      if (attemptsRef.current >= MAX_REVALIDATIONS) return;
      clearTimer();
      const delay = nextDelay(attemptsRef.current);
      timerRef.current = setTimeout(check, delay);
    };

    const check = async () => {
      attemptsRef.current += 1;
      const attempt = attemptsRef.current;

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (cancelledRef.current) return;

      const exhausted = attempt >= MAX_REVALIDATIONS;

      if (!session?.user) {
        setState({
          loading: false,
          authenticated: false,
          webhookVerified: false,
          enabled: false,
          attempts: attempt,
          exhausted,
          reason: "Sessão não autenticada. Faça login para usar o Bate Papo ao Vivo.",
        });
        if (!exhausted) scheduleNext();
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
          attempts: attempt,
          exhausted,
          reason: exhausted
            ? `Não foi possível validar o webhook Kiwify após ${MAX_REVALIDATIONS} tentativas. Recarregue a página para tentar novamente.`
            : "Não foi possível validar o webhook Kiwify (acesso negado ou erro de rede). Nova tentativa em 10s.",
        });
        if (!exhausted) scheduleNext();
        return;
      }

      const verified = (count ?? 0) > 0;
      setState({
        loading: false,
        authenticated: true,
        webhookVerified: verified,
        enabled: verified,
        attempts: attempt,
        exhausted: !verified && exhausted,
        reason: verified
          ? null
          : exhausted
            ? `Webhook Kiwify não foi confirmado após ${MAX_REVALIDATIONS} tentativas (${Math.round((MAX_REVALIDATIONS * REVALIDATE_INTERVAL_MS) / 1000)}s). Verifique a configuração da Kiwify e recarregue a página.`
            : `Aguardando confirmação do webhook Kiwify (tentativa ${attempt}/${MAX_REVALIDATIONS}). Verificando novamente em 10s...`,
      });

      if (verified) {
        clearTimer();
      } else if (!exhausted) {
        scheduleNext();
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
