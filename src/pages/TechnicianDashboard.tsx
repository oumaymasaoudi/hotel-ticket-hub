import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertCircle, Clock, TrendingUp, Eye, Play, History } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TechnicianDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveView = () => {
    if (currentPath.includes("/tickets")) return "tickets";
    if (currentPath.includes("/urgent")) return "urgent";
    if (currentPath.includes("/history")) return "history";
    return "dashboard";
  };

  const activeView = getActiveView();
  const titles: Record<string, string> = {
    dashboard: "Tableau de bord",
    tickets: "Tickets assignés",
    urgent: "Tickets urgents",
    history: "Historique",
  };

  return (
    <DashboardLayout allowedRoles={["technician"]} title={titles[activeView]}>
      {activeView === "dashboard" && <DashboardView />}
      {activeView === "tickets" && <TicketsView />}
      {activeView === "urgent" && <UrgentView />}
      {activeView === "history" && <HistoryView />}
    </DashboardLayout>
  );
};

// Dashboard View
const DashboardView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ assigned: 0, urgent: 0, slaExceeded: 0, resolved: 0 });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => { if (user?.id) fetchTickets(); }, [user]);

  const fetchTickets = async () => {
    const { data } = await supabase.from("tickets").select(`*, categories(name, color), hotels(name)`).eq("assigned_technician_id", user?.id).order("created_at", { ascending: false });
    setTickets(data || []);
    const active = data?.filter(t => t.status !== "resolved" && t.status !== "closed") || [];
    setStats({
      assigned: active.length,
      urgent: active.filter(t => t.is_urgent).length,
      slaExceeded: active.filter(t => t.sla_deadline && new Date(t.sla_deadline) < new Date()).length,
      resolved: data?.filter(t => t.status === "resolved" || t.status === "closed").length || 0,
    });
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return;
    setUpdating(true);
    const updateData: any = { status: newStatus };
    if (newStatus === "resolved") updateData.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("tickets").update(updateData).eq("id", selectedTicket.id);
    if (error) { toast({ title: "Erreur", variant: "destructive" }); } else { toast({ title: "Statut mis à jour" }); }
    setShowStatusModal(false);
    setUpdating(false);
    fetchTickets();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>;
      case "pending": return <Badge className="bg-orange-500/10 text-orange-500">En attente</Badge>;
      default: return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>;
    }
  };

  const activeTickets = tickets.filter(t => t.status !== "resolved" && t.status !== "closed");

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><Wrench className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.assigned}</span></div><h3 className="font-semibold">Tickets assignés</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center"><AlertCircle className="h-6 w-6 text-destructive" /></div><span className="text-3xl font-bold">{stats.urgent}</span></div><h3 className="font-semibold">Urgents</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-orange-500/10 rounded-full flex items-center justify-center"><Clock className="h-6 w-6 text-orange-500" /></div><span className="text-3xl font-bold">{stats.slaExceeded}</span></div><h3 className="font-semibold">SLA dépassés</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center"><TrendingUp className="h-6 w-6 text-green-500" /></div><span className="text-3xl font-bold">{stats.resolved}</span></div><h3 className="font-semibold">Résolus</h3></Card>
      </div>

      <h2 className="text-xl font-bold">Tickets actifs</h2>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Catégorie</TableHead><TableHead>Hôtel</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {activeTickets.map((t) => (
              <TableRow key={t.id} className={t.is_urgent ? "bg-destructive/5" : ""}>
                <TableCell className="font-medium"><div className="flex items-center gap-2">{t.ticket_number}{t.is_urgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}</div></TableCell>
                <TableCell>{t.categories?.name}</TableCell>
                <TableCell>{t.hotels?.name}</TableCell>
                <TableCell>{getStatusBadge(t.status)}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => { setSelectedTicket(t); setNewStatus(t.status); setShowStatusModal(true); }}><Play className="h-4 w-4 mr-1" />Gérer</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mettre à jour - {selectedTicket?.ticket_number}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Description</Label><p className="text-sm bg-muted p-3 rounded mt-1">{selectedTicket?.description}</p></div>
            <div><Label>Nouveau statut</Label><Select value={newStatus} onValueChange={setNewStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Ouvert</SelectItem><SelectItem value="in_progress">En cours</SelectItem><SelectItem value="pending">En attente</SelectItem><SelectItem value="resolved">Résolu</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowStatusModal(false)}>Annuler</Button><Button onClick={handleUpdateStatus} disabled={updating}>{updating ? "..." : "Mettre à jour"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Tickets View (all assigned)
const TicketsView = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => { if (user?.id) supabase.from("tickets").select(`*, categories(name), hotels(name)`).eq("assigned_technician_id", user?.id).neq("status", "closed").order("created_at", { ascending: false }).then(({ data }) => setTickets(data || [])); }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) { case "resolved": return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>; case "in_progress": return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>; default: return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>; }
  };

  return (
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Catégorie</TableHead><TableHead>Hôtel</TableHead><TableHead>Date</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
        <TableBody>
          {tickets.map((t) => (<TableRow key={t.id}><TableCell>{t.ticket_number}</TableCell><TableCell>{t.categories?.name}</TableCell><TableCell>{t.hotels?.name}</TableCell><TableCell>{new Date(t.created_at).toLocaleDateString('fr-FR')}</TableCell><TableCell>{getStatusBadge(t.status)}</TableCell></TableRow>))}
        </TableBody>
      </Table>
    </Card>
  );
};

// Urgent View
const UrgentView = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => { if (user?.id) supabase.from("tickets").select(`*, categories(name), hotels(name)`).eq("assigned_technician_id", user?.id).eq("is_urgent", true).neq("status", "resolved").neq("status", "closed").then(({ data }) => setTickets(data || [])); }, [user]);

  return (
    <div>
      {tickets.length === 0 ? (
        <Card className="p-8 text-center"><AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucun ticket urgent</p></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Catégorie</TableHead><TableHead>Hôtel</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
            <TableBody>
              {tickets.map((t) => (<TableRow key={t.id} className="bg-destructive/5"><TableCell className="font-bold">{t.ticket_number}</TableCell><TableCell>{t.categories?.name}</TableCell><TableCell>{t.hotels?.name}</TableCell><TableCell className="max-w-xs truncate">{t.description}</TableCell></TableRow>))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

// History View
const HistoryView = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => { if (user?.id) supabase.from("tickets").select(`*, categories(name), hotels(name)`).eq("assigned_technician_id", user?.id).in("status", ["resolved", "closed"]).order("resolved_at", { ascending: false }).then(({ data }) => setTickets(data || [])); }, [user]);

  return (
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Ticket</TableHead><TableHead>Catégorie</TableHead><TableHead>Hôtel</TableHead><TableHead>Résolu le</TableHead></TableRow></TableHeader>
        <TableBody>
          {tickets.map((t) => (<TableRow key={t.id}><TableCell>{t.ticket_number}</TableCell><TableCell>{t.categories?.name}</TableCell><TableCell>{t.hotels?.name}</TableCell><TableCell>{t.resolved_at ? new Date(t.resolved_at).toLocaleDateString('fr-FR') : "N/A"}</TableCell></TableRow>))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TechnicianDashboard;
