import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Hotel, TicketCheck, Eye, Users, Building2, Clock, CheckCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import luxuryBg from "@/assets/luxury-hotel-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />

      {/* Hero Section with Luxury Background */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${luxuryBg})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-background" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-1">
              {[...new Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-secondary text-secondary" />
              ))}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-primary-foreground drop-shadow-lg">
            L'Excellence au Service
            <br />
            <span className="text-gradient-gold">de Votre Hôtel</span>
          </h1>

          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto font-light">
            Gestion professionnelle des incidents techniques pour les établissements d'exception
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/30 text-lg px-8 py-6"
              onClick={() => navigate("/create-ticket")}
            >
              <TicketCheck className="mr-2 h-5 w-5" />
              Créer un ticket
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-2 border-primary-foreground bg-white/95 backdrop-blur-md text-primary font-bold hover:bg-white hover:text-primary hover:border-primary-foreground text-lg px-8 py-6 shadow-xl shadow-primary-foreground/20"
              onClick={() => navigate("/track-ticket")}
            >
              <Eye className="mr-2 h-5 w-5" />
              Suivre mon ticket
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Une Expérience Premium
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Des outils de gestion conçus pour répondre aux exigences des hôtels de luxe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg shadow-lg border border-border card-luxury text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <TicketCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-card-foreground">Création Instantanée</h3>
              <p className="text-muted-foreground">
                Signalez un incident en quelques secondes grâce à notre interface intuitive
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg border border-border card-luxury text-center">
              <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-card-foreground">Suivi Temps Réel</h3>
              <p className="text-muted-foreground">
                Restez informé à chaque étape de la résolution de votre demande
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg border border-border card-luxury text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3 text-card-foreground">Excellence Garantie</h3>
              <p className="text-muted-foreground">
                Des techniciens qualifiés pour une résolution rapide et efficace
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Section */}
      <section className="py-20 bg-gradient-luxury">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
              Espace Professionnel
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Accédez à votre tableau de bord personnalisé
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <button
              onClick={() => navigate("/login")}
              className="group relative bg-gradient-to-br from-card/20 via-card/15 to-card/10 backdrop-blur-md border-2 border-primary-foreground/30 rounded-2xl p-8 text-center transition-all duration-500 hover:border-secondary/60 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2 hover:scale-105 overflow-hidden"
            >
              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="relative z-10">
                <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 group-hover:scale-110 transition-all duration-300">
                  <Users className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-primary-foreground font-semibold text-lg group-hover:text-secondary transition-colors duration-300">Client</span>
              </div>
            </button>

            <button
              onClick={() => navigate("/login")}
              className="group relative bg-gradient-to-br from-card/20 via-card/15 to-card/10 backdrop-blur-md border-2 border-primary-foreground/30 rounded-2xl p-8 text-center transition-all duration-500 hover:border-secondary/60 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2 hover:scale-105 overflow-hidden"
            >
              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="relative z-10">
                <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 group-hover:scale-110 transition-all duration-300">
                  <Building2 className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-primary-foreground font-semibold text-lg group-hover:text-secondary transition-colors duration-300">Technicien</span>
              </div>
            </button>

            <button
              onClick={() => navigate("/login")}
              className="group relative bg-gradient-to-br from-card/20 via-card/15 to-card/10 backdrop-blur-md border-2 border-primary-foreground/30 rounded-2xl p-8 text-center transition-all duration-500 hover:border-secondary/60 hover:shadow-2xl hover:shadow-secondary/20 hover:-translate-y-2 hover:scale-105 overflow-hidden"
            >
              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="relative z-10">
                <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/30 group-hover:scale-110 transition-all duration-300">
                  <Hotel className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-primary-foreground font-semibold text-lg group-hover:text-secondary transition-colors duration-300">Admin Hôtel</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default Index;