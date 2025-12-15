import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const AdminReportsView = () => (
    <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Rapports désactivés
            </CardTitle>
            <CardDescription>
                Cette vue utilisait Supabase. À réimplémenter avec l’API backend (reports/statistiques).
            </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
            Connectez-la aux endpoints Spring Boot avant de la remettre en service.
        </CardContent>
    </Card>
);

export default AdminReportsView;

