import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Hotel,
  Building2,
  DollarSign,
  TrendingUp,
  Settings,
  Shield,
} from "lucide-react";

const SuperAdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">TicketHotel</span>
            <Badge variant="destructive" className="ml-2">
              <Shield className="h-3 w-3 mr-1" />
              SuperAdmin
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline">Déconnexion</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard SuperAdmin</h1>
          <p className="text-muted-foreground">Vue globale de la plateforme TicketHotel</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card to-accent border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">24</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Hôtels actifs</h3>
            <p className="text-xs text-muted-foreground mt-1">+3 ce mois</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-accent border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">47.2K€</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Revenus totaux</h3>
            <p className="text-xs text-muted-foreground mt-1">Mois en cours</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-accent border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Hotel className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">342</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Tickets ouverts</h3>
            <p className="text-xs text-muted-foreground mt-1">Global</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-accent border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">94%</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">SLA global</h3>
            <p className="text-xs text-muted-foreground mt-1">Performance moyenne</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border">
            <h2 className="text-xl font-bold mb-4 text-card-foreground">Hôtels récents</h2>
            <div className="space-y-3">
              {[
                { name: "Hôtel Paris Centre", plan: "Pro", status: "Actif" },
                { name: "Hôtel Lyon Confluence", plan: "Enterprise", status: "Actif" },
                { name: "Hôtel Marseille Vieux Port", plan: "Starter", status: "Paiement en retard" },
              ].map((hotel, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{hotel.name}</p>
                    <p className="text-sm text-muted-foreground">Plan {hotel.plan}</p>
                  </div>
                  <Badge
                    className={
                      hotel.status === "Actif"
                        ? "bg-primary text-primary-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }
                  >
                    {hotel.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-border">
            <h2 className="text-xl font-bold mb-4 text-card-foreground">Statistiques globales</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-card-foreground">Tickets résolus (7j)</span>
                <span className="font-bold text-primary">1,247</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-card-foreground">Temps moyen de résolution</span>
                <span className="font-bold text-primary">2.4h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                <span className="text-card-foreground">Taux de satisfaction</span>
                <span className="font-bold text-primary">4.7/5</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
