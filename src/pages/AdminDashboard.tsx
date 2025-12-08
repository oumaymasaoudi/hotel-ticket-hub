import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TicketCheck, AlertTriangle, Users, CreditCard, Plus, Edit, Trash2, Eye, Search, UserPlus, ArrowUpCircle, Clock } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TicketDetailDialog } from "@/components/tickets/TicketDetailDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
import AdminDashboardCharts from '@/components/dashboard/AdminDashboardCharts';

const DashboardView = () => {
  const { hotelId } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [stats, setStats] = useState({ open: 0, escalated: 0, technicians: 0, resolved: 0 });

  useEffect(() => {
    if (hotelId) fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    const { data: ticketsData } = await supabase.from("tickets").select(`*, categories (name)`).eq("hotel_id", hotelId).order("created_at", { ascending: false });
    
    const { data: techData } = await supabase
      .from("user_roles")
      .select("user_id, profiles(id, full_name)")
      .eq("role", "technician");
    
    const recentTickets = ticketsData?.slice(0, 5) || [];
    setTickets(recentTickets);
    setTechnicians(techData || []);
    setStats({ 
      open: ticketsData?.filter(t => t.status === "open").length || 0, 
      escalated: ticketsData?.filter(t => t.status === "pending" && !t.assigned_technician_id).length || 0, 
      technicians: techData?.length || 0,
      resolved: ticketsData?.filter(t => t.status === "resolved" || t.status === "closed").length || 0
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge className="bg-green-500/10 text-green-500">Résolu</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500/10 text-yellow-500">En cours</Badge>;
      case "pending": return <Badge className="bg-orange-500/10 text-orange-500">En attente</Badge>;
      case "closed": return <Badge className="bg-muted text-muted-foreground">Fermé</Badge>;
      default: return <Badge className="bg-primary/10 text-primary">Ouvert</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><TicketCheck className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.open}</span></div><h3 className="font-semibold">Tickets ouverts</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center"><TicketCheck className="h-6 w-6 text-green-500" /></div><span className="text-3xl font-bold">{stats.resolved}</span></div><h3 className="font-semibold">Résolus</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-destructive" /></div><span className="text-3xl font-bold">{stats.escalated}</span></div><h3 className="font-semibold">Escaladés</h3></Card>
        <Card className="p-6"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.technicians}</span></div><h3 className="font-semibold">Techniciens</h3></Card>
      </div>

      <AdminDashboardCharts />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Tickets récents</h2>
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun ticket récent</p>
            ) : tickets.map((ticket) => (
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
            {technicians.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun technicien</p>
            ) : technicians.map((tech, i) => (
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
  const { hotelId, user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [showOnlySpecialists, setShowOnlySpecialists] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTicket, setDetailTicket] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => { if (hotelId) fetchData(); }, [hotelId]);

  const fetchData = async () => {
    // Tickets de l'hôtel avec catégorie
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("tickets")
      .select(`*, categories(id, name, color)`)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false });
    
    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      return;
    }

    // Récupérer les noms des techniciens assignés
    if (ticketsData) {
      const ticketsWithTechNames = await Promise.all(
        ticketsData.map(async (ticket) => {
          if (ticket.assigned_technician_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", ticket.assigned_technician_id)
              .single();
            return { ...ticket, technician_name: profileData?.full_name || null };
          }
          return { ...ticket, technician_name: null };
        })
      );
      setTickets(ticketsWithTechNames);
    }
    
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
            .select("category_id, categories(name, color)")
            .eq("technician_id", tech.user_id);
          return { 
            ...tech, 
            categoryIds: techCats?.map(c => c.category_id) || [],
            categories: techCats || []
          };
        })
      );
      setTechnicians(techsWithCategories);
    } else {
      setTechnicians([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedTicket || !selectedTechId) return;
    
    // Récupérer le nom du technicien
    const selectedTech = technicians.find(t => t.user_id === selectedTechId);
    const techName = selectedTech?.profiles?.full_name || "Technicien";
    
    const { error } = await supabase
      .from("tickets")
      .update({ assigned_technician_id: selectedTechId, status: "in_progress" })
      .eq("id", selectedTicket.id);
    
    if (error) { 
      toast({ title: "Erreur", description: error.message, variant: "destructive" }); 
      return; 
    }
    
    // Enregistrer dans l'historique
    await supabase.from("ticket_history").insert({
      ticket_id: selectedTicket.id,
      action_type: "technician_assigned",
      old_value: selectedTicket.technician_name || null,
      new_value: techName,
      performed_by: user?.id || null
    });
    
    // Si changement de statut, l'enregistrer aussi
    if (selectedTicket.status !== "in_progress") {
      await supabase.from("ticket_history").insert({
        ticket_id: selectedTicket.id,
        action_type: "status_change",
        old_value: selectedTicket.status,
        new_value: "in_progress",
        performed_by: user?.id || null
      });
    }
    
    toast({ title: "Technicien assigné avec succès" });
    setShowAssignModal(false);
    setSelectedTechId("");
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": 
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Résolu</Badge>;
      case "closed": 
        return <Badge className="bg-muted text-muted-foreground">Fermé</Badge>;
      case "in_progress": 
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">En cours</Badge>;
      case "pending": 
        return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">En attente</Badge>;
      default: 
        return <Badge className="bg-primary/20 text-primary border-primary/30">Ouvert</Badge>;
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

  // Filtrer les tickets par recherche et statut
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = searchQuery === "" || 
      t.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par numéro, email, catégorie..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="open">Ouvert</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="resolved">Résolu</SelectItem>
            <SelectItem value="closed">Fermé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Numéro</TableHead>
              <TableHead className="font-semibold">Catégorie</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Technicien</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun ticket trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium font-mono">{t.ticket_number}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        borderColor: t.categories?.color, 
                        color: t.categories?.color,
                        backgroundColor: `${t.categories?.color}15`
                      }}
                    >
                      {t.categories?.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.client_email}</TableCell>
                  <TableCell>
                    {t.technician_name ? (
                      <span className="font-medium">{t.technician_name}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Non assigné</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(t.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { setDetailTicket(t); setShowDetailModal(true); }}
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => { setSelectedTicket(t); setSelectedTechId(""); setShowOnlySpecialists(true); setShowAssignModal(true); }}
                        title="Assigner un technicien"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal d'assignation */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Assigner un technicien</DialogTitle>
            {selectedTicket && (
              <div className="pt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Ticket <span className="font-mono font-medium">{selectedTicket.ticket_number}</span>
                </p>
                <Badge 
                  variant="outline" 
                  style={{ 
                    borderColor: selectedTicket.categories?.color, 
                    color: selectedTicket.categories?.color 
                  }}
                >
                  {selectedTicket.categories?.name}
                </Badge>
              </div>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Filtrer par spécialité</Label>
                <p className="text-xs text-muted-foreground">
                  {specialistsCount} technicien{specialistsCount !== 1 ? 's' : ''} spécialisé{specialistsCount !== 1 ? 's' : ''}
                </p>
              </div>
              <Button 
                variant={showOnlySpecialists ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowOnlySpecialists(!showOnlySpecialists)}
              >
                {showOnlySpecialists ? "Spécialistes" : "Tous"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Sélectionner un technicien</Label>
              <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un technicien..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredTechnicians.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      {showOnlySpecialists 
                        ? "Aucun spécialiste pour cette catégorie"
                        : "Aucun technicien disponible"
                      }
                    </div>
                  ) : (
                    filteredTechnicians.map((t) => (
                      <SelectItem key={t.user_id} value={t.user_id}>
                        <div className="flex items-center gap-2">
                          <span>{t.profiles?.full_name}</span>
                          {t.categoryIds.includes(selectedTicket?.category_id) && (
                            <Badge variant="secondary" className="text-xs">Spécialiste</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>Annuler</Button>
            <Button onClick={handleAssign} disabled={!selectedTechId}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal détail du ticket */}
      <TicketDetailDialog 
        ticket={detailTicket} 
        open={showDetailModal} 
        onOpenChange={setShowDetailModal} 
      />
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
const EscalationsView = () => {
  const { hotelId, user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [escalatedTickets, setEscalatedTickets] = useState<any[]>([]);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [escalationReason, setEscalationReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTicket, setDetailTicket] = useState<any>(null);

  useEffect(() => {
    if (hotelId) fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    const { data: ticketsData } = await supabase
      .from("tickets")
      .select(`*, categories(id, name, color)`)
      .eq("hotel_id", hotelId)
      .in("status", ["open", "in_progress", "pending"])
      .order("created_at", { ascending: false });

    if (ticketsData) {
      const ticketsWithDetails = await Promise.all(
        ticketsData.map(async (ticket) => {
          let techName = null;
          if (ticket.assigned_technician_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", ticket.assigned_technician_id)
              .single();
            techName = profileData?.full_name || null;
          }
          
          const { data: historyData } = await supabase
            .from("ticket_history")
            .select("*")
            .eq("ticket_id", ticket.id)
            .eq("action_type", "escalated")
            .limit(1);
          
          const isEscalated = historyData && historyData.length > 0;
          return { ...ticket, technician_name: techName, is_escalated: isEscalated };
        })
      );
      
      setTickets(ticketsWithDetails.filter(t => !t.is_escalated));
      setEscalatedTickets(ticketsWithDetails.filter(t => t.is_escalated));
    }
  };

  const handleEscalate = async () => {
    if (!selectedTicket || !escalationReason.trim()) {
      toast({ title: "Erreur", description: "Veuillez indiquer une raison d'escalade", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await supabase.from("ticket_history").insert({
        ticket_id: selectedTicket.id,
        action_type: "escalated",
        old_value: selectedTicket.technician_name || "Non assigné",
        new_value: escalationReason,
        performed_by: user?.id || null
      });

      if (selectedTicket.assigned_technician_id) {
        await supabase.from("ticket_history").insert({
          ticket_id: selectedTicket.id,
          action_type: "technician_archived",
          old_value: selectedTicket.technician_name,
          new_value: "Escalade - Technicien archivé",
          performed_by: user?.id || null
        });
      }

      await supabase
        .from("tickets")
        .update({ status: "pending", assigned_technician_id: null })
        .eq("id", selectedTicket.id);

      await supabase.from("ticket_history").insert({
        ticket_id: selectedTicket.id,
        action_type: "status_change",
        old_value: selectedTicket.status,
        new_value: "pending",
        performed_by: user?.id || null
      });

      toast({ title: "Ticket escaladé", description: "Le ticket a été escaladé au SuperAdmin" });
      setShowEscalateModal(false);
      setEscalationReason("");
      setSelectedTicket(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Résolu</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">En cours</Badge>;
      case "pending": return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">En attente</Badge>;
      default: return <Badge className="bg-primary/20 text-primary border-primary/30">Ouvert</Badge>;
    }
  };

  const getSlaStatus = (ticket: any) => {
    if (!ticket.sla_deadline) return null;
    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    const hoursRemaining = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (hoursRemaining < 0) return <Badge variant="destructive" className="text-xs">SLA dépassé</Badge>;
    if (hoursRemaining <= 4) return <Badge className="bg-orange-500/20 text-orange-600 text-xs">SLA critique</Badge>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <TicketCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tickets.length}</p>
              <p className="text-sm text-muted-foreground">À escalader</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-500/10 rounded-full flex items-center justify-center">
              <ArrowUpCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{escalatedTickets.length}</p>
              <p className="text-sm text-muted-foreground">Déjà escaladés</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tickets.filter(t => t.sla_deadline && new Date(t.sla_deadline) < new Date()).length}</p>
              <p className="text-sm text-muted-foreground">SLA dépassés</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Tickets pouvant être escaladés</h3>
          <p className="text-sm text-muted-foreground">Escaladez les tickets complexes vers le SuperAdmin</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Numéro</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Technicien</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun ticket à escalader
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono font-medium">{ticket.ticket_number}</TableCell>
                  <TableCell>
                    <Badge variant="outline" style={{ borderColor: ticket.categories?.color, color: ticket.categories?.color, backgroundColor: `${ticket.categories?.color}15` }}>
                      {ticket.categories?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.technician_name || <span className="text-muted-foreground italic">Non assigné</span>}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>
                    {getSlaStatus(ticket) || (ticket.sla_deadline && <span className="text-xs text-muted-foreground">{format(new Date(ticket.sla_deadline), "dd/MM HH:mm", { locale: fr })}</span>)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => { setDetailTicket(ticket); setShowDetailModal(true); }}><Eye className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => { setSelectedTicket(ticket); setShowEscalateModal(true); }}>
                        <ArrowUpCircle className="h-4 w-4 mr-1" />Escalader
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {escalatedTickets.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Tickets escaladés</h3>
            <p className="text-sm text-muted-foreground">En attente de traitement par le SuperAdmin</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Numéro</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date escalade</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalatedTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono font-medium">{ticket.ticket_number}</TableCell>
                  <TableCell>
                    <Badge variant="outline" style={{ borderColor: ticket.categories?.color, color: ticket.categories?.color, backgroundColor: `${ticket.categories?.color}15` }}>
                      {ticket.categories?.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(ticket.updated_at), "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => { setDetailTicket(ticket); setShowDetailModal(true); }}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-destructive" />Escalader le ticket
            </DialogTitle>
            <DialogDescription>Cette action transférera le ticket au SuperAdmin pour traitement prioritaire.</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Ticket</span><span className="font-mono font-medium">{selectedTicket.ticket_number}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Catégorie</span><Badge variant="outline" style={{ borderColor: selectedTicket.categories?.color, color: selectedTicket.categories?.color }}>{selectedTicket.categories?.name}</Badge></div>
                {selectedTicket.technician_name && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Technicien actuel</span><span>{selectedTicket.technician_name}</span></div>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Raison de l'escalade *</Label>
                <Textarea id="reason" placeholder="Décrivez pourquoi ce ticket nécessite une escalade..." value={escalationReason} onChange={(e) => setEscalationReason(e.target.value)} rows={4} />
              </div>
              {selectedTicket.technician_name && (
                <p className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Le technicien actuel sera archivé dans l'historique du ticket.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateModal(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleEscalate} disabled={loading || !escalationReason.trim()}>{loading ? "Escalade..." : "Confirmer l'escalade"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TicketDetailDialog ticket={detailTicket} open={showDetailModal} onOpenChange={setShowDetailModal} />
    </div>
  );
};

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
import AdminReportsView from '@/components/reports/AdminReportsView';
const ReportsView = () => <AdminReportsView />;

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
