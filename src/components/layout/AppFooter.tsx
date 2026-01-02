import { Hotel, Star, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Logo et Description */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Hotel className="h-6 w-6 text-primary" />
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold text-foreground">TicketHotel</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={`star-${i}`} className="h-2.5 w-2.5 fill-secondary text-secondary" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Solution complète de gestion de tickets pour hôtels. 
              Simplifiez la maintenance et améliorez la satisfaction client.
            </p>
          </div>

          {/* Liens Rapides */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">Liens Rapides</h3>
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Accueil
              </Link>
              <Link 
                to="/create-ticket" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Créer un ticket
              </Link>
              <Link 
                to="/track-ticket" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Suivre un ticket
              </Link>
              <Link 
                to="/login" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Connexion
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@tickethotel.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/30 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {currentYear} TicketHotel. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Mentions légales
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/" className="hover:text-primary transition-colors">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

