import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const SuperAdminEscalationsView = () => (
    <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Fonctionnalité désactivée
            </CardTitle>
            <CardDescription>
                Cette vue utilisait Supabase. À réimplémenter avec l’API backend (escalades, assignations).
            </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
            Rebranchez sur les endpoints Spring Boot avant réactivation.
        </CardContent>
    </Card>
);

export default SuperAdminEscalationsView;

