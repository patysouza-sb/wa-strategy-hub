import { 
  LayoutDashboard, MessageSquare, Columns3, Bot, GitBranch, 
  Radio, Users, UsersRound, Zap, Settings, HelpCircle,
  ChevronDown
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Bate Papo ao Vivo", url: "/chat", icon: MessageSquare },
  { title: "Kanban", url: "/kanban", icon: Columns3 },
  { title: "Atendimento (IA)", url: "/ai-service", icon: Bot },
  { title: "Fluxos de Conversa", url: "/flows", icon: GitBranch },
  { title: "Transmissão", url: "/broadcast", icon: Radio },
  { title: "Audiência", url: "/audience", icon: Users },
  { title: "Gerente de Grupo", url: "/group-manager", icon: UsersRound },
  { title: "Automação", url: "/automation", icon: Zap },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-active">AtendFlow</h1>
          <p className="text-[10px] text-sidebar-muted">Atendimento inteligente</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active"
              }`}
              activeClassName=""
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-primary" : ""}`} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <NavLink
          to="/support"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active transition-all"
          activeClassName="bg-primary/15 text-primary font-medium"
        >
          <HelpCircle className="w-[18px] h-[18px]" />
          <span>Suporte</span>
        </NavLink>
      </div>
    </aside>
  );
}
