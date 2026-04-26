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
  { type: "start", label: "Início", icon: Play, color: "bg-red-500", category: "flow" },
  { type: "content", label: "Conteúdo", icon: MessageSquare, color: "bg-orange-500", category: "content" },
  { type: "menu", label: "Menu", icon: Grid3X3, color: "bg-purple-500", category: "flow" },
  { type: "randomizer", label: "Randomizador", icon: Shuffle, color: "bg-blue-500", category: "flow" },
  { type: "tag", label: "Etiqueta", icon: Tag, color: "bg-pink-500", category: "data" },
  { type: "chat_controller", label: "Controlador de Chat", icon: HeadphonesIcon, color: "bg-teal-500", category: "flow" },
  { type: "department", label: "Departamentos", icon: Building2, color: "bg-indigo-500", category: "flow" },
  { type: "save", label: "Salvar", icon: Save, color: "bg-emerald-500", category: "logic" },
  { type: "remarketing", label: "Remarketing", icon: RotateCcw, color: "bg-yellow-500", category: "logic" },
  { type: "condition", label: "Condição", icon: GitBranch, color: "bg-cyan-500", category: "logic" },
  { type: "flow_connection", label: "Conexão de Fluxo", icon: GitBranch, color: "bg-violet-500", category: "flow" },
  { type: "smart_delay", label: "Atraso / Delay", icon: Clock, color: "bg-amber-500", category: "flow" },
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
    { id: "default-start", type: "start", label: "Início", x: 80, y: 200, color: "bg-red-500", data: { message: "" } },
  ]);
  const [connections, setConnections] = useState<FlowConnection[]>([]);

  // Helpers to convert delay strings <-> (value, unit)
  const parseDelay = (s?: string): { value: number; unit: string } => {
    if (!s) return { value: 15, unit: "minutes" };
    const m = s.match(/^(\d+)\s*(s|m|h|d)$/i);
    if (!m) return { value: 15, unit: "minutes" };
    const v = parseInt(m[1], 10);
    const u = m[2].toLowerCase();
    return { value: v, unit: u === "s" ? "seconds" : u === "m" ? "minutes" : u === "h" ? "hours" : "days" };
  };
  const formatDelay = (value?: number | null, unit?: string | null): string => {
    if (!value) return "15m";
    const u = (unit || "minutes").toLowerCase();
    const suf = u.startsWith("sec") ? "s" : u.startsWith("min") ? "m" : u.startsWith("hou") ? "h" : "d";
    return `${value}${suf}`;
  };

  // Load nodes, connections and per-node detail tables
  useEffect(() => {
    if (!flowId) return;
    const load = async () => {
      const { data: dbNodes } = await (supabase as any)
        .from("flow_nodes")
        .select("*")
        .eq("flow_id", flowId);

      if (!dbNodes || dbNodes.length === 0) return;

      const nodeIds = dbNodes.map((n: any) => n.id);

      const [contentRes, menuRes, saveRes, actionRes, randRes, connRes] = await Promise.all([
        (supabase as any).from("node_content_items").select("*").in("node_id", nodeIds).order("position", { ascending: true }),
        (supabase as any).from("node_menu_options").select("*").in("node_id", nodeIds).order("position", { ascending: true }),
        (supabase as any).from("node_save_configs").select("*").in("node_id", nodeIds),
        (supabase as any).from("node_action_configs").select("*").in("node_id", nodeIds).order("position", { ascending: true }),
        (supabase as any).from("node_randomizer_options").select("*").in("node_id", nodeIds).order("position", { ascending: true }),
        (supabase as any).from("flow_connections").select("*").eq("flow_id", flowId),
      ]);

      const contentByNode: Record<string, any[]> = {};
      (contentRes.data || []).forEach((r: any) => { (contentByNode[r.node_id] ||= []).push(r); });
      const menuByNode: Record<string, any[]> = {};
      (menuRes.data || []).forEach((r: any) => { (menuByNode[r.node_id] ||= []).push(r); });
      const saveByNode: Record<string, any> = {};
      (saveRes.data || []).forEach((r: any) => { saveByNode[r.node_id] = r; });
      const actionByNode: Record<string, any[]> = {};
      (actionRes.data || []).forEach((r: any) => { (actionByNode[r.node_id] ||= []).push(r); });
      const randByNode: Record<string, any[]> = {};
      (randRes.data || []).forEach((r: any) => { (randByNode[r.node_id] ||= []).push(r); });

      const mapped: FlowNode[] = dbNodes.map((n: any) => {
        const data: Record<string, any> = {};
        const firstContent = (contentByNode[n.id] || [])[0];
        if (firstContent) {
          data.contentType = firstContent.item_type || "text";
          data.message = firstContent.text_content || "";
          data.fileName = firstContent.media_filename || "";
          data.mediaUrl = firstContent.media_url || "";
        }
        if (menuByNode[n.id]) {
          data.options = menuByNode[n.id].map((o: any) => ({ label: o.label, keyword: o.keyword }));
        }
        if (saveByNode[n.id]) {
          const s = saveByNode[n.id];
          data.timeout = formatDelay(s.wait_time_value, s.wait_time_unit);
          data.maxRetries = String(s.max_retry_attempts ?? 3);
          data.waitForResponse = true;
          data.message = s.message_before_wait || data.message || "";
          data.saveFieldName = s.save_field_name || "";
        }
        if (actionByNode[n.id]) {
          const acts = actionByNode[n.id];
          const flowAct = acts.find((a: any) => a.action_type === "go_to_flow");
          if (flowAct) data.targetFlow = flowAct.target_flow_id || "";
          const tagAct = acts.find((a: any) => a.action_type === "add_tag");
          if (tagAct) data.tagId = tagAct.tag_id || "";
        }
        if (randByNode[n.id]) {
          data.randomizerOptions = randByNode[n.id].map((r: any) => ({ percentage: r.percentage }));
        }

        return {
          id: n.id,
          type: n.type,
          label: n.config?.label || BLOCK_TYPES.find(b => b.type === n.type)?.label || n.type,
          x: n.pos_x,
          y: n.pos_y,
          color: n.config?.color || "bg-gray-500",
          data,
        };
      });
      setNodes(mapped);

      const conns: FlowConnection[] = (connRes.data || []).map((c: any) => ({
        id: c.id,
        from: c.from_node_id,
        to: c.to_node_id,
        fromPort: c.from_output_key || undefined,
        label: c.condition_label || c.from_output_key || "",
      }));
      setConnections(conns);
    };
    load();
  }, [flowId]);

  // Auto-save to DB — persist node details into dedicated tables
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!flowId) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      // 1. Wipe existing flow data
      const { data: existingNodes } = await (supabase as any)
        .from("flow_nodes")
        .select("id")
        .eq("flow_id", flowId);

      const existingIds = (existingNodes || []).map((n: any) => n.id);
      if (existingIds.length > 0) {
        await Promise.all([
          (supabase as any).from("node_content_items").delete().in("node_id", existingIds),
          (supabase as any).from("node_menu_options").delete().in("node_id", existingIds),
          (supabase as any).from("node_save_configs").delete().in("node_id", existingIds),
          (supabase as any).from("node_action_configs").delete().in("node_id", existingIds),
          (supabase as any).from("node_randomizer_options").delete().in("node_id", existingIds),
        ]);
      }
      await (supabase as any).from("flow_connections").delete().eq("flow_id", flowId);
      await (supabase as any).from("flow_nodes").delete().eq("flow_id", flowId);

      if (nodes.length === 0) return;

      // 2. Insert nodes (config keeps only label + color now)
      const dbNodes = nodes.map(n => ({
        id: n.id,
        flow_id: flowId,
        type: n.type,
        pos_x: Math.round(n.x),
        pos_y: Math.round(n.y),
        config: { label: n.label, color: n.color },
      }));
      await (supabase as any).from("flow_nodes").insert(dbNodes);

      // 3. Build per-table batches
      const contentRows: any[] = [];
      const menuRows: any[] = [];
      const saveRows: any[] = [];
      const actionRows: any[] = [];
      const randRows: any[] = [];

      for (const n of nodes) {
        const d = n.data || {};
        if (n.type === "content" || (d.message && !["save", "menu", "randomizer", "flow_connection"].includes(n.type))) {
          contentRows.push({
            node_id: n.id,
            position: 0,
            item_type: d.contentType || "text",
            text_content: d.message || null,
            media_url: d.mediaUrl || null,
            media_filename: d.fileName || null,
          });
        }
        if (n.type === "menu" && Array.isArray(d.options)) {
          d.options.forEach((opt: any, i: number) => {
            menuRows.push({ node_id: n.id, position: i, label: opt.label || `Opção ${i + 1}`, keyword: opt.keyword || null });
          });
        }
        if (n.type === "save") {
          const { value, unit } = parseDelay(d.timeout);
          saveRows.push({
            node_id: n.id,
            wait_time_value: value,
            wait_time_unit: unit,
            max_retry_attempts: d.maxRetries ? parseInt(d.maxRetries, 10) : 3,
            message_before_wait: d.message || null,
            save_field_name: d.saveFieldName || null,
            accept_media_as_response: !!d.acceptMedia,
          });
        }
        if (n.type === "flow_connection" && d.targetFlow) {
          actionRows.push({
            node_id: n.id,
            position: 0,
            action_type: "go_to_flow",
            target_flow_id: d.targetFlow,
          });
        }
        if (n.type === "tag" && d.tagId) {
          actionRows.push({
            node_id: n.id,
            position: 0,
            action_type: "add_tag",
            tag_id: d.tagId,
          });
        }
        if (n.type === "randomizer" && Array.isArray(d.randomizerOptions)) {
          d.randomizerOptions.forEach((opt: any, i: number) => {
            randRows.push({ node_id: n.id, position: i, percentage: opt.percentage ?? 50 });
          });
        }
      }

      await Promise.all([
        contentRows.length ? (supabase as any).from("node_content_items").insert(contentRows) : null,
        menuRows.length ? (supabase as any).from("node_menu_options").insert(menuRows) : null,
        saveRows.length ? (supabase as any).from("node_save_configs").insert(saveRows) : null,
        actionRows.length ? (supabase as any).from("node_action_configs").insert(actionRows) : null,
        randRows.length ? (supabase as any).from("node_randomizer_options").insert(randRows) : null,
      ]);

      // 4. Insert connections (with flow_id + from_output_key)
      if (connections.length > 0) {
        const dbConns = connections.map(c => ({
          id: c.id,
          flow_id: flowId,
          from_node_id: c.from,
          to_node_id: c.to,
          from_output_key: c.fromPort || null,
          condition_label: c.label || null,
        }));
        await (supabase as any).from("flow_connections").insert(dbConns);
      }
    }, 2000);
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

    if (type === "content") {
      defaultData.contentType = "text";
      defaultData.fileName = "";
    }
    if (type === "save") {
      defaultData.waitForResponse = true;
      defaultData.timeout = "15m";
      defaultData.maxRetries = "3";
    }
    if (type === "flow_connection") {
      defaultData.targetFlow = "";
    }
    if (type === "smart_delay") {
      defaultData.delay = "5s";
    }
    if (type === "remarketing") {
      defaultData.delay = "15m";
      defaultData.message = "";
    }
    if (type === "condition") {
      defaultData.conditions = [];
    }

    const newNode: FlowNode = {
      id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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
    if (node.type === "save" && port) {
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
                      {node.type === "content" && (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-[9px]">
                            {CONTENT_TYPES.find(c => c.value === node.data?.contentType)?.label || "Texto"}
                          </Badge>
                          {node.data?.fileName && (
                            <span className="text-[9px] text-muted-foreground truncate">{node.data.fileName}</span>
                          )}
                        </div>
                      )}
                      {node.type === "save" && (
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
                            <span className="text-muted-foreground">Esgotado</span>
                            <button
                              className="ml-auto w-4 h-4 rounded-full bg-red-100 border border-red-300 flex items-center justify-center hover:bg-red-200"
                              onClick={e => { e.stopPropagation(); startConnection(node.id, "exhausted"); }}
                              title="Conectar: Esgotado"
                            >
                              <Plus className="w-2.5 h-2.5 text-red-600" />
                            </button>
                          </div>
                        </div>
                      )}
                      {node.type === "remarketing" && (
                        <div className="text-[9px] text-muted-foreground">
                          Delay: {node.data?.delay || "15m"}
                        </div>
                      )}
                      {node.type === "smart_delay" && (
                        <div className="text-[9px] text-muted-foreground">
                          ⏱ {DELAY_OPTIONS.find(d => d.value === node.data?.delay)?.label || node.data?.delay || "5s"}
                        </div>
                      )}
                      {node.type === "flow_connection" && (
                        <div className="text-[9px] text-muted-foreground">
                          → {node.data?.targetFlow || "Selecione"}
                        </div>
                      )}
                      <p className="text-[9px] text-muted-foreground truncate">
                        {node.data?.message || "Clique para configurar"}
                      </p>
                    </div>

                    {/* Connection point */}
                    {node.type !== "save" && (
                      <div className="flex justify-center pb-2">
                        <button
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isConnectingThis ? "bg-primary border-primary" : "bg-background border-border hover:border-primary"
                          }`}
                          onClick={e => { e.stopPropagation(); startConnection(node.id); }}
                          title="Conectar"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {connecting && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-4 py-2 rounded-full shadow-lg z-20 animate-pulse">
              Clique em outro bloco para conectar
            </div>
          )}
        </div>

        {/* Properties panel */}
        {selectedNodeData && (
          <div className="w-72 border-l border-border bg-card overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Propriedades</h3>
              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setSelectedNode(null)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Rótulo</label>
              <Input
                value={selectedNodeData.label}
                onChange={e => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, label: e.target.value } : n))}
                className="mt-1 h-8 text-xs"
              />
            </div>

            {selectedNodeData.type === "content" && (
              <>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Tipo de Conteúdo</label>
                  <Select
                    value={selectedNodeData.data?.contentType || "text"}
                    onValueChange={v => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, data: { ...n.data, contentType: v } } : n))}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(ct => (<SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                {(selectedNodeData.data?.contentType === "audio" || selectedNodeData.data?.contentType === "video" || selectedNodeData.data?.contentType === "image" || selectedNodeData.data?.contentType === "pdf") && (
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50">
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                    <p className="text-[10px] text-muted-foreground">Arraste ou clique para enviar</p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="text-[10px] font-medium text-muted-foreground">Mensagem / Texto</label>
              <Textarea
                value={selectedNodeData.data?.message || ""}
                onChange={e => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, data: { ...n.data, message: e.target.value } } : n))}
                className="mt-1 text-xs min-h-[80px]"
                placeholder="Digite a mensagem..."
              />
            </div>

            {selectedNodeData.type === "save" && (
              <>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">Timeout</label>
                  <Select
                    value={selectedNodeData.data?.timeout || "15m"}
                    onValueChange={v => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, data: { ...n.data, timeout: v } } : n))}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{DELAY_OPTIONS.map(d => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Aguardar resposta</span>
                  <Switch
                    checked={selectedNodeData.data?.waitForResponse ?? true}
                    onCheckedChange={c => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, data: { ...n.data, waitForResponse: c } } : n))}
                  />
                </div>
              </>
            )}

            {selectedNodeData.type === "smart_delay" && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Tempo de Espera</label>
                <Select
                  value={selectedNodeData.data?.delay || "5s"}
                  onValueChange={v => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, data: { ...n.data, delay: v } } : n))}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{DELAY_OPTIONS.map(d => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}

            {selectedNodeData.type === "remarketing" && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Delay do Remarketing</label>
                <Select
                  value={selectedNodeData.data?.delay || "15m"}
                  onValueChange={v => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, data: { ...n.data, delay: v } } : n))}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{DELAY_OPTIONS.map(d => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}

            {selectedNodeData.type === "flow_connection" && (
              <div>
                <label className="text-[10px] font-medium text-muted-foreground">Fluxo de Destino</label>
                <Select
                  value={selectedNodeData.data?.targetFlow || ""}
                  onValueChange={v => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, data: { ...n.data, targetFlow: v } } : n))}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{allFlows.map(f => (<SelectItem key={f} value={f}>{f}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <Button variant="destructive" size="sm" className="w-full text-xs gap-1.5" onClick={() => deleteNode(selectedNodeData.id)}>
                <Trash2 className="w-3.5 h-3.5" /> Excluir Bloco
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
