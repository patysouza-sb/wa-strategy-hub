import { Link } from "react-router-dom";
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, XCircle, Crown } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

export default function MySubscription() {
  const { loading, subscription, isActive, isExpired, daysRemaining } = useSubscription();
  const { user } = useAuth();
  const [cancelling, setCancelling] = useState(false);

  const periodEnd =
    subscription?.current_period_end || subscription?.expires_at || null;

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  const statusBadge = () => {
    if (!subscription) return <Badge variant="secondary">Sem assinatura</Badge>;
    if (subscription.blocked_at)
      return <Badge className="bg-destructive text-destructive-foreground">Bloqueada</Badge>;
    if (isExpired)
      return <Badge className="bg-destructive text-destructive-foreground">Expirada</Badge>;
    if (subscription.is_trial)
      return <Badge className="bg-amber-500 text-white">Trial</Badge>;
    if (isActive)
      return <Badge className="bg-[#25D366] text-white">Ativa</Badge>;
    return <Badge variant="secondary">{subscription.status}</Badge>;
  };

  const StatusIcon = () => {
    if (!subscription || isExpired || subscription.blocked_at)
      return <XCircle className="w-10 h-10 text-destructive" />;
    if (subscription.is_trial)
      return <AlertTriangle className="w-10 h-10 text-amber-500" />;
    return <CheckCircle2 className="w-10 h-10 text-[#25D366]" />;
  };

  const handleCancel = async () => {
    if (!subscription) return;
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? Você manterá o acesso até o fim do período atual."))
      return;
    setCancelling(true);
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", subscription.id);
    setCancelling(false);
    if (error) {
      toast.error("Erro ao cancelar assinatura");
    } else {
      toast.success("Assinatura cancelada. Acesso mantido até " + formatDate(periodEnd));
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Minha Assinatura</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seu plano, status e renovação.
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Carregando informações da assinatura...
            </CardContent>
          </Card>
        ) : !subscription ? (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">Você ainda não possui uma assinatura ativa.</p>
              <Button asChild className="bg-[#25D366] hover:bg-[#1eb558] text-white">
                <Link to="/plans">Ver planos disponíveis</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Status principal */}
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="flex items-start gap-4">
                  <StatusIcon />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {subscription.plan_name}
                      <Crown className="w-4 h-4 text-[#6C3FC5]" />
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {user?.email}
                    </CardDescription>
                  </div>
                </div>
                {statusBadge()}
              </CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                    <Calendar className="w-3.5 h-3.5" /> Próxima cobrança
                  </div>
                  <p className="text-base font-semibold mt-1.5">{formatDate(periodEnd)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                    <AlertTriangle className="w-3.5 h-3.5" /> Dias restantes
                  </div>
                  <p
                    className={`text-base font-semibold mt-1.5 ${
                      daysRemaining !== null && daysRemaining <= 3 ? "text-destructive" : ""
                    }`}
                  >
                    {daysRemaining !== null ? `${daysRemaining} dia${daysRemaining === 1 ? "" : "s"}` : "—"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                    <CreditCard className="w-3.5 h-3.5" /> Tipo
                  </div>
                  <p className="text-base font-semibold mt-1.5">
                    {subscription.is_trial ? "Período de teste" : "Assinatura paga"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Avisos */}
            {isExpired && (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardContent className="p-4 flex items-center gap-3 text-sm">
                  <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <span>Sua assinatura está expirada. Renove para reativar o acesso completo.</span>
                </CardContent>
              </Card>
            )}
            {!isExpired && daysRemaining !== null && daysRemaining <= 5 && (
              <Card className="border-amber-400/40 bg-amber-50 dark:bg-amber-500/10">
                <CardContent className="p-4 flex items-center gap-3 text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>
                    Sua assinatura expira em {daysRemaining} dia{daysRemaining === 1 ? "" : "s"}. Renove agora para evitar interrupções.
                  </span>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações</CardTitle>
                <CardDescription>Renove ou cancele sua assinatura a qualquer momento.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild className="bg-[#25D366] hover:bg-[#1eb558] text-white">
                  <Link to="/plans">{isExpired ? "Renovar assinatura" : "Mudar de plano / Renovar"}</Link>
                </Button>
                {subscription.status !== "cancelled" && !subscription.is_trial && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="text-destructive border-destructive/40 hover:bg-destructive/10"
                  >
                    {cancelling ? "Cancelando..." : "Cancelar assinatura"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
