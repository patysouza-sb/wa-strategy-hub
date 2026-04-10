import { useState, useRef, useCallback, useEffect } from "react";
import {
  Play, MessageSquare, Grid3X3, Shuffle, Tag, HeadphonesIcon, Building2,
  Save, RotateCcw, GitBranch, Clock, Bell, X, GripVertical, Plus, Trash2,
  ZoomIn, ZoomOut, Undo2, MousePointer2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface FlowNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  data?: Record<string, string>;
  color: string;
}

interface FlowConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const BLOCK_TYPES = [
  { type: "inicio", label: "Início", icon: Play, color: "bg-red-500" },
  { type: "conteudo", label: "Conteúdo", icon: MessageSquare, color: "bg-orange-500" },
  { type: "menu", label: "Menu", icon: Grid3X3, color: "bg-purple-500" },
  { type: "randomizador", label: "Randomizador", icon: Shuffle, color: "bg-blue-500" },
  { type: "etiqueta", label: "Etiqueta", icon: Tag, color: "bg-pink-500" },
  { type: "controlador", label: "Controlador de Chat", icon: HeadphonesIcon, color: "bg-teal-500" },
  { type: "departamentos", label: "Departamentos", icon: Building2, color: "bg-indigo-500" },
  { type: "salvar", label: "Salvar", icon: Save, color: "bg-emerald-500" },
  { type: "remarketing", label: "Remarketing", icon: RotateCcw, color: "bg-yellow-500" },
  { type: "condicao", label: "Condição", icon: GitBranch, color: "bg-cyan-500" },
  { type: "conexao", label: "Conexão de fluxo", icon: GitBranch, color: "bg-violet-500" },
  { type: "atraso", label: "Atraso inteligente", icon: Clock, color: "bg-amber-500" },
  { type: "notificacao", label: "Notificação", icon: Bell, color: "bg-rose-500" },
];

const DEFAULT_NODES: FlowNode[] = [
  { id: "1", type: "inicio", label: "Início", x: 80, y: 60, color: "bg-red-500", data: { message: "Olá! Bem-vindo ao atendimento." } },
  { id: "2", type: "menu", label: "Menu Principal", x: 350, y: 40, color: "bg-purple-500", data: { message: "Escolha uma opção:" } },
  { id: "3", type: "conteudo", label: "Informações", x: 350, y: 250, color: "bg-orange-500", data: { message: "Aqui estão nossas informações..." } },
  { id: "4", type: "salvar", label: "Salvar Contato", x: 650, y: 60, color: "bg-emerald-500", data: { message: "Contato salvo com sucesso." } },
  { id: "5", type: "conexao", label: "Conexão de fluxo", x: 650, y: 250, color: "bg-violet-500", data: { message: "Ir para o fluxo" } },
];

const DEFAULT_CONNECTIONS: FlowConnection[] = [
  { id: "c1", from: "1", to: "2", label: "Próximo" },
  { id: "c2", from: "2", to: "3", label: "Opção 1" },
  { id: "c3", from: "2", to: "4", label: "Opção 2" },
  { id: "c4", from: "3", to: "5", label: "Finalizar" },
];

export default function FlowEditor({ flowName, onBack }: { flowName: string; onBack: () => void }) {
  const [nodes, setNodes] = useState<FlowNode[]>(DEFAULT_NODES);
  const [connections, setConnections] = useState<FlowConnection[]>(DEFAULT_CONNECTIONS);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getBlockType = (type: string) => BLOCK_TYPES.find(b => b.type === type);

  const addNode = (type: string) => {
    const bt = getBlockType(type);
    if (!bt) return;
    const newNode: FlowNode = {
      id: Date.now().toString(),
      type,
      label: bt.label,
      x: 200 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      color: bt.color,
      data: { message: "" },
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    if (selectedNode === id) setSelectedNode(null);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connecting) {
      if (connecting !== nodeId) {
        setConnections(prev => [...prev, {
          id: `c-${Date.now()}`,
          from: connecting,
          to: nodeId,
        }]);
      }
      setConnecting(null);
      return;
    }
    setSelectedNode(nodeId);
    setDragging(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({ x: e.clientX / zoom - node.x, y: e.clientY / zoom - node.y });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    setNodes(prev => prev.map(n =>
      n.id === dragging
        ? { ...n, x: e.clientX / zoom - dragOffset.x, y: e.clientY / zoom - dragOffset.y }
        : n
    ));
  }, [dragging, dragOffset, zoom]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

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
    return { x: node.x + 90, y: node.y + 30 };
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>← Voltar</Button>
          <span className="text-sm font-semibold text-foreground">{flowName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Undo2 className="w-3.5 h-3.5" /> Desfazer
          </Button>
          <div className="flex items-center gap-1 border border-border rounded-lg px-1">
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Play className="w-3.5 h-3.5" /> Testar
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs">
            <Save className="w-3.5 h-3.5" /> Salvar
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Block palette */}
        <div className="w-52 border-r border-border bg-card overflow-y-auto p-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Blocos</p>
          {BLOCK_TYPES.map(bt => {
            const Icon = bt.icon;
            return (
              <button
                key={bt.type}
                onClick={() => addNode(bt.type)}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-foreground hover:bg-muted/60 transition-colors text-left"
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center ${bt.color} text-white`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {bt.label}
              </button>
            );
          })}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={{ background: "hsl(220 14% 96%)", backgroundImage: "radial-gradient(circle, hsl(220 13% 88%) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          onClick={() => { setSelectedNode(null); setConnecting(null); }}
        >
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="hsl(220 10% 60%)" />
              </marker>
            </defs>
            {connections.map(conn => {
              const from = getNodeCenter(conn.from);
              const to = getNodeCenter(conn.to);
              const midX = (from.x + to.x) / 2;
              return (
                <g key={conn.id}>
                  <path
                    d={`M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`}
                    fill="none"
                    stroke="hsl(220 10% 70%)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    markerEnd="url(#arrowhead)"
                  />
                  {conn.label && (
                    <text x={midX} y={(from.y + to.y) / 2 - 8} textAnchor="middle" fontSize="10" fill="hsl(220 10% 50%)" className="select-none">
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
              const isConnecting = connecting === node.id;

              return (
                <div
                  key={node.id}
                  className={`absolute cursor-grab active:cursor-grabbing select-none group`}
                  style={{ left: node.x, top: node.y, zIndex: isSelected ? 10 : 1 }}
                  onMouseDown={e => handleMouseDown(e, node.id)}
                  onClick={e => e.stopPropagation()}
                >
                  <div className={`min-w-[180px] bg-white rounded-xl shadow-md border-2 transition-colors ${isSelected ? "border-primary" : isConnecting ? "border-blue-400" : "border-transparent hover:border-border"}`}>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-t-xl ${bt.color} text-white`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold flex-1">{node.label}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[10px] text-muted-foreground truncate">{node.data?.message || "Sem conteúdo"}</p>
                    </div>
                    {/* Connection point */}
                    <div className="flex justify-between px-2 pb-2">
                      <button
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[8px] transition-colors ${connecting ? "bg-blue-100 border-blue-400" : "bg-muted border-border hover:border-primary"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConnecting(connecting === node.id ? null : node.id);
                        }}
                        title="Conectar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {connecting && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-50">
              Clique em outro bloco para conectar
            </div>
          )}
        </div>

        {/* Properties panel */}
        {selectedNodeData && (
          <div className="w-72 border-l border-border bg-card overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Propriedades</h3>
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setSelectedNode(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Nome do bloco</label>
                <Input
                  value={selectedNodeData.label}
                  onChange={e => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, label: e.target.value } : n))}
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Mensagem</label>
                <Textarea
                  value={selectedNodeData.data?.message || ""}
                  onChange={e => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, data: { ...n.data, message: e.target.value } } : n))}
                  className="mt-1 text-xs min-h-[80px]"
                  placeholder="Digite a mensagem..."
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase">Conexões</label>
                <div className="mt-1 space-y-1">
                  {connections.filter(c => c.from === selectedNode || c.to === selectedNode).map(conn => {
                    const otherNode = nodes.find(n => n.id === (conn.from === selectedNode ? conn.to : conn.from));
                    return (
                      <div key={conn.id} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1.5">
                        <span className="text-[10px] text-foreground">
                          {conn.from === selectedNode ? "→" : "←"} {otherNode?.label}
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
