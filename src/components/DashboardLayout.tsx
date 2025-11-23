import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, User, LogOut, CloudUpload, Check, Inbox, Search, FolderOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useSave } from "@/contexts/SaveContext";
import { useNavigate } from "react-router-dom";
import { useAutoSave } from "@/hooks/useAutoSave";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut, user } = useAuth();
  const { currentSave, allSaves, loadSave } = useSave();
  const navigate = useNavigate();
  const { isSaving, lastSaveTime } = useAutoSave({ interval: 120000, enabled: true });
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Premium Black & Blue Header */}
          <header className="h-16 border-b border-border/30 glass-strong flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-2xl bg-card/50">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-primary/10 transition-all hover:scale-105" />
              
              {currentSave ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:bg-primary/5 p-2 rounded-lg transition-all">
                      <div className="relative w-10 h-10 bg-gradient-blue rounded-xl flex items-center justify-center shadow-glow ring-2 ring-primary/20">
                        <span className="text-white font-heading font-bold text-sm drop-shadow-lg">
                          {currentSave.team_name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="font-heading font-semibold text-sm">{currentSave.team_name}</p>
                        <p className="text-xs text-muted-foreground">Season {currentSave.season_year}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel>Your Careers</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allSaves.map((save) => (
                      <DropdownMenuItem
                        key={save.id}
                        onClick={() => {
                          loadSave(save.id);
                          window.location.reload();
                        }}
                        className={save.id === currentSave.id ? "bg-primary/10" : ""}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{save.save_name}</span>
                          <span className="text-xs text-muted-foreground">{save.team_name}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/careers")}>
                      Manage Careers
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/new-game")}>
                      New Career
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 bg-gradient-blue rounded-xl flex items-center justify-center shadow-glow ring-2 ring-primary/20">
                    <span className="text-white font-heading font-bold text-sm drop-shadow-lg">FM</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-heading font-semibold text-sm">No Career Active</p>
                    <p className="text-xs text-muted-foreground">Start a new career</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentSave && (
                <>
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
                    isSaving
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/50 text-muted-foreground"
                  )}>
                    {isSaving ? (
                      <>
                        <CloudUpload className="h-4 w-4 animate-pulse" />
                        <span className="text-xs font-medium">Saving...</span>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <CloudUpload className="h-4 w-4" />
                          <Check className={cn(
                            "h-3 w-3 absolute -bottom-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full p-0.5",
                            "animate-in fade-in zoom-in duration-500"
                          )} />
                        </div>
                        <span className="text-xs font-medium">Saved</span>
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs font-medium hover:bg-primary/10">
                    {new Date(currentSave.game_date).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Button>
                </>
              )}
              <Button variant="outline" size="icon" className="relative hover:bg-primary/10 transition-all hover:scale-105">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-glow-pulse"
                >
                  3
                </Badge>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-all hover:scale-105">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Manager Account</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/inbox")} className="cursor-pointer">
                    <Inbox className="mr-2 h-4 w-4" />
                    Inbox
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/search")} className="cursor-pointer">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/careers")} className="cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Manage Careers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/options")} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
