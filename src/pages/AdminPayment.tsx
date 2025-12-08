import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Check, ArrowLeft, Loader2, Crown, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Stripe price IDs
const PLANS = {
  starter: {
    name: "Starter",
    priceId: "price_1Sc5yDQvCbcSJQxQFiTlEAEC",
    price: 99,
    features: [
      "50 tickets par mois",
      "2 techniciens maximum",
      "SLA 48 heures",
      "Support email"
    ],
    icon: Zap
  },
  pro: {
    name: "Pro",
    priceId: "price_1Sc5ygQvCbcSJQxQQvSqrJN0",
    price: 199,
    features: [
      "150 tickets par mois",
      "5 techniciens maximum",
      "SLA 24 heures",
      "Support prioritaire",
      "Rapports avancés"
    ],
    icon: Star,
    popular: true
  },
  enterprise: {
    name: "Enterprise",
    priceId: "price_1Sc5zzQvCbcSJQxQOgFMZE1B",
    price: 399,
    features: [
      "500 tickets par mois",
      "Techniciens illimités",
      "SLA 8 heures",
      "Support dédié 24/7",
      "Rapports personnalisés",
      "Option urgence"
    ],
    icon: Crown
  }
};

const AdminPayment = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const handleSubscribe = async (planKey: string) => {
    const plan = PLANS[planKey as keyof typeof PLANS];
    if (!plan) return;

    setLoading(planKey);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la session de paiement",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <DashboardLayout allowedRoles={["admin"]} title="Paiement Abonnement" showBackButton>
      <div className="space-y-8">
        {paymentStatus === "cancelled" && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-center">
            Le paiement a été annulé. Vous pouvez réessayer à tout moment.
          </div>
        )}

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">
            Choisissez votre plan
          </h2>
          <p className="text-muted-foreground">
            Sélectionnez l'abonnement adapté aux besoins de votre hôtel
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => {
            const Icon = plan.icon;
            const isPopular = "popular" in plan && plan.popular;
            
            return (
              <Card 
                key={key} 
                className={`relative card-luxury ${isPopular ? "border-secondary shadow-gold" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Populaire
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isPopular ? "bg-secondary/20" : "bg-primary/10"}`}>
                    <Icon className={`h-6 w-6 ${isPopular ? "text-secondary" : "text-primary"}`} />
                  </div>
                  <CardTitle className="font-serif text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">{plan.price}€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handleSubscribe(key)}
                    disabled={loading !== null}
                  >
                    {loading === key ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        S'abonner
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Paiement sécurisé par Stripe. Annulation possible à tout moment.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPayment;
