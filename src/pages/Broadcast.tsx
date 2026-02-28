import { AppLayout } from "@/components/AppLayout";
import { Radio, Plus, Send, Users, Tag, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const broadcasts = [
  { id: 1, name: "Promoção Black Friday", type: "Todos contatos", status: "sent", sent: 1250, date: "25/11/2025" },
  { id: 2, name: "Lançamento Curso", type: "Etiqueta", status: "scheduled", sent: 0, date: "01/12/2025" },
  { id: 3, name: "Follow-up Leads", type: "Lista", status: "sent", sent: 430, date: "20/11/2025" },
  { id: 4, name: "Natal - Oferta Especial", type: "Todos contatos", status: "draft", sent: 0, date: "-" },
];

export default function Broadcast() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transmissão</h1>
            <p className="text-sm text-muted-foreground">Envie mensagens em massa</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Nova Transmissão
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Nome</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Tipo</th>
                <th className="text-center py-3 px-5 text-muted-foreground font-medium">Status</th>
                <th className="text-center py-3 px-5 text-muted-foreground font-medium">Enviados</th>
                <th className="text-center py-3 px-5 text-muted-foreground font-medium">Data</th>
                <th className="text-right py-3 px-5 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.map(b => (
                <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-5 font-medium text-foreground">{b.name}</td>
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
                    <Button variant="ghost" size="icon" className="w-7 h-7">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
