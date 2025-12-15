import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiService, TicketResponse } from "@/services/apiService";
import { RefreshCw, Wrench, CheckCircle, Clock, Search, AlertTriangle, History } from "lucide-react";

type StatusKey = TicketResponse["status"];

const statusLabels: Record<StatusKey, string> = {
    OPEN: "Ouvert",
    IN_PROGRESS: "En cours",
    PENDING: "En attente",
    RESOLVED: "Résolu",
    CLOSED: "Clôturé",
};

const statusVariants: Record<StatusKey, "default" | "secondary" | "destructive" | "outline"> = {
    OPEN: "outline",
    IN_PROGRESS: "secondary",
    PENDING: "outline",
    RESOLVED: "default",
    CLOSED: "default",
};

const TechnicianDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);

    // ✅ Détecter la route active pour afficher le bon contenu
    const currentView = useMemo(() => {
        const path = location.pathname;
        if (path.includes('/tickets')) return 'tickets';
        if (path.includes('/urgent')) return 'urgent';
        if (path.includes('/history')) return 'history';
        return 'dashboard'; // Par défaut, afficher le tableau de bord
    }, [location.pathname]);

    const fetchTickets = useCallback(async (technicianId: string) => {
        setLoading(true);
        try {
            const data = await apiService.getTicketsByTechnician(technicianId);
            setTickets(data);
        } catch (error: any) {
            const errorMessage = error.message || "Impossible de récupérer vos tickets";

            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });

            // Rediriger vers login si session expirée
            if (errorMessage.includes("Session expirée")) {
                setTimeout(() => navigate("/login"), 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [toast, navigate]);

    useEffect(() => {
        if (!authLoading) {
            if (!user?.userId) {
                // Pas connecté, rediriger vers login
                navigate("/login");
            } else {
                fetchTickets(user.userId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user?.userId]);

    const filteredTickets = useMemo(() => {
        let filtered = tickets;

        // ✅ Filtrer selon la vue active
        if (currentView === 'urgent') {
            filtered = filtered.filter(t => t.isUrgent);
        } else if (currentView === 'history') {
            filtered = filtered.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');
        } else if (currentView === 'tickets') {
            // Afficher tous les tickets assignés
            filtered = filtered;
        }

        // ✅ Appliquer le filtre de recherche
        if (filter.trim()) {
            const f = filter.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.ticketNumber.toLowerCase().includes(f) ||
                    t.status.toLowerCase().includes(f) ||
                    t.categoryName.toLowerCase().includes(f) ||
                    (t.description || "").toLowerCase().includes(f)
            );
        }

        return filtered;
    }, [tickets, filter, currentView]);

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

    const updateStatus = async (ticket: TicketResponse, nextStatus: StatusKey) => {
        if (!user?.userId) return;
        setUpdating(ticket.id);
        try {
            await apiService.updateTicketStatus(ticket.id, nextStatus, user.userId, user.userId);
            setTickets((prev) =>
                prev.map((t) => (t.id === ticket.id ? { ...t, status: nextStatus } : t))
            );
            toast({ title: "Statut mis à jour", description: `${statusLabels[nextStatus]}` });
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de mettre à jour le statut",
                variant: "destructive",
            });
        } finally {
            setUpdating(null);
        }
    };

    // ✅ Titre et description selon la vue
    const getViewTitle = () => {
        switch (currentView) {
            case 'tickets':
                return 'Tickets assignés';
            case 'urgent':
                return 'Tickets urgents';
            case 'history':
                return 'Historique';
            default:
                return 'Tableau de bord Technicien';
        }
    };

    return (
        <DashboardLayout allowedRoles={["technician"]} title={getViewTitle()}>
            <div className="space-y-6">
                {/* Stats - Afficher seulement sur le tableau de bord */}
                {currentView === 'dashboard' && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatCard title="Total" value={tickets.length} />
                        <StatCard title="En cours" value={(stats.IN_PROGRESS ?? 0) + (stats.PENDING ?? 0)} />
                        <StatCard title="Ouverts" value={stats.OPEN ?? 0} />
                        <StatCard title="Résolus" value={stats.RESOLVED ?? 0} />
                    </div>
                )}

                {/* Actions */}
                <Card className="p-4 flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Filtrer par numéro / statut / catégorie / description</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="ex: TK-1234 ou 'en cours' ou 'électricité'"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            <Button variant="outline" onClick={() => setFilter("")}>Réinitialiser</Button>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => user?.userId && fetchTickets(user.userId)}
                        disabled={loading}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Rafraîchir
                    </Button>
                </Card>

                {/* Liste */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            {currentView === 'urgent' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                            {currentView === 'history' && <History className="h-5 w-5 text-muted-foreground" />}
                            <CardTitle>
                                {currentView === 'tickets' && 'Tickets assignés'}
                                {currentView === 'urgent' && 'Tickets urgents'}
                                {currentView === 'history' && 'Historique des tickets'}
                                {currentView === 'dashboard' && 'Tickets assignés'}
                                {' '}({filteredTickets.length})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Chargement...</p>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">
                                    {currentView === 'urgent' && "Aucun ticket urgent."}
                                    {currentView === 'history' && "Aucun ticket dans l'historique."}
                                    {currentView === 'tickets' && "Aucun ticket assigné."}
                                    {currentView === 'dashboard' && "Aucun ticket."}
                                </p>
                            </div>
                        ) : (
                            filteredTickets.map((t) => (
                                <div key={t.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 rounded-md border bg-muted/40">
                                    <div>
                                        <p className="font-semibold text-card-foreground">{t.ticketNumber}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {t.categoryName} • {t.hotelName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Créé le {new Date(t.createdAt).toLocaleDateString("fr-FR")}</p>
                                        {t.resolvedAt && (
                                            <p className="text-xs text-muted-foreground">Résolu le {new Date(t.resolvedAt).toLocaleDateString("fr-FR")}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground truncate max-w-xl">{t.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant={statusVariants[t.status] || "outline"} className="capitalize">
                                            {statusLabels[t.status] || t.status}
                                        </Badge>
                                        {t.isUrgent && <Badge variant="destructive">Urgent</Badge>}
                                        {t.status === "OPEN" || t.status === "PENDING" ? (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => updateStatus(t, "IN_PROGRESS")}
                                                disabled={updating === t.id}
                                            >
                                                <Wrench className="h-4 w-4 mr-1" />
                                                En cours
                                            </Button>
                                        ) : null}
                                        {t.status === "IN_PROGRESS" ? (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                onClick={() => updateStatus(t, "RESOLVED")}
                                                disabled={updating === t.id}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Marquer résolu
                                            </Button>
                                        ) : null}
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

export default TechnicianDashboard;

