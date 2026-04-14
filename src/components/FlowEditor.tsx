import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Play, MessageSquare, Grid3X3, Shuffle, Tag, HeadphonesIcon, Building2,
  Save, RotateCcw, GitBranch, Clock, X, Plus, Trash2,
  ZoomIn, ZoomOut, Undo2, Share2, Upload, FileText, Image, Video, Mic,
  AlertCircle, CheckCircle2, XCircle, Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface FlowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  data?: Record<string, any>;
  color: string;
}

interface FlowConnection {
  id: string;
  from: string;
  to: string;
  fromPort?: string;
  label?: string;
}

const BLOCK_TYPES = [
  { type: "inicio", label: "Início", icon: Play, color: "bg-red-500", category: "flow" },
  { type: "conteudo", label: "Conteúdo", icon: MessageSquare, color: "bg-orange-500", category: "content" },
  { type: "menu", label: "Menu", icon: Grid3X3, color: "bg-purple-500", category: "flow" },
  { type: "randomizador", label: "Randomizador", icon: Shuffle, color: "bg-blue-500", category: "flow" },
  { type: "etiqueta", label: "Etiqueta", icon: Tag, color: "bg-pink-500", category: "data" },
  { type: "controlador", label: "Controlador de Chat", icon: HeadphonesIcon, color: "bg-teal-500", category: "flow" },
  { type: "departamentos", label: "Departamentos", icon: Building2, color: "bg-indigo-500", category: "flow" },
  { type: "salvar", label: "Salvar", icon: Save, color: "bg-emerald-500", category: "logic" },
  { type: "remarketing", label: "Remarketing", icon: RotateCcw, color: "bg-yellow-500", category: "logic" },
  { type: "condicao", label: "Condição", icon: GitBranch, color: "bg-cyan-500", category: "logic" },
  { type: "conexao", label: "Conexão de Fluxo", icon: GitBranch, color: "bg-violet-500", category: "flow" },
  { type: "atraso", label: "Atraso / Delay", icon: Clock, color: "bg-amber-500", category: "flow" },
];

const DELAY_OPTIONS = [
  { value: "5s", label: "5 segundos" },
  { value: "10s", label: "10 segundos" },
  { value: "30s", label: "30 segundos" },
  { value: "1m", label: "1 minuto" },
  { value: "5m", label: "5 minutos" },
  { value: "15m", label: "15 minutos" },
  { value: "30m", label: "30 minutos" },
  { value: "1h", label: "1 hora" },
  { value: "24h", label: "24 horas" },
];

const CONTENT_TYPES = [
  { value: "text", label: "Texto", icon: FileText },
  { value: "audio", label: "Áudio", icon: Mic },
  { value: "video", label: "Vídeo", icon: Video },
  { value: "image", label: "Imagem", icon: Image },
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "proof", label: "Prova Social", icon: CheckCircle2 },
];

interface FlowEditorProps {
  flowName: string;
  onBack: () => void;
  allFlows?: string[];
  flowId?: string;
}

export default function FlowEditor({ flowName, onBack, allFlows = [], flowId }: FlowEditorProps) {
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: "1", type: "inicio", label: "Início", x: 80, y: 200, color: "bg-red-500", data: { message: "" } },
  ]);
  const [connections, setConnections] = useState<FlowConnection[]>([]);

  // Load saved nodes/connections from DB
  useEffect(() => {
    if (!flowId) return;
    const load = async () => {
      const { data } = await (supabase as any).from("flows").select("nodes, connections").eq("id", flowId).single();
      if (data) {
        if (data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0) setNodes(data.nodes);
        if (data.connections && Array.isArray(data.connections)) setConnections(data.connections);
      }
    };
    load();
  }, [flowId]);

  // Auto-save nodes/connections to DB
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!flowId) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await (supabase as any).from("flows").update({ nodes, connections }).eq("id", flowId);
    }, 1500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [nodes, connections, flowId]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ nodeId: string; port?: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getBlockType = (type: string) => BLOCK_TYPES.find(b => b.type === type);

  const addNode = (type: string) => {
    const bt = getBlockType(type);
    if (!bt) return;
    const defaultData: Record<string, any> = { message: "" };

    if (type === "conteudo") {
      defaultData.contentType = "text";
      defaultData.fileName = "";
    }
    if (type === "salvar") {
      defaultData.waitForResponse = true;
      defaultData.timeout = "15m";
      defaultData.maxRetries = "3";
    }
    if (type === "conexao") {
      defaultData.targetFlow = "";
    }
    if (type === "atraso") {
      defaultData.delay = "5s";
    }
    if (type === "remarketing") {
      defaultData.delay = "15m";
      defaultData.message = "";
    }
    if (type === "condicao") {
      defaultData.conditions = [];
    }

    const newNode: FlowNode = {
      id: Date.now().toString(),
      type,
      label: bt.label,
      x: 300 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      color: bt.color,
      data: defaultData,
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    if (selectedNode === id) setSelectedNode(null);
  };

  const startConnection = (nodeId: string, port?: string) => {
    if (connecting) {
      if (connecting.nodeId !== nodeId) {
        setConnections(prev => [...prev, {
          id: `c-${Date.now()}`,
          from: connecting.nodeId,
          to: nodeId,
          fromPort: connecting.port,
          label: connecting.port || "",
        }]);
      }
      setConnecting(null);
    } else {
      setConnecting({ nodeId, port });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
    setDragging(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: (e.clientX - rect.left) / zoom - node.x,
        y: (e.clientY - rect.top) / zoom - node.y,
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setNodes(prev => prev.map(n =>
      n.id === dragging
        ? { ...n, x: (e.clientX - rect.left) / zoom - dragOffset.x, y: (e.clientY - rect.top) / zoom - dragOffset.y }
        : n
    ));
  }, [dragging, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const getNodeCenter = (id: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return { x: 0, y: 0 };
    return { x: node.x + 100, y: node.y + 35 };
  };

  const getPortPosition = (id: string, port?: string) => {
    const node = nodes.find(n => n.id === id);
    if (!node) return { x: 0, y: 0 };
    const baseX = node.x + 200;
    if (node.type === "salvar" && port) {
      if (port === "responded") return { x: baseX, y: node.y + 30 };
      if (port === "timeout") return { x: baseX, y: node.y + 55 };
      if (port === "exhausted") return { x: baseX, y: node.y + 80 };
    }
    return { x: node.x + 100, y: node.y + 70 };
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  const categories = [
    { key: "flow", label: "Fluxo" },
    { key: "content", label: "Conteúdo" },
    { key: "logic", label: "Lógica" },
    { key: "data", label: "Dados" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            ← Voltar
          </Button>
          <div className="h-5 w-px bg-border" />
          <GitBranch className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{flowName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Undo2 className="w-3.5 h-3.5" /> Desfazer
          </Button>
          <div className="flex items-center gap-1 border border-border rounded-lg px-1">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Share2 className="w-3.5 h-3.5" /> Compartilhar
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs">
            <Save className="w-3.5 h-3.5" /> Salvar Fluxo
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Block palette */}
        <div className="w-56 border-r border-border bg-card overflow-y-auto p-3 space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Blocos</p>
          {categories.map(cat => (
            <div key={cat.key}>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 mt-2">{cat.label}</p>
              <div className="space-y-1">
                {BLOCK_TYPES.filter(b => b.category === cat.key).map(bt => {
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.type}
                      onClick={() => addNode(bt.type)}
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-foreground hover:bg-muted/60 transition-colors text-left group"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bt.color} text-white shadow-sm`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="group-hover:text-foreground">{bt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={{
            background: "hsl(var(--secondary))",
            backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          onClick={() => { setSelectedNode(null); setConnecting(null); }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
              </marker>
            </defs>
            {connections.map(conn => {
              const from = conn.fromPort ? getPortPosition(conn.from, conn.fromPort) : getNodeCenter(conn.from);
              const to = getNodeCenter(conn.to);
              const midX = (from.x + to.x) / 2;
              return (
                <g key={conn.id}>
                  <path
                    d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                    fill="none"
                    stroke="hsl(var(--muted-foreground) / 0.4)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    markerEnd="url(#arrowhead)"
                  />
                  {conn.label && (
                    <text x={midX} y={(from.y + to.y) / 2 - 8} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" className="select-none">
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div style={{ transform: `scale(${zoom})`, transformOrigin: "0 0", position: "relative", width: "100%", height: "100%" }}>
            {nodes.map(node => {
              const bt = getBlockType(node.type);
              if (!bt) return null;
              const Icon = bt.icon;
              const isSelected = selectedNode === node.id;
              const isConnectingThis = connecting?.nodeId === node.id;

              return (
                <div
                  key={node.id}
                  className="absolute cursor-grab active:cursor-grabbing select-none group"
                  style={{ left: node.x, top: node.y, zIndex: isSelected ? 10 : 1 }}
                  onMouseDown={e => handleMouseDown(e, node.id)}
                  onClick={e => e.stopPropagation()}
                >
                  <div className={`min-w-[200px] bg-card rounded-xl shadow-md border-2 transition-all ${
                    isSelected ? "border-primary shadow-lg" : isConnectingThis ? "border-blue-400" : "border-transparent hover:border-border"
                  }`}>
                    {/* Header */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-t-[10px] ${bt.color} text-white`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold flex-1 truncate">{node.label}</span>
                      <button
                        onClick={e => { e.stopPropagation(); deleteNode(node.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="px-3 py-2 space-y-1">
                      {node.type === "conteudo" && (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-[9px]">
                            {CONTENT_TYPES.find(c => c.value === node.data?.contentType)?.label || "Texto"}
                          </Badge>
                          {node.data?.fileName && (
                            <span className="text-[9px] text-muted-foreground truncate">{node.data.fileName}</span>
                          )}
                        </div>
                      )}
                      {node.type === "salvar" && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[9px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span className="text-muted-foreground">Respondeu</span>
                            <button
                              className="ml-auto w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center hover:bg-emerald-200"
                              onClick={e => { e.stopPropagation(); startConnection(node.id, "responded"); }}
                              title="Conectar: Respondeu"
                            >
                              <Plus className="w-2.5 h-2.5 text-emerald-600" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-[9px]">
                            <Timer className="w-3 h-3 text-amber-500" />
                            <span className="text-muted-foreground">Após {node.data?.timeout || "15m"}</span>
                            <button
                              className="ml-auto w-4 h-4 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center hover:bg-amber-200"
                              onClick={e => { e.stopPropagation(); startConnection(node.id, "timeout"); }}
                              title="Conectar: Timeout"
                            >
                              <Plus className="w-2.5 h-2.5 text-amber-600" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-[9px]">
                            <XCircle className="w-3 h-3 text-red-500" />
                            <span className="text-muted-foreground">Esgotou tentativas</span>
                            <button
                              className="ml-auto w-4 h-4 rounded-full bg-red-100 border border-red-300 flex items-center justify-center hover:bg-red-200"
                              onClick={e => { e.stopPropagation(); startConnection(node.id, "exhausted"); }}
                              title="Conectar: Esgotou"
                            >
                              <Plus className="w-2.5 h-2.5 text-red-600" />
                            </button>
                          </div>
                        </div>
                      )}
                      {node.type === "conexao" && (
                        <div className="text-[9px] text-muted-foreground">
                          → {node.data?.targetFlow || "Selecione um fluxo"}
                        </div>
                      )}
                      {node.type === "atraso" && (
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {DELAY_OPTIONS.find(d => d.value === node.data?.delay)?.label || "5 segundos"}
                        </div>
                      )}
                      {node.type === "remarketing" && (
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <RotateCcw className="w-3 h-3" />
                          Reengajar após {DELAY_OPTIONS.find(d => d.value === node.data?.delay)?.label || "15m"}
                        </div>
                      )}
                      {!["conteudo", "salvar", "conexao", "atraso", "remarketing"].includes(node.type) && (
                        <p className="text-[9px] text-muted-foreground truncate">
                          {node.data?.message || "Clique para configurar"}
                        </p>
                      )}
                    </div>

                    {/* Connection output (except salvar which has custom ports) */}
                    {node.type !== "salvar" && (
                      <div className="flex justify-end px-2 pb-2">
                        <button
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            connecting ? "bg-blue-50 border-blue-400 hover:bg-blue-100" : "bg-muted border-border hover:border-primary"
                          }`}
                          onClick={e => { e.stopPropagation(); startConnection(node.id); }}
                          title="Conectar"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {connecting && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-full shadow-lg z-50 font-medium">
              Clique em outro bloco para conectar
              <button className="ml-2 underline" onClick={() => setConnecting(null)}>Cancelar</button>
            </div>
          )}
        </div>

        {/* Properties panel */}
        {selectedNodeData && (
          <div className="w-80 border-l border-border bg-card overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Propriedades</h3>
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setSelectedNode(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Common: Label */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Nome do bloco</label>
                <Input
                  value={selectedNodeData.label}
                  onChange={e => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, label: e.target.value } : n))}
                  className="mt-1 h-8 text-xs"
                />
              </div>

              {/* Content block properties */}
              {selectedNodeData.type === "conteudo" && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Tipo de conteúdo</label>
                    <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                      {CONTENT_TYPES.map(ct => {
                        const CtIcon = ct.icon;
                        const isActive = selectedNodeData.data?.contentType === ct.value;
                        return (
                          <button
                            key={ct.value}
                            onClick={() => setNodes(prev => prev.map(n =>
                              n.id === selectedNode ? { ...n, data: { ...n.data, contentType: ct.value } } : n
                            ))}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[9px] transition-colors ${
                              isActive ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"
                            }`}
                          >
                            <CtIcon className="w-3.5 h-3.5" />
                            {ct.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Mensagem</label>
                    <Textarea
                      value={selectedNodeData.data?.message || ""}
                      onChange={e => setNodes(prev => prev.map(n =>
                        n.id === selectedNode ? { ...n, data: { ...n.data, message: e.target.value } } : n
                      ))}
                      className="mt-1 text-xs min-h-[80px]"
                      placeholder="Digite a mensagem do conteúdo..."
                    />
                  </div>
                  {selectedNodeData.data?.contentType !== "text" && (
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Arquivo</label>
                      <div className="mt-1 border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground">Clique para enviar arquivo</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">
                          {selectedNodeData.data?.contentType === "audio" && "MP3, OGG, WAV"}
                          {selectedNodeData.data?.contentType === "video" && "MP4, MOV"}
                          {selectedNodeData.data?.contentType === "image" && "JPG, PNG, WEBP"}
                          {selectedNodeData.data?.contentType === "pdf" && "PDF"}
                          {selectedNodeData.data?.contentType === "proof" && "Imagem ou vídeo"}
                        </p>
                      </div>
                      {selectedNodeData.data?.fileName && (
                        <p className="text-[10px] text-foreground mt-1">📎 {selectedNodeData.data.fileName}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Save block properties */}
              {selectedNodeData.type === "salvar" && (
                <>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase">Lógica de Espera</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-700">Esperar resposta</span>
                      <Switch
                        checked={selectedNodeData.data?.waitForResponse ?? true}
                        onCheckedChange={v => setNodes(prev => prev.map(n =>
                          n.id === selectedNode ? { ...n, data: { ...n.data, waitForResponse: v } } : n
                        ))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Caso não responda após</label>
                    <Select
                      value={selectedNodeData.data?.timeout || "15m"}
                      onValueChange={v => setNodes(prev => prev.map(n =>
                        n.id === selectedNode ? { ...n, data: { ...n.data, timeout: v } } : n
                      ))}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELAY_OPTIONS.map(d => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Máx. tentativas</label>
                    <Select
                      value={selectedNodeData.data?.maxRetries || "3"}
                      onValueChange={v => setNodes(prev => prev.map(n =>
                        n.id === selectedNode ? { ...n, data: { ...n.data, maxRetries: v } } : n
                      ))}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 tentativa</SelectItem>
                        <SelectItem value="2">2 tentativas</SelectItem>
                        <SelectItem value="3">3 tentativas</SelectItem>
                        <SelectItem value="5">5 tentativas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Saídas do bloco</p>
                    <div className="flex items-center gap-2 text-xs p-2 bg-emerald-50 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-700">Respondeu → Próximo bloco</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs p-2 bg-amber-50 rounded-lg">
                      <Timer className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-amber-700">Timeout → Remarketing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs p-2 bg-red-50 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-red-700">Esgotou → Finalizar</span>
                    </div>
                  </div>
                </>
              )}

              {/* Flow Connection block */}
              {selectedNodeData.type === "conexao" && (
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Ir para o fluxo</label>
                  <Select
                    value={selectedNodeData.data?.targetFlow || ""}
                    onValueChange={v => setNodes(prev => prev.map(n =>
                      n.id === selectedNode ? { ...n, data: { ...n.data, targetFlow: v } } : n
                    ))}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Selecione um fluxo" /></SelectTrigger>
                    <SelectContent>
                      {allFlows.filter(f => f !== flowName).map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                      {allFlows.filter(f => f !== flowName).length === 0 && (
                        <SelectItem value="none" disabled>Nenhum fluxo disponível</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] text-muted-foreground mt-1.5">
                    Conecte este bloco a outro fluxo para dividir seu funil em etapas
                  </p>
                </div>
              )}

              {/* Delay block */}
              {selectedNodeData.type === "atraso" && (
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Tempo de espera</label>
                  <Select
                    value={selectedNodeData.data?.delay || "5s"}
                    onValueChange={v => setNodes(prev => prev.map(n =>
                      n.id === selectedNode ? { ...n, data: { ...n.data, delay: v } } : n
                    ))}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DELAY_OPTIONS.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Remarketing block */}
              {selectedNodeData.type === "remarketing" && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Reengajar após</label>
                    <Select
                      value={selectedNodeData.data?.delay || "15m"}
                      onValueChange={v => setNodes(prev => prev.map(n =>
                        n.id === selectedNode ? { ...n, data: { ...n.data, delay: v } } : n
                      ))}
                    >
                      <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DELAY_OPTIONS.map(d => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Mensagem de remarketing</label>
                    <Textarea
                      value={selectedNodeData.data?.message || ""}
                      onChange={e => setNodes(prev => prev.map(n =>
                        n.id === selectedNode ? { ...n, data: { ...n.data, message: e.target.value } } : n
                      ))}
                      className="mt-1 text-xs min-h-[60px]"
                      placeholder="Ex: Oi! Ainda tem interesse?"
                    />
                  </div>
                </>
              )}

              {/* Condition block */}
              {selectedNodeData.type === "condicao" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Regras de condição</label>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 text-primary" />
                      <span>Se demonstrou interesse → Fechamento</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 text-primary" />
                      <span>Se pediu valor → Bloco de preço</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 text-primary" />
                      <span>Se pediu prova → Prova social</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Palavras-chave</label>
                    <Input
                      placeholder="Ex: interesse, quero, valor"
                      className="mt-1 h-8 text-xs"
                      onChange={e => setNodes(prev => prev.map(n =>
                        n.id === selectedNode ? { ...n, data: { ...n.data, keywords: e.target.value } } : n
                      ))}
                    />
                  </div>
                </div>
              )}

              {/* Generic message for other blocks */}
              {!["conteudo", "salvar", "conexao", "atraso", "remarketing", "condicao"].includes(selectedNodeData.type) && (
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Mensagem</label>
                  <Textarea
                    value={selectedNodeData.data?.message || ""}
                    onChange={e => setNodes(prev => prev.map(n =>
                      n.id === selectedNode ? { ...n, data: { ...n.data, message: e.target.value } } : n
                    ))}
                    className="mt-1 text-xs min-h-[80px]"
                    placeholder="Digite a mensagem..."
                  />
                </div>
              )}

              {/* Connections list */}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Conexões</label>
                <div className="mt-1 space-y-1">
                  {connections.filter(c => c.from === selectedNode || c.to === selectedNode).length === 0 && (
                    <p className="text-[9px] text-muted-foreground p-2">Nenhuma conexão</p>
                  )}
                  {connections.filter(c => c.from === selectedNode || c.to === selectedNode).map(conn => {
                    const otherNode = nodes.find(n => n.id === (conn.from === selectedNode ? conn.to : conn.from));
                    return (
                      <div key={conn.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-2.5 py-1.5">
                        <span className="text-[10px] text-foreground">
                          {conn.from === selectedNode ? "→" : "←"} {otherNode?.label}
                          {conn.label && <span className="text-muted-foreground ml-1">({conn.label})</span>}
                        </span>
                        <button onClick={() => setConnections(prev => prev.filter(c => c.id !== conn.id))}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs gap-1.5"
                onClick={() => deleteNode(selectedNode!)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir Bloco
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
