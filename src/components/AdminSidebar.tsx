import { LayoutDashboard, UtensilsCrossed, Users, Banknote, RefreshCw } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Menu Management', url: '/menu', icon: UtensilsCrossed },
  { title: 'Team Dashboard', url: '/members', icon: Users },
  { title: 'Expenses', url: '/expenses', icon: Banknote },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { fetchData } = useStore();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await fetchData();
    setTimeout(() => setSyncing(false), 800);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-6">
          {!collapsed && (
            <h1 className="font-display text-xl font-bold text-sidebar-primary-foreground">
              <span className="text-sidebar-primary">🍽</span> Hotel Admin
            </h1>
          )}
          {collapsed && <span className="text-2xl block text-center">🍽</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-accent/20">
        <Button 
          variant="ghost" 
          size={collapsed ? "icon" : "sm"} 
          className="w-full flex items-center justify-center gap-2 hover:bg-sidebar-accent"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin text-primary' : ''}`} />
          {!collapsed && <span>{syncing ? 'Syncing...' : 'Sync with Atlas'}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
