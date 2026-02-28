import { AppLayout } from "@/components/AppLayout";
import { 
  MessageSquare, Users, CheckCircle, Clock, TrendingUp, 
  Calendar, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from "recharts";

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}h`,
  mensagens: Math.floor(Math.random() * 80 + 10),
  atendimentos: Math.floor(Math.random() * 40 + 5),
}));

const stats = [
  { label: "Mensagens Hoje", value: "1.284", change: "+12%", up: true, icon: MessageSquare, color: "bg-primary/10 text-primary" },
  { label: "Atendimentos Ativos", value: "47", change: "+5%", up: true, icon: Users, color: "bg-success/10 text-success" },
  { label: "Resolvidos Hoje", value: "89", change: "+23%", up: true, icon: CheckCircle, color: "bg-success/10 text-success" },
  { label: "Tempo Médio", value: "4m 32s", change: "-8%", up: false, icon: Clock, color: "bg-warning/10 text-warning" },
];

const teamPerformance = [
  { name: "Carlos Silva", atendimentos: 34, resolvidos: 28, tempo: "3m 12s", status: "online" },
  { name: "Ana Costa", atendimentos: 29, resolvidos: 25, tempo: "4m 05s", status: "online" },
  { name: "Pedro Santos", atendimentos: 22, resolvidos: 19, tempo: "5m 30s", status: "away" },
  { name: "Maria Oliveira", atendimentos: 18, resolvidos: 17, tempo: "2m 48s", status: "online" },
  { name: "João Lima", atendimentos: 15, resolvidos: 12, tempo: "6m 15s", status: "offline" },
];

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Visão geral do seu atendimento</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Últimos 7 dias</span>
            </div>
            <div className="px-3 py-2 bg-destructive/10 text-destructive text-sm rounded-lg font-medium">
              Vence em: 15 dias
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border border-border shadow-none hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.up ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-success" />
                      )}
                      <span className="text-xs font-medium text-success">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Mensagens por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "8px", 
                    border: "1px solid hsl(220, 13%, 91%)", 
                    fontSize: "12px" 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="mensagens" 
                  stroke="hsl(43, 96%, 56%)" 
                  strokeWidth={2}
                  fill="url(#colorMsg)" 
                  name="Mensagens"
                />
                <Area 
                  type="monotone" 
                  dataKey="atendimentos" 
                  stroke="hsl(142, 76%, 36%)" 
                  strokeWidth={2}
                  fill="transparent" 
                  name="Atendimentos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Desempenho da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Membro</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Atendimentos</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Resolvidos</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Tempo Médio</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((member) => (
                    <tr key={member.name} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-medium text-foreground">{member.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 text-foreground">{member.atendimentos}</td>
                      <td className="text-center py-3 px-4 text-foreground">{member.resolvidos}</td>
                      <td className="text-center py-3 px-4 text-foreground">{member.tempo}</td>
                      <td className="text-center py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          member.status === "online" 
                            ? "bg-success/10 text-success" 
                            : member.status === "away" 
                            ? "bg-warning/10 text-warning" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            member.status === "online" ? "bg-success" 
                            : member.status === "away" ? "bg-warning" 
                            : "bg-muted-foreground"
                          }`} />
                          {member.status === "online" ? "Online" : member.status === "away" ? "Ausente" : "Offline"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
