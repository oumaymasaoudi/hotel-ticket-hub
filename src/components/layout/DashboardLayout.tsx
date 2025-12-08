import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
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
          <header className="relative h-16 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center px-6 gap-4 shadow-sm">
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
          </header>
          <main className="relative flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}