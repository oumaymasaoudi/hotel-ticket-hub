import { Button } from "@/components/ui/button";
import { Hotel, ArrowLeft, LogIn, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PublicHeaderProps {
  showBackButton?: boolean;
  showLoginButton?: boolean;
}

export function PublicHeader({ showBackButton = false, showLoginButton = true }: PublicHeaderProps) {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-border/30 bg-primary/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          )}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <Hotel className="h-8 w-8 text-secondary" />
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold text-primary-foreground">TicketHotel</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-2.5 w-2.5 fill-secondary text-secondary" />
                ))}
              </div>
            </div>
          </div>
        </div>
        {showLoginButton && (
          <Button 
            variant="outline" 
            onClick={() => navigate("/login")}
            className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Connexion
          </Button>
        )}
      </div>
    </nav>
  );
}