import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<LiveChat />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/ai-service" element={<AIService />} />
          <Route path="/flows" element={<Flows />} />
          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/audience" element={<Audience />} />
          <Route path="/group-manager" element={<GroupManager />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
