import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Hotel, TicketCheck, Eye, Users, Building2, Shield, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <PublicHeader />

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Votre hôtel, toujours opérationnel.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gérez vos incidents techniques en temps réel avec un système de ticketing professionnel
              conçu spécialement pour l'hôtellerie.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => navigate("/create-ticket")}
            >
              <TicketCheck className="mr-2 h-5 w-5" />
              Créer un ticket
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigate("/track-ticket")}
            >
              <Eye className="mr-2 h-5 w-5" />
              Suivre mon ticket
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-16">
            <div className="bg-card p-6 rounded-lg shadow-md border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <TicketCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Création rapide</h3>
              <p className="text-muted-foreground">
                Créez un ticket en quelques secondes via notre formulaire simplifié
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Suivi en temps réel</h3>
              <p className="text-muted-foreground">
                Suivez l'avancement de votre demande à tout moment
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-md border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Résolution garantie</h3>
              <p className="text-muted-foreground">
                Des techniciens qualifiés pour résoudre vos problèmes rapidement
              </p>
            </div>
          </div>

          {/* Section pour les professionnels */}
          <div className="pt-16 border-t border-border mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-8">Espace professionnel</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/login")}
              >
                <Users className="h-6 w-6 text-primary" />
                <span>Client connecté</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/login")}
              >
                <Building2 className="h-6 w-6 text-primary" />
                <span>Technicien</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/login")}
              >
                <Hotel className="h-6 w-6 text-primary" />
                <span>Admin Hôtel</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate("/login")}
              >
                <Shield className="h-6 w-6 text-primary" />
                <span>SuperAdmin</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
