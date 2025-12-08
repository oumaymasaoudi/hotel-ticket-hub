import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryCard } from "@/components/CategoryCard";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { TicketImageUpload } from "@/components/tickets/TicketImageUpload";
import { ArrowLeft, ArrowRight, Check, Copy, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const iconMap: Record<string, any> = {
  Zap, Droplet, Snowflake, Wifi, Key, BedDouble, Bath, Volume2, Sparkles, Shield, UtensilsCrossed, Package,
};

const CreateTicket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<{ number: string; category: string } | null>(null);
  
  const [hotels, setHotels] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; color: string }[]>([]);

  useEffect(() => {
    fetchHotels();
    fetchCategories();
  }, []);

  const fetchHotels = async () => {
    const { data } = await supabase.from("hotels").select("id, name").eq("is_active", true);
    if (data) setHotels(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name, icon, color");
    if (data) setCategories(data);
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const uploadImages = async (ticketId: string) => {
    for (const file of pendingImages) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${ticketId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("ticket-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      await supabase.from("ticket_images").insert({
        ticket_id: ticketId,
        storage_path: fileName,
        file_name: file.name,
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Generate ticket number
      const { data: ticketNumber } = await supabase.rpc("generate_ticket_number");

      const { data: ticketData, error } = await supabase.from("tickets").insert({
        ticket_number: ticketNumber,
        client_email: email,
        client_phone: phone || null,
        hotel_id: hotelId,
        category_id: selectedCategoryId,
        description,
        status: "open",
      }).select("id").single();

      if (error) throw error;

      // Upload images if any
      if (pendingImages.length > 0 && ticketData) {
        await uploadImages(ticketData.id);
      }

      const category = categories.find(c => c.id === selectedCategoryId);
      setCreatedTicket({
        number: ticketNumber,
        category: category?.name || "",
      });
      
      setStep(4);
      
      toast({
        title: "Ticket créé avec succès",
        description: `Votre numéro de ticket est ${ticketNumber}`,
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le ticket. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyTicketNumber = () => {
    if (createdTicket) {
      navigator.clipboard.writeText(createdTicket.number);
      toast({
        title: "Copié !",
        description: "Le numéro de ticket a été copié dans le presse-papier.",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Package;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background">
      <PublicHeader showBackButton showLoginButton={false} />

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
                  {step > s ? <Check className="h-5 w-5" /> : s}
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
            <div className={step === 1 ? "text-primary font-medium" : ""}>Identification</div>
            <div className={step === 2 ? "text-primary font-medium" : ""}>Catégorie</div>
            <div className={step === 3 ? "text-primary font-medium" : ""}>Détails</div>
            <div className={step === 4 ? "text-primary font-medium" : ""}>Confirmation</div>
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Le numéro de ticket sera envoyé à cette adresse
                  </p>
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
                  <Label htmlFor="hotel">Sélection de l'hôtel *</Label>
                  <Select value={hotelId} onValueChange={setHotelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez votre hôtel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button onClick={handleNext} disabled={!email || !hotelId}>
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
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <CategoryCard
                      key={category.id}
                      icon={IconComponent}
                      name={category.name}
                      color={category.color}
                      selected={selectedCategoryId === category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button onClick={handleNext} disabled={!selectedCategoryId}>
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
                <p className="text-muted-foreground">Décrivez le problème rencontré et ajoutez des photos si nécessaire</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description du problème *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre problème en détail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                  />
                </div>
                <TicketImageUpload onImagesChange={setPendingImages} />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button onClick={handleSubmit} disabled={!description || loading}>
                  {loading ? "Création..." : "Créer le ticket"}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && createdTicket && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-card-foreground">Ticket créé avec succès !</h2>
                <p className="text-muted-foreground mb-6">Votre demande a bien été enregistrée</p>
              </div>
              
              <Card className="p-6 bg-accent border-border">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-card-foreground">Numéro du ticket :</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary text-lg">{createdTicket.number}</span>
                      <Button variant="outline" size="icon" onClick={copyTicketNumber}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-card-foreground">Catégorie :</span>
                    <span className="text-card-foreground">{createdTicket.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-card-foreground">Email :</span>
                    <span className="text-card-foreground">{email}</span>
                  </div>
                </div>
              </Card>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-card-foreground">Conservez votre numéro de ticket</p>
                    <p className="text-sm text-muted-foreground">
                      Vous pouvez copier le numéro ci-dessus ou le retrouver dans votre email.
                      Il vous sera demandé pour suivre l'avancement de votre demande.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate(`/track-ticket?email=${email}&ticket=${createdTicket.number}`)} className="w-full">
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
