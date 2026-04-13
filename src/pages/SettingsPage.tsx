import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { GitBranch, Phone, Plus, Trash2, Wifi, WifiOff, QrCode, RefreshCw } from "lucide-react";
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

const FLOWS = ["Boas-vindas Padrão", "Boas-vindas VIP", "FAQ Automático", "Resposta Geral", "Pesquisa de Satisfação", "Encerramento Padrão"];

export default function SettingsPage() {
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
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
    setTimeout(() => {
      setConnections(prev => prev.map(c => c.status === "connecting" ? { ...c, status: "connected", lastSeen: "Agora" } : c));
    }, 2000);
  };

  const removeConnection = (id: number) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    toast.success("Conexão removida");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie conexões WhatsApp e configurações do sistema</p>
        </div>

        <Tabs defaultValue="connections">
          <TabsList>
            <TabsTrigger value="connections">Conexões WhatsApp</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="account">Minha Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Conecte seus números de WhatsApp para receber e enviar mensagens.</p>
              <Button onClick={() => setShowAddConnection(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Adicionar Número
              </Button>
            </div>

            {connections.length === 0 ? (
              <Card className="border border-border shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Phone className="w-12 h-12 text-muted-foreground/20 mb-4" />
                  <p className="text-sm text-muted-foreground">Nenhum número conectado</p>
                  <p className="text-xs text-muted-foreground mt-1">Adicione seu número de WhatsApp para começar a usar o sistema.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {connections.map(conn => (
                  <Card key={conn.id} className="border border-border shadow-none">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            conn.status === "connected" ? "bg-success/10" : conn.status === "connecting" ? "bg-primary/10" : "bg-muted"
                          }`}>
                            {conn.status === "connected" ? <Wifi className="w-5 h-5 text-success" /> :
                             conn.status === "connecting" ? <Wifi className="w-5 h-5 text-primary animate-pulse" /> :
                             <WifiOff className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-foreground">{conn.name}</h3>
                              <Badge className={`text-[10px] border-0 ${
                                conn.status === "connected" ? "bg-success/10 text-success" :
                                conn.status === "connecting" ? "bg-primary/10 text-primary" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {conn.status === "connected" ? "Conectado" : conn.status === "connecting" ? "Conectando..." : "Desconectado"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{conn.phone}</p>
                            {conn.lastSeen && <p className="text-[10px] text-muted-foreground">Última atividade: {conn.lastSeen}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditingConn(conn)}>Configurar</Button>
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => toggleConnection(conn.id)}>
                            {conn.status === "connected" ? "Desconectar" : "Conectar"}
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => removeConnection(conn.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="general" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Transcrição automática de áudio</p>
                    <p className="text-xs text-muted-foreground">Transcreve automaticamente áudios recebidos</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Aceitar chamadas de voz</p>
                    <p className="text-xs text-muted-foreground">Permitir chamadas de voz pelo WhatsApp</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Separar atendimentos por usuário</p>
                    <p className="text-xs text-muted-foreground">Cada atendente vê apenas seus contatos</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificações por e-mail</p>
                    <p className="text-xs text-muted-foreground">Receba alertas de novas mensagens</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Notificações sonoras</p>
                    <p className="text-xs text-muted-foreground">Som ao receber novas mensagens</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nome</label>
                  <Input defaultValue="Patricia" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">E-mail</label>
                  <Input placeholder="seu@email.com" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Função</label>
                  <Input defaultValue="Admin" disabled className="mt-1" />
                </div>
                <Button className="bg-primary text-primary-foreground">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Connection Dialog */}
      <Dialog open={showAddConnection} onOpenChange={setShowAddConnection}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Número WhatsApp</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome da Conexão</label>
              <Input value={newConn.name} onChange={e => setNewConn(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Atendimento Principal" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Número do WhatsApp</label>
              <Input value={newConn.phone} onChange={e => setNewConn(p => ({ ...p, phone: e.target.value }))} placeholder="+55 11 99999-0000" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fluxo de Boas-vindas</label>
                <Select value={newConn.welcomeFlow} onValueChange={v => setNewConn(p => ({ ...p, welcomeFlow: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{FLOWS.map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fluxo Padrão</label>
                <Select value={newConn.defaultFlow} onValueChange={v => setNewConn(p => ({ ...p, defaultFlow: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{FLOWS.map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddConnection(false)}>Cancelar</Button>
            <Button onClick={addConnection} className="bg-primary text-primary-foreground gap-2"><Phone className="w-4 h-4" /> Conectar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Connection Dialog */}
      <Dialog open={!!editingConn} onOpenChange={() => setEditingConn(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configurar {editingConn?.name}</DialogTitle></DialogHeader>
          {editingConn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Fluxo de Boas-vindas</label>
                  <Select value={editingConn.welcomeFlow} onValueChange={v => {
                    setEditingConn({ ...editingConn, welcomeFlow: v });
                    setConnections(prev => prev.map(c => c.id === editingConn.id ? { ...c, welcomeFlow: v } : c));
                  }}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOWS.map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Fluxo Padrão</label>
                  <Select value={editingConn.defaultFlow} onValueChange={v => {
                    setEditingConn({ ...editingConn, defaultFlow: v });
                    setConnections(prev => prev.map(c => c.id === editingConn.id ? { ...c, defaultFlow: v } : c));
                  }}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{FLOWS.map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tempo de Inatividade</label>
                <Select value={editingConn.inactivityTime} onValueChange={v => {
                  setEditingConn({ ...editingConn, inactivityTime: v });
                  setConnections(prev => prev.map(c => c.id === editingConn.id ? { ...c, inactivityTime: v } : c));
                }}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6h">6 horas</SelectItem>
                    <SelectItem value="12h">12 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="48h">48 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEditingConn(null)} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
