import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Search, Download, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
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
  const [ticket, setTicket] = useState<{
    ticketNumber?: string;
    ticket_number?: string;
    status?: string;
    clientEmail?: string;
    hotelName?: string;
    createdAt?: string;
    created_at?: string;
    categoryName?: string;
    description?: string;
    assignedTechnicianName?: string;
    resolvedAt?: string;
  } | null>(null);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getTicketByNumber(ticketNumber);

      // Vérifie l’email si présent
      if (email && data.clientEmail.toLowerCase() !== email.toLowerCase()) {
        toast({
          title: "Ticket non trouvé",
          description: "Aucun ticket ne correspond à ces informations. Vérifiez l'email et le numéro de ticket.",
          variant: "destructive",
        });
        setTicket(null);
        setShowTicket(false);
        return;
      }

      setTicket(data);
      setShowTicket(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de récupérer le ticket.";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [ticketNumber, email, toast]);

  useEffect(() => {
    if (searchParams.get("email") && searchParams.get("ticket")) {
      handleSearch();
    }
  }, [searchParams, handleSearch]);

  const handleCloseTicket = async () => {
    toast({
      title: "Action non disponible",
      description: "La clôture de ticket nécessite une authentification.",
      variant: "destructive",
    });
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
                    <h3 className="text-lg font-semibold text-card-foreground">Ticket {ticket.ticketNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {ticket.hotelName} • Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {getStatusBadge(ticket.status?.toLowerCase?.() || ticket.status)}
                </div>

                <Card className="p-4 bg-accent border-border">
                  <h4 className="font-semibold mb-2 text-card-foreground">
                    Catégorie : {ticket.categoryName || 'N/A'}
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

                    {ticket.assignedTechnicianName && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <div className="flex-1 w-px bg-primary" style={{ minHeight: "40px" }} />
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-card-foreground">Technicien assigné</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {ticket.assignedTechnicianName || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {(ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
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
                        <div className={`h-3 w-3 rounded-full ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'bg-green-500' : 'bg-muted'}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {ticket.status === 'CLOSED' ? 'Clôturé' : 'Résolu'}
                        </p>
                        {ticket.resolvedAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(ticket.resolvedAt).toLocaleString('fr-FR')}
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
                  {ticket.status === 'RESOLVED' && (
                    <Button
                      className="flex-1"
                      onClick={handleCloseTicket}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmer la résolution
                    </Button>
                  )}
                  {ticket.status === 'CLOSED' && (
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
