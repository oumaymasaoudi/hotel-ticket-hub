import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Hotel } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // TODO: Implement authentication
    // For now, simulate login and redirect based on role
    navigate("/dashboard/client");
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

          <Button onClick={handleLogin} className="w-full" disabled={!email || !password}>
            Se connecter
          </Button>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate("/")} className="text-sm">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
