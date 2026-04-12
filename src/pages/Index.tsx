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
  mensagens: 0,
  atendimentos: 0,
}));

const stats = [
  { label: "Mensagens Hoje", value: "0", change: "0%", up: true, icon: MessageSquare, color: "bg-primary/10 text-primary" },
  { label: "Atendimentos Ativos", value: "0", change: "0%", up: true, icon: Users, color: "bg-success/10 text-success" },
  { label: "Resolvidos Hoje", value: "0", change: "0%", up: true, icon: CheckCircle, color: "bg-success/10 text-success" },
  { label: "Tempo Médio", value: "0m 00s", change: "0%", up: false, icon: Clock, color: "bg-warning/10 text-warning" },
];

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Bem-vinda, Patricia! Aqui está a visão geral do seu atendimento.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Últimos 7 dias</span>
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
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220, 13%, 91%)", fontSize: "12px" }} />
                <Area type="monotone" dataKey="mensagens" stroke="hsl(43, 96%, 56%)" strokeWidth={2} fill="url(#colorMsg)" name="Mensagens" />
                <Area type="monotone" dataKey="atendimentos" stroke="hsl(142, 76%, 36%)" strokeWidth={2} fill="transparent" name="Atendimentos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Performance - Empty */}
        <Card className="border border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Desempenho da Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-10 text-center text-muted-foreground text-sm">
              Nenhum membro cadastrado ainda. Adicione sua equipe nas Configurações.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
