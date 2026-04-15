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

interface DbBot {
  id: string;
  name: string;
  status: string;
  conversations: number;
  welcome_message: string | null;
  keywords: string[] | null;
  training: string | null;
  auto_transfer: boolean | null;
  transfer_after: number | null;
  assigned_flow: string | null;
  response_delay: number | null;
  max_simultaneous: number | null;
  created_at: string;
  updated_at: string;
}

// Flows loaded from database below

export default function AIService() {
  const { data: bots, loading, insert, update, remove } = useSupabaseTable<DbBot>("ai_bots");
  const { data: dbFlows } = useSupabaseTable<{ id: string; name: string }>("flows", "name");
  const AVAILABLE_FLOWS = dbFlows.map(f => f.name);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [importScript, setImportScript] = useState("");
  const [importName, setImportName] = useState("");

  const bot = configuring ? bots.find(b => b.id === configuring) : null;

  const updateBot = async (id: string, updates: Partial<DbBot>) => {
    await update(id, updates as any);
  };

  const addKeyword = async () => {
    if (!newKeyword || !bot) return;
    await updateBot(bot.id, { keywords: [...(bot.keywords || []), newKeyword] });
    setNewKeyword("");
  };

  const removeKeyword = async (kw: string) => {
    if (!bot) return;
    await updateBot(bot.id, { keywords: (bot.keywords || []).filter(k => k !== kw) });
  };

  const createBot = async () => {
    const name = (document.getElementById("new-bot-name") as HTMLInputElement)?.value;
    if (!name) return;
    await insert({
      name, status: "draft", conversations: 0, welcome_message: "",
      keywords: [], training: "", auto_transfer: false, transfer_after: 3,
      assigned_flow: "", response_delay: 2, max_simultaneous: 50,
    } as any);
    setShowCreate(false);
    toast.success("Robô criado com sucesso!");
  };

  const toggleBotStatus = async (id: string) => {
    const b = bots.find(x => x.id === id);
    if (!b) return;
    const newStatus = b.status === "active" ? "draft" : "active";
    if (newStatus === "active" && !b.welcome_message) {
      toast.error("Configure uma mensagem inicial antes de ativar");
      return;
    }
    await updateBot(id, { status: newStatus });
    toast.success(newStatus === "active" ? "Robô ativado!" : "Robô desativado");
  };

  const importAsBot = async () => {
    if (!importScript || !importName) return;
    const keywords = importScript.match(/"([^"]+)"/g)?.map(k => k.replace(/"/g, "")) || [];
    await insert({
      name: importName, status: "draft", conversations: 0,
      welcome_message: "Olá! Como posso ajudar?",
      keywords: keywords.slice(0, 5), training: importScript,
      auto_transfer: true, transfer_after: 3, assigned_flow: "",
      response_delay: 2, max_simultaneous: 50,
    } as any);
    setImportScript("");
    setImportName("");
    setShowImport(false);
    toast.success("Script importado e convertido em robô de atendimento!");
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20"><p className="text-sm text-muted-foreground">Carregando...</p></div></AppLayout>;
  }

  if (bot) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setConfiguring(null)}><ArrowLeft className="w-4 h-4 mr-1" /> Voltar</Button>
              <h1 className="text-xl font-bold text-foreground">{bot.name}</h1>
              <Badge className={`text-[10px] border-0 ${bot.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                {bot.status === "active" ? "Ativo" : "Rascunho"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleBotStatus(bot.id)} className="gap-1.5">
                {bot.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {bot.status === "active" ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="training">Treinamento</TabsTrigger>
              <TabsTrigger value="transfer">Transferência</TabsTrigger>
              <TabsTrigger value="flow">Fluxo Vinculado</TabsTrigger>
              <TabsTrigger value="performance">Desempenho</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-4 space-y-4">
              <Card className="border border-border shadow-none">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Mensagem Inicial</label>
                    <Textarea value={bot.welcome_message || ""} onChange={e => updateBot(bot.id, { welcome_message: e.target.value })} className="mt-1 min-h-[80px]" placeholder="Mensagem de boas-vindas do robô..." />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Palavras-chave de ativação</label>
                    <div className="flex gap-2 mt-1">
                      <Input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Digite uma palavra-chave" className="flex-1" onKeyDown={e => e.key === "Enter" && addKeyword()} />
                      <Button size="sm" onClick={addKeyword} className="bg-primary text-primary-foreground">Adicionar</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(bot.keywords || []).map(kw => (
                        <Badge key={kw} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeKeyword(kw)}>{kw} ×</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Delay de resposta (segundos)</label>
                      <Input type="number" value={bot.response_delay || 2} onChange={e => updateBot(bot.id, { response_delay: parseInt(e.target.value) || 1 })} className="mt-1" min={1} max={30} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Máx. atendimentos simultâneos</label>
                      <Input type="number" value={bot.max_simultaneous || 5} onChange={e => updateBot(bot.id, { max_simultaneous: parseInt(e.target.value) || 10 })} className="mt-1" min={1} max={500} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{bot.status === "active" ? "Ativo" : "Inativo"}</span>
                      <Switch checked={bot.status === "active"} onCheckedChange={() => toggleBotStatus(bot.id)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="mt-4 space-y-4">
              <Card className="border border-border shadow-none">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Base de Conhecimento (Texto)</label>
                    <Textarea value={bot.training || ""} onChange={e => updateBot(bot.id, { training: e.target.value })} className="mt-1 min-h-[150px]" placeholder="Insira informações sobre sua empresa, produtos, serviços, FAQ..." />
                  </div>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Arraste um PDF ou clique para enviar</p>
                    <p className="text-[10px] text-muted-foreground mt-1">PDF, TXT, DOCX (máx. 10MB)</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-foreground">Status do Treinamento</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{bot.training ? `${bot.training.split(" ").length} palavras processadas` : "Nenhum conteúdo adicionado"}</p>
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
                    <Switch checked={bot.auto_transfer || false} onCheckedChange={c => updateBot(bot.id, { auto_transfer: c })} />
                  </div>
                  {bot.auto_transfer && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Transferir após quantas tentativas?</label>
                      <Input type="number" value={bot.transfer_after || 3} onChange={e => updateBot(bot.id, { transfer_after: parseInt(e.target.value) || 3 })} className="mt-1 w-24" min={1} max={10} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flow" className="mt-4 space-y-4">
              <Card className="border border-border shadow-none">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Fluxo de atendimento vinculado</label>
                    <Select value={bot.assigned_flow || ""} onValueChange={v => updateBot(bot.id, { assigned_flow: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione um fluxo" /></SelectTrigger>
                      <SelectContent>{AVAILABLE_FLOWS.map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  {bot.assigned_flow && (
                    <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-foreground">Fluxo "{bot.assigned_flow}" vinculado</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="border border-border shadow-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{bot.conversations}</p>
                    <p className="text-xs text-muted-foreground">Conversas totais</p>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-success">0</p>
                    <p className="text-xs text-muted-foreground">Resolvidas pela IA</p>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-warning">0</p>
                    <p className="text-xs text-muted-foreground">Transferidas</p>
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
            <p className="text-sm text-muted-foreground">Gerencie seus robôs de atendimento automatizado</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImport(true)} className="gap-2"><Upload className="w-4 h-4" /> Importar Script</Button>
            <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Novo Robô</Button>
          </div>
        </div>

        {bots.length === 0 ? (
          <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 text-center">
            <Bot className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground">Nenhum robô criado</p>
            <p className="text-xs text-muted-foreground mt-1">Crie um robô ou importe um script para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map(b => (
              <Card key={b.id} className="border border-border shadow-none hover:shadow-md transition-shadow cursor-pointer" onClick={() => setConfiguring(b.id)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.status === "active" ? "bg-success/10" : "bg-muted"}`}>
                        <Bot className={`w-5 h-5 ${b.status === "active" ? "text-success" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{b.name}</h3>
                        <p className="text-[10px] text-muted-foreground">Criado em {new Date(b.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] border-0 ${b.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {b.status === "active" ? "Ativo" : "Rascunho"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{b.conversations} conversas</span>
                    <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={e => { e.stopPropagation(); toggleBotStatus(b.id); }}>
                      {b.status === "active" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      {b.status === "active" ? "Pausar" : "Ativar"}
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
          <DialogHeader><DialogTitle>Criar Novo Robô</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome do Robô</label>
              <Input id="new-bot-name" placeholder="Ex: Atendimento de Vendas" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createBot} className="bg-primary text-primary-foreground">Criar Robô</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Importar Script de Atendimento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome do Robô</label>
              <Input value={importName} onChange={e => setImportName(e.target.value)} placeholder="Ex: Robô de Vendas" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cole o script de atendimento</label>
              <Textarea value={importScript} onChange={e => setImportScript(e.target.value)} className="mt-1 min-h-[150px] font-mono text-xs" placeholder={"Se o cliente perguntar sobre preço...\nSe disser 'obrigado'..."} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>Cancelar</Button>
            <Button onClick={importAsBot} className="bg-primary text-primary-foreground gap-2"><FileText className="w-4 h-4" /> Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
