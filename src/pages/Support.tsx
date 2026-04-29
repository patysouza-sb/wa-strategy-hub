import { AppLayout } from "@/components/AppLayout";
import { HelpCircle, BookOpen, MessageCircle, FileQuestion, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const items = [
  {
    icon: BookOpen,
    title: "Central de Ajuda",
    desc: "Artigos e guias completos sobre o sistema",
    action: "Acessar",
    href: "https://wa.me/5511969458142?text=Preciso+de+ajuda+com+a+Central",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: FileQuestion,
    title: "Tutoriais em Vídeo",
    desc: "Passo a passo em vídeo para usar o sistema",
    action: "Ver tutoriais",
    href: "https://wa.me/5511969458142?text=Quero+ver+os+tutoriais",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: MessageCircle,
    title: "Falar com Suporte",
    desc: "Atendimento direto via WhatsApp",
    action: "Abrir WhatsApp",
    href: "https://wa.me/5511969458142?text=Ol%C3%A1%2C+preciso+de+suporte",
    color: "bg-green-500/10 text-green-500",
    highlight: true,
  },
  {
    icon: HelpCircle,
    title: "Perguntas Frequentes",
    desc: "Respostas para as dúvidas mais comuns",
    action: "Ver FAQ",
    href: "https://wa.me/5511969458142?text=Tenho+uma+d%C3%BAvida",
    color: "bg-orange-500/10 text-orange-500",
  },
];

export default function Support() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suporte</h1>
          <p className="text-sm text-muted-foreground">Como podemos ajudar você?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <Card
              key={item.title}
              className={`border shadow-none hover:shadow-md transition-shadow ${item.highlight ? "border-green-500/40 bg-green-500/5" : "border-border"}`}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">{item.desc}</p>
                  <Button
                    size="sm"
                    variant={item.highlight ? "default" : "outline"}
                    className={`gap-1.5 text-xs h-8 ${item.highlight ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                    onClick={() => window.open(item.href, "_blank")}
                  >
                    {item.action}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-border shadow-none">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground text-center">
              Horário de atendimento: <span className="text-foreground font-medium">Segunda a Sexta, 9h às 18h</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
