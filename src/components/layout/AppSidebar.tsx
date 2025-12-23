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
import { UserRole } from "@/hooks/useAuth";
import {
  Hotel,
  TicketCheck,
  Plus,
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
import sidebarBg from "@/assets/sidebar-luxury-bg.jpg";

interface AppSidebarProps {
  role: UserRole;
  hotelName?: string;
}

const clientMenuItems = [
  { title: "Tableau de bord", url: "/dashboard/client", icon: BarChart3 },
  { title: "Nouveau ticket", url: "/create-ticket", icon: Plus },
  { title: "Suivre un ticket", url: "/track-ticket", icon: TicketCheck },
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
  { title: "Techniciens", url: "/dashboard/admin/technicians", icon: Users },
  { title: "Escalades", url: "/dashboard/admin/escalations", icon: AlertTriangle },
  { title: "Paiement", url: "/dashboard/admin/payment", icon: CreditCard },
  { title: "Rapports", url: "/dashboard/admin/reports", icon: FileText },
  { title: "Paramètres", url: "/dashboard/admin/settings", icon: Settings },
];

const superAdminMenuItems = [
  { title: "Tableau de bord", url: "/dashboard/superadmin", icon: BarChart3 },
  { title: "Hôtels", url: "/dashboard/superadmin/hotels", icon: Building2 },
  { title: "Escalades", url: "/dashboard/superadmin/escalations", icon: AlertTriangle },
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
      return { label: "Client", className: "bg-white/10 text-white/90 border-white/20" };
    case "technician":
      return { label: "Technicien", className: "bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30" };
    case "admin":
      return { label: "Admin", className: "bg-sidebar-primary text-sidebar-primary-foreground" };
    case "superadmin":
      return { label: "SuperAdmin", className: "bg-sidebar-primary text-sidebar-primary-foreground" };
    default:
      return { label: "Utilisateur", className: "bg-white/10 text-white/90" };
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
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${sidebarBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-sidebar/80 via-sidebar/70 to-sidebar/90" />

      {/* Content */}
      <SidebarHeader className="relative border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Hotel className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-serif font-bold text-white">TicketHotel</span>
              <div className="flex items-center gap-1 mb-1">
                {[...new Array(5)].map((_, i) => (
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
          <p className="text-xs text-white/60 mt-2 truncate">{hotelName}</p>
        )}
      </SidebarHeader>

      <SidebarContent className="relative">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/50 text-xs uppercase tracking-wider px-4">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="px-2">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        className={`
                          group relative flex items-center gap-3 px-4 py-3 rounded-lg
                          transition-all duration-300 ease-out
                          ${isActive
                            ? "bg-gradient-to-r from-sidebar-primary/30 to-sidebar-primary/10 text-sidebar-primary font-medium shadow-[0_0_20px_hsl(42_80%_52%/0.3)]"
                            : "text-white/70 hover:text-white"
                          }
                        `}
                        activeClassName=""
                      >
                        {/* Gold glow effect on hover */}
                        <div className={`
                          absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300
                          bg-gradient-to-r from-sidebar-primary/20 via-sidebar-primary/10 to-transparent
                          group-hover:opacity-100
                          ${isActive ? "opacity-100" : ""}
                        `} />

                        {/* Left border accent */}
                        <div className={`
                          absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full
                          transition-all duration-300 ease-out
                          ${isActive
                            ? "h-8 bg-gradient-to-b from-sidebar-primary to-sidebar-primary/50 shadow-[0_0_10px_hsl(42_80%_52%/0.5)]"
                            : "h-0 bg-sidebar-primary group-hover:h-4"
                          }
                        `} />

                        {/* Icon with glow */}
                        <div className={`
                          relative z-10 p-1.5 rounded-md transition-all duration-300
                          ${isActive
                            ? "bg-sidebar-primary/20 shadow-[0_0_15px_hsl(42_80%_52%/0.4)]"
                            : "group-hover:bg-sidebar-primary/10 group-hover:shadow-[0_0_10px_hsl(42_80%_52%/0.2)]"
                          }
                        `}>
                          <item.icon className={`
                            h-4 w-4 transition-all duration-300
                            ${isActive
                              ? "text-sidebar-primary"
                              : "text-white/60 group-hover:text-sidebar-primary"
                            }
                          `} />
                        </div>

                        {/* Text */}
                        <span className={`
                          relative z-10 text-sm transition-all duration-300
                          ${isActive
                            ? "text-sidebar-primary font-semibold"
                            : "group-hover:text-white group-hover:translate-x-1"
                          }
                        `}>
                          {item.title}
                        </span>

                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                          <div className="
                            absolute -inset-full top-0 h-full w-1/2 
                            bg-gradient-to-r from-transparent via-white/5 to-transparent
                            skew-x-12 transition-all duration-700 ease-out
                            group-hover:translate-x-[200%]
                          " />
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="relative border-t border-white/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-white/70 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Déconnexion</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}