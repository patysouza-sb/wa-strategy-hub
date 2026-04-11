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

const initialRules: AutoRule[] = [
  { id: 1, name: "Mensagem após 24h sem resposta", trigger: "Inatividade", triggerType: "inactivity", action: "send_message", status: "active", message: "Olá! Notamos que não recebemos sua resposta. Podemos ajudar?", delay: "24h" },
  { id: 2, name: "Pós-venda automática", trigger: "Tag: Cliente", triggerType: "tag", action: "start_flow", status: "active", flowName: "Pós-venda" },
  { id: 3, name: "Lembrete de pagamento", trigger: "Etapa: Fechamento", triggerType: "stage", action: "send_message", status: "paused", message: "Olá {nome}! Seu pagamento está pendente.", delay: "48h" },
  { id: 4, name: "Remarketing 7 dias", trigger: "Tag: Lead", triggerType: "tag", action: "send_message", status: "active", message: "Olá {nome}! Temos uma oferta especial para você." },
  { id: 5, name: "Boas-vindas novo contato", trigger: "Novo contato", triggerType: "new_contact", action: "start_flow", status: "active", flowName: "Boas-vindas" },
  { id: 6, name: "Follow-up interessados", trigger: "Etapa: Interessado", triggerType: "stage", action: "send_message", status: "active", message: "Olá {nome}! Vi que você se interessou. Posso te ajudar?", delay: "2h" },
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
  { value: "activate_bot", label: "Ativar robô de IA" },
];

const AVAILABLE_FLOWS = ["Boas-vindas", "Qualificação de Lead", "Suporte Nível 1", "Pós-venda", "Remarketing 7 dias"];
const KANBAN_STAGES = ["Novo contato", "Interessado", "Proposta", "Negociação", "Fechamento", "Pago"];
const AVAILABLE_TAGS = ["Lead", "Cliente", "VIP", "Inativo", "Prospect"];

export default function Automation() {
  const [rules, setRules] = useState<AutoRule[]>(initialRules);
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

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{rules.length}</p>
                <p className="text-[10px] text-muted-foreground">Regras criadas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{activeCount}</p>
                <p className="text-[10px] text-muted-foreground">Ativas agora</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{rules.filter(r => r.action === "start_flow").length}</p>
                <p className="text-[10px] text-muted-foreground">Vinculadas a fluxos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Puzzle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">4</p>
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
                                <Badge variant="secondary" className="text-[10px] gap-1">
                                  <GitBranch className="w-2.5 h-2.5" /> {rule.flowName}
                                </Badge>
                              </>
                            )}
                            {rule.delay && (
                              <Badge variant="outline" className="text-[10px]">⏱ {rule.delay}</Badge>
                            )}
                          </div>
                          {rule.message && (
                            <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-md">"{rule.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={`text-[10px] border-0 mr-1 ${rule.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                          {rule.status === "active" ? "Ativo" : "Pausado"}
                        </Badge>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => toggleRule(rule.id)} title={rule.status === "active" ? "Pausar" : "Ativar"}>
                          {rule.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => duplicateRule(rule.id)} title="Duplicar">
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={() => deleteRule(rule.id)} title="Excluir">
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

      {/* Create Rule Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
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
            {newRule.triggerType === "tag" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Selecione a Tag</label>
                <Select value={newRule.tagValue} onValueChange={v => setNewRule(p => ({ ...p, tagValue: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Escolha uma tag" /></SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {newRule.triggerType === "stage" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Selecione a Etapa</label>
                <Select value={newRule.stageValue} onValueChange={v => setNewRule(p => ({ ...p, stageValue: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Escolha uma etapa" /></SelectTrigger>
                  <SelectContent>
                    {KANBAN_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
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
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ação</label>
              <Select value={newRule.action} onValueChange={v => setNewRule(p => ({ ...p, action: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {newRule.action === "start_flow" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fluxo a iniciar</label>
                <Select value={newRule.flowName} onValueChange={v => setNewRule(p => ({ ...p, flowName: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o fluxo" /></SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_FLOWS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {newRule.action === "send_message" && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Mensagem (use {"{nome}"} para variáveis)</label>
                  <Textarea value={newRule.message} onChange={e => setNewRule(p => ({ ...p, message: e.target.value }))} placeholder="Olá {nome}! ..." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Intervalo por mensagem</label>
                    <Select value={newRule.delay || "1min"} onValueChange={v => setNewRule(p => ({ ...p, delay: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30s">30 segundos</SelectItem>
                        <SelectItem value="1min">1 minuto</SelectItem>
                        <SelectItem value="2min">2 minutos</SelectItem>
                        <SelectItem value="5min">5 minutos</SelectItem>
                        <SelectItem value="10min">10 minutos</SelectItem>
                        <SelectItem value="30min">30 minutos</SelectItem>
                        <SelectItem value="1h">1 hora</SelectItem>
                        <SelectItem value="2h">2 horas</SelectItem>
                        <SelectItem value="24h">24 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Intervalo por áudio</label>
                    <Select defaultValue="2min">
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1min">1 minuto</SelectItem>
                        <SelectItem value="2min">2 minutos</SelectItem>
                        <SelectItem value="3min">3 minutos</SelectItem>
                        <SelectItem value="5min">5 minutos</SelectItem>
                        <SelectItem value="10min">10 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Anexar Mídia (provas sociais, produtos)</label>
                  <div className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <p className="text-xs text-muted-foreground">Arraste imagens, vídeos ou áudios aqui</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Suporta: JPG, PNG, MP4, MP3, OGG</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createRule} className="bg-primary text-primary-foreground">Criar Regra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Flow from Automation Dialog */}
      <Dialog open={showFlowCreate} onOpenChange={setShowFlowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Fluxo de Automação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Crie um fluxo de atendimento inteligente baseado nas suas regras de automação. O fluxo será adicionado à página de Fluxos de Conversa.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-foreground">Modelos disponíveis:</p>
              {[
                { name: "Fluxo de Boas-vindas + Qualificação", desc: "Recepciona e qualifica leads automaticamente" },
                { name: "Fluxo de Suporte Automatizado", desc: "Atende dúvidas frequentes e escala para humano" },
                { name: "Fluxo de Remarketing", desc: "Re-engaja contatos inativos com ofertas" },
                { name: "Fluxo de Pós-venda", desc: "Coleta feedback e oferece upsell" },
              ].map(tpl => (
                <button
                  key={tpl.name}
                  className="w-full text-left bg-background rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
                  onClick={() => {
                    setShowFlowCreate(false);
                    toast.success(`Fluxo "${tpl.name}" criado! Acesse a página de Fluxos para editar.`);
                  }}
                >
                  <p className="text-sm font-medium text-foreground">{tpl.name}</p>
                  <p className="text-[10px] text-muted-foreground">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlowCreate(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
