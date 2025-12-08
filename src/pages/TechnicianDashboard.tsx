import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Eye,
  Play,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ assigned: 0, urgent: 0, slaExceeded: 0, resolved: 0 });
  
  // Modal states
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [comment, setComment] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user?.id) {
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
        .eq("assigned_technician_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTickets(data || []);
      
      const assigned = data?.filter(t => t.status !== "resolved" && t.status !== "closed").length || 0;
      const urgent = data?.filter(t => t.is_urgent && t.status !== "resolved" && t.status !== "closed").length || 0;
      const slaExceeded = data?.filter(t => {
        if (!t.sla_deadline) return false;
        return new Date(t.sla_deadline) < new Date() && t.status !== "resolved" && t.status !== "closed";
      }).length || 0;
      const resolved = data?.filter(t => t.status === "resolved" || t.status === "closed").length || 0;
      
      setStats({ assigned, urgent, slaExceeded, resolved });
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return;
    
    setUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("tickets")
        .update(updateData)
        .eq("id", selectedTicket.id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Le ticket a été mis à jour vers "${getStatusLabel(newStatus)}"`,
      });

      setShowStatusModal(false);
      setSelectedTicket(null);
      setNewStatus("");
      setComment("");
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le ticket.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "resolved": return "Résolu";
      case "in_progress": return "En cours";
      case "pending": return "En attente";
      default: return "Ouvert";
    }
  };

  const getSlaRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) {
      return <Badge variant="destructive">Dépassé de {Math.abs(hours)}h</Badge>;
    }
    return <Badge variant="outline">{hours}h {minutes}m</Badge>;
  };

  const activeTickets = tickets.filter(t => t.status !== "resolved" && t.status !== "closed");

  return (
    <DashboardLayout allowedRoles={["technician"]} title="Tableau de bord">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mes interventions</h1>
          <p className="text-muted-foreground">Gérez vos tickets assignés</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">{stats.assigned}</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Tickets assignés</h3>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">{stats.urgent}</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Tickets urgents</h3>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">{stats.slaExceeded}</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">SLA dépassés</h3>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-3xl font-bold text-card-foreground">{stats.resolved}</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Résolus</h3>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-foreground">Mes tickets actifs</h2>

        <Card className="overflow-hidden border-border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Chargement...</div>
          ) : activeTickets.length === 0 ? (
            <div className="p-8 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun ticket actif</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ticket</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Hôtel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">SLA restant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {activeTickets.map((ticket) => (
                    <tr key={ticket.id} className={ticket.is_urgent ? "bg-destructive/5" : ""}>
                      <td className="px-6 py-4 text-sm font-medium text-card-foreground">
                        <div className="flex items-center gap-2">
                          {ticket.ticket_number}
                          {ticket.is_urgent && <Badge variant="destructive" className="text-xs">Urgent</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{ticket.categories?.name}</td>
                      <td className="px-6 py-4 text-sm text-card-foreground">{ticket.hotels?.name}</td>
                      <td className="px-6 py-4 text-sm">{getSlaRemaining(ticket.sla_deadline)}</td>
                      <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setNewStatus(ticket.status);
                              setShowStatusModal(true);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du ticket {selectedTicket?.ticket_number}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Catégorie</Label>
                  <p className="font-medium">{selectedTicket.categories?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hôtel</Label>
                  <p className="font-medium">{selectedTicket.hotels?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Client</Label>
                  <p className="font-medium">{selectedTicket.client_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Téléphone</Label>
                  <p className="font-medium">{selectedTicket.client_phone || "N/A"}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 text-sm bg-muted p-3 rounded-lg">{selectedTicket.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Créé le</Label>
                <p className="font-medium">{new Date(selectedTicket.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>Fermer</Button>
            <Button onClick={() => {
              setShowDetailModal(false);
              setNewStatus(selectedTicket?.status);
              setShowStatusModal(true);
            }}>
              Mettre à jour le statut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nouveau statut</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Commentaire (optionnel)</Label>
              <Textarea
                placeholder="Ajoutez un commentaire..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Annuler</Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TechnicianDashboard;
