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

interface BotConfig {
  id: number;
  name: string;
  created: string;
  status: "active" | "draft";
  conversations: number;
  welcomeMessage: string;
  keywords: string[];
  training: string;
  autoTransfer: boolean;
  transferAfter: number;
  assignedFlow: string;
  responseDelay: number;
  maxSimultaneous: number;
}

const initialBots: BotConfig[] = [
  { id: 1, name: "Atendimento Geral", created: "12/01/2025", status: "active", conversations: 342, welcomeMessage: "Olá! Sou o assistente virtual. Como posso ajudar?", keywords: ["ajuda", "suporte", "dúvida"], training: "Somos uma empresa de tecnologia focada em soluções de atendimento via WhatsApp.", autoTransfer: true, transferAfter: 3, assignedFlow: "Boas-vindas", responseDelay: 2, maxSimultaneous: 50 },
  { id: 2, name: "Suporte Técnico", created: "15/01/2025", status: "active", conversations: 128, welcomeMessage: "Olá! Sou o suporte técnico. Descreva seu problema.", keywords: ["erro", "bug", "problema", "não funciona"], training: "Nosso produto principal é o Zap Estratégico. Problemas comuns incluem...", autoTransfer: true, transferAfter: 5, assignedFlow: "Suporte Nível 1", responseDelay: 1, maxSimultaneous: 30 },
  { id: 3, name: "Vendas Automáticas", created: "20/01/2025", status: "draft", conversations: 0, welcomeMessage: "Olá! Quer conhecer nossos planos?", keywords: ["preço", "plano", "comprar"], training: "", autoTransfer: false, transferAfter: 3, assignedFlow: "", responseDelay: 3, maxSimultaneous: 100 },
  { id: 4, name: "Pós-Venda", created: "25/01/2025", status: "active", conversations: 89, welcomeMessage: "Olá! Como está sua experiência?", keywords: ["feedback", "avaliação", "nota"], training: "Coletar NPS e feedback dos clientes.", autoTransfer: true, transferAfter: 2, assignedFlow: "Pós-venda", responseDelay: 2, maxSimultaneous: 20 },
];

const AVAILABLE_FLOWS = ["Boas-vindas", "Qualificação de Lead", "Suporte Nível 1", "Pós-venda", "Remarketing 7 dias"];

export default function AIService() {
  const [bots, setBots] = useState<BotConfig[]>(initialBots);
  const [configuring, setConfiguring] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [importScript, setImportScript] = useState("");
  const [importName, setImportName] = useState("");

  const bot = configuring ? bots.find(b => b.id === configuring) : null;

  const updateBot = (id: number, updates: Partial<BotConfig>) => {
    setBots(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addKeyword = () => {
    if (!newKeyword || !bot) return;
    updateBot(bot.id, { keywords: [...bot.keywords, newKeyword] });
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    if (!bot) return;
    updateBot(bot.id, { keywords: bot.keywords.filter(k => k !== kw) });
  };

  const createBot = () => {
    const name = (document.getElementById("new-bot-name") as HTMLInputElement)?.value;
    if (!name) return;
    setBots(prev => [...prev, {
      id: Date.now(), name, created: new Date().toLocaleDateString("pt-BR"),
      status: "draft", conversations: 0, welcomeMessage: "", keywords: [],
      training: "", autoTransfer: false, transferAfter: 3, assignedFlow: "",
      responseDelay: 2, maxSimultaneous: 50,
    }]);
    setShowCreate(false);
    toast.success("Robô criado com sucesso!");
  };

  const toggleBotStatus = (id: number) => {
    const b = bots.find(x => x.id === id);
    if (!b) return;
    const newStatus = b.status === "active" ? "draft" : "active";
    if (newStatus === "active" && !b.welcomeMessage) {
      toast.error("Configure uma mensagem inicial antes de ativar");
      return;
    }
    updateBot(id, { status: newStatus });
    toast.success(newStatus === "active" ? "Robô ativado!" : "Robô desativado");
  };

  const importAsBot = () => {
    if (!importScript || !importName) return;
    const keywords = importScript.match(/"([^"]+)"/g)?.map(k => k.replace(/"/g, "")) || [];
    setBots(prev => [...prev, {
      id: Date.now(), name: importName, created: new Date().toLocaleDateString("pt-BR"),
      status: "draft", conversations: 0, welcomeMessage: "Olá! Como posso ajudar?",
      keywords: keywords.slice(0, 5),
      training: importScript, autoTransfer: true, transferAfter: 3,
      assignedFlow: "", responseDelay: 2, maxSimultaneous: 50,
    }]);
    setImportScript("");
    setImportName("");
    setShowImport(false);
    toast.success("Script importado e convertido em robô de atendimento!");
  };

  const activeCounts = bots.filter(b => b.status === "active").length;
  const totalConversations = bots.reduce((s, b) => s + b.conversations, 0);

  if (bot) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setConfiguring(null)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
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
                    <Textarea
                      value={bot.welcomeMessage}
                      onChange={e => updateBot(bot.id, { welcomeMessage: e.target.value })}
                      className="mt-1 min-h-[80px]"
                      placeholder="Mensagem de boas-vindas do robô..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Palavras-chave de ativação</label>
                    <div className="flex gap-2 mt-1">
                      <Input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Digite uma palavra-chave" className="flex-1" onKeyDown={e => e.key === "Enter" && addKeyword()} />
                      <Button size="sm" onClick={addKeyword} className="bg-primary text-primary-foreground">Adicionar</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {bot.keywords.map(kw => (
                        <Badge key={kw} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeKeyword(kw)}>
                          {kw} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Delay de resposta (segundos)</label>
                      <Input type="number" value={bot.responseDelay} onChange={e => updateBot(bot.id, { responseDelay: parseInt(e.target.value) || 1 })} className="mt-1" min={1} max={30} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Máx. atendimentos simultâneos</label>
                      <Input type="number" value={bot.maxSimultaneous} onChange={e => updateBot(bot.id, { maxSimultaneous: parseInt(e.target.value) || 10 })} className="mt-1" min={1} max={500} />
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
                    <Textarea
                      value={bot.training}
                      onChange={e => updateBot(bot.id, { training: e.target.value })}
                      className="mt-1 min-h-[150px]"
                      placeholder="Insira informações sobre sua empresa, produtos, serviços, FAQ..."
                    />
                  </div>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Arraste um PDF ou clique para enviar</p>
                    <p className="text-[10px] text-muted-foreground mt-1">PDF, TXT, DOCX (máx. 10MB)</p>
                    <input type="file" className="hidden" accept=".pdf,.txt,.docx" />
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
                    <Switch checked={bot.autoTransfer} onCheckedChange={c => updateBot(bot.id, { autoTransfer: c })} />
                  </div>
                  {bot.autoTransfer && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Transferir após quantas tentativas?</label>
                        <Input type="number" value={bot.transferAfter} onChange={e => updateBot(bot.id, { transferAfter: parseInt(e.target.value) || 3 })} className="mt-1 w-24" min={1} max={10} />
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <p className="text-xs font-medium text-foreground">Mensagem de transferência</p>
                        <p className="text-xs text-muted-foreground italic">"Vou transferir você para um atendente humano. Aguarde um momento..."</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flow" className="mt-4 space-y-4">
              <Card className="border border-border shadow-none">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Fluxo de atendimento vinculado</label>
                    <Select value={bot.assignedFlow} onValueChange={v => updateBot(bot.id, { assignedFlow: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione um fluxo" /></SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_FLOWS.map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground mt-1">O robô seguirá este fluxo ao iniciar um atendimento</p>
                  </div>
                  {bot.assignedFlow && (
                    <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-foreground">Fluxo "{bot.assignedFlow}" vinculado</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">O robô usará este fluxo para guiar o atendimento automaticamente</p>
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
                    <p className="text-2xl font-bold text-success">{Math.round(bot.conversations * 0.85)}</p>
                    <p className="text-xs text-muted-foreground">Resolvidas pela IA</p>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-warning">{Math.round(bot.conversations * 0.15)}</p>
                    <p className="text-xs text-muted-foreground">Transferidas</p>
                  </CardContent>
                </Card>
              </div>
              <Card className="border border-border shadow-none">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Palavras mais acionadas</h3>
                  <div className="space-y-2">
                    {bot.keywords.map((kw, i) => (
                      <div key={kw} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{kw}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${90 - i * 15}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{Math.round((90 - i * 15) * bot.conversations / 100)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
            <Button variant="outline" onClick={() => setShowImport(true)} className="gap-2">
              <FileText className="w-4 h-4" /> Importar Script
            </Button>
            <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Novo Robô
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{bots.length}</p>
                <p className="text-[10px] text-muted-foreground">Robôs criados</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{activeCounts}</p>
                <p className="text-[10px] text-muted-foreground">Ativos agora</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{totalConversations}</p>
                <p className="text-[10px] text-muted-foreground">Conversas totais</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-none">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{Math.round(totalConversations * 0.85)}</p>
                <p className="text-[10px] text-muted-foreground">Resolvidas por IA</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bots.map(b => (
            <Card key={b.id} className="border border-border shadow-none hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{b.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{b.created}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => toggleBotStatus(b.id)}>
                      {b.status === "active" ? <Pause className="w-3.5 h-3.5 text-warning" /> : <Play className="w-3.5 h-3.5 text-success" />}
                    </Button>
                    <Badge className={`text-[10px] border-0 ${b.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {b.status === "active" ? "Ativo" : "Rascunho"}
                    </Badge>
                  </div>
                </div>
                {b.assignedFlow && (
                  <div className="flex items-center gap-1.5 mb-3 bg-muted/50 rounded-lg px-3 py-1.5">
                    <ArrowRight className="w-3 h-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground">Fluxo: <strong className="text-foreground">{b.assignedFlow}</strong></span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{b.conversations} conversas</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">Máx: {b.maxSimultaneous} simultâneos</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setConfiguring(b.id)}>
                    <Settings className="w-3.5 h-3.5" /> Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Robô de Atendimento</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome do Robô</label>
            <Input id="new-bot-name" placeholder="Ex: Atendimento Geral" className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createBot} className="bg-primary text-primary-foreground">Criar Robô</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar Script como Atendimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome do Robô</label>
              <Input value={importName} onChange={e => setImportName(e.target.value)} placeholder="Ex: Atendimento Importado" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cole o script / roteiro de atendimento</label>
              <Textarea
                value={importScript}
                onChange={e => setImportScript(e.target.value)}
                className="mt-1 min-h-[200px] font-mono text-xs"
                placeholder={'Cole aqui seu script de atendimento...\n\nExemplo:\nSe cliente diz "preço" → responder com tabela de preços\nSe cliente diz "suporte" → transferir para humano\nSe cliente diz "horário" → informar horário de funcionamento'}
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">O que acontece ao importar?</span>
              </div>
              <ul className="text-[10px] text-muted-foreground space-y-0.5 ml-5">
                <li>• O script será convertido em base de treinamento</li>
                <li>• Palavras-chave serão extraídas automaticamente</li>
                <li>• Você poderá vincular a um fluxo de atendimento</li>
                <li>• O robô ficará em rascunho até você ativar</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImport(false)}>Cancelar</Button>
            <Button onClick={importAsBot} className="bg-primary text-primary-foreground gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Importar e Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
