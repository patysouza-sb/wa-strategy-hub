import { AppLayout } from "@/components/AppLayout";
import { GitBranch, Plus, Play, Pause, Folder, FileText, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const flows = [
  { id: 1, name: "Boas-vindas", folder: "Principal", shortcut: "/bemvindo", status: "active" },
  { id: 2, name: "Qualificação de Lead", folder: "Vendas", shortcut: "/qualificar", status: "active" },
  { id: 3, name: "Suporte Nível 1", folder: "Suporte", shortcut: "/suporte1", status: "active" },
  { id: 4, name: "Pós-venda", folder: "Vendas", shortcut: "/posvenda", status: "paused" },
  { id: 5, name: "Remarketing 7 dias", folder: "Marketing", shortcut: "/remarket7", status: "active" },
];

export default function Flows() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fluxos de Conversa</h1>
            <p className="text-sm text-muted-foreground">Crie e gerencie seus fluxos automatizados</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Novo Fluxo
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Nome</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Pasta</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Atalho</th>
                <th className="text-center py-3 px-5 text-muted-foreground font-medium">Status</th>
                <th className="text-right py-3 px-5 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {flows.map(flow => (
                <tr key={flow.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <GitBranch className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{flow.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Folder className="w-3.5 h-3.5" />
                      <span>{flow.folder}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">{flow.shortcut}</code>
                  </td>
                  <td className="py-3 px-5 text-center">
                    <Badge className={`text-[10px] border-0 ${
                      flow.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {flow.status === "active" ? "Ativo" : "Pausado"}
                    </Badge>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        {flow.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
