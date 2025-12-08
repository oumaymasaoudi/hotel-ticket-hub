import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketCheck, Clock, CheckCircle, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    if (user?.email) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          categories (name, color),
          hotels (name)
        `)
        .eq("client_email", user?.email)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTickets(data || []);
      
      // Calculate stats
      const open = data?.filter(t => t.status === "open").length || 0;
      const inProgress = data?.filter(t => t.status === "in_progress" || t.status === "pending").length || 0;
      const resolved = data?.filter(t => t.status === "resolved" || t.status === "closed").length || 0;
      setStats({ open, inProgress, resolved });
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "closed":
        return <Badge variant="outline">Clôturé</Badge>;
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>;
      case "pending":
        return <Badge className="bg-orange-500/10 text-orange-500">En attente</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>;
    }
  };

  return (
    <DashboardLayout allowedRoles={["client"]} title="Tableau de bord">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bienvenue</h1>
          <p className="text-muted-foreground">Gérez vos tickets et suivez leur avancement</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TicketCheck className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">{stats.open}</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Tickets ouverts</h3>
            <p className="text-sm text-muted-foreground">Demandes en attente</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">{stats.inProgress}</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">En cours</h3>
            <p className="text-sm text-muted-foreground">Interventions actives</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">{stats.resolved}</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Résolus</h3>
            <p className="text-sm text-muted-foreground">Total résolu</p>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Mes tickets</h2>
          <Button onClick={() => navigate("/create-ticket")}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau ticket
          </Button>
        </div>

        <Card className="overflow-hidden border-border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center">
              <TicketCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Aucun ticket pour le moment</p>
              <Button onClick={() => navigate("/create-ticket")}>
                <Plus className="mr-2 h-4 w-4" />
                Créer mon premier ticket
              </Button>
            </div>
          ) : (
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
                      Hôtel
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
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                        {ticket.ticket_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        {ticket.categories?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                        {ticket.hotels?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/track-ticket?email=${user?.email}&ticket=${ticket.ticket_number}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
