import { Home, Users, Zap, ArrowLeftRight, Building, DollarSign, Trophy, Calendar, Briefcase, ChevronDown } from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const managerBoardItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Squad", url: "/squad", icon: Users },
  { title: "Tactics", url: "/tactics", icon: Zap },
  { title: "Club", url: "/club", icon: Building },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Finances", url: "/finances", icon: DollarSign },
  { title: "Transfers", url: "/transfers", icon: ArrowLeftRight },
];

const competitionsItems = [
  { title: "Competitions", url: "/competitions", icon: Trophy },
  { title: "World", url: "/world", icon: Trophy },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isManagerBoardActive = managerBoardItems.some(item => isActive(item.url));
  const isCompetitionsActive = competitionsItems.some(item => isActive(item.url));

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Football Manager
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen={isManagerBoardActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-muted/50">
                      <Briefcase className="h-4 w-4" />
                      {open && <span>Manager Board</span>}
                      {open && <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {managerBoardItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink 
                              to={item.url} 
                              end 
                              className="hover:bg-muted/50" 
                              activeClassName="bg-muted text-primary font-medium"
                            >
                              <item.icon className="h-4 w-4" />
                              {open && <span>{item.title}</span>}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible defaultOpen={isCompetitionsActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-muted/50">
                      <Trophy className="h-4 w-4" />
                      {open && <span>Competitions</span>}
                      {open && <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {competitionsItems.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink 
                              to={item.url} 
                              end 
                              className="hover:bg-muted/50" 
                              activeClassName="bg-muted text-primary font-medium"
                            >
                              <item.icon className="h-4 w-4" />
                              {open && <span>{item.title}</span>}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
