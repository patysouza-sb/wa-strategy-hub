import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/lib/tenant";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface KanbanCard {
  id: string;
  name: string;
  phone: string;
  value?: string;
  tags: string[];
  conversationId?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const COLUMNS: Omit<KanbanColumn, "cards">[] = [
  { id: "new", title: "Novo Contato", color: "bg-blue-500" },
  { id: "interested", title: "Interessado", color: "bg-primary" },
  { id: "proposal", title: "Proposta", color: "bg-orange-500" },
  { id: "negotiation", title: "Negociação", color: "bg-purple-500" },
  { id: "closing", title: "Fechamento", color: "bg-green-500" },
  { id: "paid", title: "Pago", color: "bg-green-600" },
];

export default function Kanban() {
  const tenantId = useTenantId();
  const navigate = useNavigate();
  const [columns, setColumns] = useState<KanbanColumn[]>(
    COLUMNS.map(c => ({ ...c, cards: [] }))
  );
  const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard; fromCol: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({ name: "", phone: "", value: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      try {
        const { data: convs, error } = await (supabase as any)
          .from("conversations")
          .select("id, contact_id, kanban_column_id, contacts(name, phone_number)")
          .eq("queue_status", "open");

        if (error) throw error;

        const newCols = COLUMNS.map(col => ({
          ...col,
          cards: (convs ?? [])
            .filter((c: any) => (c.kanban_column_id ?? "new") === col.id)
            .map((c: any) => ({
              id: c.id,
              name: c.contacts?.name ?? "Sem nome",
              phone: c.contacts?.phone_number ?? "",
              tags: [],
              conversationId: c.id,
            })),
        }));
        setColumns(newCols);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenantId]);

  const handleDragStart = (card: KanbanCard, fromCol: string) => {
    setDraggedCard({ card, fromCol });
  };

  const handleDrop = async (toCol: string) => {
    if (!draggedCard || draggedCard.fromCol === toCol) return;
    const card = draggedCard.card;

    setColumns(prev => prev.map(col => {
      if (col.id === draggedCard.fromCol) return { ...col, cards: col.cards.filter(c => c.id !== card.id) };
      if (col.id === toCol) return { ...col, cards: [...col.cards, card] };
      return col;
    }));
    setDraggedCard(null);

    const { error } = await (supabase as any)
      .from("conversations")
      .update({ kanban_column_id: toCol })
      .eq("id", card.id);
    if (error) toast.error("Erro ao mover card");
  };

  const handleAddCard = async () => {
    if (!newCard.name.trim() && !newCard.phone.trim()) {
      toast.error("Informe nome ou telefone");
      return;
    }
    setSaving(true);
    const card: KanbanCard = {
      id: `local-${Date.now()}`,
      name: newCard.name || "Sem nome",
      phone: newCard.phone,
      value: newCard.value,
      tags: [],
    };
    setColumns(prev => prev.map(col =>
      col.id === "new" ? { ...col, cards: [...col.cards, card] } : col
    ));
    toast.success("Contato adicionado ao Kanban");
    setNewCard({ name: "", phone: "", value: "" });
    setShowAdd(false);
    setSaving(false);
  };

  const totalCards = columns.reduce((acc, col) => acc + col.cards.length, 0);

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kanban</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Carregando..." : `${totalCards} contato${totalCards !== 1 ? "s" : ""} no funil`}
            </p>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4" /> Novo Contato
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => (
            <div
              key={col.id}
              className="flex-shrink-0 w-64 bg-muted/50 rounded-xl border border-border"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <span className="text-xs font-semibold text-foreground flex-1">{col.title}</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {col.cards.length}
                </Badge>
              </div>

              <div className="p-2 space-y-2 min-h-[200px]">
                {col.cards.map(card => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(card, col.id)}
                    className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                          {card.name[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{card.name}</p>
                          {card.phone && (
                            <p className="text-[10px] text-muted-foreground truncate">{card.phone}</p>
                          )}
                        </div>
                      </div>
                      <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </div>
                    {card.value && (
                      <div className="mt-2 text-xs text-green-600 font-medium">R$ {card.value}</div>
                    )}
                    {card.conversationId && (
                      <button
                        className="mt-2 flex items-center gap-1 text-[10px] text-primary hover:underline"
                        onClick={() => navigate("/chat")}
                      >
                        <MessageSquare className="w-3 h-3" /> Ver conversa
                      </button>
                    )}
                  </div>
                ))}

                {col.cards.length === 0 && (
                  <div className="flex items-center justify-center py-8 text-xs text-muted-foreground/50">
                    Arraste cards aqui
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Contato no Kanban</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
              <Input
                placeholder="Nome do contato"
                value={newCard.name}
                onChange={e => setNewCard(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Telefone</label>
              <Input
                placeholder="5511999999999"
                value={newCard.phone}
                onChange={e => setNewCard(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Valor (opcional)</label>
              <Input
                placeholder="Ex: 1.500,00"
                value={newCard.value}
                onChange={e => setNewCard(p => ({ ...p, value: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button onClick={handleAddCard} disabled={saving}>
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
