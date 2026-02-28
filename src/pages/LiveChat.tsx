import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Search, Phone, Video, MoreVertical, Send, Smile, Paperclip, Image, Mic, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Tab = "attending" | "waiting" | "resolved";

const contacts = [
  { id: 1, name: "Maria Silva", message: "Olá, gostaria de saber sobre...", time: "14:32", unread: 3, status: "attending" as Tab, avatar: "MS" },
  { id: 2, name: "João Pedro", message: "Pode me enviar o catálogo?", time: "14:28", unread: 1, status: "attending" as Tab, avatar: "JP" },
  { id: 3, name: "Ana Carolina", message: "Obrigada pelo atendimento!", time: "14:15", unread: 0, status: "resolved" as Tab, avatar: "AC" },
  { id: 4, name: "Carlos Eduardo", message: "Estou aguardando resposta", time: "13:50", unread: 2, status: "waiting" as Tab, avatar: "CE" },
  { id: 5, name: "Fernanda Lima", message: "Qual o valor do plano?", time: "13:45", unread: 0, status: "waiting" as Tab, avatar: "FL" },
  { id: 6, name: "Roberto Santos", message: "Preciso de suporte técnico", time: "13:30", unread: 5, status: "attending" as Tab, avatar: "RS" },
];

const messages = [
  { id: 1, text: "Olá! Tudo bem? 😊", sent: false, time: "14:20" },
  { id: 2, text: "Oi Maria! Tudo sim, como posso ajudar?", sent: true, time: "14:21" },
  { id: 3, text: "Gostaria de saber mais sobre os planos disponíveis", sent: false, time: "14:22" },
  { id: 4, text: "Claro! Temos 3 planos:\n\n📌 *Básico* - R$ 97/mês\n📌 *Profissional* - R$ 197/mês\n📌 *Enterprise* - R$ 397/mês\n\nQual te interessa mais?", sent: true, time: "14:25" },
  { id: 5, text: "O Profissional parece bom! Quais são os recursos?", sent: false, time: "14:30" },
];

export default function LiveChat() {
  const [activeTab, setActiveTab] = useState<Tab>("attending");
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const [messageInput, setMessageInput] = useState("");

  const filteredContacts = contacts.filter(c => c.status === activeTab);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "attending", label: "Atendendo", count: contacts.filter(c => c.status === "attending").length },
    { key: "waiting", label: "Aguardando", count: contacts.filter(c => c.status === "waiting").length },
    { key: "resolved", label: "Resolvidos", count: contacts.filter(c => c.status === "resolved").length },
  ];

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] bg-card rounded-xl border border-border overflow-hidden">
        {/* Left - Contact List */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                placeholder="Buscar contato..."
              />
            </div>
          </div>
          <div className="flex border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors relative ${
                  activeTab === tab.key 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label} ({tab.count})
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left ${
                  selectedContact.id === contact.id ? "bg-muted/80" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                  {contact.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{contact.name}</span>
                    <span className="text-[10px] text-muted-foreground">{contact.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.message}</p>
                </div>
                {contact.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-success text-success-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                    {contact.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Center - Chat */}
        <div className="flex-1 flex flex-col">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                {selectedContact.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedContact.name}</p>
                <p className="text-[10px] text-success font-medium">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/30">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[65%] px-4 py-2.5 ${msg.sent ? "chat-bubble-sent" : "chat-bubble-received"}`}>
                  <p className="text-sm text-foreground whitespace-pre-line">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sent ? "text-right text-muted-foreground" : "text-muted-foreground"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0"><Smile className="w-5 h-5 text-muted-foreground" /></Button>
              <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="w-5 h-5 text-muted-foreground" /></Button>
              <input 
                className="flex-1 px-4 py-2.5 bg-muted rounded-lg text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Digite uma mensagem..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
              />
              <Button size="icon" className="shrink-0 bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4 text-primary-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right - Contact Info */}
        <div className="w-72 border-l border-border p-5 overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-lg font-bold text-primary mx-auto">
              {selectedContact.avatar}
            </div>
            <h3 className="text-sm font-semibold text-foreground mt-3">{selectedContact.name}</h3>
            <p className="text-xs text-muted-foreground">+55 11 99999-9999</p>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs">Lead</Badge>
                <Badge variant="secondary" className="text-xs">WhatsApp</Badge>
                <Badge className="bg-success/10 text-success hover:bg-success/20 text-xs border-0">VIP</Badge>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Etapa</h4>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs">Proposta Enviada</Badge>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Responsável</h4>
              <p className="text-sm text-foreground">Carlos Silva</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ações Rápidas</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2">
                  <Star className="w-3.5 h-3.5" /> Marcar como VIP
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2">
                  <Tag className="w-3.5 h-3.5" /> Adicionar Tag
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
