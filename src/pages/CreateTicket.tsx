import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryCard } from "@/components/CategoryCard";
import { ArrowLeft, ArrowRight, Check, Hotel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Droplet,
  Snowflake,
  Wifi,
  Key,
  BedDouble,
  Bath,
  Volume2,
  Sparkles,
  Shield,
  UtensilsCrossed,
  Package,
} from "lucide-react";

const categories = [
  { id: "electricite", name: "Electricité", icon: Zap, color: "yellow" },
  { id: "plomberie", name: "Plomberie", icon: Droplet, color: "blue" },
  { id: "climatisation", name: "Climatisation / Chauffage", icon: Snowflake, color: "cyan" },
  { id: "internet", name: "Internet / WiFi", icon: Wifi, color: "purple" },
  { id: "serrurerie", name: "Serrurerie", icon: Key, color: "gray" },
  { id: "chambre", name: "Chambre", icon: BedDouble, color: "pink" },
  { id: "salle-bain", name: "Salle de bain", icon: Bath, color: "teal" },
  { id: "bruit", name: "Bruit", icon: Volume2, color: "orange" },
  { id: "proprete", name: "Propreté", icon: Sparkles, color: "green" },
  { id: "securite", name: "Sécurité", icon: Shield, color: "red" },
  { id: "restauration", name: "Restauration / Room Service", icon: UtensilsCrossed, color: "amber" },
  { id: "autres", name: "Autres", icon: Package, color: "slate" },
];

const CreateTicket = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hotel, setHotel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // TODO: Submit ticket
    navigate("/track-ticket");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Hotel className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">TicketHotel</span>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                    step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 transition-colors",
                      step > s ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs text-center text-muted-foreground">
            <div>Identification</div>
            <div>Catégorie</div>
            <div>Détails</div>
            <div>Confirmation</div>
          </div>
        </div>

        <Card className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-card-foreground">Identification</h2>
                <p className="text-muted-foreground">Renseignez vos informations de contact</p>
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
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hotel">Sélection de l'hôtel</Label>
                  <Select value={hotel} onValueChange={setHotel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez votre hôtel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel-1">Hôtel Paris Centre</SelectItem>
                      <SelectItem value="hotel-2">Hôtel Lyon Confluence</SelectItem>
                      <SelectItem value="hotel-3">Hôtel Marseille Vieux Port</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!email || !hotel}>
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-card-foreground">Sélection de la catégorie</h2>
                <p className="text-muted-foreground">Choisissez la catégorie correspondant à votre problème</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    icon={category.icon}
                    name={category.name}
                    color={category.color}
                    selected={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button onClick={handleNext} disabled={!selectedCategory}>
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-card-foreground">Détails du problème</h2>
                <p className="text-muted-foreground">Décrivez le problème rencontré</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description du problème</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre problème en détail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button onClick={handleNext} disabled={!description}>
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-card-foreground">Ticket créé avec succès !</h2>
                <p className="text-muted-foreground mb-6">Votre demande a bien été enregistrée</p>
              </div>
              
              <Card className="p-6 bg-accent border-border">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-card-foreground">Numéro du ticket :</span>
                    <span className="font-mono font-bold text-primary">TK-45821</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-card-foreground">Catégorie :</span>
                    <span className="text-card-foreground">
                      {categories.find((c) => c.id === selectedCategory)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-card-foreground">Temps estimé :</span>
                    <span className="text-card-foreground">2-4 heures</span>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/track-ticket")} className="w-full">
                  Suivre mon ticket
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default CreateTicket;
