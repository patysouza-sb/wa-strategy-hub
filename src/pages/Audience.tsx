import { AppLayout } from "@/components/AppLayout";
import { Search, Filter, Tag, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const contacts = [
  { id: 1, name: "Maria Silva", phone: "+55 11 99999-1111", tags: ["VIP", "Cliente"], avatar: "MS" },
  { id: 2, name: "João Pedro", phone: "+55 11 99999-2222", tags: ["Lead", "WhatsApp"], avatar: "JP" },
  { id: 3, name: "Ana Costa", phone: "+55 21 99999-3333", tags: ["Cliente", "Recorrente"], avatar: "AC" },
  { id: 4, name: "Carlos Eduardo", phone: "+55 31 99999-4444", tags: ["Lead Quente"], avatar: "CE" },
  { id: 5, name: "Fernanda Lima", phone: "+55 41 99999-5555", tags: ["Prospect"], avatar: "FL" },
  { id: 6, name: "Roberto Santos", phone: "+55 51 99999-6666", tags: ["VIP", "Enterprise"], avatar: "RS" },
];

export default function Audience() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audiência</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus contatos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 text-sm">
              <Filter className="w-4 h-4" /> Filtrar
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm outline-none placeholder:text-muted-foreground" placeholder="Buscar contato..." />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Contato</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">WhatsApp</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Tags</th>
                <th className="text-right py-3 px-5 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">{c.avatar}</div>
                      <span className="font-medium text-foreground">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-muted-foreground">{c.phone}</td>
                  <td className="py-3 px-5">
                    <div className="flex gap-1 flex-wrap">
                      {c.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <Button variant="ghost" size="icon" className="w-7 h-7"><MoreVertical className="w-3.5 h-3.5" /></Button>
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
