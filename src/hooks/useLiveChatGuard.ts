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
 * com backoff exponencial, até o limite de MAX_REVALIDATIONS tentativas, para
 * evitar polling infinito caso o webhook nunca chegue.
 *
 * Para diagnóstico, todas as falhas são classificadas em `failureKind`
 * ("network" | "permission" | "signature" | "auth" | "unknown") e o detalhe
 * técnico é exposto em `lastErrorDetail` + logado no console.
 */
export type LiveChatGuardFailureKind =
  | "none"
  | "auth"
  | "network"
  | "permission"
  | "signature"
  | "unknown";

export interface LiveChatGuardState {
  loading: boolean;
  authenticated: boolean;
  webhookVerified: boolean;
  enabled: boolean;
  reason: string | null;
  attempts: number;
  exhausted: boolean;
  failureKind: LiveChatGuardFailureKind;
  lastErrorDetail: string | null;
  lastErrorCode: string | null;
}

const INITIAL_INTERVAL_MS = 10_000;
const MAX_INTERVAL_MS = 5 * 60_000;
const BACKOFF_FACTOR = 1.5;
const MAX_REVALIDATIONS = 30;

function nextDelay(attempt: number): number {
  const delay = INITIAL_INTERVAL_MS * Math.pow(BACKOFF_FACTOR, Math.max(0, attempt - 1));
  return Math.min(delay, MAX_INTERVAL_MS);
}

/**
 * Classifica o erro retornado pelo Supabase/PostgREST para facilitar o diagnóstico.
 *  - network    → falha de fetch/CORS/offline
 *  - permission → RLS bloqueou (42501 / "permission denied")
 *  - signature  → tabela ou recurso ausente, indicando que a edge function nunca
 *                 inseriu evento (assinatura `x-kiwify-signature` provavelmente
 *                 foi rejeitada antes do insert ou tabela não foi migrada)
 *  - unknown    → outros casos
 */
function classifyError(error: any): {
  kind: LiveChatGuardFailureKind;
  detail: string;
  code: string | null;
} {
  const message = String(error?.message ?? error ?? "Erro desconhecido");
  const code = error?.code ? String(error.code) : null;
  const status = error?.status ?? null;

  const lower = message.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("load failed")
  ) {
    return { kind: "network", detail: message, code };
  }

  if (
    code === "42501" ||
    status === 401 ||
    status === 403 ||
    lower.includes("permission denied") ||
    lower.includes("rls") ||
    lower.includes("not authorized")
  ) {
    return { kind: "permission", detail: message, code };
  }

  if (
    code === "42P01" ||
    code === "PGRST205" ||
    lower.includes("does not exist") ||
    lower.includes("relation") ||
    lower.includes("schema cache")
  ) {
    return { kind: "signature", detail: message, code };
  }

  return { kind: "unknown", detail: message, code };
}

function describeFailure(kind: LiveChatGuardFailureKind): string {
  switch (kind) {
    case "network":
      return "Falha de rede ao consultar o webhook Kiwify (verifique conexão/CORS).";
    case "permission":
      return "Acesso negado pelas políticas RLS ao consultar subscription_events.";
    case "signature":
      return "Tabela subscription_events indisponível — a edge function Kiwify nunca registrou eventos (assinatura provavelmente rejeitada).";
    case "auth":
      return "Sessão Supabase ausente ou expirada.";
    default:
      return "Erro desconhecido ao validar o webhook Kiwify.";
  }
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
    failureKind: "none",
    lastErrorDetail: null,
    lastErrorCode: null,
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

      let session;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        session = sessionData.session;
      } catch (e) {
        const info = classifyError(e);
        console.warn(
          `[useLiveChatGuard] tentativa ${attempt}/${MAX_REVALIDATIONS} — falha em getSession (${info.kind}):`,
          info.detail,
          info.code ? `code=${info.code}` : "",
        );
        if (cancelledRef.current) return;
        const exhausted = attempt >= MAX_REVALIDATIONS;
        setState({
          loading: false,
          authenticated: false,
          webhookVerified: false,
          enabled: false,
          attempts: attempt,
          exhausted,
          failureKind: info.kind,
          lastErrorDetail: info.detail,
          lastErrorCode: info.code,
          reason: `${describeFailure(info.kind)} Detalhe: ${info.detail}`,
        });
        if (!exhausted) scheduleNext();
        return;
      }

      if (cancelledRef.current) return;

      const exhausted = attempt >= MAX_REVALIDATIONS;

      if (!session?.user) {
        console.warn(
          `[useLiveChatGuard] tentativa ${attempt}/${MAX_REVALIDATIONS} — sem sessão autenticada.`,
        );
        setState({
          loading: false,
          authenticated: false,
          webhookVerified: false,
          enabled: false,
          attempts: attempt,
          exhausted,
          failureKind: "auth",
          lastErrorDetail: "Sessão Supabase ausente.",
          lastErrorCode: null,
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
        const info = classifyError(error);
        const nextSec = Math.round(nextDelay(attempt) / 1000);
        console.warn(
          `[useLiveChatGuard] tentativa ${attempt}/${MAX_REVALIDATIONS} — falha ao consultar subscription_events (${info.kind})`,
          { code: info.code, detail: info.detail, raw: error },
        );
        setState({
          loading: false,
          authenticated: true,
          webhookVerified: false,
          enabled: false,
          attempts: attempt,
          exhausted,
          failureKind: info.kind,
          lastErrorDetail: info.detail,
          lastErrorCode: info.code,
          reason: exhausted
            ? `${describeFailure(info.kind)} Após ${MAX_REVALIDATIONS} tentativas. Detalhe: ${info.detail}${info.code ? ` (code=${info.code})` : ""}.`
            : `${describeFailure(info.kind)} Nova tentativa em ${nextSec}s. Detalhe: ${info.detail}${info.code ? ` (code=${info.code})` : ""}.`,
        });
        if (!exhausted) scheduleNext();
        return;
      }

      const verified = (count ?? 0) > 0;
      const nextSec = Math.round(nextDelay(attempt) / 1000);

      if (verified) {
        console.info(
          `[useLiveChatGuard] webhook Kiwify confirmado na tentativa ${attempt} (eventos=${count}).`,
        );
      } else {
        console.info(
          `[useLiveChatGuard] tentativa ${attempt}/${MAX_REVALIDATIONS} — nenhum evento Kiwify ainda (assinatura x-kiwify-signature pode não ter chegado).`,
        );
      }

      setState({
        loading: false,
        authenticated: true,
        webhookVerified: verified,
        enabled: verified,
        attempts: attempt,
        exhausted: !verified && exhausted,
        failureKind: verified ? "none" : "signature",
        lastErrorDetail: verified
          ? null
          : "Nenhum evento em subscription_events com source='kiwify'. A edge function só insere após validar x-kiwify-signature.",
        lastErrorCode: null,
        reason: verified
          ? null
          : exhausted
            ? `Webhook Kiwify não foi confirmado após ${MAX_REVALIDATIONS} tentativas. Verifique se a Kiwify está enviando o header x-kiwify-signature correto e se a edge function está respondendo 200.`
            : `Aguardando confirmação do webhook Kiwify (tentativa ${attempt}/${MAX_REVALIDATIONS}). Próxima verificação em ${nextSec}s (backoff exponencial). Causa provável: header x-kiwify-signature ainda não validado.`,
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
