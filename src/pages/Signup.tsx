import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Hotel, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import luxuryBg from "@/assets/luxury-hotel-bg.jpg";

type UserRole = "client" | "technician" | "admin" | "superadmin";

interface HotelData {
  id: string;
  name: string;
}

// Liste fixe des spécialités pour les techniciens
const TECHNICIAN_SPECIALTIES = [
  "Electricité",
  "Plomberie",
  "Climatisation / Chauffage",
  "Internet / WiFi",
  "Serrurerie",
  "Chambre",
  "Salle de bain",
  "Bruit",
  "Propreté",
  "Sécurité",
  "Restauration / Room Service",
  "Autres",
];

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    role: "" as UserRole | "",
    hotelId: "",
  });

  const fetchHotels = useCallback(async () => {
    try {
      const data = await apiService.getActiveHotels();
      if (data && data.length > 0) {
        setHotels(data);
      } else {
        toast({
          title: "Aucun hôtel disponible",
          description: "Veuillez créer un hôtel via le dashboard SuperAdmin ou exécutez le script create-test-hotel.sql",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des hôtels",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Charger les hôtels au montage du composant
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (!formData.role) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un rôle",
        variant: "destructive",
      });
      return;
    }

    // Admin et Technicien doivent sélectionner un hôtel (règle de gestion)
    if ((formData.role === "admin" || formData.role === "technician") && !formData.hotelId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un hôtel",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "technician" && selectedSpecialties.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une spécialité",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await apiService.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
        hotelId: (formData.role === "admin" || formData.role === "technician") ? formData.hotelId : undefined,
        specialties:
          formData.role === "technician" ? selectedSpecialties : undefined,
      });

      toast({
        title: "Compte créé !",
        description: "Vous pouvez maintenant vous connecter",
      });

      navigate("/login");
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${luxuryBg})` }}
      />
      <div className="absolute inset-0 bg-primary/85" />

      {/* Card */}
      <Card className="relative w-full max-w-md p-8 glass-luxury shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Hotel className="h-10 w-10 text-primary" />
            <span className="text-3xl font-serif font-bold text-foreground">TicketHotel</span>
          </div>
          <div className="flex items-center gap-1 mb-4">
            {[...new Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
            ))}
          </div>
          <h2 className="text-xl font-serif font-semibold text-card-foreground">Créer un compte</h2>
          <p className="text-sm text-muted-foreground mt-1">Rejoignez l'excellence hôtelière</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="bg-background/50"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-background/50"
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-background/50"
            />
          </div>

          <div>
            <Label htmlFor="role">Rôle</Label>
            <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value, hotelId: "" })}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="technician">Technicien</SelectItem>
                <SelectItem value="admin">Admin Hôtel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Admin et Technicien doivent sélectionner un hôtel (règle de gestion) */}
          {(formData.role === "admin" || formData.role === "technician") && (
            <div>
              <Label htmlFor="hotel">Hôtel *</Label>
              {hotels.length === 0 ? (
                <div className="p-4 border border-destructive/40 rounded-lg bg-destructive/5">
                  <p className="text-sm text-destructive font-medium mb-2">
                    ⚠️ Aucun hôtel disponible
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Pour créer un compte admin, vous devez d'abord créer un hôtel :
                  </p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Connectez-vous en tant que <strong>SuperAdmin</strong></li>
                    <li>Allez dans <strong>"Hôtels"</strong> → <strong>"Créer un hôtel"</strong></li>
                    <li>Ou exécutez le script SQL <code className="bg-muted px-1 rounded">create-test-hotel.sql</code></li>
                  </ol>
                </div>
              ) : (
                <Select value={formData.hotelId} onValueChange={(value) => setFormData({ ...formData, hotelId: value })}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Sélectionnez un hôtel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {formData.role === "technician" && (
            <div>
              <Label>Spécialités</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Sélectionnez vos domaines d&apos;intervention
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md bg-background/50">
                {TECHNICIAN_SPECIALTIES.map((spec) => (
                  <div
                    key={spec}
                    onClick={() => toggleSpecialty(spec)}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all border ${selectedSpecialties.includes(spec)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                      }`}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0 bg-primary/60" />
                    <span className="text-xs">{spec}</span>
                  </div>
                ))}
              </div>
              {selectedSpecialties.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedSpecialties.length} spécialité(s) sélectionnée(s)
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-background/50"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="bg-background/50"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
            disabled={loading}
          >
            {loading ? "Création..." : "Créer mon compte"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/login")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Déjà un compte ? Se connecter
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Signup;