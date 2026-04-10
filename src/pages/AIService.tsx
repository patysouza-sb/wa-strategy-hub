import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Bot, Plus, Settings, Calendar, ArrowLeft, Upload, MessageSquare, Tag, Users, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
}

const initialBots: BotConfig[] = [
  { id: 1, name: "Atendimento Geral", created: "12/01/2025", status: "active", conversations: 342, welcomeMessage: "Olá! Sou o assistente virtual. Como posso ajudar?", keywords: ["ajuda", "suporte", "dúvida"], training: "Somos uma empresa de tecnologia focada em soluções de atendimento via WhatsApp.", autoTransfer: true, transferAfter: 3 },
  { id: 2, name: "Suporte Técnico", created: "15/01/2025", status: "active", conversations: 128, welcomeMessage: "Olá! Sou o suporte técnico. Descreva seu problema.", keywords: ["erro", "bug", "problema", "não funciona"], training: "Nosso produto principal é o Zap Estratégico. Problemas comuns incluem...", autoTransfer: true, transferAfter: 5 },
  { id: 3, name: "Vendas Automáticas", created: "20/01/2025", status: "draft", conversations: 0, welcomeMessage: "Olá! Quer conhecer nossos planos?", keywords: ["preço", "plano", "comprar"], training: "", autoTransfer: false, transferAfter: 3 },
  { id: 4, name: "Pós-Venda", created: "25/01/2025", status: "active", conversations: 89, welcomeMessage: "Olá! Como está sua experiência?", keywords: ["feedback", "avaliação", "nota"], training: "Coletar NPS e feedback dos clientes.", autoTransfer: true, transferAfter: 2 },
];

export default function AIService() {
  const [bots, setBots] = useState<BotConfig[]>(initialBots);
  const [configuring, setConfiguring] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

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
      training: "", autoTransfer: false, transferAfter: 3,
    }]);
    setShowCreate(false);
  };

  if (bot) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setConfiguring(null)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <h1 className="text-xl font-bold text-foreground">{bot.name}</h1>
            <Badge className={`text-[10px] border-0 ${bot.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              {bot.status === "active" ? "Ativo" : "Rascunho"}
            </Badge>
          </div>

          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="training">Treinamento</TabsTrigger>
              <TabsTrigger value="transfer">Transferência</TabsTrigger>
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{bot.status === "active" ? "Ativo" : "Inativo"}</span>
                      <Switch checked={bot.status === "active"} onCheckedChange={c => updateBot(bot.id, { status: c ? "active" : "draft" })} />
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
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Arraste um PDF ou clique para enviar</p>
                    <p className="text-[10px] text-muted-foreground mt-1">PDF, TXT, DOCX (máx. 10MB)</p>
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
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Transferir após quantas tentativas?</label>
                      <Input
                        type="number"
                        value={bot.transferAfter}
                        onChange={e => updateBot(bot.id, { transferAfter: parseInt(e.target.value) || 3 })}
                        className="mt-1 w-24"
                        min={1}
                        max={10}
                      />
                    </div>
                  )}
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
            <p className="text-sm text-muted-foreground">Gerencie seus robôs de atendimento</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Novo Robô
          </Button>
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
                  <Badge className={`text-[10px] border-0 ${b.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {b.status === "active" ? "Ativo" : "Rascunho"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{b.conversations} conversas</span>
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
    </AppLayout>
  );
}
