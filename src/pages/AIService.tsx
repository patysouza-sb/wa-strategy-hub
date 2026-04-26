import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Bot, Plus, Settings, Calendar, ArrowLeft, Upload, Play, Pause, Zap, FileText, CheckCircle2, AlertCircle, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSupabaseTable } from "@/hooks/useSupabaseData";
import { useTenantId } from "@/lib/tenant";

interface DbAgent {
  id: string;
  name: string;
  tenant_id: string;
  instance_id: string | null;
  model: string;
  tokens_used: number;
  status: string;
  created_at: string;
}

interface DbAgentConfig {
  id: string;
  agent_id: string;
  system_prompt: string | null;
  temperature: number;
  max_tokens: number;
  extra_config: any;
  updated_at: string;
}

export default function AIService() {
  const { data: agents, loading, insert, update, remove } = useSupabaseTable<DbAgent>("ai_agents");
  const { data: configs, insert: insertConfig, update: updateConfig } = useSupabaseTable<DbAgentConfig>("ai_agent_configs");
  const { data: dbFlows } = useSupabaseTable<{ id: string; name: string }>("automation_flows", "name");
  const AVAILABLE_FLOWS = dbFlows.map(f => f.name);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importScript, setImportScript] = useState("");
  const [importName, setImportName] = useState("");

  const agent = configuring ? agents.find(b => b.id === configuring) : null;
  const agentConfig = agent ? configs.find(c => c.agent_id === agent.id) : null;

  const updateAgent = async (id: string, updates: Partial<DbAgent>) => {
    await update(id, updates as any);
  };

  const updateAgentConfig = async (configId: string, updates: Partial<DbAgentConfig>) => {
    await updateConfig(configId, updates as any);
  };

  const createAgent = async () => {
    const name = (document.getElementById("new-bot-name") as HTMLInputElement)?.value;
    if (!name) return;
    const inserted = await insert({
      name, tenant_id: tenantId, model: "gpt-4o-mini",
      tokens_used: 0, status: "inactive",
    } as any);
    if (inserted) {
      await insertConfig({
        agent_id: inserted.id,
        system_prompt: "",
        temperature: 0.7,
        max_tokens: 500,
        extra_config: { keywords: [], welcome_message: "", auto_transfer: false, transfer_after: 3, max_simultaneous: 50, response_delay: 2 },
      } as any);
    }
    setShowCreate(false);
    toast.success("Agente IA criado com sucesso!");
  };

  const toggleAgentStatus = async (id: string) => {
    const a = agents.find(x => x.id === id);
    if (!a) return;
    const newStatus = a.status === "active" ? "inactive" : "active";
    await updateAgent(id, { status: newStatus });
    toast.success(newStatus === "active" ? "Agente ativado!" : "Agente desativado");
  };

  const importAsAgent = async () => {
    if (!importScript || !importName) return;
    const inserted = await insert({
      name: importName, tenant_id: tenantId, model: "gpt-4o-mini",
      tokens_used: 0, status: "inactive",
    } as any);
    if (inserted) {
      const keywords = importScript.match(/"([^"]+)"/g)?.map(k => k.replace(/"/g, "")) || [];
      await insertConfig({
        agent_id: inserted.id,
        system_prompt: importScript,
        temperature: 0.7,
        max_tokens: 500,
        extra_config: { keywords: keywords.slice(0, 5), welcome_message: "Olá! Como posso ajudar?", auto_transfer: true, transfer_after: 3, max_simultaneous: 50, response_delay: 2 },
      } as any);
    }
    setImportScript("");
    setImportName("");
    setShowImport(false);
    toast.success("Script importado e convertido em agente IA!");
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20"><p className="text-sm text-muted-foreground">Carregando...</p></div></AppLayout>;
  }

  if (agent && agentConfig) {
    const extra = agentConfig.extra_config || {};
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setConfiguring(null)}><ArrowLeft className="w-4 h-4 mr-1" /> Voltar</Button>
              <h1 className="text-xl font-bold text-foreground">{agent.name}</h1>
              <Badge className={`text-[10px] border-0 ${agent.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {agent.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => toggleAgentStatus(agent.id)} className="gap-1.5">
              {agent.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {agent.status === "active" ? "Desativar" : "Ativar"}
            </Button>
          </div>

          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="training">Treinamento</TabsTrigger>
              <TabsTrigger value="transfer">Transferência</TabsTrigger>
              <TabsTrigger value="performance">Desempenho</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-4">
              <Card className="border border-border shadow-none">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Mensagem Inicial</label>
                    <Textarea value={extra.welcome_message || ""} onChange={e => updateAgentConfig(agentConfig.id, { extra_config: { ...extra, welcome_message: e.target.value } })} className="mt-1 min-h-[80px]" placeholder="Mensagem de boas-vindas..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Modelo IA</label>
                      <Select value={agent.model} onValueChange={v => updateAgent(agent.id, { model: v })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-5-mini">GPT-5 Mini</SelectItem>
                          <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Delay de resposta (s)</label>
                      <Input type="number" value={extra.response_delay || 2} onChange={e => updateAgentConfig(agentConfig.id, { extra_config: { ...extra, response_delay: parseInt(e.target.value) || 1 } })} className="mt-1" min={1} max={30} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="mt-4 space-y-4">
              <Card className="border border-border shadow-none">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">System Prompt</label>
                    <Textarea value={agentConfig.system_prompt || ""} onChange={e => updateAgentConfig(agentConfig.id, { system_prompt: e.target.value })} className="mt-1 min-h-[150px]" placeholder="Insira informações sobre sua empresa, produtos, serviços, FAQ..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Temperatura</label>
                      <Input type="number" value={agentConfig.temperature} onChange={e => updateAgentConfig(agentConfig.id, { temperature: parseFloat(e.target.value) || 0.7 })} className="mt-1" min={0} max={2} step={0.1} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Max Tokens</label>
                      <Input type="number" value={agentConfig.max_tokens} onChange={e => updateAgentConfig(agentConfig.id, { max_tokens: parseInt(e.target.value) || 500 })} className="mt-1" min={50} max={4000} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transfer" className="mt-4 space-y-4">
              <Card className="border border-border shadow-none">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Transferência automática para humano</p>
                      <p className="text-xs text-muted-foreground">Transferir após tentativas sem resolução</p>
                    </div>
                    <Switch checked={extra.auto_transfer || false} onCheckedChange={c => updateAgentConfig(agentConfig.id, { extra_config: { ...extra, auto_transfer: c } })} />
                  </div>
                  {extra.auto_transfer && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Transferir após quantas tentativas?</label>
                      <Input type="number" value={extra.transfer_after || 3} onChange={e => updateAgentConfig(agentConfig.id, { extra_config: { ...extra, transfer_after: parseInt(e.target.value) || 3 } })} className="mt-1 w-24" min={1} max={10} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-border shadow-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{agent.tokens_used}</p>
                    <p className="text-xs text-muted-foreground">Tokens utilizados</p>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{agent.model}</p>
                    <p className="text-xs text-muted-foreground">Modelo</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Atendimento (IA)</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus agentes de atendimento automatizado</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImport(true)} className="gap-2"><Upload className="w-4 h-4" /> Importar Script</Button>
            <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Novo Agente</Button>
          </div>
        </div>

        {agents.length === 0 ? (
          <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 text-center">
            <Bot className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground">Nenhum agente criado</p>
            <p className="text-xs text-muted-foreground mt-1">Crie um agente ou importe um script para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(a => (
              <Card key={a.id} className="border border-border shadow-none hover:shadow-md transition-shadow cursor-pointer" onClick={() => setConfiguring(a.id)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.status === "active" ? "bg-success/10" : "bg-muted"}`}>
                        <Bot className={`w-5 h-5 ${a.status === "active" ? "text-success" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{a.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{a.model}</p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] border-0 ${a.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {a.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{a.tokens_used} tokens</span>
                    <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={e => { e.stopPropagation(); toggleAgentStatus(a.id); }}>
                      {a.status === "active" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {a.status === "active" ? "Pausar" : "Ativar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Criar Novo Agente IA</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome do Agente</label>
              <Input id="new-bot-name" placeholder="Ex: Atendimento de Vendas" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createAgent} className="bg-primary text-primary-foreground">Criar Agente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Importar Script de Atendimento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome do Agente</label>
              <Input value={importName} onChange={e => setImportName(e.target.value)} placeholder="Ex: Vendedor Automático" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cole seu script aqui</label>
              <Textarea value={importScript} onChange={e => setImportScript(e.target.value)} className="mt-1 min-h-[200px] font-mono text-xs" placeholder="Cole o script de atendimento..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>Cancelar</Button>
            <Button onClick={importAsAgent} className="bg-primary text-primary-foreground gap-2"><Upload className="w-4 h-4" /> Importar e Converter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
