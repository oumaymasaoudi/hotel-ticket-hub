import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketCheck, AlertTriangle, Users, CreditCard, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { hotelId } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ open: 0, escalated: 0, technicians: 0 });

  useEffect(() => {
    if (hotelId) {
      fetchData();
    }
  }, [hotelId]);

  const fetchData = async () => {
    try {
      const { data: ticketsData } = await supabase
        .from("tickets")
        .select(`*, categories (name)`)
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: techData } = await supabase
        .from("user_roles")
        .select(`user_id, profiles (full_name)`)
        .eq("hotel_id", hotelId)
        .eq("role", "technician");

      setTickets(ticketsData || []);
      setTechnicians(techData || []);
      
      const open = ticketsData?.filter(t => t.status === "open" || t.status === "in_progress").length || 0;
      setStats({ open, escalated: 0, technicians: techData?.length || 0 });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>;
      default: return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>;
    }
  };

  return (
    <DashboardLayout allowedRoles={["admin"]} title="Dashboard Admin">
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><TicketCheck className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.open}</span></div><h3 className="font-semibold">Tickets ouverts</h3></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-destructive" /></div><span className="text-3xl font-bold">{stats.escalated}</span></div><h3 className="font-semibold">Escaladés</h3></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.technicians}</span></div><h3 className="font-semibold">Techniciens</h3></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><CreditCard className="h-6 w-6 text-primary" /></div></div><h3 className="font-semibold">Plan Pro</h3><p className="text-xs text-muted-foreground">Prochain paiement: 15/12/2025</p></Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tickets récents</h2>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Créer</Button>
            </div>
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div><p className="font-medium">{ticket.ticket_number}</p><p className="text-sm text-muted-foreground">{ticket.categories?.name}</p></div>
                  {getStatusBadge(ticket.status)}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Techniciens</h2>
            <div className="space-y-3">
              {technicians.map((tech, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                    <p className="font-medium">{tech.profiles?.full_name || "N/A"}</p>
                  </div>
                  <Badge variant="outline">Actif</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
