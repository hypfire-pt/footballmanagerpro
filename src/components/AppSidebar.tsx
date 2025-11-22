import { Home, Gamepad2, Users, Zap, ArrowLeftRight, Building, DollarSign, Trophy, Calendar, Globe, Inbox, Search, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Game", url: "https://hypfire-pt.github.io/FootballStreamer1/#how-it-works", icon: Gamepad2, external: true },
  { title: "Squad", url: "/squad", icon: Users },
  { title: "Tactics", url: "/tactics", icon: Zap },
  { title: "Transfers", url: "/transfers", icon: ArrowLeftRight },
  { title: "Club", url: "/club", icon: Building },
  { title: "Finances", url: "/finances", icon: DollarSign },
  { title: "Competitions", url: "/competitions", icon: Trophy },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "World", url: "/world", icon: Globe },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Search", url: "/search", icon: Search },
  { title: "Options", url: "/options", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Football Manager
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.external ? (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:bg-muted/50"
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </a>
                    ) : (
                      <NavLink 
                        to={item.url} 
                        end 
                        className="hover:bg-muted/50" 
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
