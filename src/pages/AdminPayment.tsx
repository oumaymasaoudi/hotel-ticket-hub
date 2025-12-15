import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

const AdminPayment = () => {
  return (
    <DashboardLayout allowedRoles={["admin"]} title="Paiement / Abonnement" showBackButton>
      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Paiement désactivé
          </CardTitle>
          <CardDescription>
            La logique de paiement Supabase/Stripe a été retirée. Cette page reste en lecture seule tant que l’API backend dédiée n’est pas implémentée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Implémentez vos endpoints backend (ex: /api/billing/...) puis remplacez cette page par les appels correspondants.
          </p>
          <Badge variant="outline" className="text-destructive border-destructive/40 bg-white">
            Non disponible
          </Badge>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminPayment;
