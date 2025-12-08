import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TicketCheck, AlertTriangle, Users, CreditCard, Plus, Edit, Trash2, Eye, Search, UserPlus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminDashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveView = () => {
    if (currentPath.includes("/tickets")) return "tickets";
    if (currentPath.includes("/create-ticket")) return "create-ticket";
    if (currentPath.includes("/technicians")) return "technicians";
    if (currentPath.includes("/escalations")) return "escalations";
    if (currentPath.includes("/payments")) return "payments";
    if (currentPath.includes("/reports")) return "reports";
    if (currentPath.includes("/settings")) return "settings";
    return "dashboard";
  };

  const activeView = getActiveView();
  const titles: Record<string, string> = {
    dashboard: "Tableau de bord",
    tickets: "Gestion des tickets",
    "create-ticket": "Créer un ticket",
    technicians: "Gestion des techniciens",
    escalations: "Escalades",
    payments: "Paiements",
    reports: "Rapports",
    settings: "Paramètres",
  };

  return (
    <DashboardLayout allowedRoles={["admin"]} title={titles[activeView]}>
      {activeView === "dashboard" && <DashboardView />}
      {activeView === "tickets" && <TicketsView />}
      {activeView === "create-ticket" && <CreateTicketView />}
      {activeView === "technicians" && <TechniciansView />}
      {activeView === "escalations" && <EscalationsView />}
      {activeView === "payments" && <PaymentsView />}
      {activeView === "reports" && <ReportsView />}
      {activeView === "settings" && <SettingsView />}
    </DashboardLayout>
  );
};

// Dashboard View
const DashboardView = () => {
  const { hotelId } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [stats, setStats] = useState({ open: 0, escalated: 0, technicians: 0 });

  useEffect(() => {
    if (hotelId) fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    const { data: ticketsData } = await supabase.from("tickets").select(`*, categories (name)`).eq("hotel_id", hotelId).order("created_at", { ascending: false }).limit(5);
    // Techniciens sans hotel_id = disponibles pour tous les hôtels
    const { data: techData } = await supabase.from("user_roles").select(`user_id, profiles (full_name)`).eq("role", "technician").is("hotel_id", null);
    setTickets(ticketsData || []);
    setTechnicians(techData || []);
    setStats({ open: ticketsData?.filter(t => t.status !== "resolved" && t.status !== "closed").length || 0, escalated: 0, technicians: techData?.length || 0 });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>;
      default: return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><TicketCheck className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.open}</span></div><h3 className="font-semibold">Tickets ouverts</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-destructive" /></div><span className="text-3xl font-bold">{stats.escalated}</span></div><h3 className="font-semibold">Escaladés</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.technicians}</span></div><h3 className="font-semibold">Techniciens</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><CreditCard className="h-6 w-6 text-primary" /></div></div><h3 className="font-semibold">Plan Pro</h3><p className="text-xs text-muted-foreground">Prochain: 15/12/2025</p></Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Tickets récents</h2>
          <div className="space-y-3">
            {tickets.map((ticket) => (
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
                <div className="flex items-center gap-3"><div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div><p className="font-medium">{tech.profiles?.full_name || "N/A"}</p></div>
                <Badge variant="outline">Actif</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Tickets View
const TicketsView = () => {
  const { hotelId } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");

  useEffect(() => { if (hotelId) fetchData(); }, [hotelId]);

  const fetchData = async () => {
    const { data: t } = await supabase.from("tickets").select(`*, categories(name), profiles!tickets_assigned_technician_id_fkey(full_name)`).eq("hotel_id", hotelId).order("created_at", { ascending: false });
    // Tous les techniciens (sans hotel_id = disponibles pour tous les hôtels)
    const { data: tech } = await supabase.from("user_roles").select(`user_id, profiles(full_name)`).eq("role", "technician").is("hotel_id", null);
    setTickets(t || []);
    setTechnicians(tech || []);
  };

  const handleAssign = async () => {
    if (!selectedTicket || !selectedTechId) return;
    const { error } = await supabase.from("tickets").update({ assigned_technician_id: selectedTechId, status: "in_progress" }).eq("id", selectedTicket.id);
    if (error) { toast({ title: "Erreur", variant: "destructive" }); return; }
    toast({ title: "Technicien assigné" });
    setShowAssignModal(false);
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>;
      default: return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><Input placeholder="Rechercher..." className="w-64" /></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Numéro</TableHead><TableHead>Catégorie</TableHead><TableHead>Client</TableHead><TableHead>Technicien</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.ticket_number}</TableCell>
                <TableCell>{t.categories?.name}</TableCell>
                <TableCell>{t.client_email}</TableCell>
                <TableCell>{t.profiles?.full_name || <span className="text-muted-foreground">Non assigné</span>}</TableCell>
                <TableCell>{getStatusBadge(t.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedTicket(t); setShowAssignModal(true); }}><UserPlus className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assigner un technicien</DialogTitle></DialogHeader>
          <div><Label>Technicien</Label><Select value={selectedTechId} onValueChange={setSelectedTechId}><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent>{technicians.map((t) => (<SelectItem key={t.user_id} value={t.user_id}>{t.profiles?.full_name}</SelectItem>))}</SelectContent></Select></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAssignModal(false)}>Annuler</Button><Button onClick={handleAssign}>Assigner</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Ticket View
const CreateTicketView = () => {
  const { hotelId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { supabase.from("categories").select("*").then(({ data }) => setCategories(data || [])); }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const { data: ticketNumber } = await supabase.rpc("generate_ticket_number");
    const { error } = await supabase.from("tickets").insert({ ticket_number: ticketNumber, client_email: email, client_phone: phone || null, hotel_id: hotelId, category_id: categoryId, description, status: "open" });
    if (error) { toast({ title: "Erreur", variant: "destructive" }); setLoading(false); return; }
    toast({ title: "Ticket créé", description: `Numéro: ${ticketNumber}` });
    navigate("/dashboard/admin/tickets");
  };

  return (
    <Card className="p-6 max-w-2xl">
      <div className="space-y-4">
        <div><Label>Email client</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@email.com" /></div>
        <div><Label>Téléphone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33..." /></div>
        <div><Label>Catégorie</Label><Select value={categoryId} onValueChange={setCategoryId}><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger><SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent></Select></div>
        <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} /></div>
        <Button onClick={handleSubmit} disabled={!email || !categoryId || !description || loading}>{loading ? "Création..." : "Créer le ticket"}</Button>
      </div>
    </Card>
  );
};

// Technicians View
const TechniciansView = () => {
  const [technicians, setTechnicians] = useState<any[]>([]);
  useEffect(() => { 
    // Tous les techniciens disponibles (sans hotel_id)
    supabase.from("user_roles").select(`*, profiles(full_name, phone)`).eq("role", "technician").is("hotel_id", null).then(({ data }) => setTechnicians(data || [])); 
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><Button><Plus className="h-4 w-4 mr-2" />Ajouter technicien</Button></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Téléphone</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {technicians.map((t) => (
              <TableRow key={t.id}><TableCell>{t.profiles?.full_name}</TableCell><TableCell>{t.profiles?.phone || "N/A"}</TableCell><TableCell><Badge>Actif</Badge></TableCell><TableCell><div className="flex gap-2"><Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Escalations View
const EscalationsView = () => (
  <div className="space-y-6">
    <Card className="p-8 text-center"><AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Aucune escalade en cours</p></Card>
  </div>
);

// Payments View
const PaymentsView = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="p-6"><h3 className="text-muted-foreground mb-2">Plan actuel</h3><p className="text-2xl font-bold">Pro</p></Card>
      <Card className="p-6"><h3 className="text-muted-foreground mb-2">Prochain paiement</h3><p className="text-2xl font-bold">15/12/2025</p></Card>
      <Card className="p-6"><h3 className="text-muted-foreground mb-2">Montant</h3><p className="text-2xl font-bold text-primary">99€/mois</p></Card>
    </div>
    <Card className="p-6"><h3 className="font-bold mb-4">Historique des paiements</h3><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>15/11/2025</TableCell><TableCell>99€</TableCell><TableCell><Badge className="bg-green-500/10 text-green-500">Payé</Badge></TableCell></TableRow></TableBody></Table></Card>
  </div>
);

// Reports View
const ReportsView = () => (
  <div className="grid md:grid-cols-2 gap-6">
    <Card className="p-6"><h3 className="font-bold mb-4">Rapport mensuel</h3><p className="text-muted-foreground mb-4">Statistiques des tickets</p><Button>Télécharger PDF</Button></Card>
    <Card className="p-6"><h3 className="font-bold mb-4">Rapport techniciens</h3><p className="text-muted-foreground mb-4">Performance des interventions</p><Button>Télécharger PDF</Button></Card>
  </div>
);

// Settings View
const SettingsView = () => (
  <Card className="p-6 max-w-2xl">
    <h3 className="font-bold mb-4">Paramètres de l'hôtel</h3>
    <div className="space-y-4">
      <div><Label>Nom de l'hôtel</Label><Input defaultValue="Hôtel Paris Centre" /></div>
      <div><Label>Email</Label><Input defaultValue="contact@hotel.com" /></div>
      <div><Label>Téléphone</Label><Input defaultValue="+33 1 23 45 67 89" /></div>
      <Button>Enregistrer</Button>
    </div>
  </Card>
);

export default AdminDashboard;
