import { AppLayout } from "@/components/AppLayout";
import { useState } from "react";
import { Search, Phone, Video, MoreVertical, Send, Smile, Paperclip, Mic, Star, Tag, Bot, ArrowRight, CheckCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Tab = "attending" | "waiting" | "resolved";

interface Contact {
  id: number;
  name: string;
  message: string;
  time: string;
  unread: number;
  status: Tab;
  avatar: string;
  phone: string;
  tags: string[];
  stage: string;
  assignedTo: string;
  isBot: boolean;
}

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
  status?: "sent" | "delivered" | "read";
}

const initialContacts: Contact[] = [
  { id: 1, name: "Maria Silva", message: "Olá, gostaria de saber sobre...", time: "14:32", unread: 3, status: "attending", avatar: "MS", phone: "+55 11 99999-1111", tags: ["Lead", "VIP"], stage: "Proposta", assignedTo: "Carlos Silva", isBot: false },
  { id: 2, name: "João Pedro", message: "Pode me enviar o catálogo?", time: "14:28", unread: 1, status: "attending", avatar: "JP", phone: "+55 11 99999-2222", tags: ["Lead"], stage: "Interessado", assignedTo: "Ana Costa", isBot: false },
  { id: 3, name: "Ana Carolina", message: "Obrigada pelo atendimento!", time: "14:15", unread: 0, status: "resolved", avatar: "AC", phone: "+55 11 99999-3333", tags: ["Cliente"], stage: "Pago", assignedTo: "Carlos Silva", isBot: false },
  { id: 4, name: "Carlos Eduardo", message: "Estou aguardando resposta", time: "13:50", unread: 2, status: "waiting", avatar: "CE", phone: "+55 11 99999-4444", tags: ["Prospect"], stage: "Novo contato", assignedTo: "", isBot: true },
  { id: 5, name: "Fernanda Lima", message: "Qual o valor do plano?", time: "13:45", unread: 0, status: "waiting", avatar: "FL", phone: "+55 11 99999-5555", tags: ["Lead"], stage: "Interessado", assignedTo: "", isBot: true },
  { id: 6, name: "Roberto Santos", message: "Preciso de suporte técnico", time: "13:30", unread: 5, status: "attending", avatar: "RS", phone: "+55 11 99999-6666", tags: ["Cliente", "Suporte"], stage: "Negociação", assignedTo: "Pedro Lima", isBot: false },
  { id: 7, name: "Luciana Mendes", message: "Quero saber do plano profissional", time: "13:20", unread: 1, status: "attending", avatar: "LM", phone: "+55 11 99999-7777", tags: ["Lead"], stage: "Proposta", assignedTo: "Ana Costa", isBot: false },
  { id: 8, name: "André Souza", message: "Quando chega meu pedido?", time: "13:10", unread: 0, status: "waiting", avatar: "AS", phone: "+55 11 99999-8888", tags: ["Cliente"], stage: "Pago", assignedTo: "", isBot: true },
];

const initialMessages: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Olá! Tudo bem? 😊", sent: false, time: "14:20" },
    { id: 2, text: "Oi Maria! Tudo sim, como posso ajudar?", sent: true, time: "14:21", status: "read" },
    { id: 3, text: "Gostaria de saber mais sobre os planos disponíveis", sent: false, time: "14:22" },
    { id: 4, text: "Claro! Temos 3 planos:\n\n📌 *Básico* - R$ 97/mês\n📌 *Profissional* - R$ 197/mês\n📌 *Enterprise* - R$ 397/mês\n\nQual te interessa mais?", sent: true, time: "14:25", status: "read" },
    { id: 5, text: "O Profissional parece bom! Quais são os recursos?", sent: false, time: "14:30" },
  ],
  2: [
    { id: 1, text: "Boa tarde!", sent: false, time: "14:20" },
    { id: 2, text: "Boa tarde, João! Como posso ajudar?", sent: true, time: "14:22", status: "read" },
    { id: 3, text: "Pode me enviar o catálogo?", sent: false, time: "14:28" },
  ],
  4: [
    { id: 1, text: "Olá, boa tarde", sent: false, time: "13:40" },
    { id: 2, text: "🤖 Olá! Sou o assistente virtual do Zap Estratégico. Como posso ajudar?", sent: true, time: "13:40", status: "delivered" },
    { id: 3, text: "Estou aguardando resposta sobre meu pedido", sent: false, time: "13:50" },
  ],
};

const QUICK_REPLIES = [
  "Olá! Como posso ajudar?",
  "Vou verificar e retorno em instantes",
  "Obrigado pelo contato! 😊",
  "Segue o link para pagamento:",
  "Seu pedido está em processamento",
];

export default function LiveChat() {
  const [activeTab, setActiveTab] = useState<Tab>("attending");
  const [selectedContact, setSelectedContact] = useState(initialContacts[0]);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [contacts, setContacts] = useState(initialContacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const filteredContacts = contacts
    .filter(c => c.status === activeTab)
    .filter(c => searchTerm ? c.name.toLowerCase().includes(searchTerm.toLowerCase()) : true);

  const currentMessages = messages[selectedContact.id] || [];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "attending", label: "Atendendo", count: contacts.filter(c => c.status === "attending").length },
    { key: "waiting", label: "Aguardando", count: contacts.filter(c => c.status === "waiting").length },
    { key: "resolved", label: "Resolvidos", count: contacts.filter(c => c.status === "resolved").length },
  ];

  const sendMessage = (text?: string) => {
    const msg = text || messageInput;
    if (!msg.trim()) return;
    const newMsg: Message = { id: Date.now(), text: msg, sent: true, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), status: "sent" };
    setMessages(prev => ({ ...prev, [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg] }));
    setMessageInput("");
    setShowQuickReplies(false);

    // Simulate delivery
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedContact.id]: (prev[selectedContact.id] || []).map(m => m.id === newMsg.id ? { ...m, status: "delivered" as const } : m)
      }));
    }, 1000);
  };

  const transferToHuman = (contactId: number) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isBot: false, status: "attending" as Tab, assignedTo: "Carlos Silva" } : c));
    toast.success("Contato transferido para atendente humano");
  };

  const resolveChat = (contactId: number) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, status: "resolved" as Tab } : c));
    toast.success("Atendimento finalizado");
  };

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
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors relative ${
                  activeTab === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label} ({tab.count})
                {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
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
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {contact.avatar}
                  </div>
                  {contact.isBot && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <Bot className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{contact.name}</span>
                    <span className="text-[10px] text-muted-foreground">{contact.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.message}</p>
                </div>
                {contact.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-success text-white text-[10px] font-bold flex items-center justify-center shrink-0">
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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{selectedContact.name}</p>
                  {selectedContact.isBot && <Badge className="text-[8px] bg-blue-500/10 text-blue-500 border-0">IA</Badge>}
                </div>
                <p className="text-[10px] text-success font-medium">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {selectedContact.isBot && (
                <Button variant="outline" size="sm" className="text-xs gap-1 mr-2" onClick={() => transferToHuman(selectedContact.id)}>
                  <ArrowRight className="w-3 h-3" /> Transferir para humano
                </Button>
              )}
              <Button variant="outline" size="sm" className="text-xs" onClick={() => resolveChat(selectedContact.id)}>
                Finalizar
              </Button>
              <Button variant="ghost" size="icon"><Phone className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon"><Video className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/30">
            {currentMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[65%] px-4 py-2.5 ${msg.sent ? "chat-bubble-sent" : "chat-bubble-received"}`}>
                  <p className="text-sm text-foreground whitespace-pre-line">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.sent ? "justify-end" : ""}`}>
                    <p className="text-[10px] text-muted-foreground">{msg.time}</p>
                    {msg.sent && msg.status === "read" && <CheckCheck className="w-3 h-3 text-blue-500" />}
                    {msg.sent && msg.status === "delivered" && <CheckCheck className="w-3 h-3 text-muted-foreground" />}
                    {msg.sent && msg.status === "sent" && <Clock className="w-3 h-3 text-muted-foreground" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick replies */}
          {showQuickReplies && (
            <div className="px-4 py-2 border-t border-border bg-muted/30">
              <p className="text-[10px] text-muted-foreground mb-1.5">Respostas rápidas:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map(reply => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="text-[10px] bg-background border border-border rounded-full px-3 py-1 hover:border-primary/50 transition-colors text-foreground"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setShowQuickReplies(!showQuickReplies)}>
                <Smile className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="w-5 h-5 text-muted-foreground" /></Button>
              <input
                className="flex-1 px-4 py-2.5 bg-muted rounded-lg text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Digite uma mensagem..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <Button variant="ghost" size="icon" className="shrink-0"><Mic className="w-5 h-5 text-muted-foreground" /></Button>
              <Button size="icon" className="shrink-0 bg-primary hover:bg-primary/90" onClick={() => sendMessage()}>
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
            <p className="text-xs text-muted-foreground">{selectedContact.phone}</p>
            {selectedContact.isBot && (
              <Badge className="mt-1 text-[10px] bg-blue-500/10 text-blue-500 border-0">Atendimento por IA</Badge>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedContact.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Etapa</h4>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs">{selectedContact.stage}</Badge>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Responsável</h4>
              <p className="text-sm text-foreground">{selectedContact.assignedTo || "Sem responsável"}</p>
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
                {selectedContact.isBot && (
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 border-blue-500/30 text-blue-500" onClick={() => transferToHuman(selectedContact.id)}>
                    <ArrowRight className="w-3.5 h-3.5" /> Transferir para humano
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
