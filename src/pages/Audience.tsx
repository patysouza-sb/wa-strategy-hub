import { AppLayout } from "@/components/AppLayout";
import { Search, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground">Nenhum contato cadastrado</p>
            <p className="text-xs text-muted-foreground mt-1">Os contatos aparecerão aqui quando você receber mensagens pelo WhatsApp.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
