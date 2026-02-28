import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Plus, MoreHorizontal, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanCard {
  id: string;
  name: string;
  phone: string;
  value?: string;
  tags: string[];
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const initialColumns: KanbanColumn[] = [
  {
    id: "new", title: "Novo Contato", color: "bg-blue-500",
    cards: [
      { id: "1", name: "Lucas Ferreira", phone: "+55 11 98765-4321", tags: ["WhatsApp"] },
      { id: "2", name: "Juliana Santos", phone: "+55 21 99876-5432", tags: ["Instagram"] },
    ]
  },
  {
    id: "interested", title: "Interessado", color: "bg-primary",
    cards: [
      { id: "3", name: "Roberto Almeida", phone: "+55 31 97654-3210", value: "R$ 297", tags: ["Lead Quente"] },
    ]
  },
  {
    id: "proposal", title: "Proposta", color: "bg-orange-500",
    cards: [
      { id: "4", name: "Carla Mendes", phone: "+55 41 96543-2109", value: "R$ 1.497", tags: ["Enterprise"] },
      { id: "5", name: "André Costa", phone: "+55 51 95432-1098", value: "R$ 497", tags: ["Profissional"] },
    ]
  },
  {
    id: "negotiation", title: "Negociação", color: "bg-purple-500",
    cards: [
      { id: "6", name: "Patrícia Lima", phone: "+55 61 94321-0987", value: "R$ 2.997", tags: ["VIP"] },
    ]
  },
  {
    id: "closing", title: "Fechamento", color: "bg-success",
    cards: [
      { id: "7", name: "Marcos Oliveira", phone: "+55 71 93210-9876", value: "R$ 997", tags: ["Recorrente"] },
    ]
  },
  {
    id: "paid", title: "Pago", color: "bg-success",
    cards: [
      { id: "8", name: "Fernanda Ribeiro", phone: "+55 81 92109-8765", value: "R$ 497", tags: ["Cliente"] },
    ]
  },
];

export default function Kanban() {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedCard, setDraggedCard] = useState<{ card: KanbanCard; fromCol: string } | null>(null);

  const handleDragStart = (card: KanbanCard, fromCol: string) => {
    setDraggedCard({ card, fromCol });
  };

  const handleDrop = (toCol: string) => {
    if (!draggedCard || draggedCard.fromCol === toCol) return;
    setColumns(prev => prev.map(col => {
      if (col.id === draggedCard.fromCol) return { ...col, cards: col.cards.filter(c => c.id !== draggedCard.card.id) };
      if (col.id === toCol) return { ...col, cards: [...col.cards, draggedCard.card] };
      return col;
    }));
    setDraggedCard(null);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kanban</h1>
            <p className="text-sm text-muted-foreground">Gerencie seu funil de vendas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Novo Contato
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => (
            <div
              key={col.id}
              className="min-w-[280px] w-[280px] bg-muted/50 rounded-xl p-3 flex flex-col"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                  <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded-md">
                    {col.cards.length}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="w-7 h-7">
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>

              <div className="space-y-2 flex-1">
                {col.cards.map(card => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(card, col.id)}
                    className="bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
                          {card.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{card.name}</p>
                          <p className="text-[10px] text-muted-foreground">{card.phone}</p>
                        </div>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {card.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {card.value && (
                        <span className="text-xs font-semibold text-success flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" />{card.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
