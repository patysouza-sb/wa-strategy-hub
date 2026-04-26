import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Phone, Plus, Trash2, Wifi, WifiOff, QrCode, RefreshCw, MessageCircle, Instagram, Mail, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSupabaseTable } from "@/hooks/useSupabaseData";
import { useTenantId } from "@/lib/tenant";

interface DbChannel {
  id: string;
  tenant_id: string;
  channel_type: string;
  display_name: string;
  phone_number: string | null;
  status: string;
  is_default: boolean;
  welcome_flow_id: string | null;
  default_response_flow_id: string | null;
  closed_flow_id: string | null;
  default_response_delay_value: number;
  default_response_delay_unit: string;
  qr_code: string | null;
  last_connected_at: string | null;
  created_at: string;
}

const CHANNEL_TYPES: { value: string; label: string; icon: any }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "whatsapp_official", label: "WhatsApp Oficial", icon: MessageCircle },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "messenger", label: "Messenger", icon: MessageCircle },
  { value: "email", label: "E-mail", icon: Mail },
  { value: "widget", label: "Widget Web", icon: Globe },
];

export default function SettingsPage() {
  const { data: instances, loading, insert, update, remove } = useSupabaseTable<DbChannel>("channels");
  const { data: dbFlows } = useSupabaseTable<{ id: string; name: string }>("automation_flows", "name");
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrExpired, setQrExpired] = useState(false);
  const [qrTimer, setQrTimer] = useState(60);
  const [newConn, setNewConn] = useState({ name: "", phone: "", channelType: "whatsapp", welcomeFlowId: "", defaultFlowId: "", closedFlowId: "" });
  const [editingConn, setEditingConn] = useState<DbChannel | null>(null);

  useEffect(() => {
    if (!showQRCode || qrExpired) return;
    if (qrTimer <= 0) { setQrExpired(true); return; }
    const t = setTimeout(() => setQrTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [showQRCode, qrTimer, qrExpired]);

  const startQRCode = () => {
    if (!newConn.name || !newConn.phone) {
      toast.error("Preencha o nome e número antes de continuar");
      return;
    }
    setShowAddConnection(false);
    setShowQRCode(true);
    setQrExpired(false);
    setQrTimer(60);
  };

  const refreshQR = () => {
    setQrExpired(false);
    setQrTimer(60);
    toast.info("QR Code atualizado!");
  };

  const confirmQRConnection = async () => {
    await insert({
      tenant_id: tenantId,
      channel_type: newConn.channelType,
      display_name: newConn.name,
      phone_number: newConn.phone,
      status: "connected",
      is_default: instances.length === 0,
      welcome_flow_id: newConn.welcomeFlowId || null,
      default_response_flow_id: newConn.defaultFlowId || null,
      closed_flow_id: newConn.closedFlowId || null,
      last_connected_at: new Date().toISOString(),
    } as any);
    setNewConn({ name: "", phone: "", channelType: "whatsapp", welcomeFlowId: "", defaultFlowId: "", closedFlowId: "" });
    setShowQRCode(false);
    toast.success("Canal conectado com sucesso!");
  };

  const toggleConnection = async (id: string) => {
    const conn = instances.find(c => c.id === id);
    if (!conn) return;
    const newStatus = conn.status === "connected" ? "disconnected" : "connected";
    await update(id, { status: newStatus, last_connected_at: newStatus === "connected" ? new Date().toISOString() : conn.last_connected_at } as any);
  };

  const removeConnection = async (id: string) => {
    await remove(id);
    toast.success("Conexão removida");
  };

  const updateConnField = async (id: string, field: string, value: string) => {
    await update(id, { [field]: value || null } as any);
    if (editingConn && editingConn.id === id) {
      setEditingConn({ ...editingConn, [field]: value });
    }
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20"><p className="text-sm text-muted-foreground">Carregando...</p></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie conexões WhatsApp e configurações do sistema</p>
        </div>

        <Tabs defaultValue="connections">
          <TabsList>
            <TabsTrigger value="connections">Canais</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="account">Minha Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Conecte WhatsApp, Instagram, E-mail e outros canais de atendimento.</p>
              <Button onClick={() => setShowAddConnection(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" /> Adicionar Canal
              </Button>
            </div>

            {instances.length === 0 ? (
              <Card className="border border-border shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Phone className="w-12 h-12 text-muted-foreground/20 mb-4" />
                  <p className="text-sm text-muted-foreground">Nenhum número conectado</p>
                  <p className="text-xs text-muted-foreground mt-1">Adicione seu número de WhatsApp para começar.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {instances.map(conn => (
                  <Card key={conn.id} className="border border-border shadow-none">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            conn.status === "connected" ? "bg-success/10" : "bg-muted"
                          }`}>
                            {conn.status === "connected" ? <Wifi className="w-5 h-5 text-success" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-foreground">{conn.display_name}</h3>
                              <Badge className={`text-[10px] border-0 ${conn.status === "connected" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                                {conn.status === "connected" ? "Conectado" : "Desconectado"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{conn.phone_number}</p>
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
                  <div><p className="text-sm font-medium text-foreground">Transcrição automática de áudio</p><p className="text-xs text-muted-foreground">Transcreve automaticamente áudios recebidos</p></div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-foreground">Aceitar chamadas de voz</p><p className="text-xs text-muted-foreground">Permitir chamadas de voz pelo WhatsApp</p></div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-foreground">Separar atendimentos por usuário</p><p className="text-xs text-muted-foreground">Cada atendente vê apenas seus contatos</p></div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-foreground">Notificações por e-mail</p><p className="text-xs text-muted-foreground">Receba alertas de novas mensagens</p></div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-foreground">Notificações sonoras</p><p className="text-xs text-muted-foreground">Som ao receber novas mensagens</p></div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-4">
                <div><label className="text-xs font-medium text-muted-foreground">Nome</label><Input defaultValue="Patricia" className="mt-1" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">E-mail</label><Input placeholder="seu@email.com" className="mt-1" /></div>
                <div><label className="text-xs font-medium text-muted-foreground">Função</label><Input defaultValue="Admin" disabled className="mt-1" /></div>
                <Button className="bg-primary text-primary-foreground">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddConnection} onOpenChange={setShowAddConnection}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Canal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo de Canal</label>
              <Select value={newConn.channelType} onValueChange={v => setNewConn(p => ({ ...p, channelType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHANNEL_TYPES.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground">Nome da Conexão</label><Input value={newConn.name} onChange={e => setNewConn(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Atendimento Principal" className="mt-1" /></div>
            <div><label className="text-xs font-medium text-muted-foreground">Número / Identificador</label><Input value={newConn.phone} onChange={e => setNewConn(p => ({ ...p, phone: e.target.value }))} placeholder="+55 11 99999-0000" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fluxo de Boas-vindas</label>
                <Select value={newConn.welcomeFlowId} onValueChange={v => setNewConn(p => ({ ...p, welcomeFlowId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{dbFlows.map(f => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Fluxo Padrão</label>
                <Select value={newConn.defaultFlowId} onValueChange={v => setNewConn(p => ({ ...p, defaultFlowId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{dbFlows.map(f => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddConnection(false)}>Cancelar</Button>
            <Button onClick={startQRCode} className="bg-primary text-primary-foreground gap-2"><QrCode className="w-4 h-4" /> Gerar QR Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showQRCode} onOpenChange={(open) => { if (!open) setShowQRCode(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><QrCode className="w-5 h-5" /> Escanear QR Code</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Abra o <strong>WhatsApp Business</strong> no celular → Menu (⋮) → <strong>Aparelhos conectados</strong> → <strong>Conectar um aparelho</strong>
            </p>
            <div className="relative w-64 h-64 border-2 border-border rounded-2xl flex items-center justify-center bg-white">
              {qrExpired ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <QrCode className="w-16 h-16 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">QR Code expirado</p>
                  <Button size="sm" variant="outline" onClick={refreshQR} className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Atualizar</Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-11 gap-[2px] p-4">
                    {Array.from({ length: 121 }, (_, i) => {
                      const row = Math.floor(i / 11);
                      const col = i % 11;
                      const isCorner = (row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3);
                      const isFilled = isCorner || Math.random() > 0.5;
                      return (<div key={i} className={`w-3.5 h-3.5 rounded-[1px] ${isFilled ? "bg-foreground" : "bg-transparent"}`} />);
                    })}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1">
                    <span className="text-xs font-mono text-muted-foreground">{qrTimer}s</span>
                  </div>
                </>
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground">{newConn.name || "Conexão"}</p>
              <p className="text-xs text-muted-foreground">{newConn.phone}</p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowQRCode(false)}>Cancelar</Button>
            <Button onClick={confirmQRConnection} className="bg-success hover:bg-success/90 text-white gap-2"><Wifi className="w-4 h-4" /> Já escaneei, conectar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingConn} onOpenChange={() => setEditingConn(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configurar {editingConn?.display_name}</DialogTitle></DialogHeader>
          {editingConn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Fluxo de Boas-vindas</label>
                  <Select value={editingConn.welcome_flow_id || ""} onValueChange={v => updateConnField(editingConn.id, "welcome_flow_id", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{dbFlows.map(f => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Fluxo Padrão</label>
                  <Select value={editingConn.default_response_flow_id || ""} onValueChange={v => updateConnField(editingConn.id, "default_response_flow_id", v)}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{dbFlows.map(f => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Delay de Resposta Padrão</label>
                  <Input type="number" value={editingConn.default_response_delay_value} onChange={e => updateConnField(editingConn.id, "default_response_delay_value", e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Unidade</label>
                  <Select value={editingConn.default_response_delay_unit} onValueChange={v => updateConnField(editingConn.id, "default_response_delay_unit", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutos</SelectItem>
                      <SelectItem value="hours">Horas</SelectItem>
                      <SelectItem value="days">Dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
