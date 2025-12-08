import { useNavigate, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/hooks/useAuth";
import {
  Hotel,
  TicketCheck,
  Plus,
  Clock,
  CheckCircle,
  Users,
  Settings,
  CreditCard,
  Building2,
  BarChart3,
  FileText,
  AlertTriangle,
  Wrench,
  LogOut,
  History,
  Shield,
  Layers,
  DollarSign,
  Star,
} from "lucide-react";

interface AppSidebarProps {
  role: UserRole;
  hotelName?: string;
}

const clientMenuItems = [
  { title: "Tableau de bord", url: "/dashboard/client", icon: BarChart3 },
  { title: "Nouveau ticket", url: "/dashboard/client/create", icon: Plus },
  { title: "Mes tickets", url: "/dashboard/client/tickets", icon: TicketCheck },
  { title: "Historique", url: "/dashboard/client/history", icon: History },
];

const technicianMenuItems = [
  { title: "Tableau de bord", url: "/dashboard/technician", icon: BarChart3 },
  { title: "Tickets assignés", url: "/dashboard/technician/tickets", icon: TicketCheck },
  { title: "Tickets urgents", url: "/dashboard/technician/urgent", icon: AlertTriangle },
  { title: "Historique", url: "/dashboard/technician/history", icon: History },
];

const adminMenuItems = [
  { title: "Tableau de bord", url: "/dashboard/admin", icon: BarChart3 },
  { title: "Tickets", url: "/dashboard/admin/tickets", icon: TicketCheck },
  { title: "Créer ticket", url: "/dashboard/admin/create-ticket", icon: Plus },
  { title: "Techniciens", url: "/dashboard/admin/technicians", icon: Users },
  { title: "Escalades", url: "/dashboard/admin/escalations", icon: AlertTriangle },
  { title: "Paiements", url: "/dashboard/admin/payments", icon: CreditCard },
  { title: "Rapports", url: "/dashboard/admin/reports", icon: FileText },
  { title: "Paramètres", url: "/dashboard/admin/settings", icon: Settings },
];

const superAdminMenuItems = [
  { title: "Tableau de bord", url: "/dashboard/superadmin", icon: BarChart3 },
  { title: "Hôtels", url: "/dashboard/superadmin/hotels", icon: Building2 },
  { title: "Plans", url: "/dashboard/superadmin/plans", icon: Layers },
  { title: "Utilisateurs", url: "/dashboard/superadmin/users", icon: Users },
  { title: "Catégories", url: "/dashboard/superadmin/categories", icon: Wrench },
  { title: "Paiements", url: "/dashboard/superadmin/payments", icon: DollarSign },
  { title: "Rapports", url: "/dashboard/superadmin/reports", icon: FileText },
  { title: "Logs", url: "/dashboard/superadmin/logs", icon: History },
  { title: "Paramètres", url: "/dashboard/superadmin/settings", icon: Settings },
];

const getMenuItems = (role: UserRole) => {
  switch (role) {
    case "client":
      return clientMenuItems;
    case "technician":
      return technicianMenuItems;
    case "admin":
      return adminMenuItems;
    case "superadmin":
      return superAdminMenuItems;
    default:
      return [];
  }
};

const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case "client":
      return { label: "Client", className: "bg-sidebar-accent text-sidebar-foreground border-sidebar-border" };
    case "technician":
      return { label: "Technicien", className: "bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30" };
    case "admin":
      return { label: "Admin", className: "bg-sidebar-primary text-sidebar-primary-foreground" };
    case "superadmin":
      return { label: "SuperAdmin", className: "bg-sidebar-primary text-sidebar-primary-foreground" };
    default:
      return { label: "Utilisateur", className: "bg-sidebar-accent text-sidebar-foreground" };
  }
};

export function AppSidebar({ role, hotelName }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const menuItems = getMenuItems(role);
  const badge = getRoleBadge(role);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="bg-sidebar border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Hotel className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-serif font-bold text-sidebar-foreground">TicketHotel</span>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-2 w-2 fill-sidebar-primary text-sidebar-primary" />
                ))}
              </div>
              <Badge className={`text-xs ${badge.className}`}>
                {role === "superadmin" && <Shield className="h-3 w-3 mr-1" />}
                {badge.label}
              </Badge>
            </div>
          )}
        </div>
        {!collapsed && hotelName && (
          <p className="text-xs text-sidebar-foreground/70 mt-2 truncate">{hotelName}</p>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                          isActive 
                            ? "bg-sidebar-primary/20 text-sidebar-primary font-medium" 
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-sidebar-primary" : ""}`} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Déconnexion</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}