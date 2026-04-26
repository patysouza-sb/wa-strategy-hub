import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Crown, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

interface Plan {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  max_channels: number | null;
  max_users: number | null;
  features: string[];
  sort_order: number;
}

const ICONS: Record<string, JSX.Element> = {
  starter: <Zap className="w-6 h-6" />,
  pro: <Crown className="w-6 h-6" />,
  business: <Building2 className="w-6 h-6" />,
};

export default function PlansExpired() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const { subscription, isExpired, isActive } = useSubscription();

  useEffect(() => {
    supabase
      .from("plans")
      .select("id, slug, name, price_cents, max_channels, max_users, features, sort_order")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setPlans((data as any) ?? []));
  }, []);

  const formatPrice = (cents: number) =>
    `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6C3FC5] to-[#9B6FE8] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 text-white">
          <h1 className="text-4xl font-bold mb-3">
            {isExpired ? "Sua assinatura expirou" : "Escolha seu plano"}
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            {isExpired
              ? "Para continuar usando o AtendFlow, renove sua assinatura escolhendo um dos planos abaixo."
              : "Desbloqueie todo o potencial do AtendFlow."}
          </p>
          {subscription && (
            <p className="mt-3 text-sm opacity-80">
              Plano atual: <strong>{subscription.plan_name}</strong>
              {subscription.is_trial && " (Trial)"}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-8 relative ${
                plan.slug === "pro" ? "ring-2 ring-[#25D366] scale-105" : ""
              }`}
            >
              {plan.slug === "pro" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#25D366] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  MAIS POPULAR
                </span>
              )}

              <div className="flex items-center gap-3 mb-4 text-[#6C3FC5]">
                {ICONS[plan.slug]}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{formatPrice(plan.price_cents)}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>

              <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                <p>📱 {plan.max_channels ?? "Ilimitados"} canais</p>
                <p>👥 {plan.max_users ?? "Ilimitados"} usuários</p>
              </div>

              <ul className="space-y-3 mb-8">
                {(plan.features as string[]).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-[#25D366] flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-[#25D366] hover:bg-[#1eb558] text-white"
                onClick={() => {
                  // Redireciona para a Kiwify (URL configurável depois)
                  window.open(
                    `https://pay.kiwify.com.br/checkout?plan=${plan.slug}`,
                    "_blank",
                  );
                }}
              >
                {isExpired ? "Renovar assinatura" : "Assinar agora"}
              </Button>
            </Card>
          ))}
        </div>

        {isActive && (
          <div className="text-center mt-8">
            <Link to="/" className="text-white underline">
              ← Voltar ao painel
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
