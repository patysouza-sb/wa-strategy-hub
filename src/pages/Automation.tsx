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
import { useSupabaseTable } from "@/hooks/useSupabaseData";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";
import { ChannelFilter, CHANNEL_LABELS } from "@/components/ChannelFilter";

interface DbAutomation {
  id: string;
  name: string;
  tenant_id: string;
  flow_id: string | null;
  status: string;
  channel_type?: string;
}

interface DbTrigger {
  id: string;
  automation_id: string;
  trigger_type: string;
  conditions: any;
  delay_hours: number;
}

const TRIGGER_TYPES = [
  { value: "inactivity", label: "Inatividade" },
  { value: "keyword", label: "Palavra-chave" },
  { value: "kanban_column", label: "Por etapa do Kanban" },
  { value: "new_contact", label: "Novo contato" },
  { value: "schedule", label: "Agendamento" },
  { value: "webhook", label: "Webhook" },
];

const ACTION_TYPES = [
  { value: "send_message", label: "Enviar mensagem" },
  { value: "start_flow", label: "Iniciar fluxo" },
  { value: "add_tag", label: "Adicionar tag" },
  { value: "move_stage", label: "Mover etapa" },
  { value: "transfer", label: "Transferir atendimento" },
  { value: "activate_bot", label: "Ativar robô de IA" },
];

const KANBAN_STAGES = ["Novo contato", "Interessado", "Proposta", "Negociação", "Fechamento", "Pago"];

export default function Automation() {
  const { data: automations, loading, insert, update, remove } = useSupabaseTable<DbAutomation>("automations");
  const { data: triggers, insert: insertTrigger } = useSupabaseTable<DbTrigger>("automation_triggers");
  const { data: dbFlows } = useSupabaseTable<{ id: string; name: string }>("automation_flows", "name");
  const AVAILABLE_FLOWS = dbFlows.map(f => f.name);

  const [showCreate, setShowCreate] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [newRule, setNewRule] = useState({ name: "", channelType: "whatsapp", triggerType: "inactivity", action: "send_message", message: "", flowName: "", delay: "", tagValue: "", stageValue: "" });

  const filteredAutomations = automations.filter(a =>
    channelFilter === "all" ? true : (a.channel_type || "whatsapp") === channelFilter,
  );

  const toggleRule = async (id: string) => {
    const r = automations.find(x => x.id === id);
    if (!r) return;
    await update(id, { status: r.status === "active" ? "inactive" : "active" } as any);
    toast.success("Status atualizado!");
  };

  const deleteRule = async (id: string) => {
    await remove(id);
    toast.success("Regra removida");
  };

  const duplicateRule = async (id: string) => {
    const rule = automations.find(r => r.id === id);
    if (!rule) return;
    const inserted = await insert({
      name: `${rule.name} (cópia)`,
      tenant_id: DEFAULT_TENANT_ID,
      channel_type: rule.channel_type || "whatsapp",
      status: "inactive",
    } as any);
    if (inserted) {
      const ruleTriggers = triggers.filter(t => t.automation_id === id);
      for (const t of ruleTriggers) {
        await insertTrigger({
          automation_id: inserted.id,
          trigger_type: t.trigger_type,
          conditions: t.conditions,
          delay_hours: t.delay_hours,
        } as any);
      }
    }
    toast.success("Regra duplicada");
  };

  const createRule = async () => {
    if (!newRule.name) return;
    const flow = dbFlows.find(f => f.name === newRule.flowName);
    const inserted = await insert({
      name: newRule.name,
      tenant_id: DEFAULT_TENANT_ID,
      flow_id: flow?.id || null,
      channel_type: newRule.channelType,
      status: "inactive",
    } as any);
    if (inserted) {
      await insertTrigger({
        automation_id: inserted.id,
        trigger_type: newRule.triggerType,
        conditions: {
          action: newRule.action,
          message: newRule.message,
          tag: newRule.tagValue,
          stage: newRule.stageValue,
        },
        delay_hours: newRule.delay ? parseInt(newRule.delay) || 0 : 0,
      } as any);
    }
    setNewRule({ name: "", channelType: "whatsapp", triggerType: "inactivity", action: "send_message", message: "", flowName: "", delay: "", tagValue: "", stageValue: "" });
    setShowCreate(false);
    toast.success("Regra criada com sucesso!");
  };

  const activeCount = automations.filter(r => r.status === "active").length;

  const getTriggerInfo = (automationId: string) => {
    const t = triggers.find(tr => tr.automation_id === automationId);
    if (!t) return { type: "", action: "", label: "" };
    const typeLabel = TRIGGER_TYPES.find(tt => tt.value === t.trigger_type)?.label || t.trigger_type;
    const actionLabel = ACTION_TYPES.find(a => a.value === t.conditions?.action)?.label || "";
    return { type: typeLabel, action: actionLabel, conditions: t.conditions };
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20"><p className="text-sm text-muted-foreground">Carregando...</p></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automação</h1>
            <p className="text-sm text-muted-foreground">Automatize respostas, crie fluxos inteligentes e atenda dezenas de clientes simultaneamente</p>
          </div>
          <div className="flex items-center gap-2">
            <ChannelFilter value={channelFilter} onChange={setChannelFilter} />
            <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Nova Regra
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Zap className="w-5 h-5 text-primary" /></div>
              <div><p className="text-lg font-bold text-foreground">{automations.length}</p><p className="text-[10px] text-muted-foreground">Regras criadas</p></div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-success" /></div>
              <div><p className="text-lg font-bold text-foreground">{activeCount}</p><p className="text-[10px] text-muted-foreground">Ativas agora</p></div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><GitBranch className="w-5 h-5 text-blue-500" /></div>
              <div><p className="text-lg font-bold text-foreground">{automations.filter(r => r.flow_id).length}</p><p className="text-[10px] text-muted-foreground">Vinculadas a fluxos</p></div>
            </CardContent>
          </Card>
        </div>

        {filteredAutomations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Zap className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground">
              {automations.length === 0 ? "Nenhuma regra de automação criada" : "Nenhuma regra para o canal selecionado"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Regra" para automatizar seu atendimento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAutomations.map(rule => {
              const info = getTriggerInfo(rule.id);
              return (
                <Card key={rule.id} className="border border-border shadow-none hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${rule.status === "active" ? "bg-success/10" : "bg-muted"}`}>
                          <Zap className={`w-4 h-4 ${rule.status === "active" ? "text-success" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{rule.name}</p>
                            <Badge variant="outline" className="text-[9px]">
                              {CHANNEL_LABELS[rule.channel_type || "whatsapp"] || rule.channel_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">Gatilho: <strong>{info.type}</strong></span>
                            {info.action && (
                              <>
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Ação: <strong>{info.action}</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={`text-[10px] border-0 mr-1 ${rule.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                          {rule.status === "active" ? "Ativo" : "Inativo"}
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
              );
            })}
          </div>
        )}
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
            {newRule.triggerType === "kanban_column" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Selecione a etapa</label>
                <Select value={newRule.stageValue} onValueChange={v => setNewRule(p => ({ ...p, stageValue: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Escolha" /></SelectTrigger>
                  <SelectContent>{KANBAN_STAGES.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}
            {newRule.action === "send_message" && (
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
                <label className="text-xs font-medium text-muted-foreground">Horas de inatividade</label>
                <Input type="number" value={newRule.delay} onChange={e => setNewRule(p => ({ ...p, delay: e.target.value }))} placeholder="24" className="mt-1" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createRule} className="bg-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Criar Regra</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
