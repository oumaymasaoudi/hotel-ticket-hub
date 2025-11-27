import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Hotel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && role) {
      redirectBasedOnRole(role);
    }
  }, [user, role, authLoading]);

  const redirectBasedOnRole = (userRole: string) => {
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
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();

        if (roleError) throw roleError;

        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });

        redirectBasedOnRole(roleData.role);
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Hotel className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-foreground">TicketHotel</span>
          </div>
          <h2 className="text-xl font-semibold text-card-foreground">Connexion</h2>
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
            <Button variant="link" className="px-0 text-sm">
              Mot de passe oublié ?
            </Button>
          </div>

          <Button onClick={handleLogin} className="w-full" disabled={!email || !password || loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>

          <div className="text-center space-y-2">
            <Button type="button" variant="ghost" onClick={() => navigate("/signup")} className="text-sm">
              Créer un compte
            </Button>
            <br />
            <Button type="button" variant="ghost" onClick={() => navigate("/")} className="text-sm">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
