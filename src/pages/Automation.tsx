import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Zap, Puzzle, Plus, Trash2, Play, Pause } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface AutoRule {
  id: number;
  name: string;
  trigger: string;
  triggerType: string;
  action: string;
  status: "active" | "paused";
  message?: string;
}

const initialRules: AutoRule[] = [
  { id: 1, name: "Mensagem após 24h sem resposta", trigger: "Inatividade", triggerType: "inactivity", action: "send_message", status: "active", message: "Olá! Notamos que não recebemos sua resposta. Podemos ajudar?" },
  { id: 2, name: "Pós-venda automática", trigger: "Tag: Cliente", triggerType: "tag", action: "send_message", status: "active", message: "Obrigado pela compra! Como foi sua experiência?" },
  { id: 3, name: "Lembrete de pagamento", trigger: "Etapa: Fechamento", triggerType: "stage", action: "send_message", status: "paused", message: "Olá {nome}! Seu pagamento está pendente." },
  { id: 4, name: "Remarketing 7 dias", trigger: "Tag: Lead", triggerType: "tag", action: "send_message", status: "active", message: "Olá {nome}! Temos uma oferta especial para você." },
  { id: 5, name: "Boas-vindas novo contato", trigger: "Novo contato", triggerType: "new_contact", action: "start_flow", status: "active" },
];

const TRIGGER_TYPES = [
  { value: "inactivity", label: "Inatividade" },
  { value: "tag", label: "Por tag" },
  { value: "stage", label: "Por etapa do Kanban" },
  { value: "new_contact", label: "Novo contato" },
  { value: "keyword", label: "Palavra-chave" },
  { value: "schedule", label: "Agendamento" },
];

const ACTION_TYPES = [
  { value: "send_message", label: "Enviar mensagem" },
  { value: "start_flow", label: "Iniciar fluxo" },
  { value: "add_tag", label: "Adicionar tag" },
  { value: "move_stage", label: "Mover etapa" },
  { value: "transfer", label: "Transferir atendimento" },
];

export default function Automation() {
  const [rules, setRules] = useState<AutoRule[]>(initialRules);
  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", triggerType: "inactivity", action: "send_message", message: "" });

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r));
  };

  const deleteRule = (id: number) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const createRule = () => {
    if (!newRule.name) return;
    const trigger = TRIGGER_TYPES.find(t => t.value === newRule.triggerType)?.label || newRule.triggerType;
    setRules(prev => [...prev, {
      id: Date.now(), name: newRule.name, trigger, triggerType: newRule.triggerType,
      action: newRule.action, status: "paused", message: newRule.message,
    }]);
    setNewRule({ name: "", triggerType: "inactivity", action: "send_message", message: "" });
    setShowCreate(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automação</h1>
            <p className="text-sm text-muted-foreground">Configure regras e integrações automáticas</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
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
              {rules.map(rule => (
                <Card key={rule.id} className="border border-border shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{rule.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">Gatilho: {rule.trigger}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">Ação: {ACTION_TYPES.find(a => a.value === rule.action)?.label}</span>
                          </div>
                          {rule.message && (
                            <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-md">"{rule.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] border-0 ${rule.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                          {rule.status === "active" ? "Ativo" : "Pausado"}
                        </Badge>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => toggleRule(rule.id)}>
                          {rule.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Endpoints de Webhook</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-foreground mb-1">URL do Webhook (Receber)</p>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded block">https://api.zapestrategico.com/webhook/seu-token</code>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-foreground mb-1">URL do Webhook (Enviar)</p>
                  <Input placeholder="https://seu-servidor.com/webhook" className="mt-1" />
                  <div className="flex gap-2 mt-2">
                    {["Mensagem recebida", "Contato criado", "Etapa alterada"].map(ev => (
                      <Badge key={ev} variant="secondary" className="text-[10px]">{ev}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Agendamentos Ativos</h3>
                {[
                  { name: "Lembrete diário", time: "09:00", days: "Seg-Sex", active: true },
                  { name: "Follow-up semanal", time: "14:00", days: "Segunda", active: true },
                  { name: "Relatório mensal", time: "08:00", days: "Dia 1", active: false },
                ].map(sched => (
                  <div key={sched.name} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{sched.name}</p>
                      <p className="text-xs text-muted-foreground">{sched.time} - {sched.days}</p>
                    </div>
                    <Switch checked={sched.active} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Campanhas de Remarketing</h3>
                {[
                  { name: "Remarketing 7 dias", contacts: 245, sent: 180, status: "active" },
                  { name: "Remarketing 30 dias", contacts: 520, sent: 0, status: "draft" },
                ].map(camp => (
                  <div key={camp.name} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{camp.name}</p>
                      <p className="text-xs text-muted-foreground">{camp.contacts} contatos • {camp.sent} enviados</p>
                    </div>
                    <Badge className={`text-[10px] border-0 ${camp.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {camp.status === "active" ? "Ativa" : "Rascunho"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "N8N", desc: "Automação de workflows", connected: false },
                    { name: "Zapier", desc: "Conecte 5000+ apps", connected: false },
                    { name: "Google Sheets", desc: "Sincronize contatos", connected: true },
                    { name: "Stripe", desc: "Pagamentos automáticos", connected: false },
                  ].map(integ => (
                    <div key={integ.name} className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Puzzle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{integ.name}</p>
                          <p className="text-[10px] text-muted-foreground">{integ.desc}</p>
                        </div>
                      </div>
                      <Button variant={integ.connected ? "outline" : "default"} size="sm" className={`text-xs ${!integ.connected ? "bg-primary text-primary-foreground" : ""}`}>
                        {integ.connected ? "Conectado" : "Conectar"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Regra de Automação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome da Regra</label>
              <Input value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Follow-up automático" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Gatilho</label>
              <Select value={newRule.triggerType} onValueChange={v => setNewRule(p => ({ ...p, triggerType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ação</label>
              <Select value={newRule.action} onValueChange={v => setNewRule(p => ({ ...p, action: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {newRule.action === "send_message" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Mensagem (use {"{nome}"} para variáveis)</label>
                <Textarea value={newRule.message} onChange={e => setNewRule(p => ({ ...p, message: e.target.value }))} placeholder="Olá {nome}! ..." className="mt-1" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createRule} className="bg-primary text-primary-foreground">Criar Regra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
