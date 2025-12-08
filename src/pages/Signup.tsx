import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Hotel, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

interface CategoryData {
  id: string;
  name: string;
  color: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    role: "" as UserRole | "",
    hotelId: "",
  });

  useEffect(() => {
    fetchHotels();
    fetchCategories();
  }, []);

  const fetchHotels = async () => {
    const { data, error } = await supabase
      .from("hotels")
      .select("id, name")
      .eq("is_active", true);

    if (!error && data) {
      setHotels(data);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, color");

    if (!error && data) {
      setCategories(data);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
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

    // Seul admin doit sélectionner un hôtel - les techniciens sont assignés dynamiquement
    if (formData.role === "admin" && !formData.hotelId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un hôtel",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === "technician" && selectedCategories.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une spécialité",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Update profile with hotel_id if applicable
        if (formData.hotelId) {
          await supabase
            .from("profiles")
            .update({ hotel_id: formData.hotelId })
            .eq("id", authData.user.id);
        }

        // Insert user role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: formData.role,
            hotel_id: formData.hotelId || null,
          });

        if (roleError) throw roleError;

        // Insert technician categories if applicable
        if (formData.role === "technician" && selectedCategories.length > 0) {
          const categoryInserts = selectedCategories.map(categoryId => ({
            technician_id: authData.user!.id,
            category_id: categoryId,
          }));

          await supabase.from("technician_categories").insert(categoryInserts);
        }

        toast({
          title: "Compte créé !",
          description: "Votre compte a été créé avec succès",
        });

        navigate("/login");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite",
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
            {[...Array(5)].map((_, i) => (
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

          {/* Seul admin sélectionne un hôtel - les techniciens sont assignés dynamiquement */}
          {formData.role === "admin" && (
            <div>
              <Label htmlFor="hotel">Hôtel</Label>
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
            </div>
          )}

          {formData.role === "technician" && (
            <div>
              <Label>Spécialités</Label>
              <p className="text-xs text-muted-foreground mb-2">Sélectionnez vos domaines d'intervention</p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md bg-background/50">
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
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs">{cat.name}</span>
                  </div>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCategories.length} spécialité(s) sélectionnée(s)
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