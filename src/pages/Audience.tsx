import { AppLayout } from "@/components/AppLayout";
import { Search, Filter, Users, Phone, Clock, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseTable } from "@/hooks/useSupabaseData";
import { useTenantId } from "@/lib/tenant";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string | null;
  phone_number: string;
  avatar_url: string | null;
  last_seen: string | null;
  tenant_id: string;
  created_at: string;
  instance_id: string | null;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name: string | null, phone: string) {
  if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return phone.slice(-2);
}

export default function Audience() {
  const tenantId = useTenantId();
  const { data: contacts, loading, insert, remove } = useSupabaseTable<Contact>("contacts", "created_at");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone_number: "" });
  const [saving, setSaving] = useState(false);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name?.toLowerCase().includes(q) ?? false) ||
      c.phone_number.includes(q)
    );
  });

  const handleAdd = async () => {
    if (!newContact.phone_number.trim()) {
      toast.error("Informe o telefone do contato");
      return;
    }
    if (!tenantId) return;
    setSaving(true);
    await insert({ name: newContact.name || null, phone_number: newContact.phone_number, tenant_id: tenantId, avatar_url: null, last_seen: null, instance_id: null } as any);
    toast.success("Contato adicionado!");
    setNewContact({ name: "", phone_number: "" });
    setShowAdd(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este contato?")) return;
    await remove(id);
    toast.success("Contato removido");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audiência</h1>
            <p className="text-sm text-muted-foreground">
              {contacts.length} contato{contacts.length !== 1 ? "s" : ""} cadastrado{contacts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 text-sm">
              <Filter className="w-4 h-4" /> Filtrar
            </Button>
            <Button className="gap-2 text-sm bg-primary hover:bg-primary/90" onClick={() => setShowAdd(true)}>
              <UserPlus className="w-4 h-4" /> Novo Contato
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Carregando contatos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm text-muted-foreground">
                {search ? "Nenhum contato encontrado" : "Nenhum contato cadastrado"}
              </p>
              {!search && (
                <p className="text-xs text-muted-foreground mt-1">
                  Os contatos aparecerão aqui quando você receber mensagens ou adicionar manualmente.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 px-4 py-2 bg-muted/50 text-xs text-muted-foreground font-medium">
                <div className="col-span-5">Contato</div>
                <div className="col-span-3">Telefone</div>
                <div className="col-span-3">Último acesso</div>
                <div className="col-span-1"></div>
              </div>
              {filtered.map(contact => (
                <div key={contact.id} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-muted/30 transition-colors">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                      {getInitials(contact.name, contact.phone_number)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {contact.name ?? <span className="text-muted-foreground italic">Sem nome</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Desde {formatDate(contact.created_at)}</p>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5 text-sm text-foreground">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    {contact.phone_number}
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(contact.last_seen)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Contato</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome (opcional)</label>
              <Input
                placeholder="Nome do contato"
                value={newContact.name}
                onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Telefone *</label>
              <Input
                placeholder="5511999999999"
                value={newContact.phone_number}
                onChange={e => setNewContact(p => ({ ...p, phone_number: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
