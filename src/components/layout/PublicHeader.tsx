import { Button } from "@/components/ui/button";
import { Hotel, ArrowLeft, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PublicHeaderProps {
  showBackButton?: boolean;
  showLoginButton?: boolean;
}

export function PublicHeader({ showBackButton = false, showLoginButton = true }: PublicHeaderProps) {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Hotel className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">TicketHotel</span>
          </div>
        </div>
        {showLoginButton && (
          <Button variant="outline" onClick={() => navigate("/login")}>
            <LogIn className="mr-2 h-4 w-4" />
            Connexion
          </Button>
        )}
      </div>
    </nav>
  );
}
