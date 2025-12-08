import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketCheck, Clock, CheckCircle, Plus, Eye, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ClientDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveView = () => {
    if (currentPath.includes("/create")) return "create";
    if (currentPath.includes("/tickets")) return "tickets";
    if (currentPath.includes("/history")) return "history";
    return "dashboard";
  };

  const activeView = getActiveView();
  const titles: Record<string, string> = {
    dashboard: "Tableau de bord",
    create: "Nouveau ticket",
    tickets: "Mes tickets",
    history: "Historique",
  };

  return (
    <DashboardLayout allowedRoles={["client"]} title={titles[activeView]}>
      {activeView === "dashboard" && <DashboardView />}
      {activeView === "create" && <CreateView />}
      {activeView === "tickets" && <TicketsView />}
      {activeView === "history" && <HistoryView />}
    </DashboardLayout>
  );
};

// Dashboard View
const DashboardView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  useEffect(() => { if (user?.email) fetchTickets(); }, [user]);

  const fetchTickets = async () => {
    const { data } = await supabase.from("tickets").select(`*, categories(name), hotels(name)`).eq("client_email", user?.email).order("created_at", { ascending: false });
    setTickets(data || []);
    setStats({
      open: data?.filter(t => t.status === "open").length || 0,
      inProgress: data?.filter(t => t.status === "in_progress" || t.status === "pending").length || 0,
      resolved: data?.filter(t => t.status === "resolved" || t.status === "closed").length || 0,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) { case "resolved": case "closed": return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>; case "in_progress": return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>; default: return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>; }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bienvenue</h1>
        <p className="text-muted-foreground">Gérez vos tickets et suivez leur avancement</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><TicketCheck className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.open}</span></div><h3 className="font-semibold">Tickets ouverts</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center"><Clock className="h-6 w-6 text-yellow-500" /></div><span className="text-3xl font-bold">{stats.inProgress}</span></div><h3 className="font-semibold">En cours</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center"><CheckCircle className="h-6 w-6 text-green-500" /></div><span className="text-3xl font-bold">{stats.resolved}</span></div><h3 className="font-semibold">Résolus</h3></Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tickets récents</h2>
        <Button onClick={() => navigate("/create-ticket")}><Plus className="mr-2 h-4 w-4" />Nouveau ticket</Button>
      </div>

      <Card>
        {tickets.length === 0 ? (
          <div className="p-8 text-center"><TicketCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground mb-4">Aucun ticket</p><Button onClick={() => navigate("/create-ticket")}><Plus className="mr-2 h-4 w-4" />Créer mon premier ticket</Button></div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Numéro</TableHead><TableHead>Catégorie</TableHead><TableHead>Hôtel</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {tickets.slice(0, 5).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.ticket_number}</TableCell>
                  <TableCell>{t.categories?.name}</TableCell>
                  <TableCell>{t.hotels?.name}</TableCell>
                  <TableCell>{getStatusBadge(t.status)}</TableCell>
                  <TableCell>{new Date(t.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell><Button variant="outline" size="sm" onClick={() => navigate(`/track-ticket?email=${user?.email}&ticket=${t.ticket_number}`)}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

// Create View - redirects to public create ticket
const CreateView = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate("/create-ticket"); }, []);
  return null;
};

// Tickets View
const TicketsView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => { if (user?.email) supabase.from("tickets").select(`*, categories(name), hotels(name)`).eq("client_email", user?.email).neq("status", "closed").order("created_at", { ascending: false }).then(({ data }) => setTickets(data || [])); }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) { case "resolved": return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>; case "in_progress": return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>; default: return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>; }
  };

  return (
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Numéro</TableHead><TableHead>Catégorie</TableHead><TableHead>Hôtel</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
        <TableBody>
          {tickets.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.ticket_number}</TableCell>
              <TableCell>{t.categories?.name}</TableCell>
              <TableCell>{t.hotels?.name}</TableCell>
              <TableCell>{getStatusBadge(t.status)}</TableCell>
              <TableCell>{new Date(t.created_at).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell><Button variant="outline" size="sm" onClick={() => navigate(`/track-ticket?email=${user?.email}&ticket=${t.ticket_number}`)}><Eye className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

// History View
const HistoryView = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => { if (user?.email) supabase.from("tickets").select(`*, categories(name), hotels(name)`).eq("client_email", user?.email).eq("status", "closed").order("resolved_at", { ascending: false }).then(({ data }) => setTickets(data || [])); }, [user]);

  return (
    <Card>
      {tickets.length === 0 ? (
        <div className="p-8 text-center"><History className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucun ticket clôturé</p></div>
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Numéro</TableHead><TableHead>Catégorie</TableHead><TableHead>Clôturé le</TableHead></TableRow></TableHeader>
          <TableBody>
            {tickets.map((t) => (<TableRow key={t.id}><TableCell>{t.ticket_number}</TableCell><TableCell>{t.categories?.name}</TableCell><TableCell>{t.resolved_at ? new Date(t.resolved_at).toLocaleDateString('fr-FR') : "N/A"}</TableCell></TableRow>))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};

export default ClientDashboard;
