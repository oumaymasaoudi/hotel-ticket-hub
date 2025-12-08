import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, DollarSign, TrendingUp, TicketCheck, Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SuperAdminDashboard = () => {
  const location = useLocation();
  const { toast } = useToast();
  const currentPath = location.pathname;

  // Determine which view to show based on path
  const getActiveView = () => {
    if (currentPath.includes("/hotels")) return "hotels";
    if (currentPath.includes("/plans")) return "plans";
    if (currentPath.includes("/users")) return "users";
    if (currentPath.includes("/categories")) return "categories";
    if (currentPath.includes("/payments")) return "payments";
    if (currentPath.includes("/reports")) return "reports";
    if (currentPath.includes("/logs")) return "logs";
    if (currentPath.includes("/settings")) return "settings";
    return "dashboard";
  };

  const activeView = getActiveView();

  return (
    <DashboardLayout allowedRoles={["superadmin"]} title={getTitle(activeView)}>
      {activeView === "dashboard" && <DashboardView />}
      {activeView === "hotels" && <HotelsView />}
      {activeView === "plans" && <PlansView />}
      {activeView === "users" && <UsersView />}
      {activeView === "categories" && <CategoriesView />}
      {activeView === "payments" && <PaymentsView />}
      {activeView === "reports" && <ReportsView />}
      {activeView === "logs" && <LogsView />}
      {activeView === "settings" && <SettingsView />}
    </DashboardLayout>
  );
};

const getTitle = (view: string) => {
  const titles: Record<string, string> = {
    dashboard: "Tableau de bord",
    hotels: "Gestion des hôtels",
    plans: "Plans d'abonnement",
    users: "Utilisateurs",
    categories: "Catégories",
    payments: "Paiements",
    reports: "Rapports",
    logs: "Logs d'activité",
    settings: "Paramètres",
  };
  return titles[view] || "SuperAdmin";
};

// Dashboard View
const DashboardView = () => {
  const [stats, setStats] = useState({ hotels: 0, tickets: 0 });
  const [hotels, setHotels] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: hotelsData } = await supabase.from("hotels").select("*, plans(name)").limit(5);
    const { count } = await supabase.from("tickets").select("id", { count: "exact", head: true });
    setHotels(hotelsData || []);
    setStats({ hotels: hotelsData?.length || 0, tickets: count || 0 });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.hotels}</span></div><h3 className="font-semibold">Hôtels actifs</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><DollarSign className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">47.2K€</span></div><h3 className="font-semibold">Revenus</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><TicketCheck className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.tickets}</span></div><h3 className="font-semibold">Tickets</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><TrendingUp className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">94%</span></div><h3 className="font-semibold">SLA global</h3></Card>
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Hôtels récents</h2>
        <div className="space-y-3">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div><p className="font-medium">{hotel.name}</p><p className="text-sm text-muted-foreground">Plan {hotel.plans?.name}</p></div>
              <Badge className={hotel.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}>{hotel.is_active ? "Actif" : "Inactif"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Hotels View
const HotelsView = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { fetchHotels(); }, []);

  const fetchHotels = async () => {
    const { data } = await supabase.from("hotels").select("*, plans(name)").order("created_at", { ascending: false });
    setHotels(data || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2"><Input placeholder="Rechercher un hôtel..." className="w-64" /><Button variant="outline"><Search className="h-4 w-4" /></Button></div>
        <Button><Plus className="h-4 w-4 mr-2" />Ajouter un hôtel</Button>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Plan</TableHead><TableHead>Email</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {hotels.map((hotel) => (
              <TableRow key={hotel.id}>
                <TableCell className="font-medium">{hotel.name}</TableCell>
                <TableCell><Badge variant="outline">{hotel.plans?.name}</Badge></TableCell>
                <TableCell>{hotel.email || "N/A"}</TableCell>
                <TableCell><Badge className={hotel.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}>{hotel.is_active ? "Actif" : "Inactif"}</Badge></TableCell>
                <TableCell><div className="flex gap-2"><Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button><Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Plans View
const PlansView = () => {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => { supabase.from("plans").select("*").then(({ data }) => setPlans(data || [])); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><Button><Plus className="h-4 w-4 mr-2" />Nouveau plan</Button></div>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6">
            <h3 className="text-xl font-bold mb-2 capitalize">{plan.name}</h3>
            <p className="text-3xl font-bold text-primary mb-4">{plan.base_cost}€<span className="text-sm text-muted-foreground">/mois</span></p>
            <div className="space-y-2 text-sm">
              <p>• {plan.ticket_quota} tickets/mois</p>
              <p>• {plan.max_technicians} techniciens max</p>
              <p>• SLA: {plan.sla_hours}h</p>
              <p>• Ticket excédent: {plan.excess_ticket_cost}€</p>
            </div>
            <div className="flex gap-2 mt-4"><Button variant="outline" className="flex-1"><Edit className="h-4 w-4 mr-1" />Modifier</Button></div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Users View
const UsersView = () => {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => { supabase.from("user_roles").select("*, profiles(full_name, email), hotels(name)").then(({ data }) => setUsers(data || [])); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><Input placeholder="Rechercher..." className="w-64" /><Button><Plus className="h-4 w-4 mr-2" />Ajouter</Button></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Rôle</TableHead><TableHead>Hôtel</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.profiles?.full_name || "N/A"}</TableCell>
                <TableCell><Badge>{u.role}</Badge></TableCell>
                <TableCell>{u.hotels?.name || "Global"}</TableCell>
                <TableCell><div className="flex gap-2"><Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Categories View
const CategoriesView = () => {
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => { supabase.from("categories").select("*").then(({ data }) => setCategories(data || [])); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-end"><Button><Plus className="h-4 w-4 mr-2" />Nouvelle catégorie</Button></div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Obligatoire</TableHead><TableHead>Coût additionnel</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>{cat.is_mandatory ? <Badge>Oui</Badge> : <Badge variant="outline">Non</Badge>}</TableCell>
                <TableCell>{cat.additional_cost || 0}€</TableCell>
                <TableCell><div className="flex gap-2"><Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Payments View
const PaymentsView = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  useEffect(() => { supabase.from("hotels").select("*, plans(name, base_cost)").then(({ data }) => setHotels(data || [])); }, []);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6"><h3 className="text-muted-foreground mb-2">Revenus ce mois</h3><p className="text-3xl font-bold text-primary">47,200€</p></Card>
        <Card className="p-6"><h3 className="text-muted-foreground mb-2">Paiements en attente</h3><p className="text-3xl font-bold text-orange-500">3</p></Card>
        <Card className="p-6"><h3 className="text-muted-foreground mb-2">Impayés</h3><p className="text-3xl font-bold text-destructive">1</p></Card>
      </div>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Hôtel</TableHead><TableHead>Plan</TableHead><TableHead>Montant</TableHead><TableHead>Dernier paiement</TableHead><TableHead>Prochain</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
          <TableBody>
            {hotels.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.name}</TableCell>
                <TableCell>{h.plans?.name}</TableCell>
                <TableCell>{h.plans?.base_cost}€</TableCell>
                <TableCell>{h.last_payment_date ? new Date(h.last_payment_date).toLocaleDateString('fr-FR') : "N/A"}</TableCell>
                <TableCell>{h.next_payment_date ? new Date(h.next_payment_date).toLocaleDateString('fr-FR') : "N/A"}</TableCell>
                <TableCell><Badge className="bg-green-500/10 text-green-500">À jour</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Reports View
const ReportsView = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6"><h3 className="font-bold mb-4">Rapport mensuel</h3><p className="text-muted-foreground mb-4">Statistiques globales de la plateforme</p><Button>Télécharger PDF</Button></Card>
      <Card className="p-6"><h3 className="font-bold mb-4">Rapport financier</h3><p className="text-muted-foreground mb-4">Revenus et paiements détaillés</p><Button>Télécharger Excel</Button></Card>
      <Card className="p-6"><h3 className="font-bold mb-4">Rapport SLA</h3><p className="text-muted-foreground mb-4">Performance des interventions</p><Button>Télécharger PDF</Button></Card>
      <Card className="p-6"><h3 className="font-bold mb-4">Rapport par hôtel</h3><p className="text-muted-foreground mb-4">Statistiques par établissement</p><Button>Télécharger PDF</Button></Card>
    </div>
  </div>
);

// Logs View
const LogsView = () => (
  <div className="space-y-6">
    <div className="flex gap-2"><Input placeholder="Rechercher dans les logs..." className="flex-1" /><Button variant="outline"><Search className="h-4 w-4" /></Button></div>
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Action</TableHead><TableHead>Utilisateur</TableHead><TableHead>Détails</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow><TableCell>08/12/2025 14:32</TableCell><TableCell>Création ticket</TableCell><TableCell>client@hotel.com</TableCell><TableCell>TK-12345 créé</TableCell></TableRow>
          <TableRow><TableCell>08/12/2025 14:28</TableCell><TableCell>Connexion</TableCell><TableCell>admin@hotel.com</TableCell><TableCell>Connexion réussie</TableCell></TableRow>
          <TableRow><TableCell>08/12/2025 14:15</TableCell><TableCell>Modification statut</TableCell><TableCell>tech@hotel.com</TableCell><TableCell>TK-12340 → Résolu</TableCell></TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
);

// Settings View
const SettingsView = () => (
  <div className="space-y-6">
    <Card className="p-6">
      <h3 className="font-bold mb-4">Paramètres généraux</h3>
      <div className="space-y-4">
        <div><Label>Nom de la plateforme</Label><Input defaultValue="TicketHotel" className="mt-1" /></div>
        <div><Label>Email de contact</Label><Input defaultValue="contact@tickethotel.com" className="mt-1" /></div>
        <Button className="mt-4">Enregistrer</Button>
      </div>
    </Card>
    <Card className="p-6">
      <h3 className="font-bold mb-4">Paramètres SLA par défaut</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div><Label>Starter (heures)</Label><Input type="number" defaultValue="48" className="mt-1" /></div>
        <div><Label>Pro (heures)</Label><Input type="number" defaultValue="24" className="mt-1" /></div>
        <div><Label>Enterprise (heures)</Label><Input type="number" defaultValue="4" className="mt-1" /></div>
      </div>
      <Button className="mt-4">Enregistrer</Button>
    </Card>
  </div>
);

export default SuperAdminDashboard;
