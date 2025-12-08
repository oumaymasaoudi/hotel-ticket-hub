import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Search, Download, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TrackTicket = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [ticketNumber, setTicketNumber] = useState(searchParams.get("ticket") || "");
  const [showTicket, setShowTicket] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    if (searchParams.get("email") && searchParams.get("ticket")) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          categories (name, color, icon),
          hotels (name),
          profiles!tickets_assigned_technician_id_fkey (full_name)
        `)
        .eq("client_email", email)
        .eq("ticket_number", ticketNumber)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Ticket non trouvé",
          description: "Aucun ticket ne correspond à ces informations. Vérifiez l'email et le numéro de ticket.",
          variant: "destructive",
        });
        return;
      }

      setTicket(data);
      setShowTicket(true);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer le ticket.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;

    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          status: "closed",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", ticket.id);

      if (error) throw error;

      toast({
        title: "Ticket clôturé",
        description: "Merci pour votre retour ! Votre ticket a été clôturé avec succès.",
      });

      handleSearch();
    } catch (error) {
      console.error("Error closing ticket:", error);
      toast({
        title: "Erreur",
        description: "Impossible de clôturer le ticket.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    const ticketElement = document.getElementById("ticket-details");
    if (!ticketElement) return;

    try {
      const canvas = await html2canvas(ticketElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`ticket-${ticket?.ticket_number || "unknown"}.pdf`);

      toast({
        title: "PDF téléchargé",
        description: "Le rapport PDF a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "closed":
        return <Badge className="bg-muted text-muted-foreground">Clôturé</Badge>;
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Résolu</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">En cours</Badge>;
      case "pending":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">En attente</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary border-primary/20">Ouvert</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "closed": return "Clôturé";
      case "resolved": return "Résolu";
      case "in_progress": return "En cours";
      case "pending": return "En attente";
      default: return "Ouvert";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <PublicHeader showBackButton />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-card-foreground">Suivre mon ticket</h2>
              <p className="text-muted-foreground">
                Entrez vos informations pour consulter l'état de votre demande
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ticket">Numéro du ticket</Label>
                <Input
                  id="ticket"
                  placeholder="TK-12345"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full" disabled={!email || !ticketNumber || loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Recherche..." : "Rechercher"}
            </Button>

            {showTicket && ticket && (
              <div id="ticket-details" className="pt-6 border-t border-border space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Ticket {ticket.ticket_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {ticket.hotels?.name} • Créé le {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                <Card className="p-4 bg-accent border-border">
                  <h4 className="font-semibold mb-2 text-card-foreground">
                    Catégorie : {ticket.categories?.name || 'N/A'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {ticket.description}
                  </p>
                </Card>

                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">Historique</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="flex-1 w-px bg-primary" style={{ minHeight: "40px" }} />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-card-foreground">Ticket créé</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    
                    {ticket.assigned_technician_id && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <div className="flex-1 w-px bg-primary" style={{ minHeight: "40px" }} />
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-card-foreground">Technicien assigné</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {ticket.profiles?.full_name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {(ticket.status === 'in_progress' || ticket.status === 'resolved' || ticket.status === 'closed') && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <div className="flex-1 w-px bg-muted" style={{ minHeight: "40px" }} />
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-card-foreground">En cours d'intervention</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-green-500' : 'bg-muted'}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${ticket.status === 'resolved' || ticket.status === 'closed' ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {ticket.status === 'closed' ? 'Clôturé' : 'Résolu'}
                        </p>
                        {ticket.resolved_at && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(ticket.resolved_at).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleDownloadPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger PDF
                  </Button>
                  {ticket.status === 'resolved' && (
                    <Button 
                      className="flex-1" 
                      onClick={handleCloseTicket}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmer la résolution
                    </Button>
                  )}
                  {ticket.status === 'closed' && (
                    <Button className="flex-1" disabled>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Ticket clôturé
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default TrackTicket;
