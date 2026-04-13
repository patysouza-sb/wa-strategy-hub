import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  GitBranch, Plus, Play, Pause, Folder, Pencil, Copy, Share2,
  Trash2, ChevronRight, ChevronDown, MoreVertical, FolderPlus, Clock
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

interface Flow {
  id: number;
  name: string;
  folder: string;
  shortcut: string;
  status: "active" | "paused";
}

interface FlowFolder {
  name: string;
  open: boolean;
}

const DEFAULT_FOLDERS: FlowFolder[] = [
  { name: "ATENDIMENTOS FUNIL SCRIPT", open: true },
  { name: "Atendimento Inicial", open: false },
  { name: "Provas Sociais", open: false },
  { name: "Fechamento", open: false },
  { name: "Remarketing", open: false },
  { name: "Pós-venda", open: false },
];

export default function Flows() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [folders, setFolders] = useState<FlowFolder[]>(DEFAULT_FOLDERS);
  const [editingFlow, setEditingFlow] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>(DEFAULT_FOLDERS[0].name);
  const [newFlow, setNewFlow] = useState({ name: "", folder: "", shortcut: "", delay: "" });
  const [newFolderName, setNewFolderName] = useState("");

  if (editingFlow) {
    return (
      <AppLayout>
        <FlowEditor
          flowName={editingFlow}
          onBack={() => setEditingFlow(null)}
          allFlows={flows.map(f => f.name)}
        />
      </AppLayout>
    );
  }

  const toggleFolder = (name: string) => {
    setFolders(prev => prev.map(f => f.name === name ? { ...f, open: !f.open } : f));
  };

  const toggleStatus = (id: number) => {
    setFlows(prev => prev.map(f => f.id === id ? { ...f, status: f.status === "active" ? "paused" : "active" } : f));
  };

  const openCreateInFolder = (folderName: string) => {
    setSelectedFolder(folderName);
    setNewFlow({ name: "", folder: folderName, shortcut: "", delay: "" });
    setShowCreate(true);
  };

  const createFlow = () => {
    if (!newFlow.name) return;
    setFlows(prev => [...prev, {
      id: Date.now(),
      name: newFlow.name,
      folder: selectedFolder,
      shortcut: newFlow.shortcut || `/${newFlow.name.toLowerCase().replace(/\s/g, "")}`,
      status: "paused",
    }]);
    setNewFlow({ name: "", folder: "", shortcut: "", delay: "" });
    setShowCreate(false);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders(prev => [...prev, { name: newFolderName.trim(), open: true }]);
    setNewFolderName("");
    setShowCreateFolder(false);
  };

  const duplicateFlow = (flow: Flow) => {
    setFlows(prev => [...prev, {
      ...flow,
      id: Date.now(),
      name: `${flow.name} (cópia)`,
      status: "paused",
    }]);
  };

  const deleteFlow = (id: number) => {
    setFlows(prev => prev.filter(f => f.id !== id));
  };

  const deleteFolder = (name: string) => {
    setFolders(prev => prev.filter(f => f.name !== name));
    setFlows(prev => prev.filter(f => f.folder !== name));
  };

  const getFlowsInFolder = (folderName: string) => flows.filter(f => f.folder === folderName);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fluxos de Conversa</h1>
            <p className="text-sm text-muted-foreground">
              Crie e gerencie seus funis automatizados de WhatsApp
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateFolder(true)}
              className="gap-2"
            >
              <FolderPlus className="w-4 h-4" /> Nova Pasta
            </Button>
            <Button
              onClick={() => openCreateInFolder(folders[0]?.name || "Principal")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Fluxo
            </Button>
          </div>
        </div>

        {/* Folder Tree */}
        <div className="space-y-2">
          {folders.map(folder => {
            const folderFlows = getFlowsInFolder(folder.name);
            return (
              <div key={folder.name} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Folder Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleFolder(folder.name)}
                >
                  <div className="flex items-center gap-2">
                    {folder.open ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Folder className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{folder.name}</span>
                    <Badge variant="secondary" className="text-[10px] ml-1">
                      {folderFlows.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7"
                      onClick={() => openCreateInFolder(folder.name)}
                      title="Adicionar fluxo"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-7 h-7">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openCreateInFolder(folder.name)}>
                          <Plus className="w-3.5 h-3.5 mr-2" /> Adicionar fluxo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteFolder(folder.name)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir pasta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Folder Flows */}
                {folder.open && (
                  <div className="border-t border-border">
                    {folderFlows.length === 0 ? (
                      <div className="px-6 py-6 text-center">
                        <GitBranch className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Nenhum fluxo nesta pasta</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-xs mt-1"
                          onClick={() => openCreateInFolder(folder.name)}
                        >
                          Criar primeiro fluxo
                        </Button>
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
                                <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">{flow.shortcut}</code>
                              </td>
                              <td className="py-2.5 px-5 text-center">
                                <Badge className={`text-[10px] border-0 ${
                                  flow.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                }`}>
                                  {flow.status === "active" ? "Ativo" : "Pausado"}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-7 h-7"
                                    onClick={() => setEditingFlow(flow.name)}
                                    title="Editar fluxo"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-7 h-7"
                                    onClick={() => toggleStatus(flow.id)}
                                    title={flow.status === "active" ? "Pausar" : "Ativar"}
                                  >
                                    {flow.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="w-7 h-7">
                                        <MoreVertical className="w-3.5 h-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => duplicateFlow(flow)}>
                                        <Copy className="w-3.5 h-3.5 mr-2" /> Duplicar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Share2 className="w-3.5 h-3.5 mr-2" /> Compartilhar
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => deleteFlow(flow.id)}
                                      >
                                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                                      </DropdownMenuItem>
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

      {/* Modal: Adicionar Fluxo */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Fluxo</DialogTitle>
            <DialogDescription>
              Pasta: <span className="font-semibold text-foreground">{selectedFolder}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nome do Fluxo</label>
              <Input
                value={newFlow.name}
                onChange={e => setNewFlow(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: PARTE 01 - ATENDIMENTO INICIAL"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Pasta</label>
              <Select value={selectedFolder} onValueChange={v => setSelectedFolder(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {folders.map(f => (
                    <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Atalhos</label>
              <Input
                value={newFlow.shortcut}
                onChange={e => setNewFlow(p => ({ ...p, shortcut: e.target.value }))}
                placeholder="Ex: /atendimento1"
                className="mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Palavras curtas para localizar ou acionar rapidamente o fluxo
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Atraso inicial (opcional)</label>
              <Select value={newFlow.delay} onValueChange={v => setNewFlow(p => ({ ...p, delay: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Sem atraso" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem atraso</SelectItem>
                  <SelectItem value="5s">5 segundos</SelectItem>
                  <SelectItem value="10s">10 segundos</SelectItem>
                  <SelectItem value="1m">1 minuto</SelectItem>
                  <SelectItem value="15m">15 minutos</SelectItem>
                  <SelectItem value="1h">1 hora</SelectItem>
                  <SelectItem value="24h">24 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createFlow} className="bg-primary text-primary-foreground gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nova Pasta */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
            <DialogDescription>Organize seus fluxos em pastas</DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome da Pasta</label>
            <Input
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="Ex: Vendas Premium"
              className="mt-1"
            />
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
