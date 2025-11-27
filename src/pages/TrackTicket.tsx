import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hotel, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TrackTicket = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [showTicket, setShowTicket] = useState(false);

  const handleSearch = () => {
    setShowTicket(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Hotel className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">TicketHotel</span>
        </div>
      </nav>

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

            <Button onClick={handleSearch} className="w-full" disabled={!email || !ticketNumber}>
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>

            {showTicket && (
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Ticket TK-45821</h3>
                    <p className="text-sm text-muted-foreground">Créé le 27 novembre 2025</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">En cours</Badge>
                </div>

                <Card className="p-4 bg-accent border-border">
                  <h4 className="font-semibold mb-2 text-card-foreground">Catégorie : Plomberie</h4>
                  <p className="text-sm text-muted-foreground">
                    Fuite d'eau dans la salle de bain de la chambre 305
                  </p>
                </Card>

                <div className="space-y-3">
                  <h4 className="font-semibold text-card-foreground">Statut</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="flex-1 w-px bg-primary" style={{ minHeight: "40px" }} />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-card-foreground">Ticket créé</p>
                        <p className="text-xs text-muted-foreground">27/11/2025 à 14:30</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="flex-1 w-px bg-primary" style={{ minHeight: "40px" }} />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-card-foreground">Technicien assigné</p>
                        <p className="text-xs text-muted-foreground">27/11/2025 à 14:45</p>
                        <p className="text-sm text-muted-foreground mt-1">Jean Dupont</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="flex-1 w-px bg-muted" style={{ minHeight: "40px" }} />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-card-foreground">En cours d'intervention</p>
                        <p className="text-xs text-muted-foreground">27/11/2025 à 15:00</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-muted" />
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Résolu</p>
                        <p className="text-xs text-muted-foreground">En attente</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    Télécharger PDF
                  </Button>
                  <Button className="flex-1">Clôturer mon ticket</Button>
                </div>
              </div>
            )}

            <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
              Retour à l'accueil
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default TrackTicket;
