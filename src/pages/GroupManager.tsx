import { AppLayout } from "@/components/AppLayout";
import { UsersRound, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function GroupManager() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerente de Grupo</h1>
            <p className="text-sm text-muted-foreground">Gerencie grupos e distribua atendimentos</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Novo Grupo
          </Button>
        </div>

        <Tabs defaultValue="groups">
          <TabsList>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="flows">Fluxos</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-4">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UsersRound className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm text-muted-foreground">Nenhum grupo criado</p>
              <p className="text-xs text-muted-foreground mt-1">Crie grupos para organizar sua equipe de atendimento.</p>
            </div>
          </TabsContent>

          <TabsContent value="flows" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground text-sm">
                Configure fluxos de distribuição para seus grupos
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground text-sm">
                Gerencie permissões e configurações dos grupos
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center text-muted-foreground text-sm">
                Gerencie sua assinatura e plano
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
