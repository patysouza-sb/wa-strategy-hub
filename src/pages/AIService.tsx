import { AppLayout } from "@/components/AppLayout";
import { Bot, Plus, Settings, MoreVertical, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const bots = [
  { id: 1, name: "Atendimento Geral", created: "12/01/2025", status: "active", conversations: 342 },
  { id: 2, name: "Suporte Técnico", created: "15/01/2025", status: "active", conversations: 128 },
  { id: 3, name: "Vendas Automáticas", created: "20/01/2025", status: "draft", conversations: 0 },
  { id: 4, name: "Pós-Venda", created: "25/01/2025", status: "active", conversations: 89 },
];

export default function AIService() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Atendimento (IA)</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus robôs de atendimento</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Novo Robô
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bots.map(bot => (
            <Card key={bot.id} className="border border-border shadow-none hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{bot.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{bot.created}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-[10px] border-0 ${
                    bot.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {bot.status === "active" ? "Ativo" : "Rascunho"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{bot.conversations} conversas</span>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    <Settings className="w-3.5 h-3.5" /> Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
