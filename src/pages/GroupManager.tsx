import { AppLayout } from "@/components/AppLayout";
import { UsersRound, Plus, Settings, GitBranch } from "lucide-react";
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
            <TabsTrigger value="groups" className="gap-1.5">
              <UsersRound className="w-3.5 h-3.5" /> Grupos
            </TabsTrigger>
            <TabsTrigger value="flows" className="gap-1.5">
              <GitBranch className="w-3.5 h-3.5" /> Fluxos
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-1.5">
              <Settings className="w-3.5 h-3.5" /> Gerenciar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-4">
            <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl bg-card">
              <UsersRound className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-foreground">Nenhum grupo criado</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Crie grupos para organizar sua equipe de atendimento e distribuir conversas automaticamente.
              </p>
              <Button className="mt-4 gap-2 bg-primary hover:bg-primary/90" size="sm">
                <Plus className="w-4 h-4" /> Criar primeiro grupo
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="flows" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center">
                <GitBranch className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Fluxos de distribuição</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure regras para distribuir atendimentos entre os grupos
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="mt-4">
            <Card className="border border-border shadow-none">
              <CardContent className="p-10 text-center">
                <Settings className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Permissões e configurações</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gerencie permissões e configurações dos grupos
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
