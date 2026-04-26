import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Radio, Plus, Send, Users, Tag, MoreVertical, X, Image, Video, Clock, Mic, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChannelFilter, CHANNEL_LABELS } from "@/components/ChannelFilter";

interface MediaFile {
  id: number;
  name: string;
  type: "image" | "video" | "audio";
  url: string;
  size: string;
}

interface BroadcastItem {
  id: number;
  name: string;
  type: string;
  channelType: string;
  status: "sent" | "scheduled" | "draft";
  sent: number;
  date: string;
}

export default function Broadcast() {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [newBroadcast, setNewBroadcast] = useState({
    name: "", type: "all", channelType: "whatsapp", tag: "", message: "",
    delayMinutes: "1", mediaFiles: [] as MediaFile[],
    includeAudio: false, audioDelayMinutes: "2",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: MediaFile[] = Array.from(files).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      type: f.type.startsWith("image") ? "image" : f.type.startsWith("video") ? "video" : "audio",
      url: URL.createObjectURL(f),
      size: `${(f.size / 1024).toFixed(0)} KB`,
    }));
    setNewBroadcast(p => ({ ...p, mediaFiles: [...p.mediaFiles, ...newFiles] }));
    toast.success(`${newFiles.length} arquivo(s) adicionado(s)`);
  };

  const removeMedia = (id: number) => {
    setNewBroadcast(p => ({ ...p, mediaFiles: p.mediaFiles.filter(f => f.id !== id) }));
  };

  const createBroadcast = () => {
    if (!newBroadcast.name || !newBroadcast.message) return;
    setBroadcasts(prev => [...prev, {
      id: Date.now(),
      name: newBroadcast.name,
      type: newBroadcast.type === "all" ? "Todos contatos" : newBroadcast.type === "list" ? "Lista" : "Etiqueta",
      channelType: newBroadcast.channelType,
      status: "draft",
      sent: 0,
      date: new Date().toLocaleDateString("pt-BR"),
    }]);
    setNewBroadcast({ name: "", type: "all", channelType: "whatsapp", tag: "", message: "", delayMinutes: "1", mediaFiles: [], includeAudio: false, audioDelayMinutes: "2" });
    setShowCreate(false);
    toast.success("Transmissão criada com sucesso!");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transmissão</h1>
            <p className="text-sm text-muted-foreground">Envie mensagens em massa com mídia, áudios e intervalos configuráveis</p>
          </div>
          <div className="flex items-center gap-2">
            <ChannelFilter value={channelFilter} onChange={setChannelFilter} />
            <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Nova Transmissão
            </Button>
          </div>
        </div>

        {(() => {
          const filtered = broadcasts.filter(b => channelFilter === "all" || b.channelType === channelFilter);
          if (filtered.length === 0) {
            return (
              <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 text-center">
                <Radio className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {broadcasts.length === 0 ? "Nenhuma transmissão criada" : "Nenhuma transmissão para o canal selecionado"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Transmissão" para enviar mensagens em massa.</p>
              </div>
            );
          }
          return (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-5 text-muted-foreground font-medium">Nome</th>
                    <th className="text-left py-3 px-5 text-muted-foreground font-medium">Canal</th>
                    <th className="text-left py-3 px-5 text-muted-foreground font-medium">Tipo</th>
                    <th className="text-center py-3 px-5 text-muted-foreground font-medium">Status</th>
                    <th className="text-center py-3 px-5 text-muted-foreground font-medium">Enviados</th>
                    <th className="text-center py-3 px-5 text-muted-foreground font-medium">Data</th>
                    <th className="text-right py-3 px-5 text-muted-foreground font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-5 font-medium text-foreground">{b.name}</td>
                      <td className="py-3 px-5">
                        <Badge variant="outline" className="text-[10px]">{CHANNEL_LABELS[b.channelType] || b.channelType}</Badge>
                      </td>
                      <td className="py-3 px-5 text-muted-foreground">{b.type}</td>
                      <td className="py-3 px-5 text-center">
                        <Badge className={`text-[10px] border-0 ${
                          b.status === "sent" ? "bg-success/10 text-success"
                          : b.status === "scheduled" ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                        }`}>
                          {b.status === "sent" ? "Enviado" : b.status === "scheduled" ? "Agendado" : "Rascunho"}
                        </Badge>
                      </td>
                      <td className="py-3 px-5 text-center text-foreground">{b.sent}</td>
                      <td className="py-3 px-5 text-center text-muted-foreground">{b.date}</td>
                      <td className="py-3 px-5 text-right">
                        <Button variant="ghost" size="icon" className="w-7 h-7"><MoreVertical className="w-3.5 h-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Transmissão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome da Transmissão</label>
              <Input value={newBroadcast.name} onChange={e => setNewBroadcast(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Promoção de Verão" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Canal</label>
              <Select value={newBroadcast.channelType} onValueChange={v => setNewBroadcast(p => ({ ...p, channelType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CHANNEL_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                <Select value={newBroadcast.type} onValueChange={v => setNewBroadcast(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos contatos</SelectItem>
                    <SelectItem value="list">Lista</SelectItem>
                    <SelectItem value="tag">Etiqueta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newBroadcast.type === "tag" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Selecione a Etiqueta</label>
                  <Select value={newBroadcast.tag} onValueChange={v => setNewBroadcast(p => ({ ...p, tag: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Escolha" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Cliente">Cliente</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mensagem (use {"{nome}"} para variáveis)</label>
              <Textarea value={newBroadcast.message} onChange={e => setNewBroadcast(p => ({ ...p, message: e.target.value }))} placeholder="Olá {nome}! Temos uma oferta especial..." className="mt-1 min-h-[100px]" />
            </div>
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Intervalo entre Mensagens</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Intervalo por mensagem</label>
                  <Select value={newBroadcast.delayMinutes} onValueChange={v => setNewBroadcast(p => ({ ...p, delayMinutes: v }))}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">30 segundos</SelectItem>
                      <SelectItem value="1">1 minuto</SelectItem>
                      <SelectItem value="2">2 minutos</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Intervalo por áudio</label>
                  <Select value={newBroadcast.audioDelayMinutes} onValueChange={v => setNewBroadcast(p => ({ ...p, audioDelayMinutes: v }))}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minuto</SelectItem>
                      <SelectItem value="2">2 minutos</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Define o intervalo entre cada envio para evitar bloqueios do WhatsApp</p>
            </div>
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Mídia (Provas Sociais & Produtos)</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-3 h-3" /> Enviar Arquivo
                </Button>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={handleFileUpload} />
              </div>
              {newBroadcast.mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {newBroadcast.mediaFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 group">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${
                        file.type === "image" ? "bg-blue-500/10" : file.type === "video" ? "bg-purple-500/10" : "bg-green-500/10"
                      }`}>
                        {file.type === "image" ? <Image className="w-4 h-4 text-blue-500" /> :
                         file.type === "video" ? <Video className="w-4 h-4 text-purple-500" /> :
                         <Mic className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{file.size}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100" onClick={() => removeMedia(file.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-border rounded-lg p-3 hover:border-primary/50 transition-colors text-center">
                  <Image className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground">Imagens</p>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-border rounded-lg p-3 hover:border-primary/50 transition-colors text-center">
                  <Video className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground">Vídeos</p>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-border rounded-lg p-3 hover:border-primary/50 transition-colors text-center">
                  <Mic className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-[10px] text-muted-foreground">Áudios</p>
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createBroadcast} className="bg-primary text-primary-foreground gap-2">
              <Send className="w-4 h-4" /> Criar Transmissão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
