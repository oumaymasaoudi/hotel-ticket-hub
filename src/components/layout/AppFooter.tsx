import { Hotel, Star, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t-2 border-primary/20 bg-gradient-to-b from-card via-card/95 to-card/90 backdrop-blur-md mt-auto shadow-lg shadow-primary/5">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo et Description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Hotel className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-bold text-foreground">TicketHotel</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={`star-${i}`} className="h-3 w-3 fill-secondary text-secondary" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Solution complète de gestion de tickets pour hôtels. 
              Simplifiez la maintenance et améliorez la satisfaction client.
            </p>
            {/* Réseaux sociaux */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#" 
                className="h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="#" 
                className="h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Liens Rapides */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg text-foreground mb-2">Liens Rapides</h3>
            <div className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors"></span>
                Accueil
              </Link>
              <Link 
                to="/create-ticket" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors"></span>
                Créer un ticket
              </Link>
              <Link 
                to="/track-ticket" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors"></span>
                Suivre un ticket
              </Link>
              <Link 
                to="/login" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors"></span>
                Connexion
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg text-foreground mb-2">Contact</h3>
            <div className="flex flex-col gap-3 text-sm">
              <a 
                href="mailto:support@tickethotel.com" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>support@tickethotel.com</span>
              </a>
              <a 
                href="tel:+33123456789" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span>+33 1 23 45 67 89</span>
              </a>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span>Paris, France</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg text-foreground mb-2">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Restez informé de nos dernières actualités et fonctionnalités.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {currentYear} <span className="font-semibold text-foreground">TicketHotel</span>. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors font-medium">
              Mentions légales
            </Link>
            <Link to="/" className="hover:text-primary transition-colors font-medium">
              Politique de confidentialité
            </Link>
            <Link to="/" className="hover:text-primary transition-colors font-medium">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

