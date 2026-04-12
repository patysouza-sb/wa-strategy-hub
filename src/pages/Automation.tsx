import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Zap, Puzzle, Plus, Trash2, Play, Pause, GitBranch, ArrowRight, Copy, Settings, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AutoRule {
  id: number;
  name: string;
  trigger: string;
  triggerType: string;
  action: string;
  status: "active" | "paused";
  message?: string;
  flowName?: string;
  delay?: string;
}

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
  { value: "activate_bot", label: "Ativar robô de IA" },
];

const AVAILABLE_FLOWS = ["Boas-vindas", "Qualificação de Lead", "Suporte Nível 1", "Pós-venda", "Remarketing 7 dias"];
const KANBAN_STAGES = ["Novo contato", "Interessado", "Proposta", "Negociação", "Fechamento", "Pago"];
const AVAILABLE_TAGS = ["Lead", "Cliente", "VIP", "Inativo", "Prospect"];

export default function Automation() {
  const [rules, setRules] = useState<AutoRule[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showFlowCreate, setShowFlowCreate] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", triggerType: "inactivity", action: "send_message", message: "", flowName: "", delay: "", tagValue: "", stageValue: "" });

  const toggleRule = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r));
    toast.success("Status atualizado!");
  };

  const deleteRule = (id: number) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success("Regra removida");
  };

  const duplicateRule = (id: number) => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return;
    setRules(prev => [...prev, { ...rule, id: Date.now(), name: `${rule.name} (cópia)`, status: "paused" }]);
    toast.success("Regra duplicada");
  };

  const createRule = () => {
    if (!newRule.name) return;
    const trigger = TRIGGER_TYPES.find(t => t.value === newRule.triggerType)?.label || newRule.triggerType;
    const fullTrigger = newRule.triggerType === "tag" ? `Tag: ${newRule.tagValue || "Lead"}` :
      newRule.triggerType === "stage" ? `Etapa: ${newRule.stageValue || "Novo contato"}` : trigger;
    setRules(prev => [...prev, {
      id: Date.now(), name: newRule.name, trigger: fullTrigger, triggerType: newRule.triggerType,
      action: newRule.action, status: "paused", message: newRule.message,
      flowName: newRule.flowName, delay: newRule.delay,
    }]);
    setNewRule({ name: "", triggerType: "inactivity", action: "send_message", message: "", flowName: "", delay: "", tagValue: "", stageValue: "" });
    setShowCreate(false);
    toast.success("Regra criada com sucesso!");
  };

  const activeCount = rules.filter(r => r.status === "active").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automação</h1>
            <p className="text-sm text-muted-foreground">Automatize respostas, crie fluxos inteligentes e atenda dezenas de clientes simultaneamente</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFlowCreate(true)} className="gap-2">
              <GitBranch className="w-4 h-4" /> Criar Fluxo
            </Button>
            <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Nova Regra
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Zap className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-lg font-bold text-foreground">{rules.length}</p>
                <p className="text-[10px] text-muted-foreground">Regras criadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-success" /></div>
              <div>
                <p className="text-lg font-bold text-foreground">{activeCount}</p>
                <p className="text-[10px] text-muted-foreground">Ativas agora</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><GitBranch className="w-5 h-5 text-blue-500" /></div>
              <div>
                <p className="text-lg font-bold text-foreground">{rules.filter(r => r.action === "start_flow").length}</p>
                <p className="text-[10px] text-muted-foreground">Vinculadas a fluxos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><Puzzle className="w-5 h-5 text-purple-500" /></div>
              <div>
                <p className="text-lg font-bold text-foreground">0</p>
                <p className="text-[10px] text-muted-foreground">Integrações</p>
              </div>
            </CardContent>
          </Card>
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
            {rules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Zap className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground">Nenhuma regra de automação criada</p>
                <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Regra" para automatizar seu atendimento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map(rule => (
                  <Card key={rule.id} className="border border-border shadow-none hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${rule.status === "active" ? "bg-success/10" : "bg-muted"}`}>
                            <Zap className={`w-4 h-4 ${rule.status === "active" ? "text-success" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{rule.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-muted-foreground">Gatilho: <strong>{rule.trigger}</strong></span>
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Ação: <strong>{ACTION_TYPES.find(a => a.value === rule.action)?.label}</strong></span>
                              {rule.flowName && (
                                <>
                                  <ArrowRight className="w-3 h-3 text-primary" />
                                  <Badge variant="secondary" className="text-[10px] gap-1"><GitBranch className="w-2.5 h-2.5" /> {rule.flowName}</Badge>
                                </>
                              )}
                              {rule.delay && <Badge variant="outline" className="text-[10px]">⏱ {rule.delay}</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge className={`text-[10px] border-0 mr-1 ${rule.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                            {rule.status === "active" ? "Ativo" : "Pausado"}
                          </Badge>
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => toggleRule(rule.id)}>
                            {rule.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => duplicateRule(rule.id)}>
                            <Copy className="w-3.5 h-3.5" />
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
            )}
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Endpoints de Webhook</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-foreground mb-1">URL do Webhook (Receber)</p>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded block">Configure sua URL de webhook aqui</code>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs font-medium text-foreground mb-1">URL do Webhook (Enviar)</p>
                  <Input placeholder="https://seu-servidor.com/webhook" className="mt-1" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground text-sm">
                Nenhum agendamento configurado. Crie regras com gatilho "Agendamento" para começar.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground text-sm">
                Nenhuma campanha criada. Use a aba Transmissão para criar campanhas de remarketing.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "N8N", desc: "Automação de workflows" },
                    { name: "Zapier", desc: "Conecte 5000+ apps" },
                    { name: "Google Sheets", desc: "Sincronize contatos" },
                    { name: "Stripe", desc: "Pagamentos automáticos" },
                  ].map(integ => (
                    <div key={integ.name} className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Puzzle className="w-5 h-5 text-primary" /></div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{integ.name}</p>
                          <p className="text-[10px] text-muted-foreground">{integ.desc}</p>
                        </div>
                      </div>
                      <Button size="sm" className="text-xs bg-primary text-primary-foreground">Conectar</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova Regra de Automação</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome da Regra</label>
              <Input value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Mensagem de boas-vindas" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Gatilho</label>
                <Select value={newRule.triggerType} onValueChange={v => setNewRule(p => ({ ...p, triggerType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{TRIGGER_TYPES.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Ação</label>
                <Select value={newRule.action} onValueChange={v => setNewRule(p => ({ ...p, action: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{ACTION_TYPES.map(a => (<SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            {newRule.triggerType === "tag" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Selecione a tag</label>
                <Select value={newRule.tagValue} onValueChange={v => setNewRule(p => ({ ...p, tagValue: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Escolha" /></SelectTrigger>
                  <SelectContent>{AVAILABLE_TAGS.map(t => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
            {newRule.triggerType === "stage" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Selecione a etapa</label>
                <Select value={newRule.stageValue} onValueChange={v => setNewRule(p => ({ ...p, stageValue: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Escolha" /></SelectTrigger>
                  <SelectContent>{KANBAN_STAGES.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
            {(newRule.action === "send_message") && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Mensagem</label>
                <Textarea value={newRule.message} onChange={e => setNewRule(p => ({ ...p, message: e.target.value }))} placeholder="Olá {nome}! ..." className="mt-1" />
              </div>
            )}
            {newRule.action === "start_flow" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Selecione o fluxo</label>
                <Select value={newRule.flowName} onValueChange={v => setNewRule(p => ({ ...p, flowName: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Escolha" /></SelectTrigger>
                  <SelectContent>{AVAILABLE_FLOWS.map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
            {newRule.triggerType === "inactivity" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tempo de inatividade</label>
                <Select value={newRule.delay} onValueChange={v => setNewRule(p => ({ ...p, delay: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="2h">2 horas</SelectItem>
                    <SelectItem value="6h">6 horas</SelectItem>
                    <SelectItem value="12h">12 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="48h">48 horas</SelectItem>
                    <SelectItem value="7d">7 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createRule} className="bg-primary text-primary-foreground">Criar Regra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFlowCreate} onOpenChange={setShowFlowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Criar Fluxo Inteligente</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Escolha um modelo de fluxo para começar:</p>
            {["Boas-vindas", "Qualificação de Lead", "Pós-venda", "Remarketing"].map(f => (
              <button key={f} onClick={() => { setShowFlowCreate(false); toast.success(`Fluxo "${f}" criado!`); }}
                className="w-full flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left">
                <GitBranch className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{f}</p>
                  <p className="text-[10px] text-muted-foreground">Modelo pronto para usar</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
