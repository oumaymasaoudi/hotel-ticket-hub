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
    
    // Tous les techniciens (travaillent sur tous les hôtels)
    const { data: techData } = await supabase
      .from("user_roles")
      .select("user_id, profiles(id, full_name)")
      .eq("role", "technician");
    
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
  const [showOnlySpecialists, setShowOnlySpecialists] = useState(true);

  useEffect(() => { if (hotelId) fetchData(); }, [hotelId]);

  const fetchData = async () => {
    // Tickets avec profil du technicien assigné via jointure
    const { data: t } = await supabase
      .from("tickets")
      .select(`*, categories(id, name), profiles!tickets_assigned_technician_id_fkey(full_name)`)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false });
    
    // Tous les techniciens avec leurs spécialités
    const { data: techData } = await supabase
      .from("user_roles")
      .select("user_id, profiles(id, full_name, phone)")
      .eq("role", "technician");
    
    // Récupérer les catégories de chaque technicien
    if (techData) {
      const techsWithCategories = await Promise.all(
        techData.map(async (tech) => {
          const { data: techCats } = await supabase
            .from("technician_categories")
            .select("category_id")
            .eq("technician_id", tech.user_id);
          return { ...tech, categoryIds: techCats?.map(c => c.category_id) || [] };
        })
      );
      setTechnicians(techsWithCategories);
    } else {
      setTechnicians([]);
    }
    
    setTickets(t || []);
  };

  const handleAssign = async () => {
    if (!selectedTicket || !selectedTechId) return;
    const { error } = await supabase.from("tickets").update({ assigned_technician_id: selectedTechId, status: "in_progress" }).eq("id", selectedTicket.id);
    if (error) { toast({ title: "Erreur", variant: "destructive" }); return; }
    toast({ title: "Technicien assigné" });
    setShowAssignModal(false);
    setSelectedTechId("");
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>;
      default: return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>;
    }
  };

  // Filtrer les techniciens selon la catégorie du ticket
  const getFilteredTechnicians = () => {
    if (!selectedTicket || !showOnlySpecialists) return technicians;
    const ticketCategoryId = selectedTicket.category_id;
    return technicians.filter(t => t.categoryIds.includes(ticketCategoryId));
  };

  const filteredTechnicians = getFilteredTechnicians();
  const specialistsCount = selectedTicket 
    ? technicians.filter(t => t.categoryIds.includes(selectedTicket.category_id)).length 
    : 0;

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
                    <Button variant="outline" size="sm" onClick={() => { setSelectedTicket(t); setSelectedTechId(""); setShowAssignModal(true); }}><UserPlus className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un technicien</DialogTitle>
            {selectedTicket && (
              <p className="text-sm text-muted-foreground">
                Ticket {selectedTicket.ticket_number} - {selectedTicket.categories?.name}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Spécialistes uniquement</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{specialistsCount} spécialiste{specialistsCount > 1 ? 's' : ''}</Badge>
                <Button 
                  variant={showOnlySpecialists ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setShowOnlySpecialists(!showOnlySpecialists)}
                >
                  {showOnlySpecialists ? "Filtré" : "Tous"}
                </Button>
              </div>
            </div>
            <div>
              <Label>Technicien</Label>
              <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredTechnicians.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Aucun spécialiste disponible
                    </div>
                  ) : (
                    filteredTechnicians.map((t) => (
                      <SelectItem key={t.user_id} value={t.user_id}>
                        {t.profiles?.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>Annuler</Button>
            <Button onClick={handleAssign} disabled={!selectedTechId}>Assigner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Technicians View
const TechniciansView = () => {
  const { hotelId } = useAuth();
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const fetchTechnicians = async () => {
    // Tous les techniciens (travaillent sur tous les hôtels)
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("*, profiles(full_name, phone)")
      .eq("role", "technician");
      
    if (rolesData && rolesData.length > 0) {
      // Récupérer les catégories pour chaque technicien
      const techsWithCategories = await Promise.all(
        rolesData.map(async (role) => {
          const { data: techCats } = await supabase
            .from("technician_categories")
            .select(`category_id, categories(name, color)`)
            .eq("technician_id", role.user_id);
          
          return { ...role, categories: techCats || [] };
        })
      );
      setTechnicians(techsWithCategories);
    } else {
      setTechnicians([]);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  useEffect(() => { 
    fetchTechnicians();
    fetchCategories();
  }, [hotelId]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCreateTechnician = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({ title: "Erreur", description: "Veuillez sélectionner au moins une spécialité", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        await supabase.from("profiles").update({ hotel_id: hotelId }).eq("id", authData.user.id);

        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: "technician",
          hotel_id: hotelId,
        });

        if (roleError) throw roleError;

        // Insérer les catégories du technicien
        const categoryInserts = selectedCategories.map(categoryId => ({
          technician_id: authData.user!.id,
          category_id: categoryId,
        }));

        await supabase.from("technician_categories").insert(categoryInserts);

        toast({ title: "Technicien créé", description: `${formData.fullName} a été ajouté avec succès` });
        setShowAddModal(false);
        setFormData({ email: "", password: "", fullName: "", phone: "" });
        setSelectedCategories([]);
        fetchTechnicians();
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Une erreur s'est produite", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />Ajouter technicien
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Spécialités</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucun technicien trouvé
                </TableCell>
              </TableRow>
            ) : (
              technicians.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.profiles?.full_name || "N/A"}</TableCell>
                  <TableCell>{t.profiles?.phone || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.categories?.length > 0 ? (
                        t.categories.map((cat: any) => (
                          <Badge 
                            key={cat.category_id} 
                            variant="outline"
                            style={{ borderColor: cat.categories?.color, color: cat.categories?.color }}
                          >
                            {cat.categories?.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">Aucune</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><Badge className="bg-green-500/10 text-green-500">Actif</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal création technicien */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un technicien</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tech-name">Nom complet *</Label>
              <Input
                id="tech-name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <Label htmlFor="tech-email">Email *</Label>
              <Input
                id="tech-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="technicien@hotel.com"
              />
            </div>
            <div>
              <Label htmlFor="tech-phone">Téléphone</Label>
              <Input
                id="tech-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div>
              <Label htmlFor="tech-password">Mot de passe *</Label>
              <Input
                id="tech-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label>Spécialités *</Label>
              <p className="text-sm text-muted-foreground mb-2">Sélectionnez les domaines d'intervention</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all border ${
                      selectedCategories.includes(cat.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedCategories.length} spécialité(s) sélectionnée(s)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Annuler</Button>
            <Button onClick={handleCreateTechnician} disabled={loading}>
              {loading ? "Création..." : "Créer le technicien"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
