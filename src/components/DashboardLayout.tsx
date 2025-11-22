import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Premium Black & Blue Header */}
          <header className="h-16 border-b border-border/30 glass-strong flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-2xl bg-card/50">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-primary/10 transition-all hover:scale-105" />
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 bg-gradient-blue rounded-xl flex items-center justify-center shadow-glow ring-2 ring-primary/20">
                  <span className="text-white font-heading font-bold text-sm drop-shadow-lg">MC</span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-heading font-semibold text-sm">Manchester City</p>
                  <p className="text-xs text-muted-foreground">Season 2024/25</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-xs font-medium hover:bg-primary/10">
                15 January 2025
              </Button>
              <Button variant="outline" size="icon" className="relative hover:bg-primary/10 transition-all hover:scale-105">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-glow-pulse"
                >
                  3
                </Badge>
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-all hover:scale-105">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
