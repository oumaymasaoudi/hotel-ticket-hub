import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Hotel, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/apiService";
import { AppFooter } from "@/components/layout/AppFooter";
import luxuryBg from "@/assets/luxury-hotel-bg.jpg";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectBasedOnRole = useCallback((userRole: string) => {
    switch (userRole) {
      case "client":
        navigate("/dashboard/client");
        break;
      case "technician":
        navigate("/dashboard/technician");
        break;
      case "admin":
        navigate("/dashboard/admin");
        break;
      case "superadmin":
        navigate("/dashboard/superadmin");
        break;
      default:
        navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    // Ne rediriger que si on est sur la page login et que l'utilisateur est connecté
    if (!authLoading && user && role && window.location.pathname === '/login') {
      redirectBasedOnRole(role);
    }
  }, [user, role, authLoading, redirectBasedOnRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiService.login(email, password);

      // Sauvegarder les données utilisateur dans le localStorage
      localStorage.setItem('user_data', JSON.stringify(data));
      localStorage.setItem('auth_token', data.token);

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });

      // Recharge la page pour que le contexte Auth détecte le nouvel utilisateur
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Email ou mot de passe incorrect";
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${luxuryBg})` }}
      />
      <div className="absolute inset-0 bg-primary/85" />

      {/* Card */}
      <Card className="relative w-full max-w-md p-8 glass-luxury shadow-2xl">
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
          <h2 className="text-xl font-serif font-semibold text-card-foreground">Connexion</h2>
          <p className="text-sm text-muted-foreground mt-1">Accédez à votre espace professionnel</p>
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
              className="bg-background/50"
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-card-foreground"
              >
                Se souvenir de moi
              </label>
            </div>
            <Button variant="link" className="px-0 text-sm text-secondary">
              Mot de passe oublié ?
            </Button>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg"
            disabled={!email || !password || loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          <div className="text-center space-y-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/signup")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Créer un compte
            </Button>
            <br />
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </Card>
      </div>
      <AppFooter />
    </div>
  );
};

export default Login;