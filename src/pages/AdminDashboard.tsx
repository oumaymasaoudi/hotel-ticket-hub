import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiService, TicketResponse, Hotel } from "@/services/apiService";
import { TicketDetailDialog } from "@/components/tickets/TicketDetailDialog";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/PaginationControls";
import { generateMonthlyReportPDF, generatePerformanceReportCSV } from "@/utils/exportUtils";
import { AdvancedFilters, FilterState } from "@/components/AdvancedFilters";
import {
    RefreshCw,
    Search,
    AlertTriangle,
    CheckCircle,
    Clock,
    Users,
    FileText,
    Eye,
    UserPlus,
    ArrowUp,
    Download,
    Edit,
    Trash2,
    CreditCard,
    Star,
    Crown,
    Zap
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type StatusKey = TicketResponse["status"];

const statusLabels: Record<StatusKey, string> = {
    OPEN: "Ouvert",
    IN_PROGRESS: "En cours",
    PENDING: "En attente",
    RESOLVED: "Résolu",
    CLOSED: "Clôturé",
    ESCALATED: "Escaladé",
};

const statusVariants: Record<StatusKey, "default" | "secondary" | "destructive" | "outline"> = {
    OPEN: "destructive",
    IN_PROGRESS: "secondary",
    PENDING: "outline",
    RESOLVED: "default",
    CLOSED: "default",
    ESCALATED: "destructive",
};

const AdminDashboard = () => {
    const { user, hotelId, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [loadingTechnicians, setLoadingTechnicians] = useState(false);
    const [loadingSubscription, setLoadingSubscription] = useState(false);
    const [filter] = useState("");
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
    const [assigning, setAssigning] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [specialtySearch, setSpecialtySearch] = useState("");
    const [addTechnicianDialogOpen, setAddTechnicianDialogOpen] = useState(false);
    const [creatingTechnician, setCreatingTechnician] = useState(false);
    const [newTechnician, setNewTechnician] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
    });
    const [editTechnicianDialogOpen, setEditTechnicianDialogOpen] = useState(false);
    const [editingTechnician, setEditingTechnician] = useState(false);
    const [selectedTechnicianForEdit, setSelectedTechnicianForEdit] = useState<any>(null);
    const [editTechnicianForm, setEditTechnicianForm] = useState({
        email: "",
        fullName: "",
        phone: "",
        password: "",
        isActive: true,
    });
    const [deletingTechnician, setDeletingTechnician] = useState(false);

    // ✅ Détecter la route active pour afficher le bon contenu
    const currentView = useMemo(() => {
        const path = location.pathname;
        if (path.includes('/tickets')) return 'tickets';
        if (path.includes('/technicians')) return 'technicians';
        if (path.includes('/escalations')) return 'escalations';
        if (path.includes('/payment')) return 'payments'; // Note: menu utilise "payment" mais on garde "payments" pour la cohérence
        if (path.includes('/reports')) return 'reports';
        return 'dashboard'; // Par défaut, afficher le tableau de bord
    }, [location.pathname]);

    const fetchTickets = useCallback(async (hotelIdParam: string) => {
        setLoading(true);
        try {
            const data = await apiService.getTicketsByHotel(hotelIdParam);
            setTickets(data || []); // S'assurer que tickets est toujours un tableau
        } catch (error: any) {
            const errorMessage = error.message || "Impossible de récupérer les tickets";

            // Initialize with empty array so dashboard still displays
            setTickets([]);

            // Si c'est une erreur 402 (Payment Required), afficher un message spécifique
            if (errorMessage.includes("402") || errorMessage.includes("Payment Required") || errorMessage.includes("Paiement")) {
                toast({
                    title: "Paiement en retard",
                    description: "Votre abonnement nécessite un paiement. Certaines fonctionnalités peuvent être limitées.",
                    variant: "destructive",
                });
            } else if (!errorMessage.includes("Session expirée") && !errorMessage.includes("401")) {
                // Ne pas afficher de toast pour les erreurs d'authentification (redirection automatique)
                toast({
                    title: "Erreur",
                    description: errorMessage,
                    variant: "destructive",
                });
            }

            if (errorMessage.includes("Session expirée") || errorMessage.includes("401")) {
                setTimeout(() => navigate("/login"), 2000);
            }
        } finally {
            setLoading(false);
        }
    }, [toast, navigate]);

    const fetchHotel = useCallback(async (hotelIdParam: string) => {
        try {
            const data = await apiService.getHotelById(hotelIdParam);
            setHotel(data);
        } catch (error: any) {
            // Silent error - hotel is not required to display dashboard
            // This can happen if payment is overdue (402) or other error
            setHotel(null); // Ensure hotel is null on error
        }
    }, []);

    const fetchTechnicians = useCallback(async (hotelIdParam: string) => {
        if (!hotelIdParam) {
            return;
        }

        setLoadingTechnicians(true);
        try {
            const data = await apiService.getTechniciansByHotel(hotelIdParam);

            if (Array.isArray(data)) {
                setTechnicians(data);
            } else {
                setTechnicians([]);
            }
        } catch (error: any) {
            setTechnicians([]);

            // Message d'erreur plus spécifique
            const errorMessage = error.message || "Impossible de charger les techniciens";
            const isConnectionError = errorMessage.includes('backend n\'est pas accessible') ||
                errorMessage.includes('ERR_CONNECTION_REFUSED') ||
                errorMessage.includes('Failed to fetch');

            toast({
                title: isConnectionError ? "Serveur backend inaccessible" : "Erreur",
                description: isConnectionError
                    ? "Le serveur backend n'est pas démarré. Veuillez démarrer le backend Spring Boot sur le port 8080."
                    : errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoadingTechnicians(false);
        }
    }, [toast]);

    const fetchPlans = useCallback(async () => {
        try {
            const data = await apiService.getAllPlans();
            setPlans(data || []);
        } catch (error: any) {
            setPlans([]);
        }
    }, []);

    const fetchSubscription = useCallback(async (hotelIdParam: string) => {
        if (!hotelIdParam) return;

        setLoadingSubscription(true);
        try {
            const data = await apiService.getHotelSubscription(hotelIdParam);
            setCurrentSubscription(data.exists === false ? null : data);
        } catch (error: any) {
            setCurrentSubscription(null);
        } finally {
            setLoadingSubscription(false);
        }
    }, []);

    // Fonction pour assigner un technicien à un ticket
    const handleAssignTechnician = useCallback(async (ticketId: string, technicianId: string) => {
        if (!user?.userId) return;

        setAssigning(true);
        try {
            await apiService.updateTicketStatus(ticketId, 'IN_PROGRESS', user.userId, technicianId);
            toast({
                title: "Technicien assigné",
                description: "Le technicien a été assigné au ticket avec succès.",
            });
            // Recharger les tickets
            if (hotelId) {
                await fetchTickets(hotelId);
            }
            setAssignDialogOpen(false);
            setSelectedTicket(null);
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de l'assignation du technicien",
                variant: "destructive",
            });
        } finally {
            setAssigning(false);
        }
    }, [user?.userId, hotelId, fetchTickets, toast]);

    // Filtrer les techniciens selon la catégorie du ticket et la recherche
    const filteredTechnicians = useMemo(() => {
        if (technicians.length === 0) return technicians;

        let filtered = technicians;

        // Filtrage par catégorie du ticket (si un ticket est sélectionné)
        if (selectedTicket) {
            const ticketCategory = selectedTicket.categoryName?.toLowerCase() || '';

            // Mapping des catégories vers les spécialités potentielles
            const categoryToSpecialtyMap: Record<string, string[]> = {
                'plomberie': ['plomberie', 'plombier', 'eau', 'sanitaire'],
                'électricité': ['électricité', 'électricien', 'électrique'],
                'climatisation': ['climatisation', 'chauffage', 'ventilation'],
                'wifi/internet': ['wifi', 'internet', 'réseau', 'informatique'],
                'serrurerie': ['serrurerie', 'serrurier', 'sécurité'],
                'mobilier': ['mobilier', 'menuiserie', 'réparation'],
                'sanitaires': ['sanitaire', 'plomberie', 'hygiène'],
                'insonorisation': ['insonorisation', 'acoustique'],
                'nettoyage': ['nettoyage', 'ménage'],
                'sécurité': ['sécurité', 'serrurerie'],
                'restauration': ['restauration', 'cuisine'],
                'approvisionnement': ['approvisionnement', 'logistique'],
            };

            // Trouver les spécialités correspondantes
            const matchingSpecialties = categoryToSpecialtyMap[ticketCategory] || [];

            // Filtrer les techniciens qui ont une spécialité correspondante
            if (matchingSpecialties.length > 0) {
                filtered = filtered.filter((tech: any) => {
                    // Si le technicien n'a pas de spécialités, l'inclure quand même
                    if (!tech.specialties || tech.specialties.length === 0) {
                        return true;
                    }

                    // Vérifier si au moins une spécialité du technicien correspond
                    return tech.specialties.some((specialty: string) =>
                        matchingSpecialties.some(match =>
                            specialty.toLowerCase().includes(match.toLowerCase()) ||
                            match.toLowerCase().includes(specialty.toLowerCase())
                        )
                    );
                });
            }
        }

        // Filtrage par recherche de spécialité
        if (specialtySearch.trim()) {
            const searchLower = specialtySearch.toLowerCase().trim();
            filtered = filtered.filter((tech: any) => {
                // Rechercher dans le nom
                const nameMatch = tech.fullName?.toLowerCase().includes(searchLower) ||
                    tech.email?.toLowerCase().includes(searchLower);

                // Rechercher dans les spécialités
                const specialtyMatch = tech.specialties?.some((specialty: string) =>
                    specialty.toLowerCase().includes(searchLower)
                ) || false;

                return nameMatch || specialtyMatch;
            });
        }

        return filtered;
    }, [selectedTicket, technicians, specialtySearch]);

    useEffect(() => {
        if (!authLoading && user?.userId && hotelId) {
            // Charger les tickets en priorité (nécessaire pour le dashboard)
            fetchTickets(hotelId);
            // Charger l'hôtel en arrière-plan (optionnel, ne bloque pas l'affichage)
            fetchHotel(hotelId);
            // Charger les techniciens pour le dashboard
            fetchTechnicians(hotelId);
        }
    }, [authLoading, user?.userId, hotelId, fetchTickets, fetchHotel, fetchTechnicians]);

    // Charger les données spécifiques selon la vue active
    useEffect(() => {
        if (authLoading || !hotelId) return;

        if (currentView === 'technicians') {
            fetchTechnicians(hotelId);
        } else if (currentView === 'payments') {
            fetchPlans();
            fetchSubscription(hotelId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, hotelId, currentView]);

    const filteredTickets = useMemo(() => {
        let filtered = tickets;
        if (filter.trim()) {
            const f = filter.toLowerCase();
            filtered = filtered.filter(t =>
                t.ticketNumber.toLowerCase().includes(f) ||
                t.description?.toLowerCase().includes(f) ||
                t.clientEmail?.toLowerCase().includes(f)
            );
        }
        return filtered;
    }, [tickets, filter]);

    // Statistiques
    const stats = useMemo(() => {
        const total = tickets.length;
        const open = tickets.filter(t => t.status === 'OPEN').length;
        const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
        const resolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
        const escalated = tickets.filter(t => t.status === 'ESCALATED').length;
        const urgent = tickets.filter(t => t.isUrgent).length;
        return { total, open, inProgress, resolved, escalated, urgent };
    }, [tickets]);

    // Données pour le graphique en donut (tickets par statut)
    const statusChartData = useMemo(() => {
        const statusCounts = {
            'OPEN': tickets.filter(t => t.status === 'OPEN').length,
            'IN_PROGRESS': tickets.filter(t => t.status === 'IN_PROGRESS').length,
            'RESOLVED': tickets.filter(t => t.status === 'RESOLVED').length,
            'CLOSED': tickets.filter(t => t.status === 'CLOSED').length,
            'ESCALATED': tickets.filter(t => t.status === 'ESCALATED').length,
        };

        return [
            { name: 'Ouvert', value: statusCounts.OPEN, color: '#3b82f6' },
            { name: 'En cours', value: statusCounts.IN_PROGRESS, color: '#f59e0b' },
            { name: 'Résolu', value: statusCounts.RESOLVED, color: '#10b981' },
            { name: 'Clôturé', value: statusCounts.CLOSED, color: '#6b7280' },
            { name: 'Escaladé', value: statusCounts.ESCALATED, color: '#ef4444' },
        ].filter(item => item.value > 0);
    }, [tickets]);

    // Données pour le graphique d'évolution sur 7 jours
    const evolutionData = useMemo(() => {
        const days = ['Samedi', 'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        const today = new Date();
        const data = days.map((day, index) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - index));
            const dateStr = date.toISOString().split('T')[0];

            const created = tickets.filter(t => {
                if (!t.createdAt) return false;
                const ticketDate = new Date(t.createdAt).toISOString().split('T')[0];
                return ticketDate === dateStr;
            }).length;

            const resolved = tickets.filter(t => {
                if (!t.resolvedAt) return false;
                const ticketDate = new Date(t.resolvedAt).toISOString().split('T')[0];
                return ticketDate === dateStr;
            }).length;

            return { day, Créés: created, Résolus: resolved };
        });
        return data;
    }, [tickets]);

    // Données pour le graphique de performance des techniciens
    const technicianPerformanceData = useMemo(() => {
        const techMap = new Map<string, { assigned: number; resolved: number }>();

        tickets.forEach(ticket => {
            if (ticket.assignedTechnicianName) {
                const techName = ticket.assignedTechnicianName;
                if (!techMap.has(techName)) {
                    techMap.set(techName, { assigned: 0, resolved: 0 });
                }
                const stats = techMap.get(techName)!;
                stats.assigned++;
                if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
                    stats.resolved++;
                }
            }
        });

        return Array.from(techMap.entries()).map(([name, stats]) => ({
            name: name.length > 10 ? name.substring(0, 10) + '...' : name,
            Assignés: stats.assigned,
            Résolus: stats.resolved,
        }));
    }, [tickets]);

    // Tickets récents (5 derniers)
    const recentTickets = useMemo(() => {
        return [...tickets]
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 5);
    }, [tickets]);

    // Techniciens actifs
    const activeTechnicians = useMemo(() => {
        const techSet = new Set<string>();
        tickets.forEach(ticket => {
            if (ticket.assignedTechnicianName) {
                techSet.add(ticket.assignedTechnicianName);
            }
        });
        return Array.from(techSet).slice(0, 5);
    }, [tickets]);

    // Vue Dashboard (statistiques)
    const DashboardView = () => (
        <div className="space-y-6">
            {/* KPIs en haut */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tickets ouverts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.open}</div>
                        <p className="text-xs text-muted-foreground">En attente de traitement</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Résolus</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.resolved}</div>
                        <p className="text-xs text-muted-foreground">Tickets clôturés</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Escaladés</CardTitle>
                        <ArrowUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.escalated}</div>
                        <p className="text-xs text-muted-foreground">Tickets escaladés</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Techniciens</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{technicians.length > 0 ? technicians.length : activeTechnicians.length}</div>
                        <p className="text-xs text-muted-foreground">Techniciens actifs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphiques */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Graphique en donut - Tickets par statut */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tickets par statut</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {statusChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                Aucun ticket
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Graphique linéaire - Évolution sur 7 jours */}
                <Card>
                    <CardHeader>
                        <CardTitle>Évolution sur 7 jours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={evolutionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Créés" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="Résolus" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Graphique en barres - Performance techniciens */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance techniciens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {technicianPerformanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={technicianPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Assignés" fill="#3b82f6" />
                                    <Bar dataKey="Résolus" fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                Aucun technicien assigné
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Listes en bas */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Tickets récents */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tickets récents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTickets.length > 0 ? (
                            <div className="space-y-3">
                                {recentTickets.map((ticket) => (
                                    <div key={ticket.id} className="flex items-center justify-between p-2 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-medium">{ticket.ticketNumber}</div>
                                                <div className="text-sm text-muted-foreground">{ticket.categoryName || 'Sans catégorie'}</div>
                                            </div>
                                        </div>
                                        <Badge variant={statusVariants[ticket.status]}>
                                            {statusLabels[ticket.status]}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucun ticket récent
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Techniciens actifs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Techniciens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingTechnicians ? (
                            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
                        ) : technicians.length > 0 ? (
                            <div className="space-y-3">
                                {technicians.slice(0, 5).map((tech: any) => (
                                    <div key={tech.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <div className="font-medium">{tech.fullName || tech.email || 'Technicien'}</div>
                                            {tech.email && tech.fullName && (
                                                <div className="text-sm text-muted-foreground">{tech.email}</div>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {tech.isActive !== false ? 'Actif' : 'Inactif'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : activeTechnicians.length > 0 ? (
                            <div className="space-y-3">
                                {activeTechnicians.map((techName, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <div className="font-medium">{techName}</div>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Actif
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucun technicien
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {hotel && (
                <Card>
                    <CardHeader>
                        <CardTitle>Informations de l'hôtel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <span className="font-medium">Nom :</span> {hotel.name}
                        </div>
                        {hotel.email && (
                            <div>
                                <span className="font-medium">Email :</span> {hotel.email}
                            </div>
                        )}
                        {hotel.phone && (
                            <div>
                                <span className="font-medium">Téléphone :</span> {hotel.phone}
                            </div>
                        )}
                        {hotel.address && (
                            <div>
                                <span className="font-medium">Adresse :</span> {hotel.address}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {stats.urgent > 0 && (
                <Card className="border-destructive/40 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Tickets urgents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            Vous avez <strong>{stats.urgent}</strong> ticket(s) urgent(s) nécessitant une attention immédiate.
                        </p>
                        <Button
                            variant="destructive"
                            className="mt-4"
                            onClick={() => navigate('/dashboard/admin/tickets?urgent=true')}
                        >
                            Voir les tickets urgents
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    // Vue Tickets avec table formatée
    const TicketsView = () => {
        const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
            search: "",
            status: "all",
            categoryId: "all",
            technicianId: "all",
            dateFrom: null,
            dateTo: null,
            isUrgent: null,
        });
        const showUrgent = new URLSearchParams(location.search).get('urgent') === 'true';

        // Préparer les catégories pour les filtres
        const categoriesForFilters = useMemo(() => {
            const uniqueCategories = new Map();
            filteredTickets.forEach(ticket => {
                if (ticket.categoryId && ticket.categoryName) {
                    uniqueCategories.set(ticket.categoryId, {
                        id: ticket.categoryId,
                        name: ticket.categoryName,
                        color: ticket.categoryColor || '#3b82f6'
                    });
                }
            });
            return Array.from(uniqueCategories.values());
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [filteredTickets]);

        const displayTickets = useMemo(() => {
            let filtered = filteredTickets;

            // Filtre urgent (depuis URL)
            if (showUrgent) {
                filtered = filtered.filter(t => t.isUrgent);
            }

            // Filtres avancés
            if (advancedFilters.search) {
                const search = advancedFilters.search.toLowerCase();
                filtered = filtered.filter(t =>
                    t.ticketNumber.toLowerCase().includes(search) ||
                    t.clientEmail?.toLowerCase().includes(search) ||
                    t.description?.toLowerCase().includes(search) ||
                    t.categoryName?.toLowerCase().includes(search)
                );
            }

            if (advancedFilters.status !== "all") {
                filtered = filtered.filter(t => t.status === advancedFilters.status);
            }

            if (advancedFilters.categoryId !== "all") {
                filtered = filtered.filter(t => t.categoryId === advancedFilters.categoryId);
            }

            if (advancedFilters.technicianId !== "all") {
                if (advancedFilters.technicianId === "unassigned") {
                    filtered = filtered.filter(t => !t.assignedTechnicianId);
                } else {
                    filtered = filtered.filter(t => t.assignedTechnicianId === advancedFilters.technicianId);
                }
            }

            if (advancedFilters.isUrgent !== null) {
                filtered = filtered.filter(t => t.isUrgent === advancedFilters.isUrgent);
            }

            if (advancedFilters.dateFrom) {
                filtered = filtered.filter(t => {
                    const ticketDate = new Date(t.createdAt);
                    return ticketDate >= advancedFilters.dateFrom!;
                });
            }

            if (advancedFilters.dateTo) {
                filtered = filtered.filter(t => {
                    const ticketDate = new Date(t.createdAt);
                    const endDate = new Date(advancedFilters.dateTo!);
                    endDate.setHours(23, 59, 59, 999);
                    return ticketDate <= endDate;
                });
            }

            return filtered;
        }, [showUrgent, advancedFilters]);

        const pagination = usePagination({
            items: displayTickets,
            itemsPerPage: 10,
        });

        return (
            <div className="space-y-4">
                <AdvancedFilters
                    onFilterChange={setAdvancedFilters}
                    categories={categoriesForFilters}
                    technicians={technicians}
                />

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Chargement...</div>
                ) : displayTickets.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            {showUrgent ? "Aucun ticket urgent" : "Aucun ticket trouvé"}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Numéro</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Technicien</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pagination.paginatedItems.map((ticket) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                                            <TableCell>
                                                <Badge style={{ backgroundColor: ticket.categoryColor || '#3b82f6' }}>
                                                    {ticket.categoryName}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{ticket.clientEmail}</TableCell>
                                            <TableCell>
                                                {ticket.assignedTechnicianName || "Non assigné"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariants[ticket.status]}>
                                                    {statusLabels[ticket.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedTicket(ticket);
                                                            setDetailDialogOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedTicket(ticket);
                                                            setAssignDialogOpen(true);
                                                        }}
                                                    >
                                                        <UserPlus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {pagination.totalPages > 1 && (
                            <div className="px-6 pb-4">
                                <PaginationControls
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    itemsPerPage={pagination.itemsPerPage}
                                    totalItems={pagination.totalItems}
                                    startIndex={pagination.startIndex}
                                    endIndex={pagination.endIndex}
                                    onPageChange={pagination.goToPage}
                                    onItemsPerPageChange={pagination.setItemsPerPage}
                                />
                            </div>
                        )}
                    </Card>
                )}
            </div>
        );
    };

    // Vue Techniciens avec table
    const TechniciansView = () => {

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <CardTitle>Gestion des techniciens</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (hotelId) {
                                    fetchTechnicians(hotelId);
                                }
                            }}
                            disabled={loadingTechnicians}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loadingTechnicians ? 'animate-spin' : ''}`} />
                            Rafraîchir
                        </Button>
                        <Button onClick={() => setAddTechnicianDialogOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            + Ajouter technicien
                        </Button>
                    </div>
                </div>

                {loadingTechnicians ? (
                    <div className="text-center py-8 text-muted-foreground">Chargement...</div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Téléphone</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Spécialités</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!technicians || technicians.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="space-y-2">
                                                    <p className="text-muted-foreground">Aucun technicien trouvé</p>
                                                    {hotelId && (
                                                        <div className="mt-2 text-xs space-y-1">
                                                            <p className="text-muted-foreground">Hotel ID: {hotelId}</p>
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                onClick={() => hotelId && fetchTechnicians(hotelId)}
                                                                className="mt-2"
                                                            >
                                                                Réessayer
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-xs text-left max-w-md mx-auto">
                                                        <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                                            💡 Astuce
                                                        </p>
                                                        <p className="text-yellow-700 dark:text-yellow-300">
                                                            Si vous voyez des erreurs "ERR_CONNECTION_REFUSED" dans la console,
                                                            assurez-vous que le backend Spring Boot est démarré sur le port 8080.
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        technicians.map((tech: any, index: number) => {
                                            // Utiliser un identifiant unique pour la clé
                                            const techKey = tech.id || tech.userId || `tech-${index}`;
                                            return (
                                                <TableRow key={techKey}>
                                                    <TableCell className="font-medium">
                                                        {tech.fullName || tech.email || `Technicien ${index + 1}`}
                                                    </TableCell>
                                                    <TableCell>{tech.phone || "N/A"}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {tech.email || "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {tech.specialties && Array.isArray(tech.specialties) && tech.specialties.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {tech.specialties.map((specialty: string, idx: number) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                        {specialty}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">Aucune</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={tech.isActive !== false ? "default" : "secondary"}>
                                                            {tech.isActive !== false ? "Actif" : "Inactif"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedTechnicianForEdit(tech);
                                                                    setEditTechnicianForm({
                                                                        email: tech.email || "",
                                                                        fullName: tech.fullName || "",
                                                                        phone: tech.phone || "",
                                                                        password: "",
                                                                        isActive: tech.isActive !== false,
                                                                    });
                                                                    setEditTechnicianDialogOpen(true);
                                                                }}
                                                                title="Modifier"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={async () => {
                                                                    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le technicien ${tech.fullName || tech.email} ? Cette action est irréversible.`)) {
                                                                        setDeletingTechnician(true);
                                                                        try {
                                                                            await apiService.deleteTechnician(tech.id);
                                                                            toast({
                                                                                title: "Technicien supprimé",
                                                                                description: `Le technicien ${tech.fullName || tech.email} a été supprimé avec succès`,
                                                                            });
                                                                            // Recharger la liste
                                                                            if (hotelId) {
                                                                                await fetchTechnicians(hotelId);
                                                                            }
                                                                        } catch (error: any) {
                                                                            toast({
                                                                                title: "Erreur",
                                                                                description: error.message || "Erreur lors de la suppression du technicien",
                                                                                variant: "destructive",
                                                                            });
                                                                        } finally {
                                                                            setDeletingTechnician(false);
                                                                        }
                                                                    }
                                                                }}
                                                                title="Supprimer"
                                                                disabled={deletingTechnician}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    // Vue Escalades avec statistiques et table
    const EscalationsView = () => {
        const escalatableTickets = useMemo(() => {
            return filteredTickets.filter(t =>
                t.status === 'OPEN' ||
                t.status === 'IN_PROGRESS' ||
                (t.slaDeadline && new Date(t.slaDeadline) < new Date())
            );
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [filteredTickets]);

        const escalatedCount = tickets.filter(t => t.isUrgent).length;
        const slaExceededCount = tickets.filter(t =>
            t.slaDeadline && new Date(t.slaDeadline) < new Date()
        ).length;

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">À escalader</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{escalatableTickets.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Déjà escaladés</CardTitle>
                            <ArrowUp className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{escalatedCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">SLA dépassés</CardTitle>
                            <Clock className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{slaExceededCount}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <div>
                        <CardTitle className="mb-2">Tickets pouvant être escaladés</CardTitle>
                        <p className="text-sm text-muted-foreground mb-4">
                            Escaladez les tickets complexes vers le SuperAdmin
                        </p>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Numéro</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Technicien</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>SLA</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {escalatableTickets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Aucun ticket à escalader
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        escalatableTickets.map((ticket) => (
                                            <TableRow key={ticket.id}>
                                                <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                                                <TableCell>
                                                    <Badge style={{ backgroundColor: ticket.categoryColor || '#3b82f6' }}>
                                                        {ticket.categoryName}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{ticket.assignedTechnicianName || "Non assigné"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={statusVariants[ticket.status]}>
                                                        {statusLabels[ticket.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date() ? (
                                                        <Badge variant="destructive">SLA dépassé</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Dans les temps</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="destructive" size="sm">
                                                            <ArrowUp className="h-4 w-4 mr-1" />
                                                            Escalader
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    // Vue Paiements avec cartes de plans
    const PaymentsView = () => {
        const [searchParams] = useSearchParams();

        // Vérifier si l'utilisateur revient de Stripe
        useEffect(() => {
            const success = searchParams.get('success');
            const canceled = searchParams.get('canceled');
            const sessionId = searchParams.get('session_id');

            if (success === 'true' && sessionId) {
                toast({
                    title: "Paiement réussi !",
                    description: "Votre abonnement a été activé avec succès.",
                });
                // Recharger l'abonnement
                if (hotelId) {
                    fetchSubscription(hotelId);
                }
                // Nettoyer l'URL
                window.history.replaceState({}, '', '/dashboard/admin/payment');
            } else if (canceled === 'true') {
                toast({
                    title: "Paiement annulé",
                    description: "Le paiement a été annulé. Vous pouvez réessayer à tout moment.",
                    variant: "default",
                });
                // Nettoyer l'URL
                window.history.replaceState({}, '', '/dashboard/admin/payment');
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [searchParams, fetchSubscription]);

        const defaultPlans = [
            { id: '1', name: 'Starter', price: 99, icon: Zap, features: ['50 tickets par mois', '2 techniciens maximum', 'SLA 48 heures', 'Support email'] },
            { id: '2', name: 'Pro', price: 199, icon: Star, features: ['150 tickets par mois', '5 techniciens maximum', 'SLA 24 heures', 'Support prioritaire', 'Rapports avancés'], popular: true },
            { id: '3', name: 'Enterprise', price: 399, icon: Crown, features: ['500 tickets par mois', 'Techniciens illimités', 'SLA 8 heures', 'Support dédié 24/7', 'Rapports personnalisés', 'Option urgence'] },
        ];

        const displayPlans = plans.length > 0 ? plans.map(p => ({
            id: p.id,
            name: p.name,
            price: p.baseCost,
            icon: p.name === 'BASIC' || p.name === 'Starter' ? Zap : p.name === 'PRO' || p.name === 'Pro' ? Star : Crown,
            features: [
                `${p.ticketQuota} tickets par mois`,
                p.maxTechnicians === 999 ? 'Techniciens illimités' : `${p.maxTechnicians} techniciens maximum`,
                `SLA ${p.slaHours} heures`,
                'Support email',
            ],
            popular: p.name === 'PRO' || p.name === 'Pro',
        })) : defaultPlans;

        const isCurrentPlan = (planId: string) => {
            return currentSubscription && currentSubscription.planId === planId;
        };

        return (
            <div className="space-y-6">
                <div>
                    <CardTitle className="text-2xl mb-2">Gestion de l'abonnement</CardTitle>
                    <p className="text-muted-foreground">
                        Gérez votre abonnement et choisissez le plan adapté à vos besoins
                    </p>
                </div>

                {/* Affichage de l'abonnement actuel */}
                {loadingSubscription ? (
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-center text-muted-foreground">Chargement de l'abonnement...</p>
                        </CardContent>
                    </Card>
                ) : currentSubscription ? (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Abonnement actuel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Plan:</span>
                                <span className="font-semibold">{currentSubscription.planName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Prix:</span>
                                <span className="font-semibold">{currentSubscription.planBaseCost}€/mois</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Statut:</span>
                                <Badge variant={currentSubscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {currentSubscription.status === 'ACTIVE' ? 'Actif' : currentSubscription.status}
                                </Badge>
                            </div>
                            {currentSubscription.endDate && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date d'expiration:</span>
                                    <span>{new Date(currentSubscription.endDate).toLocaleDateString('fr-FR')}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-orange-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-500">
                                Aucun abonnement actif
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Vous n'avez pas d'abonnement actif. Veuillez choisir un plan ci-dessous.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div>
                    <CardTitle className="text-xl mb-4">Plans disponibles</CardTitle>
                    <div className="grid gap-6 md:grid-cols-3">
                        {displayPlans.map((plan) => {
                            const isCurrent = isCurrentPlan(plan.id);
                            return (
                                <Card key={plan.id} className={plan.popular ? "border-primary" : isCurrent ? "border-green-500" : ""}>
                                    {plan.popular && !isCurrent && (
                                        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium rounded-t-lg">
                                            Populaire
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div className="bg-green-500 text-white text-center py-1 text-sm font-medium rounded-t-lg">
                                            Plan actuel
                                        </div>
                                    )}
                                    <CardHeader className="text-center">
                                        <plan.icon className="h-12 w-12 mx-auto mb-2 text-primary" />
                                        <CardTitle>{plan.name}</CardTitle>
                                        <div className="text-3xl font-bold mt-2">
                                            {plan.price}€<span className="text-sm font-normal text-muted-foreground">/mois</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            className="w-full"
                                            variant={isCurrent ? "secondary" : plan.popular ? "default" : "outline"}
                                            disabled={isCurrent || loadingSubscription}
                                            onClick={async () => {
                                                if (!isCurrent && hotelId) {
                                                    // Vérifier que le plan a un ID valide (UUID)
                                                    if (!plan.id || plan.id.length < 30) {
                                                        toast({
                                                            title: "Erreur",
                                                            description: "Les plans ne sont pas encore chargés. Veuillez patienter ou recharger la page.",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }

                                                    try {
                                                        setLoadingSubscription(true);
                                                        const session = await apiService.createStripeCheckoutSession(hotelId, plan.id);
                                                        // Rediriger vers Stripe Checkout
                                                        window.location.href = session.url;
                                                    } catch (error: any) {
                                                        const errorMessage = error.message || "Impossible de créer la session de paiement";

                                                        // Vérifier si c'est une erreur de connexion
                                                        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("ERR_CONNECTION_REFUSED") || errorMessage.includes("NetworkError")) {
                                                            toast({
                                                                title: "Backend non disponible",
                                                                description: "Le serveur backend n'est pas démarré. Veuillez démarrer le backend sur le port 8080.",
                                                                variant: "destructive",
                                                            });
                                                        } else if (errorMessage.includes("Clé API Stripe non configurée") || errorMessage.includes("Invalid API Key")) {
                                                            toast({
                                                                title: "Configuration Stripe requise",
                                                                description: "Veuillez configurer vos clés Stripe dans application.properties et redémarrer le backend. Consultez CONFIGURATION_STRIPE.md pour plus d'informations.",
                                                                variant: "destructive",
                                                            });
                                                        } else {
                                                            toast({
                                                                title: "Erreur",
                                                                description: errorMessage,
                                                                variant: "destructive",
                                                            });
                                                        }
                                                    } finally {
                                                        setLoadingSubscription(false);
                                                    }
                                                }
                                            }}
                                        >
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            {isCurrent ? "Plan actuel" : loadingSubscription ? "Chargement..." : "S'abonner"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                    Paiement sécurisé. Annulation possible à tout moment.
                </p>
            </div>
        );
    };

    // Vue Rapports avec cartes de téléchargement
    const ReportsView = () => {
        const [loadingReport, setLoadingReport] = useState(false);

        const handleDownloadPDF = async () => {
            if (!hotelId) {
                toast({
                    title: "Erreur",
                    description: "Hôtel non identifié",
                    variant: "destructive",
                });
                return;
            }

            setLoadingReport(true);
            try {
                const now = new Date();
                const reportData = await apiService.getMonthlyReport(
                    hotelId,
                    now.getFullYear(),
                    now.getMonth() + 1
                );
                generateMonthlyReportPDF(reportData, hotel?.name || 'Hôtel');
                toast({
                    title: "Succès",
                    description: "Rapport PDF téléchargé avec succès",
                });
            } catch (error: any) {
                toast({
                    title: "Erreur",
                    description: error.message || "Impossible de générer le rapport PDF",
                    variant: "destructive",
                });
            } finally {
                setLoadingReport(false);
            }
        };

        const handleDownloadExcel = async () => {
            if (!hotelId) {
                toast({
                    title: "Erreur",
                    description: "Hôtel non identifié",
                    variant: "destructive",
                });
                return;
            }

            setLoadingReport(true);
            try {
                const now = new Date();
                const reportData = await apiService.getMonthlyReport(
                    hotelId,
                    now.getFullYear(),
                    now.getMonth() + 1
                );
                generatePerformanceReportCSV(reportData, `rapport-performance-${hotel?.name || 'hotel'}-${now.getFullYear()}-${now.getMonth() + 1}.csv`);
                toast({
                    title: "Succès",
                    description: "Rapport CSV téléchargé avec succès",
                });
            } catch (error: any) {
                toast({
                    title: "Erreur",
                    description: error.message || "Impossible de générer le rapport CSV",
                    variant: "destructive",
                });
            } finally {
                setLoadingReport(false);
            }
        };

        return (
            <div className="space-y-6">
                <CardTitle>Rapports</CardTitle>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle>Rapport Mensuel des Tickets</CardTitle>
                                    <CardDescription>
                                        Statistiques complètes des tickets : ouverts, résolus, escaladés, répartition par catégorie.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleDownloadPDF} className="w-full" disabled={loadingReport}>
                                {loadingReport ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Génération...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger PDF
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle>Rapport Performance Techniciens</CardTitle>
                                    <CardDescription>
                                        Performance détaillée : tickets assignés, résolus, temps de résolution moyen.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleDownloadExcel} variant="outline" className="w-full" disabled={loadingReport}>
                                {loadingReport ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Génération...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger CSV
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Contenu des rapports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Rapport PDF</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                <li>Statistiques des tickets par statut</li>
                                <li>Performance des techniciens</li>
                                <li>Répartition par catégorie</li>
                                <li>Date de génération</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Rapport Excel</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                <li>Feuille résumé avec statistiques</li>
                                <li>Feuille détail techniciens</li>
                                <li>Liste complète des tickets</li>
                                <li>Données exportables et filtrables</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };


    // Rendu conditionnel selon la vue active
    const renderContent = () => {
        switch (currentView) {
            case 'tickets':
                return <TicketsView />;
            case 'technicians':
                return <TechniciansView />;
            case 'escalations':
                return <EscalationsView />;
            case 'payments':
                return <PaymentsView />;
            case 'reports':
                return <ReportsView />;
            default:
                return <DashboardView />;
        }
    };

    if (authLoading) {
        return (
            <DashboardLayout allowedRoles={["admin"]} title="Tableau de bord">
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            </DashboardLayout>
        );
    }

    if (!user?.userId || !hotelId) {
        return (
            <DashboardLayout allowedRoles={["admin"]} title="Tableau de bord">
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <p>Session expirée ou non autorisée.</p>
                        <Button onClick={() => navigate("/login")} className="mt-4">
                            Se connecter
                        </Button>
                    </CardContent>
                </Card>
            </DashboardLayout>
        );
    }

    // Fonction pour obtenir le titre selon la vue active
    const getPageTitle = () => {
        switch (currentView) {
            case 'tickets':
                return 'Gestion des tickets';
            case 'technicians':
                return 'Gestion des techniciens';
            case 'escalations':
                return 'Escalades';
            case 'payments':
                return 'Paiement et abonnement';
            case 'reports':
                return 'Rapports';
            default:
                return 'Tableau de bord';
        }
    };

    return (
        <>
            <DashboardLayout allowedRoles={["admin"]} title={getPageTitle()}>
                {renderContent()}
            </DashboardLayout>

            {/* Dialog pour assigner un technicien */}
            <Dialog open={assignDialogOpen} onOpenChange={(open) => {
                setAssignDialogOpen(open);
                if (!open) {
                    setSelectedTicket(null);
                    setSpecialtySearch("");
                }
            }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Assigner un technicien</DialogTitle>
                        <DialogDescription>
                            {selectedTicket && (
                                <>
                                    Sélectionnez un technicien pour le ticket <strong>{selectedTicket.ticketNumber}</strong>
                                    <br />
                                    Catégorie: <Badge style={{ backgroundColor: selectedTicket.categoryColor || '#3b82f6' }}>
                                        {selectedTicket.categoryName}
                                    </Badge>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Champ de recherche */}
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, email ou spécialité..."
                            value={specialtySearch}
                            onChange={(e) => setSpecialtySearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loadingTechnicians ? (
                            <div className="text-center py-8 text-muted-foreground">Chargement des techniciens...</div>
                        ) : filteredTechnicians.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucun technicien disponible
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredTechnicians.map((tech: any) => (
                                    <div
                                        key={tech.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => {
                                            if (selectedTicket && !assigning) {
                                                handleAssignTechnician(selectedTicket.id, tech.id);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Users className="h-5 w-5 text-muted-foreground" />
                                            <div className="flex-1">
                                                <div className="font-medium">{tech.fullName || tech.email}</div>
                                                {tech.email && tech.fullName && (
                                                    <div className="text-sm text-muted-foreground">{tech.email}</div>
                                                )}
                                                {tech.phone && (
                                                    <div className="text-sm text-muted-foreground">{tech.phone}</div>
                                                )}
                                                {tech.specialties && tech.specialties.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {tech.specialties.map((specialty: string, idx: number) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {specialty}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {tech.isActive !== false ? 'Actif' : 'Inactif'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <div className="flex items-center justify-between w-full">
                            <div className="text-sm text-muted-foreground">
                                {filteredTechnicians.length} technicien{filteredTechnicians.length > 1 ? 's' : ''} trouvé{filteredTechnicians.length > 1 ? 's' : ''}
                            </div>
                            <Button variant="outline" onClick={() => {
                                setAssignDialogOpen(false);
                                setSelectedTicket(null);
                                setSpecialtySearch("");
                            }}>
                                Annuler
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de détails du ticket */}
            {selectedTicket && (
                <TicketDetailDialog
                    ticket={selectedTicket}
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                />
            )}

            {/* Dialog pour ajouter un technicien */}
            <Dialog open={addTechnicianDialogOpen} onOpenChange={setAddTechnicianDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Ajouter un technicien</DialogTitle>
                        <DialogDescription>
                            Créez un nouveau compte technicien pour votre hôtel
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nom complet *</Label>
                            <Input
                                id="fullName"
                                placeholder="Jean Dupont"
                                value={newTechnician.fullName}
                                onChange={(e) => setNewTechnician({ ...newTechnician, fullName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="technicien@example.com"
                                value={newTechnician.email}
                                onChange={(e) => setNewTechnician({ ...newTechnician, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+33612345678"
                                value={newTechnician.phone}
                                onChange={(e) => setNewTechnician({ ...newTechnician, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Laissez vide pour un mot de passe par défaut"
                                value={newTechnician.password}
                                onChange={(e) => setNewTechnician({ ...newTechnician, password: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Si vide, le mot de passe par défaut sera "Technician123!"
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setAddTechnicianDialogOpen(false);
                                setNewTechnician({ email: "", password: "", fullName: "", phone: "" });
                            }}
                            disabled={creatingTechnician}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!newTechnician.email || !newTechnician.fullName) {
                                    toast({
                                        title: "Erreur",
                                        description: "L'email et le nom complet sont obligatoires",
                                        variant: "destructive",
                                    });
                                    return;
                                }

                                if (!hotelId) {
                                    toast({
                                        title: "Erreur",
                                        description: "Impossible de déterminer l'hôtel",
                                        variant: "destructive",
                                    });
                                    return;
                                }

                                setCreatingTechnician(true);
                                try {
                                    await apiService.createTechnician({
                                        email: newTechnician.email,
                                        password: newTechnician.password || "Technician123!",
                                        fullName: newTechnician.fullName,
                                        phone: newTechnician.phone || undefined,
                                        hotelId: hotelId,
                                    });

                                    toast({
                                        title: "Succès",
                                        description: "Le technicien a été créé avec succès",
                                    });

                                    // Réinitialiser le formulaire
                                    setNewTechnician({ email: "", password: "", fullName: "", phone: "" });
                                    setAddTechnicianDialogOpen(false);

                                    // Recharger la liste des techniciens
                                    if (hotelId) {
                                        await fetchTechnicians(hotelId);
                                    }
                                } catch (error: any) {
                                    toast({
                                        title: "Erreur",
                                        description: error.message || "Erreur lors de la création du technicien",
                                        variant: "destructive",
                                    });
                                } finally {
                                    setCreatingTechnician(false);
                                }
                            }}
                            disabled={creatingTechnician || !newTechnician.email || !newTechnician.fullName}
                        >
                            {creatingTechnician ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                "Créer le technicien"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog pour modifier un technicien */}
            <Dialog open={editTechnicianDialogOpen} onOpenChange={setEditTechnicianDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier le technicien</DialogTitle>
                        <DialogDescription>
                            Modifiez les informations du technicien {selectedTechnicianForEdit?.fullName || selectedTechnicianForEdit?.email}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-fullName">Nom complet *</Label>
                            <Input
                                id="edit-fullName"
                                placeholder="Jean Dupont"
                                value={editTechnicianForm.fullName}
                                onChange={(e) => setEditTechnicianForm({ ...editTechnicianForm, fullName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email *</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                placeholder="technicien@example.com"
                                value={editTechnicianForm.email}
                                onChange={(e) => setEditTechnicianForm({ ...editTechnicianForm, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Téléphone</Label>
                            <Input
                                id="edit-phone"
                                type="tel"
                                placeholder="+33612345678"
                                value={editTechnicianForm.phone}
                                onChange={(e) => setEditTechnicianForm({ ...editTechnicianForm, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Nouveau mot de passe</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                placeholder="Laissez vide pour ne pas changer"
                                value={editTechnicianForm.password}
                                onChange={(e) => setEditTechnicianForm({ ...editTechnicianForm, password: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Laissez vide pour conserver le mot de passe actuel
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-isActive"
                                checked={editTechnicianForm.isActive}
                                onChange={(e) => setEditTechnicianForm({ ...editTechnicianForm, isActive: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="edit-isActive" className="cursor-pointer">
                                Technicien actif
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditTechnicianDialogOpen(false);
                                setSelectedTechnicianForEdit(null);
                                setEditTechnicianForm({ email: "", fullName: "", phone: "", password: "", isActive: true });
                            }}
                            disabled={editingTechnician}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!editTechnicianForm.email || !editTechnicianForm.fullName) {
                                    toast({
                                        title: "Erreur",
                                        description: "L'email et le nom complet sont obligatoires",
                                        variant: "destructive",
                                    });
                                    return;
                                }

                                if (!selectedTechnicianForEdit?.id) {
                                    toast({
                                        title: "Erreur",
                                        description: "Technicien non sélectionné",
                                        variant: "destructive",
                                    });
                                    return;
                                }

                                setEditingTechnician(true);
                                try {
                                    const updateData: any = {
                                        email: editTechnicianForm.email,
                                        fullName: editTechnicianForm.fullName,
                                        phone: editTechnicianForm.phone || undefined,
                                        isActive: editTechnicianForm.isActive,
                                    };

                                    // Ne mettre à jour le mot de passe que s'il est fourni
                                    if (editTechnicianForm.password) {
                                        updateData.password = editTechnicianForm.password;
                                    }

                                    await apiService.updateTechnician(selectedTechnicianForEdit.id, updateData);

                                    toast({
                                        title: "Succès",
                                        description: "Le technicien a été modifié avec succès",
                                    });

                                    // Réinitialiser le formulaire
                                    setEditTechnicianForm({ email: "", fullName: "", phone: "", password: "", isActive: true });
                                    setEditTechnicianDialogOpen(false);
                                    setSelectedTechnicianForEdit(null);

                                    // Recharger la liste des techniciens
                                    if (hotelId) {
                                        await fetchTechnicians(hotelId);
                                    }
                                } catch (error: any) {
                                    toast({
                                        title: "Erreur",
                                        description: error.message || "Erreur lors de la modification du technicien",
                                        variant: "destructive",
                                    });
                                } finally {
                                    setEditingTechnician(false);
                                }
                            }}
                            disabled={editingTechnician || !editTechnicianForm.email || !editTechnicianForm.fullName}
                        >
                            {editingTechnician ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Modification...
                                </>
                            ) : (
                                "Enregistrer"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
};

export default AdminDashboard;
