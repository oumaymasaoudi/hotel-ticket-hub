import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel, TicketCheck, Clock, CheckCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (!loading && role && role !== "client") {
      navigate("/");
    }
  }, [user, role, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Chargement...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">TicketHotel</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>Déconnexion</Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue sur votre espace client</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TicketCheck className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">3</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Tickets ouverts</h3>
            <p className="text-sm text-muted-foreground">Demandes en attente</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">2</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">En cours</h3>
            <p className="text-sm text-muted-foreground">Interventions actives</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">15</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Résolus</h3>
            <p className="text-sm text-muted-foreground">Ce mois-ci</p>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Mes tickets</h2>
          <Button onClick={() => navigate("/create-ticket")}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Button>
        </div>

        <Card className="overflow-hidden border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                    TK-45821
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">Plomberie</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                      En cours
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">27/11/2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button variant="outline" size="sm">
                      Voir
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

export default ClientDashboard;
