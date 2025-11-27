import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Hotel,
  TicketCheck,
  AlertTriangle,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">TicketHotel</span>
            <Badge variant="outline" className="ml-2">
              Admin
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Admin - Hôtel Paris Centre</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre établissement</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TicketCheck className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">12</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Tickets ouverts</h3>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">3</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Tickets escaladés</h3>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">8</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Techniciens actifs</h3>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-card-foreground">Plan Pro</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Abonnement</h3>
            <p className="text-xs text-muted-foreground mt-1">Prochain paiement: 15/12/2025</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border">
            <h2 className="text-xl font-bold mb-4 text-card-foreground">Tickets récents</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">TK-4582{i}</p>
                    <p className="text-sm text-muted-foreground">Plomberie - Chambre 305</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">En cours</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-border">
            <h2 className="text-xl font-bold mb-4 text-card-foreground">Techniciens disponibles</h2>
            <div className="space-y-3">
              {["Jean Dupont", "Marie Martin", "Pierre Durand"].map((name) => (
                <div key={name} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{name}</p>
                      <p className="text-sm text-muted-foreground">2 tickets actifs</p>
                    </div>
                  </div>
                  <Badge variant="outline">Disponible</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
