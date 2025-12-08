import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4">
            <SidebarTrigger />
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (backUrl ? navigate(backUrl) : navigate(-1))}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
            {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
          </header>
          <main className="flex-1 p-6 bg-background overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
