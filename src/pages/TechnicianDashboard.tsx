import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hotel, Wrench, AlertCircle, Clock, TrendingUp } from "lucide-react";

const TechnicianDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">TicketHotel</span>
          </div>
          <Button variant="outline">Déconnexion</Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord Technicien</h1>
          <p className="text-muted-foreground">Gérez vos interventions</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">5</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Tickets assignés</h3>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">2</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Tickets urgents</h3>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">1</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">SLA dépassés</h3>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">92%</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Performance</h3>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-6">Mes tickets</h2>

        <Card className="overflow-hidden border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Hôtel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    SLA restant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-card-foreground">TK-45821</td>
                  <td className="px-6 py-4 text-sm text-card-foreground">Plomberie</td>
                  <td className="px-6 py-4 text-sm text-card-foreground">Paris Centre</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant="destructive">-30 min</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-primary text-primary-foreground">En cours</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm">
                      Gérer
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default TechnicianDashboard;
