import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, CheckCircle, Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useNotifications } from "@/hooks/useNotifications";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import luxuryLightBg from "@/assets/luxury-hotel-light-bg.jpg";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export function DashboardLayout({
  children,
  allowedRoles,
  title,
  showBackButton = false,
  backUrl,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (!loading && role && !allowedRoles.includes(role)) {
      // Redirect to appropriate dashboard based on role
      switch (role) {
        case "client":
          navigate("/dashboard/client");
          break;
        case "technician":
          navigate("/dashboard/technician");
          break;
        case "admin":
          navigate("/dashboard/admin");
          break;
        case "superadmin":
          navigate("/dashboard/superadmin");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, role, loading, navigate, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role={role} />
        <div className="flex-1 flex flex-col relative">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-20"
            style={{ backgroundImage: `url(${luxuryLightBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95" />
          
          {/* Content */}
          <header className="relative h-16 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-primary hover:bg-primary/10" />
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (backUrl ? navigate(backUrl) : navigate(-1))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              )}
              {title && (
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-serif font-semibold text-primary">{title}</h1>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-secondary text-secondary" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>
                    <div className="flex items-center justify-between">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="h-6 text-xs"
                        >
                          Tout marquer comme lu
                        </Button>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Aucune notification
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.slice(0, 10).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={notification.read ? "opacity-60" : ""}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.ticketId) {
                              navigate(`/dashboard/${role}/tickets`);
                            }
                          }}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {notification.message}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleString('fr-FR')}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Toggle Theme */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newTheme = theme === "dark" ? "light" : "dark";
                  setTheme(newTheme);
                }}
                className="h-9 w-9"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              {user && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Connecté</span>
                  <span className="font-medium text-foreground">
                    {user.fullName || user.email || 'Utilisateur'}
                  </span>
                </div>
              )}
            </div>
          </header>
          <main className="relative flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}