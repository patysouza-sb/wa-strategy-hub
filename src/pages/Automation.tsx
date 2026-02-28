import { AppLayout } from "@/components/AppLayout";
import { Zap, Webhook, CalendarDays, Megaphone, RotateCcw, Puzzle, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const automations = [
  { name: "Mensagem após 24h sem resposta", trigger: "Inatividade", status: "active" },
  { name: "Pós-venda automática", trigger: "Tag: Cliente", status: "active" },
  { name: "Lembrete de pagamento", trigger: "Etapa: Fechamento", status: "paused" },
  { name: "Remarketing 7 dias", trigger: "Tag: Lead", status: "active" },
];

export default function Automation() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automação</h1>
            <p className="text-sm text-muted-foreground">Configure regras e integrações automáticas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Nova Regra
          </Button>
        </div>

        <Tabs defaultValue="rules">
          <TabsList>
            <TabsTrigger value="rules">Regras</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="schedules">Agendas</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-4">
            <div className="space-y-3">
              {automations.map(a => (
                <Card key={a.name} className="border border-border shadow-none">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.name}</p>
                        <p className="text-xs text-muted-foreground">Gatilho: {a.trigger}</p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] border-0 ${
                      a.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {a.status === "active" ? "Ativo" : "Pausado"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground">Configure seus webhooks</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedules" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground">Gerencie agendamentos</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="campaigns" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground">Configure campanhas automáticas</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="integrations" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground">
                <Puzzle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                Conecte com N8N e outras ferramentas
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
