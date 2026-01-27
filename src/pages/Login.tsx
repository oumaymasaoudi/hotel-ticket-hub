import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Hotel, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/apiService";
import { AppFooter } from "@/components/layout/AppFooter";
import { FadeIn, StaggerContainer } from "@/components/animations/FadeIn";
import { AnimatedButton } from "@/components/animations/AnimatedButton";
import { motion } from "framer-motion";
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
    // Only redirect if on login page and user is connected
    if (!authLoading && user && role && window.location.pathname === '/login') {
      redirectBasedOnRole(role);
    }
  }, [user, role, authLoading, redirectBasedOnRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiService.login(email, password);

      // Save user data to localStorage
      localStorage.setItem('user_data', JSON.stringify(data));
      localStorage.setItem('auth_token', data.token);

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });

      // Reload page so Auth context detects new user
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
    <div className="min-h-screen relative flex flex-col overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${luxuryBg})` }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-navy-900/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gold-400/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -100],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Card with animations */}
      <FadeIn direction="up" delay={0.2} className="relative w-full max-w-md">
        <Card className="p-8 glass-luxury shadow-2xl border-gold/20 hover:border-gold/40 transition-all duration-500 hover:shadow-gold">
          <StaggerContainer>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex flex-col items-center mb-8"
            >
              <motion.div
                className="flex items-center gap-2 mb-2"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Hotel className="h-10 w-10 text-gold-600" />
                </motion.div>
                <span className="text-3xl font-serif font-bold text-gradient-gold bg-clip-text text-transparent">
                  TicketHotel
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="h-5 w-5 text-gold-500" />
                </motion.div>
              </motion.div>
              <motion.div
                className="flex items-center gap-1 mb-4"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
              >
                {[...new Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.3, rotate: 15 }}
                  >
                    <Star className="h-4 w-4 fill-gold-600 text-gold-600" />
                  </motion.div>
                ))}
              </motion.div>
              <motion.h2
                className="text-xl font-serif font-semibold text-card-foreground"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
              >
                Connexion
              </motion.h2>
              <motion.p
                className="text-sm text-muted-foreground mt-1"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
              >
                Accédez à votre espace professionnel
              </motion.p>
            </motion.div>
          </StaggerContainer>

          <StaggerContainer staggerDelay={0.1}>
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              className="space-y-4"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <motion.div whileFocus={{ scale: 1.02 }}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-silver/50 focus:border-gold-500 focus:ring-gold-500 transition-all duration-300"
                  />
                </motion.div>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
                <motion.div whileFocus={{ scale: 1.02 }}>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-silver/50 focus:border-gold-500 focus:ring-gold-500 transition-all duration-300"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="flex items-center justify-between"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-silver/50 data-[state=checked]:bg-gold-600 data-[state=checked]:border-gold-600"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-card-foreground cursor-pointer"
                  >
                    Se souvenir de moi
                  </label>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="link" className="px-0 text-sm text-gold-600 hover:text-gold-500">
                    Mot de passe oublié ?
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <AnimatedButton
                  onClick={handleLogin}
                  variant="gold"
                  className="w-full text-white font-semibold shadow-lg hover:shadow-xl"
                  disabled={!email || !password || loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Connexion...
                    </span>
                  ) : (
                    "Se connecter"
                  )}
                </AnimatedButton>
              </motion.div>

              <motion.div
                className="text-center space-y-2"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/signup")}
                    className="text-sm text-muted-foreground hover:text-gold-600 transition-colors"
                  >
                    Créer un compte
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="text-sm text-muted-foreground hover:text-gold-600 transition-colors"
                  >
                    Retour à l'accueil
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </StaggerContainer>
        </Card>
      </FadeIn>
      </div>
      <AppFooter />
    </div>
  );
};

export default Login;