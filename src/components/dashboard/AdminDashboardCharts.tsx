import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const AdminDashboardCharts = () => (
    <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Charts désactivés
            </CardTitle>
            <CardDescription>Ces graphiques utilisaient Supabase. À recâbler sur l’API backend.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
            Implémentez les agrégations côté backend puis branchez ici.
        </CardContent>
    </Card>
);

export default AdminDashboardCharts;

