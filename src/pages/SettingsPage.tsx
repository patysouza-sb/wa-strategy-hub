import { AppLayout } from "@/components/AppLayout";
import { Settings as SettingsIcon, Building, MessageSquareText, FileText, Globe, Tag, Building2, Users, BookOpen, Clock, GitBranch, Link, Code } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie todas as configurações da plataforma</p>
        </div>

        <Tabs defaultValue="company" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="quick-replies">Respostas Rápidas</TabsTrigger>
            <TabsTrigger value="labels">Etiquetas</TabsTrigger>
            <TabsTrigger value="departments">Departamento</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="hours">Horários</TabsTrigger>
            <TabsTrigger value="default-flow">Fluxo Padrão</TabsTrigger>
            <TabsTrigger value="connections">Conexões</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card className="border border-border shadow-none">
              <CardHeader><CardTitle className="text-base">Configurações da Empresa</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Nome da Empresa</label>
                    <input className="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none border border-border focus:ring-2 focus:ring-primary/30" defaultValue="Zap Estratégico" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                    <input className="w-full px-3 py-2 bg-muted rounded-lg text-sm outline-none border border-border focus:ring-2 focus:ring-primary/30" defaultValue="contato@zapestrategico.com" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Aceitar chamadas</p>
                      <p className="text-xs text-muted-foreground">Permite receber chamadas de voz</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Transcrever áudio</p>
                      <p className="text-xs text-muted-foreground">Transcrição automática de mensagens de áudio</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Separar atendimentos por usuário</p>
                      <p className="text-xs text-muted-foreground">Cada usuário vê apenas seus atendimentos</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="default-flow">
            <Card className="border border-border shadow-none">
              <CardHeader><CardTitle className="text-base">Fluxo Padrão</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Fluxo de Boas-vindas</label>
                  <select className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border outline-none">
                    <option>Boas-vindas Padrão</option>
                    <option>Boas-vindas VIP</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Fluxo de Resposta Padrão</label>
                  <select className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border outline-none">
                    <option>Resposta Geral</option>
                    <option>FAQ Automático</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Tempo de Inatividade</label>
                  <select className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border outline-none">
                    <option>24 horas</option>
                    <option>12 horas</option>
                    <option>48 horas</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Fluxo de Conversa Finalizada</label>
                  <select className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border outline-none">
                    <option>Pesquisa de Satisfação</option>
                    <option>Encerramento Padrão</option>
                  </select>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Salvar</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {["quick-replies", "labels", "departments", "team", "hours", "connections", "api"].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card className="border border-border shadow-none">
                <CardContent className="p-10 text-center text-muted-foreground">
                  Configuração de {tab === "quick-replies" ? "Respostas Rápidas" : tab === "labels" ? "Etiquetas" : tab === "departments" ? "Departamentos" : tab === "team" ? "Equipe" : tab === "hours" ? "Horários" : tab === "connections" ? "Conexões" : "API"}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
