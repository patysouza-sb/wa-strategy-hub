import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Settings as SettingsIcon, Building, MessageSquareText, FileText, Globe, Tag, Building2, Users, BookOpen, Clock, GitBranch, Link, Code, Phone, Plus, Trash2, Wifi, WifiOff, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface WhatsAppConnection {
  id: number;
  name: string;
  phone: string;
  status: "connected" | "disconnected" | "connecting";
  welcomeFlow: string;
  defaultFlow: string;
  inactivityTime: string;
  closedFlow: string;
  lastSeen?: string;
}

export default function SettingsPage() {
  const [connections, setConnections] = useState<WhatsAppConnection[]>([
    { id: 1, name: "Atendimento Principal", phone: "+55 11 99999-0001", status: "connected", welcomeFlow: "Boas-vindas Padrão", defaultFlow: "Resposta Geral", inactivityTime: "24h", closedFlow: "Pesquisa de Satisfação", lastSeen: "Agora" },
    { id: 2, name: "Vendas", phone: "+55 11 99999-0002", status: "connected", welcomeFlow: "Boas-vindas VIP", defaultFlow: "FAQ Automático", inactivityTime: "12h", closedFlow: "Encerramento Padrão", lastSeen: "2 min atrás" },
    { id: 3, name: "Suporte", phone: "+55 21 98888-0003", status: "disconnected", welcomeFlow: "Boas-vindas Padrão", defaultFlow: "Resposta Geral", inactivityTime: "24h", closedFlow: "Pesquisa de Satisfação" },
  ]);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [newConn, setNewConn] = useState({ name: "", phone: "", welcomeFlow: "Boas-vindas Padrão", defaultFlow: "Resposta Geral", inactivityTime: "24h", closedFlow: "Pesquisa de Satisfação" });
  const [editingConn, setEditingConn] = useState<WhatsAppConnection | null>(null);

  const addConnection = () => {
    if (!newConn.name || !newConn.phone) return;
    setConnections(prev => [...prev, {
      id: Date.now(), ...newConn, status: "connecting" as const,
    }]);
    setTimeout(() => {
      setConnections(prev => prev.map(c => c.status === "connecting" ? { ...c, status: "connected", lastSeen: "Agora" } : c));
    }, 2000);
    setNewConn({ name: "", phone: "", welcomeFlow: "Boas-vindas Padrão", defaultFlow: "Resposta Geral", inactivityTime: "24h", closedFlow: "Pesquisa de Satisfação" });
    setShowAddConnection(false);
    toast.success("Conexão adicionada! Conectando...");
  };

  const toggleConnection = (id: number) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "connected" ? "disconnected" : "connecting" } : c));
    const conn = connections.find(c => c.id === id);
    if (conn?.status === "disconnected") {
      setTimeout(() => {
        setConnections(prev => prev.map(c => c.id === id ? { ...c, status: "connected", lastSeen: "Agora" } : c));
        toast.success("Reconectado!");
      }, 2000);
    }
  };

  const removeConnection = (id: number) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    toast.success("Conexão removida");
  };

  const saveFlowConfig = () => {
    if (editingConn) {
      setConnections(prev => prev.map(c => c.id === editingConn.id ? editingConn : c));
      setEditingConn(null);
      toast.success("Fluxos atualizados!");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie todas as configurações da plataforma</p>
        </div>

        <Tabs defaultValue="connections" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="connections">Conexões WhatsApp</TabsTrigger>
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="quick-replies">Respostas Rápidas</TabsTrigger>
            <TabsTrigger value="labels">Etiquetas</TabsTrigger>
            <TabsTrigger value="departments">Departamento</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="hours">Horários</TabsTrigger>
            <TabsTrigger value="default-flow">Fluxo Padrão</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          {/* WhatsApp Connections Tab */}
          <TabsContent value="connections">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Números de WhatsApp Conectados</h2>
                  <p className="text-xs text-muted-foreground">Gerencie seus números e configure fluxos para cada conexão</p>
                </div>
                <Button onClick={() => setShowAddConnection(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  <Plus className="w-4 h-4" /> Adicionar Número
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card className="border border-border shadow-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{connections.filter(c => c.status === "connected").length}</p>
                      <p className="text-[10px] text-muted-foreground">Conectados</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <WifiOff className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{connections.filter(c => c.status === "disconnected").length}</p>
                      <p className="text-[10px] text-muted-foreground">Desconectados</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border shadow-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{connections.length}</p>
                      <p className="text-[10px] text-muted-foreground">Total de números</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {connections.map(conn => (
                  <Card key={conn.id} className="border border-border shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            conn.status === "connected" ? "bg-success/10" : conn.status === "connecting" ? "bg-primary/10" : "bg-destructive/10"
                          }`}>
                            <Phone className={`w-6 h-6 ${
                              conn.status === "connected" ? "text-success" : conn.status === "connecting" ? "text-primary animate-pulse" : "text-destructive"
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{conn.name}</p>
                              <Badge className={`text-[10px] border-0 ${
                                conn.status === "connected" ? "bg-success/10 text-success" 
                                : conn.status === "connecting" ? "bg-primary/10 text-primary"
                                : "bg-destructive/10 text-destructive"
                              }`}>
                                {conn.status === "connected" ? "Conectado" : conn.status === "connecting" ? "Conectando..." : "Desconectado"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{conn.phone}</p>
                            {conn.lastSeen && <p className="text-[10px] text-muted-foreground">Última atividade: {conn.lastSeen}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setEditingConn(conn)}>
                            <GitBranch className="w-3 h-3" /> Fluxos
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => toggleConnection(conn.id)}>
                            {conn.status === "connected" ? "Desconectar" : "Reconectar"}
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => removeConnection(conn.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {conn.status === "connected" && (
                        <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-muted/30 rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground">Boas-vindas</p>
                            <p className="text-xs font-medium text-foreground">{conn.welcomeFlow}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground">Resposta Padrão</p>
                            <p className="text-xs font-medium text-foreground">{conn.defaultFlow}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground">Inatividade</p>
                            <p className="text-xs font-medium text-foreground">{conn.inactivityTime}</p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2">
                            <p className="text-[10px] text-muted-foreground">Finalização</p>
                            <p className="text-xs font-medium text-foreground">{conn.closedFlow}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="company">
            <Card className="border border-border shadow-none">
              <CardHeader><CardTitle className="text-base">Configurações da Empresa</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Nome da Empresa</label>
                    <input className="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none border border-border focus:ring-2 focus:ring-primary/30" defaultValue="Zap Estratégico" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                    <input className="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none border border-border focus:ring-2 focus:ring-primary/30" defaultValue="contato@zapestrategico.com" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Aceitar chamadas</p>
                      <p className="text-xs text-muted-foreground">Permite receber chamadas de voz</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Transcrever áudio</p>
                      <p className="text-xs text-muted-foreground">Transcrição automática de mensagens de áudio</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Separar atendimentos por usuário</p>
                      <p className="text-xs text-muted-foreground">Cada usuário vê apenas seus atendimentos</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="default-flow">
            <Card className="border border-border shadow-none">
              <CardHeader><CardTitle className="text-base">Fluxo Padrão</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">Configure os fluxos padrão globais. Para configurar por número, acesse a aba "Conexões WhatsApp".</p>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Fluxo de Boas-vindas</label>
                  <select className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border outline-none">
                    <option>Boas-vindas Padrão</option>
                    <option>Boas-vindas VIP</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Fluxo de Resposta Padrão</label>
                  <select className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border outline-none">
                    <option>Resposta Geral</option>
                    <option>FAQ Automático</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Tempo de Inatividade</label>
                  <select className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border outline-none">
                    <option>24 horas</option>
                    <option>12 horas</option>
                    <option>48 horas</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Fluxo de Conversa Finalizada</label>
                  <select className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border outline-none">
                    <option>Pesquisa de Satisfação</option>
                    <option>Encerramento Padrão</option>
                  </select>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Salvar</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {["quick-replies", "labels", "departments", "team", "hours", "api"].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card className="border border-border shadow-none">
                <CardContent className="p-10 text-center text-muted-foreground">
                  Configuração de {tab === "quick-replies" ? "Respostas Rápidas" : tab === "labels" ? "Etiquetas" : tab === "departments" ? "Departamentos" : tab === "team" ? "Equipe" : tab === "hours" ? "Horários" : "API"}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Add Connection Dialog */}
      <Dialog open={showAddConnection} onOpenChange={setShowAddConnection}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Phone className="w-5 h-5 text-primary" /> Adicionar Número WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome da Conexão</label>
              <Input value={newConn.name} onChange={e => setNewConn(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Atendimento, Vendas, Suporte" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Número de Telefone</label>
              <Input value={newConn.phone} onChange={e => setNewConn(p => ({ ...p, phone: e.target.value }))} placeholder="+55 11 99999-0000" className="mt-1" />
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-foreground mb-3">Configurar Fluxos para este Número</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Fluxo de Boas-vindas</label>
                  <Select value={newConn.welcomeFlow} onValueChange={v => setNewConn(p => ({ ...p, welcomeFlow: v }))}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boas-vindas Padrão">Boas-vindas Padrão</SelectItem>
                      <SelectItem value="Boas-vindas VIP">Boas-vindas VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Resposta Padrão</label>
                  <Select value={newConn.defaultFlow} onValueChange={v => setNewConn(p => ({ ...p, defaultFlow: v }))}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Resposta Geral">Resposta Geral</SelectItem>
                      <SelectItem value="FAQ Automático">FAQ Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Tempo de Inatividade</label>
                  <Select value={newConn.inactivityTime} onValueChange={v => setNewConn(p => ({ ...p, inactivityTime: v }))}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 horas</SelectItem>
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="48h">48 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Conversa Finalizada</label>
                  <Select value={newConn.closedFlow} onValueChange={v => setNewConn(p => ({ ...p, closedFlow: v }))}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pesquisa de Satisfação">Pesquisa de Satisfação</SelectItem>
                      <SelectItem value="Encerramento Padrão">Encerramento Padrão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddConnection(false)}>Cancelar</Button>
            <Button onClick={addConnection} className="bg-primary text-primary-foreground gap-2">
              <Wifi className="w-4 h-4" /> Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Flow Config Dialog */}
      <Dialog open={!!editingConn} onOpenChange={() => setEditingConn(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar Fluxos — {editingConn?.name}</DialogTitle>
          </DialogHeader>
          {editingConn && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{editingConn.phone}</p>
                  <p className="text-[10px] text-muted-foreground">Configurar fluxos para este número</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fluxo de Boas-vindas</label>
                <Select value={editingConn.welcomeFlow} onValueChange={v => setEditingConn(p => p ? { ...p, welcomeFlow: v } : null)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boas-vindas Padrão">Boas-vindas Padrão</SelectItem>
                    <SelectItem value="Boas-vindas VIP">Boas-vindas VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fluxo de Resposta Padrão</label>
                <Select value={editingConn.defaultFlow} onValueChange={v => setEditingConn(p => p ? { ...p, defaultFlow: v } : null)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Resposta Geral">Resposta Geral</SelectItem>
                    <SelectItem value="FAQ Automático">FAQ Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tempo de Inatividade</label>
                <Select value={editingConn.inactivityTime} onValueChange={v => setEditingConn(p => p ? { ...p, inactivityTime: v } : null)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6h">6 horas</SelectItem>
                    <SelectItem value="12h">12 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="48h">48 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fluxo de Conversa Finalizada</label>
                <Select value={editingConn.closedFlow} onValueChange={v => setEditingConn(p => p ? { ...p, closedFlow: v } : null)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pesquisa de Satisfação">Pesquisa de Satisfação</SelectItem>
                    <SelectItem value="Encerramento Padrão">Encerramento Padrão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingConn(null)}>Cancelar</Button>
            <Button onClick={saveFlowConfig} className="bg-primary text-primary-foreground">Salvar Fluxos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
