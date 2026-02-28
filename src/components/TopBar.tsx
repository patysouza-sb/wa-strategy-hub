import { ChevronDown, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
            ZE
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Equipe</p>
            <p className="text-[10px] text-muted-foreground">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
