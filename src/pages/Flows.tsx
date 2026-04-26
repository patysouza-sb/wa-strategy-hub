import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  GitBranch, Plus, Play, Pause, Folder, Pencil, Copy, Share2,
  Trash2, ChevronRight, ChevronDown, MoreVertical, FolderPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import FlowEditor from "@/components/FlowEditor";
import { useSupabaseTable } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEFAULT_TENANT_ID } from "@/lib/tenant";

interface DbFolder {
  id: string;
  name: string;
  tenant_id: string;
  parent_folder_id: string | null;
  path: string | null;
  created_at: string;
}

interface DbFlow {
  id: string;
  name: string;
  tenant_id: string;
  folder_id: string | null;
  shortcut: string | null;
  status: string;
  channel_type: string;
  created_by: string | null;
  created_at: string;
}

const CHANNEL_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "whatsapp_official", label: "WhatsApp Oficial" },
  { value: "instagram", label: "Instagram" },
  { value: "messenger", label: "Messenger" },
  { value: "email", label: "E-mail" },
  { value: "widget", label: "Widget Web" },
];

const DEFAULT_FOLDER_NAMES = [
  "ATENDIMENTOS FUNIL SCRIPT",
  "Atendimento Inicial",
  "Provas Sociais",
  "Fechamento",
  "Remarketing",
  "Pós-venda",
];

export default function Flows() {
  const { data: folders, loading: foldersLoading, insert: insertFolder, update: updateFolder, remove: removeFolder, fetch: fetchFolders } = useSupabaseTable<DbFolder>("flow_folders", "name");
  const { data: flows, loading: flowsLoading, insert: insertFlow, update: updateFlow, remove: removeFlow, fetch: fetchFlows } = useSupabaseTable<DbFlow>("automation_flows", "created_at");

  const [editingFlow, setEditingFlow] = useState<{ id: string; name: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [newFlow, setNewFlow] = useState({ name: "", shortcut: "", channelType: "whatsapp" });
  const [newFolderName, setNewFolderName] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  // Seed default folders if none exist
  useEffect(() => {
    if (foldersLoading || initialized) return;
    if (folders.length === 0) {
      const seedFolders = async () => {
        for (let i = 0; i < DEFAULT_FOLDER_NAMES.length; i++) {
          await (supabase as any).from("flow_folders").insert({
            name: DEFAULT_FOLDER_NAMES[i],
            tenant_id: DEFAULT_TENANT_ID,
          });
        }
        await fetchFolders();
      };
      seedFolders();
    } else {
      // Open first folder by default
      setOpenFolders(new Set([folders[0].id]));
    }
    setInitialized(true);
  }, [foldersLoading, folders.length, initialized]);

  useEffect(() => {
    if (folders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(folders[0].id);
    }
  }, [folders, selectedFolderId]);

  if (editingFlow) {
    return (
      <AppLayout>
        <FlowEditor
          flowName={editingFlow.name}
          onBack={async () => {
            setEditingFlow(null);
            await fetchFlows();
          }}
          allFlows={flows.map(f => f.name)}
          flowId={editingFlow.id}
        />
      </AppLayout>
    );
  }

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleStatus = async (id: string) => {
    const flow = flows.find(f => f.id === id);
    if (flow) await updateFlow(id, { status: flow.status === "active" ? "paused" : "active" } as any);
  };

  const openCreateInFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setNewFlow({ name: "", shortcut: "", channelType: "whatsapp" });
    setShowCreate(true);
  };

  const createFlow = async () => {
    if (!newFlow.name) return;
    await insertFlow({
      name: newFlow.name,
      tenant_id: DEFAULT_TENANT_ID,
      folder_id: selectedFolderId,
      shortcut: newFlow.shortcut || `/${newFlow.name.toLowerCase().replace(/\s/g, "")}`,
      channel_type: newFlow.channelType,
      status: "paused",
    } as any);
    setNewFlow({ name: "", shortcut: "", channelType: "whatsapp" });
    setShowCreate(false);
    toast.success("Fluxo criado!");
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await insertFolder({ name: newFolderName.trim(), tenant_id: DEFAULT_TENANT_ID } as any);
    setNewFolderName("");
    setShowCreateFolder(false);
    toast.success("Pasta criada!");
  };

  const duplicateFlow = async (flow: DbFlow) => {
    await insertFlow({
      name: `${flow.name} (cópia)`,
      tenant_id: DEFAULT_TENANT_ID,
      folder_id: flow.folder_id,
      shortcut: null,
      channel_type: flow.channel_type || "whatsapp",
      status: "paused",
    } as any);
    toast.success("Fluxo duplicado!");
  };

  const deleteFlow = async (id: string) => {
    await removeFlow(id);
    toast.success("Fluxo excluído");
  };

  const deleteFolder = async (id: string) => {
    const folderFlows = flows.filter(f => f.folder_id === id);
    for (const f of folderFlows) await removeFlow(f.id);
    await removeFolder(id);
    toast.success("Pasta excluída");
  };

  const getFlowsInFolder = (folderId: string) => flows.filter(f => f.folder_id === folderId);

  if (foldersLoading || flowsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Carregando fluxos...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fluxos de Conversa</h1>
            <p className="text-sm text-muted-foreground">Crie e gerencie seus funis automatizados de WhatsApp</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateFolder(true)} className="gap-2">
              <FolderPlus className="w-4 h-4" /> Nova Pasta
            </Button>
            <Button onClick={() => openCreateInFolder(folders[0]?.id || "")} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Novo Fluxo
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {folders.map(folder => {
            const folderFlows = getFlowsInFolder(folder.id);
            const isOpen = openFolders.has(folder.id);
            return (
              <div key={folder.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleFolder(folder.id)}>
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <Folder className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{folder.name}</span>
                    <Badge variant="secondary" className="text-[10px] ml-1">{folderFlows.length}</Badge>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openCreateInFolder(folder.id)} title="Adicionar fluxo">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-7 h-7"><MoreVertical className="w-3.5 h-3.5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openCreateInFolder(folder.id)}><Plus className="w-3.5 h-3.5 mr-2" /> Adicionar fluxo</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteFolder(folder.id)}><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir pasta</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border">
                    {folderFlows.length === 0 ? (
                      <div className="px-6 py-6 text-center">
                        <GitBranch className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Nenhum fluxo nesta pasta</p>
                        <Button variant="link" size="sm" className="text-xs mt-1" onClick={() => openCreateInFolder(folder.id)}>Criar primeiro fluxo</Button>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/20">
                            <th className="text-left py-2.5 px-5 text-muted-foreground font-medium text-xs">Nome</th>
                            <th className="text-left py-2.5 px-5 text-muted-foreground font-medium text-xs">Atalho</th>
                            <th className="text-center py-2.5 px-5 text-muted-foreground font-medium text-xs">Status</th>
                            <th className="text-right py-2.5 px-5 text-muted-foreground font-medium text-xs">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {folderFlows.map(flow => (
                            <tr key={flow.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                              <td className="py-2.5 px-5">
                                <div className="flex items-center gap-2">
                                  <GitBranch className="w-4 h-4 text-primary" />
                                  <span className="font-medium text-foreground">{flow.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-5">
                                <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">{flow.shortcut || "-"}</code>
                              </td>
                              <td className="py-2.5 px-5 text-center">
                                <Badge className={`text-[10px] border-0 ${flow.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                                  {flow.status === "active" ? "Ativo" : "Pausado"}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setEditingFlow({ id: flow.id, name: flow.name })} title="Editar fluxo">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => toggleStatus(flow.id)} title={flow.status === "active" ? "Pausar" : "Ativar"}>
                                    {flow.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="w-7 h-7"><MoreVertical className="w-3.5 h-3.5" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => duplicateFlow(flow)}><Copy className="w-3.5 h-3.5 mr-2" /> Duplicar</DropdownMenuItem>
                                      <DropdownMenuItem><Share2 className="w-3.5 h-3.5 mr-2" /> Compartilhar</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-destructive" onClick={() => deleteFlow(flow.id)}><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Fluxo</DialogTitle>
            <DialogDescription>
              Pasta: <span className="font-semibold text-foreground">{folders.find(f => f.id === selectedFolderId)?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome do Fluxo</label>
              <Input value={newFlow.name} onChange={e => setNewFlow(p => ({ ...p, name: e.target.value }))} placeholder="Ex: PARTE 01 - ATENDIMENTO INICIAL" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Pasta</label>
              <Select value={selectedFolderId} onValueChange={v => setSelectedFolderId(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {folders.map(f => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Atalhos</label>
              <Input value={newFlow.shortcut} onChange={e => setNewFlow(p => ({ ...p, shortcut: e.target.value }))} placeholder="Ex: /atendimento1" className="mt-1" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createFlow} className="bg-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
            <DialogDescription>Organize seus fluxos em pastas</DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome da Pasta</label>
            <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Ex: Vendas Premium" className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>Cancelar</Button>
            <Button onClick={createFolder} className="bg-primary text-primary-foreground">Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
