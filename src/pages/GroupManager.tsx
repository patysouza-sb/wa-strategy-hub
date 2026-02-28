import { AppLayout } from "@/components/AppLayout";
import { UsersRound, BarChart3, Settings, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const groups = [
  { name: "Vendas - Time A", members: 12, active: 8 },
  { name: "Suporte Premium", members: 6, active: 5 },
  { name: "Marketing Digital", members: 9, active: 4 },
];

export default function GroupManager() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerente de Grupo</h1>
          <p className="text-sm text-muted-foreground">Gerencie grupos e distribua atendimentos</p>
        </div>

        <Tabs defaultValue="groups">
          <TabsList>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="flows">Fluxos</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {groups.map(g => (
                <Card key={g.name} className="border border-border shadow-none">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <UsersRound className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{g.name}</h3>
                        <p className="text-xs text-muted-foreground">{g.members} membros</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-xs text-muted-foreground">{g.active} online agora</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flows" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground">
                Configure fluxos de distribuição para seus grupos
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground">
                Gerencie permissões e configurações dos grupos
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground">
                Gerencie sua assinatura e plano
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
