import { AppLayout } from "@/components/AppLayout";
import { HelpCircle, BookOpen, MessageCircle, FileQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  { icon: BookOpen, title: "Central de Ajuda", desc: "Artigos e guias completos" },
  { icon: FileQuestion, title: "Tutoriais", desc: "Passo a passo em vídeo" },
  { icon: MessageCircle, title: "Chat Interno", desc: "Fale com nossa equipe" },
  { icon: HelpCircle, title: "FAQ", desc: "Perguntas frequentes" },
];

export default function Support() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suporte</h1>
          <p className="text-sm text-muted-foreground">Como podemos ajudar?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <Card key={item.title} className="border border-border shadow-none hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
