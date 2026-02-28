import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 bg-background overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
