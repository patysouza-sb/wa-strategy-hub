import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import PlansExpired from "./pages/PlansExpired";
import MySubscription from "./pages/MySubscription";
import LiveChat from "./pages/LiveChat";
import Kanban from "./pages/Kanban";
import AIService from "./pages/AIService";
import Flows from "./pages/Flows";
import Broadcast from "./pages/Broadcast";
import Audience from "./pages/Audience";
import GroupManager from "./pages/GroupManager";
import Automation from "./pages/Automation";
import SettingsPage from "./pages/SettingsPage";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const protect = (el: JSX.Element) => <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/plans" element={<PlansExpired />} />
            <Route path="/" element={protect(<Index />)} />
            <Route path="/chat" element={protect(<LiveChat />)} />
            <Route path="/kanban" element={protect(<Kanban />)} />
            <Route path="/ai-service" element={protect(<AIService />)} />
            <Route path="/flows" element={protect(<Flows />)} />
            <Route path="/broadcast" element={protect(<Broadcast />)} />
            <Route path="/audience" element={protect(<Audience />)} />
            <Route path="/group-manager" element={protect(<GroupManager />)} />
            <Route path="/automation" element={protect(<Automation />)} />
            <Route path="/subscription" element={protect(<MySubscription />)} />
            <Route path="/settings" element={protect(<SettingsPage />)} />
            <Route path="/support" element={protect(<Support />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
