bash

cat /mnt/user-data/outputs/SettingsPage.tsx
Saída

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Phone, Plus, Trash2, Wifi, WifiOff, QrCode, RefreshCw, MessageCircle, Instagram, Mail, Globe, Tag, Building2, Users, Clock, Edit2, Check, X } from "lucide-react";
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

const TAG_COLORS = [
  { value: "bg-red-500", label: "Vermelho" },
  { value: "bg-orange-500", label: "Laranja" },
  { value: "bg-yellow-500", label: "Amarelo" },
  { value: "bg-green-500", label: "Verde" },
  { value: "bg-blue-500", label: "Azul" },
  { value: "bg-purple-500", label: "Roxo" },
  { value: "bg-pink-500", label: "Rosa" },
  { value: "bg-gray-500", label: "Cinza" },
];

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const DEFAULT_HOURS = DAYS.map((day, i) => ({
  day,
  enabled: i < 5,
  open: "08:00",
  close: "18:00",
}));

interface Tag { id: string; name: string; color: string; }
interface Department { id: string; name: string; description: string; }
interface TeamMember { id: string; name: string; email: string; role: string; }

export default function SettingsPage() {
  const tenantId = useTenantId();
  const { data: instances, loading, insert, update, remove } = useSupabaseTable<DbChannel>("channels");
  const { data: dbFlows } = useSupabaseTable<{ id: string; name: string }>("automation_flows", "name");

  // Channels
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrExpired, setQrExpired] = useState(false);
  const [qrTimer, setQrTimer] = useState(60);
  const [newConn, setNewConn] = useState({ name: "", phone: "", channelType: "whatsapp", welcomeFlowId: "", defaultFlowId: "", closedFlowId: "" });
  const [editingConn, setEditingConn] = useState<DbChannel | null>(null);

  // Etiquetas
  const [tags, setTags] = useState<Tag[]>([
    { id: "1", name: "Cliente VIP", color: "bg-yellow-500" },
    { id: "2", name: "Suporte", color: "bg-blue-500" },
    { id: "3", name: "Novo Lead", color: "bg-green-500" },
  ]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState({ name: "", color: "bg-blue-500" });

  // Departamentos
  const [departments, setDepartments] = useState<Department[]>([
    { id: "1", name: "Vendas", description: "Equipe responsável por fechar negócios" },
    { id: "2", name: "Suporte", description: "Atendimento pós-venda e suporte técnico" },
  ]);
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", description: "" });

  // Equipe
  const [team, setTeam] = useState<TeamMember[]>([
    { id: "1", name: "Patricia Batista", email: "patricia@atendflow.com", role: "admin" },
  ]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "agent" });

  // Horários
  const [hours, setHours] = useState(DEFAULT_HOURS);

  useEffect(() => {
    if (!showQRCode || qrExpired) return;
    if (qrTimer <= 0) { setQrExpired(true); return; }
    const t = setTimeout(() => setQrTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [showQRCode, qrTimer, qrExpired]);

  const startQRCode = () => {
    if (!newConn.name || !newConn.phone) { toast.error("Preencha o nome e número"); return; }
    setShowAddConnection(false);
    setShowQRCode(true);
    setQrExpired(false);
    setQrTimer(60);
  };

  const confirmQRConnection = async () => {
    await insert({ tenant_id: tenantId, channel_type: newConn.channelType, display_name: newConn.name, phone_number: newConn.phone, status: "connected", is_default: instances.length === 0, welcome_flow_id: newConn.welcomeFlowId || null, default_response_flow_id: newConn.defaultFlowId || null, closed_flow_id: newConn.closedFlowId || null, last_connected_at: new Date().toISOString() } as any);
    setNewConn({ name: "", phone: "", channelType: "whatsapp", welcomeFlowId: "", defaultFlowId: "", closedFlowId: "" });
    setShowQRCode(false);
    toast.success("Canal conectado!");
  };

  const toggleConnection = async (id: string) => {
    const conn = instances.find(c => c.id === id);
    if (!conn) return;
    await update(id, { status: conn.status === "connected" ? "disconnected" : "connected" } as any);
  };

  const handleAddTag = () => {
    if (!newTag.name.trim()) { toast.error("Informe o nome da etiqueta"); return; }
    setTags(prev => [...prev, { id: Date.now().toString(), ...newTag }]);
    setNewTag({ name: "", color: "bg-blue-500" });
    setShowAddTag(false);
    toast.success("Etiqueta criada!");
  };

  const handleDeleteTag = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
    toast.success("Etiqueta removida");
  };

  const handleAddDept = () => {
    if (!newDept.name.trim()) { toast.error("Informe o nome do departamento"); return; }
    setDepartments(prev => [...prev, { id: Date.now().toString(), ...newDept }]);
    setNewDept({ name: "", description: "" });
    setShowAddDept(false);
    toast.success("Departamento criado!");
  };

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) { toast.error("Preencha nome e e-mail"); return; }
    setTeam(prev => [...prev, { id: Date.now().toString(), ...newMember }]);
    setNewMember({ name: "", email: "", role: "agent" });
    setShowAddMember(false);
    toast.success("Membro adicionado!");
  };

  const toggleDay = (i: number) => {
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, enabled: !h.enabled } : h));
  };

  const updateHour = (i: number, field: "open" | "close", value: string) => {
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: value } : h));
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center py-20"><p className="text-sm text-muted-foreground">Carregando...</p></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie canais, equipe e configurações do sistema</p>
        </div>

        <Tabs defaultValue="connections">
          <TabsList className="flex-wrap">
            <TabsTrigger value="connections">Canais</TabsTrigger>
            <TabsTrigger value="tags" className="gap-1.5"><Tag className="w-3.5 h-3.5" />Etiquetas</TabsTrigger>
            <TabsTrigger value="departments" className="gap-1.5"><Building2 className="w-3.5 h-3.5" />Departamentos</TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5"><Users className="w-3.5 h-3.5" />Equipe</TabsTrigger>
            <TabsTrigger value="hours" className="gap-1.5"><Clock className="w-3.5 h-3.5" />Horários</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
          </TabsList>

          {/* CANAIS */}
          <TabsContent value="connections" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Conecte WhatsApp, Instagram e outros canais.</p>
              <Button onClick={() => setShowAddConnection(true)} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Adicionar Canal
              </Button>
            </div>
            {instances.length === 0 ? (
              <Card className="border border-border shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Phone className="w-12 h-12 text-muted-foreground/20 mb-4" />
                  <p className="text-sm text-muted-foreground">Nenhum canal conectado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {instances.map(conn => (
                  <Card key={conn.id} className="border border-border shadow-none">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${conn.status === "connected" ? "bg-green-500/10" : "bg-muted"}`}>
                            {conn.status === "connected" ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold">{conn.display_name}</h3>
                              <Badge className={`text-[10px] border-0 ${conn.status === "connected" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                                {conn.status === "connected" ? "Conectado" : "Desconectado"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{conn.phone_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => toggleConnection(conn.id)}>
                            {conn.status === "connected" ? "Desconectar" : "Conectar"}
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => remove(conn.id)}>
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

          {/* ETIQUETAS */}
          <TabsContent value="tags" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Crie etiquetas para organizar contatos e conversas.</p>
              <Button onClick={() => setShowAddTag(true)} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Nova Etiqueta
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tags.map(tag => (
                <Card key={tag.id} className="border border-border shadow-none">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${tag.color}`} />
                      <span className="text-sm font-medium text-foreground">{tag.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTag(tag.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {tags.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center py-12 border border-border rounded-xl">
                  <Tag className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma etiqueta criada</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* DEPARTAMENTOS */}
          <TabsContent value="departments" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Organize sua equipe em departamentos.</p>
              <Button onClick={() => setShowAddDept(true)} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Novo Departamento
              </Button>
            </div>
            <div className="space-y-3">
              {departments.map(dept => (
                <Card key={dept.id} className="border border-border shadow-none">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{dept.name}</p>
                        <p className="text-xs text-muted-foreground">{dept.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDepartments(prev => prev.filter(d => d.id !== dept.id))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {departments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 border border-border rounded-xl">
                  <Building2 className="w-10 h-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum departamento criado</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* EQUIPE */}
          <TabsContent value="team" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Gerencie os membros da sua equipe.</p>
              <Button onClick={() => setShowAddMember(true)} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Adicionar Membro
              </Button>
            </div>
            <div className="space-y-3">
              {team.map(member => (
                <Card key={member.id} className="border border-border shadow-none">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-semibold">
                        {member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {member.role === "admin" ? "Admin" : "Agente"}
                      </Badge>
                      {member.role !== "admin" && (
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setTeam(prev => prev.filter(m => m.id !== member.id))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* HORÁRIOS */}
          <TabsContent value="hours" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-5 space-y-3">
                <p className="text-sm text-muted-foreground mb-4">Defina os horários de atendimento para cada dia da semana.</p>
                {hours.map((h, i) => (
                  <div key={h.day} className="flex items-center gap-4">
                    <div className="w-24 flex items-center gap-2">
                      <Switch checked={h.enabled} onCheckedChange={() => toggleDay(i)} />
                      <span className="text-sm text-foreground">{h.day}</span>
                    </div>
                    {h.enabled ? (
                      <div className="flex items-center gap-2">
                        <Input type="time" value={h.open} onChange={e => updateHour(i, "open", e.target.value)} className="w-32 text-sm" />
                        <span className="text-sm text-muted-foreground">até</span>
                        <Input type="time" value={h.close} onChange={e => updateHour(i, "close", e.target.value)} className="w-32 text-sm" />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Fechado</span>
                    )}
                  </div>
                ))}
                <div className="pt-4">
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => toast.success("Horários salvos!")}>
                    Salvar Horários
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GERAL */}
          <TabsContent value="general" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Transcrição automática de áudio</p><p className="text-xs text-muted-foreground">Transcreve automaticamente áudios recebidos</p></div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Aceitar chamadas de voz</p><p className="text-xs text-muted-foreground">Permitir chamadas de voz pelo WhatsApp</p></div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Separar atendimentos por usuário</p><p className="text-xs text-muted-foreground">Cada atendente vê apenas seus contatos</p></div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Notificações sonoras</p><p className="text-xs text-muted-foreground">Som ao receber novas mensagens</p></div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Nova Etiqueta */}
      <Dialog open={showAddTag} onOpenChange={setShowAddTag}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Etiqueta</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
              <Input placeholder="Ex: Cliente VIP" value={newTag.name} onChange={e => setNewTag(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {TAG_COLORS.map(c => (
                  <button key={c.value} onClick={() => setNewTag(p => ({ ...p, color: c.value }))}
                    className={`w-8 h-8 rounded-full ${c.value} ${newTag.color === c.value ? "ring-2 ring-offset-2 ring-primary" : ""}`} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTag(false)}>Cancelar</Button>
            <Button onClick={handleAddTag}>Criar Etiqueta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Novo Departamento */}
      <Dialog open={showAddDept} onOpenChange={setShowAddDept}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Departamento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
              <Input placeholder="Ex: Vendas" value={newDept.name} onChange={e => setNewDept(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
              <Input placeholder="Ex: Equipe de vendas" value={newDept.description} onChange={e => setNewDept(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDept(false)}>Cancelar</Button>
            <Button onClick={handleAddDept}>Criar Departamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Novo Membro */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Membro</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
              <Input placeholder="Nome completo" value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">E-mail</label>
              <Input placeholder="email@empresa.com" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Função</label>
              <Select value={newMember.role} onValueChange={v => setNewMember(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancelar</Button>
            <Button onClick={handleAddMember}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Canal */}
      <Dialog open={showAddConnection} onOpenChange={setShowAddConnection}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Canal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo de Canal</label>
              <Select value={newConn.channelType} onValueChange={v => setNewConn(p => ({ ...p, channelType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CHANNEL_TYPES.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground">Nome da Conexão</label><Input value={newConn.name} onChange={e => setNewConn(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Atendimento Principal" className="mt-1" /></div>
            <div><label className="text-xs font-medium text-muted-foreground">Número / Identificador</label><Input value={newConn.phone} onChange={e => setNewConn(p => ({ ...p, phone: e.target.value }))} placeholder="+55 11 99999-0000" className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddConnection(false)}>Cancelar</Button>
            <Button onClick={startQRCode} className="bg-primary gap-2"><QrCode className="w-4 h-4" /> Gerar QR Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal QR Code */}
      <Dialog open={showQRCode} onOpenChange={() => setShowQRCode(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><QrCode className="w-5 h-5" /> Escanear QR Code</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">Abra o <strong>WhatsApp Business</strong> → Menu → <strong>Aparelhos conectados</strong> → <strong>Conectar</strong></p>
            <div className="relative w-64 h-64 border-2 border-border rounded-2xl flex items-center justify-center bg-white">
              {qrExpired ? (
                <div className="flex flex-col items-center gap-3">
                  <QrCode className="w-16 h-16 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">QR Code expirado</p>
                  <Button size="sm" variant="outline" onClick={() => { setQrExpired(false); setQrTimer(60); }} className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Atualizar</Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-11 gap-[2px] p-4">
                    {Array.from({ length: 121 }, (_, i) => {
                      const row = Math.floor(i / 11); const col = i % 11;
                      const isCorner = (row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3);
                      return (<div key={i} className={`w-3.5 h-3.5 rounded-[1px] ${isCorner || Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"}`} />);
                    })}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-background/80 rounded-md px-2 py-1">
                    <span className="text-xs font-mono text-muted-foreground">{qrTimer}s</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRCode(false)}>Cancelar</Button>
            <Button onClick={confirmQRConnection} className="bg-green-500 hover:bg-green-600 text-white gap-2"><Wifi className="w-4 h-4" /> Já escaneei</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}



