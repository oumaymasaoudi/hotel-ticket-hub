import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiService, TicketResponse } from "@/services/apiService";
import { Search, RefreshCw, ArrowUpCircle, Clock } from "lucide-react";

type StatusKey = TicketResponse["status"];

const statusLabels: Record<StatusKey, string> = {
    OPEN: "Ouvert",
    IN_PROGRESS: "En cours",
    PENDING: "En attente",
    RESOLVED: "Résolu",
    CLOSED: "Clôturé",
};

const statusVariants: Record<StatusKey, string> = {
    OPEN: "outline",
    IN_PROGRESS: "secondary",
    PENDING: "warning",
    RESOLVED: "success",
    CLOSED: "default",
} as const;

const ClientDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        if (!authLoading && user?.email) {
            fetchTickets(user.email);
        }
    }, [authLoading, user?.email]);

    const fetchTickets = async (email: string) => {
        setLoading(true);
        try {
            const data = await apiService.getTicketsByEmail(email);
            setTickets(data);
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de récupérer vos tickets",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = useMemo(() => {
        if (!filter.trim()) return tickets;
        const f = filter.toLowerCase();
        return tickets.filter(
            (t) =>
                t.ticketNumber.toLowerCase().includes(f) ||
                t.status.toLowerCase().includes(f) ||
                t.categoryName.toLowerCase().includes(f)
        );
    }, [tickets, filter]);

    const stats = useMemo(() => {
        const initial: Record<StatusKey, number> = {
            OPEN: 0,
            IN_PROGRESS: 0,
            PENDING: 0,
            RESOLVED: 0,
            CLOSED: 0,
        };
        return tickets.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, initial);
    }, [tickets]);

    return (
        <DashboardLayout allowedRoles={["client"]} title="Tableau de bord Client">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard title="Tickets en cours" value={(stats.OPEN ?? 0) + (stats.IN_PROGRESS ?? 0) + (stats.PENDING ?? 0)} />
                    <StatCard title="Résolus" value={stats.RESOLVED ?? 0} />
                    <StatCard title="Clôturés" value={stats.CLOSED ?? 0} />
                </div>

                {/* Actions */}
                <Card className="p-4 flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Filtrer par numéro / statut / catégorie</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="ex: TK-1234 ou 'ouvert' ou 'plomberie'"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            <Button variant="outline" onClick={() => setFilter("")}>Réinitialiser</Button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => user?.email && fetchTickets(user.email)} disabled={loading}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Rafraîchir
                        </Button>
                        <Button onClick={() => window.location.href = "/dashboard/client/create"}>
                            <ArrowUpCircle className="h-4 w-4 mr-2" />
                            Nouveau ticket
                        </Button>
                    </div>
                </Card>

                {/* Liste */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mes tickets ({filteredTickets.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Chargement...</p>
                        ) : filteredTickets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Aucun ticket.</p>
                        ) : (
                            filteredTickets.map((t) => (
                                <div key={t.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 rounded-md border bg-muted/40">
                                    <div>
                                        <p className="font-semibold text-card-foreground">{t.ticketNumber}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {t.categoryName} • {t.hotelName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Créé le {new Date(t.createdAt).toLocaleDateString("fr-FR")}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={statusVariants[t.status] || "outline"} className="capitalize">
                                            {statusLabels[t.status] || t.status}
                                        </Badge>
                                        {t.isUrgent && <Badge variant="destructive">Urgent</Badge>}
                                        <Button size="sm" variant="outline" onClick={() => window.location.href = `/dashboard/client/tickets/${t.ticketNumber}`}>
                                            <Search className="h-4 w-4 mr-1" />
                                            Détails
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

const StatCard = ({ title, value }: { title: string; value: number }) => (
    <Card className="p-4">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-semibold text-card-foreground">{value}</p>
            </div>
            <div className="p-2 rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
            </div>
        </div>
    </Card>
);

export default ClientDashboard;

