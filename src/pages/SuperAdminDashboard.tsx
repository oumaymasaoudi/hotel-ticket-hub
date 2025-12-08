import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    plan_id: "",
    is_active: true,
  });

  useEffect(() => { 
    fetchHotels(); 
    fetchPlans();
  }, []);

  const fetchHotels = async () => {
    const { data } = await supabase.from("hotels").select("*, plans(name)").order("created_at", { ascending: false });
    setHotels(data || []);
    setLoading(false);
  };

  const fetchPlans = async () => {
    const { data } = await supabase.from("plans").select("*");
    setPlans(data || []);
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", address: "", plan_id: "", is_active: true });
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.plan_id) {
      toast({ title: "Erreur", description: "Le nom et le plan sont obligatoires.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("hotels").insert({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        plan_id: formData.plan_id,
        is_active: formData.is_active,
      });

      if (error) throw error;

      toast({ title: "Succès", description: "L'hôtel a été créé avec succès." });
      setShowCreateModal(false);
      resetForm();
      fetchHotels();
    } catch (error: any) {
      console.error("Error creating hotel:", error);
      toast({ title: "Erreur", description: error.message || "Impossible de créer l'hôtel.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedHotel || !formData.name.trim() || !formData.plan_id) {
      toast({ title: "Erreur", description: "Le nom et le plan sont obligatoires.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("hotels").update({
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        plan_id: formData.plan_id,
        is_active: formData.is_active,
      }).eq("id", selectedHotel.id);

      if (error) throw error;

      toast({ title: "Succès", description: "L'hôtel a été modifié avec succès." });
      setShowEditModal(false);
      setSelectedHotel(null);
      resetForm();
      fetchHotels();
    } catch (error: any) {
      console.error("Error updating hotel:", error);
      toast({ title: "Erreur", description: error.message || "Impossible de modifier l'hôtel.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedHotel) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("hotels").delete().eq("id", selectedHotel.id);

      if (error) throw error;

      toast({ title: "Succès", description: "L'hôtel a été supprimé." });
      setShowDeleteModal(false);
      setSelectedHotel(null);
      fetchHotels();
    } catch (error: any) {
      console.error("Error deleting hotel:", error);
      toast({ title: "Erreur", description: error.message || "Impossible de supprimer l'hôtel.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (hotel: any) => {
    setSelectedHotel(hotel);
    setFormData({
      name: hotel.name || "",
      email: hotel.email || "",
      phone: hotel.phone || "",
      address: hotel.address || "",
      plan_id: hotel.plan_id || "",
      is_active: hotel.is_active ?? true,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (hotel: any) => {
    setSelectedHotel(hotel);
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Input placeholder="Rechercher un hôtel..." className="w-64" />
          <Button variant="outline"><Search className="h-4 w-4" /></Button>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />Ajouter un hôtel
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hotels.map((hotel) => (
              <TableRow key={hotel.id}>
                <TableCell className="font-medium">{hotel.name}</TableCell>
                <TableCell><Badge variant="outline">{hotel.plans?.name}</Badge></TableCell>
                <TableCell>{hotel.email || "N/A"}</TableCell>
                <TableCell>{hotel.phone || "N/A"}</TableCell>
                <TableCell>
                  <Badge className={hotel.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}>
                    {hotel.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditModal(hotel)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => openDeleteModal(hotel)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Hotel Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un hôtel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de l'hôtel *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Hôtel Paris Centre"
              />
            </div>
            <div>
              <Label htmlFor="plan">Plan d'abonnement *</Label>
              <Select value={formData.plan_id} onValueChange={(value) => setFormData({ ...formData, plan_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.base_cost}€/mois
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@hotel.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Rue de Paris, 75001 Paris"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Actif</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Création..." : "Créer l'hôtel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hotel Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'hôtel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom de l'hôtel *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-plan">Plan d'abonnement *</Label>
              <Select value={formData.plan_id} onValueChange={(value) => setFormData({ ...formData, plan_id: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.base_cost}€/mois
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Adresse</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-is_active">Actif</Label>
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer l'hôtel <strong>{selectedHotel?.name}</strong> ?
            Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
import SuperAdminReportsView from '@/components/reports/SuperAdminReportsView';
const ReportsView = () => <SuperAdminReportsView />;

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
