import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
// Force rebuild: Hotel type import fix - Changed at 2026-01-02 14:20
import { apiService, TicketResponse, type Hotel, Category, Plan, User, Payment, AuditLog } from "@/services/apiService";
import { Building2, Users, TicketCheck, DollarSign, AlertTriangle, RefreshCw, TrendingUp, Layers, FileText, History, Settings, Wrench, Edit, Trash2, Plus, Search, Clock, ArrowUp, CheckCircle, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const SuperAdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const location = useLocation();
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [overduePayments, setOverduePayments] = useState<Payment[]>([]);
    const [allPayments, setAllPayments] = useState<Payment[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");

    // Detect active route to display correct content
    const currentView = useMemo(() => {
        const path = location.pathname;
        if (path.includes('/hotels')) return 'hotels';
        if (path.includes('/escalations')) return 'escalations';
        if (path.includes('/plans')) return 'plans';
        if (path.includes('/users')) return 'users';
        if (path.includes('/categories')) return 'categories';
        if (path.includes('/payments')) return 'payments';
        if (path.includes('/reports')) return 'reports';
        if (path.includes('/logs')) return 'logs';
        if (path.includes('/settings')) return 'settings';
        return 'dashboard'; // Default: show dashboard
    }, [location.pathname]);

    const fetchData = useCallback(async () => {
        if (!user?.userId) return;

        setLoading(true);
        try {
            // Fetch all data in parallel
            const [ticketsData, hotelsData, usersData, categoriesData, overduePaymentsData, allPaymentsData, plansData, logsData] = await Promise.all([
                apiService.getAllTickets(),
                apiService.getAllHotels(),
                apiService.getAllUsers(),
                apiService.getCategories().catch(() => []), // Use getCategories for now
                apiService.getOverduePayments().catch(() => []), // Ignore error if endpoint doesn't exist
                apiService.getAllPayments().catch(() => []), // Get all payments
                apiService.getAllPlans().catch(() => []), // Get plans
                apiService.getAllAuditLogs().catch(() => []), // Get audit logs
            ]);

            setTickets(ticketsData);
            setHotels(hotelsData);
            setUsers(usersData);
            setCategories(categoriesData || []);
            setOverduePayments(overduePaymentsData || []);
            setAllPayments(allPaymentsData || []);
            setPlans(plansData || []);
            setAuditLogs(logsData || []);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Impossible de récupérer les données";
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [user?.userId, toast]);

    useEffect(() => {
        if (!authLoading && user?.userId) {
            fetchData();
        }
    }, [authLoading, user?.userId, fetchData]);

    // Calculer les statistiques
    const stats = useMemo(() => {
        const totalTickets = tickets.length;
        const openTickets = tickets.filter(t => t.status === 'OPEN').length;
        const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS').length;
        const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
        const urgentTickets = tickets.filter(t => t.isUrgent).length;
        const totalHotels = hotels.length;
        const activeHotels = hotels.filter(h => h).length; // Adjust according to your model
        const totalUsers = users.length;
        const overdueCount = overduePayments.length;

        return {
            totalTickets,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            urgentTickets,
            totalHotels,
            activeHotels,
            totalUsers,
            overdueCount,
        };
    }, [tickets, hotels, users, overduePayments]);

    // Dynamic title based on view
    const getTitle = () => {
        switch (currentView) {
            case 'hotels': return 'Gestion des Hôtels';
            case 'escalations': return 'Escalades';
            case 'plans': return 'Gestion des Plans';
            case 'users': return 'Gestion des Utilisateurs';
            case 'categories': return 'Gestion des Catégories';
            case 'payments': return 'Gestion des Paiements';
            case 'reports': return 'Rapports';
            case 'logs': return 'Logs Système';
            case 'settings': return 'Paramètres';
            default: return 'Tableau de bord Super Admin';
        }
    };

    if (loading && tickets.length === 0 && hotels.length === 0) {
        return (
            <DashboardLayout allowedRoles={["superadmin"]} title={getTitle()}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Chargement des données...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Function to render content based on view
    const renderContent = () => {
        switch (currentView) {
            case 'hotels':
                return <HotelsView hotels={hotels} searchFilter={searchFilter} onHotelCreated={fetchData} />;
            case 'users':
                return <UsersView users={users} searchFilter={searchFilter} />;
            case 'categories':
                return <CategoriesView categories={categories} searchFilter={searchFilter} onRefresh={fetchData} />;
            case 'payments':
                return <PaymentsView overduePayments={overduePayments} allPayments={allPayments} />;
            case 'escalations':
                return <EscalationsView tickets={tickets.filter(t => t.isUrgent)} />;
            case 'reports':
                return <ReportsView stats={stats} tickets={tickets} hotels={hotels} users={users} />;
            case 'logs':
                return <LogsView logs={auditLogs} onRefresh={fetchData} />;
            case 'settings':
                return <SettingsView />;
            case 'plans':
                return <PlansView plans={plans} onRefresh={fetchData} />;
            default:
                return <DashboardView stats={stats} tickets={tickets} hotels={hotels} overduePayments={overduePayments} />;
        }
    };

    return (
        <DashboardLayout allowedRoles={["superadmin"]} title={getTitle()}>
            <div className="space-y-6">
                {/* Bouton de rafraîchissement et recherche */}
                <div className="flex justify-between items-center gap-4">
                    {currentView !== 'dashboard' && (
                        <div className="flex-1 max-w-md">
                            <Input
                                placeholder="Rechercher..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                            />
                        </div>
                    )}
                    <Button
                        variant="outline"
                        onClick={fetchData}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Rafraîchir
                    </Button>
                </div>

                {/* Contenu dynamique selon la vue */}
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

// Dashboard view (default)
interface DashboardViewProps {
    stats: Record<string, number>;
    tickets: TicketResponse[];
    hotels: Hotel[];
    overduePayments: Payment[];
}
const DashboardView = ({ stats, tickets, hotels, overduePayments }: DashboardViewProps) => (
    <>
        {/* Statistiques principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Tickets"
                value={stats.totalTickets}
                icon={TicketCheck}
                description={`${stats.openTickets} ouverts, ${stats.resolvedTickets} résolus`}
            />
            <StatCard
                title="Hôtels"
                value={stats.totalHotels}
                icon={Building2}
                description={`${stats.activeHotels} actifs`}
            />
            <StatCard
                title="Utilisateurs"
                value={stats.totalUsers}
                icon={Users}
                description="Tous les rôles confondus"
            />
            <StatCard
                title="Paiements en retard"
                value={stats.overdueCount}
                icon={DollarSign}
                description={stats.overdueCount > 0 ? "Action requise" : "À jour"}
                variant={stats.overdueCount > 0 ? "destructive" : "default"}
            />
        </div>

        {/* Statistiques détaillées des tickets */}
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Ouverts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.openTickets}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">En Cours</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.inProgressTickets}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Résolus</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Urgents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.urgentTickets}</div>
                </CardContent>
            </Card>
        </div>

        {/* Liste des hôtels */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Hôtels ({hotels.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {hotels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun hôtel enregistré</p>
                ) : (
                    <div className="space-y-2">
                        {hotels.slice(0, 5).map((hotel) => (
                            <div key={hotel.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                    <p className="font-medium">{hotel.name}</p>
                                    {hotel.email && <p className="text-sm text-muted-foreground">{hotel.email}</p>}
                                </div>
                                <Badge variant="outline">Actif</Badge>
                            </div>
                        ))}
                        {hotels.length > 5 && (
                            <p className="text-sm text-muted-foreground text-center">
                                + {hotels.length - 5} autres hôtels
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Tickets récents */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TicketCheck className="h-5 w-5" />
                    Tickets Récents ({tickets.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {tickets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun ticket</p>
                ) : (
                    <div className="space-y-2">
                        {tickets.slice(0, 10).map((ticket: TicketResponse) => (
                            <div key={ticket.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                    <p className="font-medium">{ticket.ticketNumber}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {ticket.hotelName} • {ticket.categoryName}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={ticket.status === 'OPEN' ? 'outline' : 'default'}>
                                        {ticket.status}
                                    </Badge>
                                    {ticket.isUrgent && (
                                        <Badge variant="destructive">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Urgent
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                        {tickets.length > 10 && (
                            <p className="text-sm text-muted-foreground text-center">
                                + {tickets.length - 10} autres tickets
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Paiements en retard */}
        {stats.overdueCount > 0 && (
            <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Paiements en Retard ({stats.overdueCount})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {stats.overdueCount} hôtel(s) ont des paiements en retard. Action requise.
                    </p>
                </CardContent>
            </Card>
        )}
    </>
);

// Hotels view
const HotelsView = ({ hotels, searchFilter, onHotelCreated }: {
    hotels: Hotel[];
    searchFilter: string;
    onHotelCreated: () => void;
}) => {
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        zipCode: "",
        planId: "",
    });

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const plansData = await apiService.getAllPlans();
                if (plansData && plansData.length > 0) {
                    setPlans(plansData);
                } else {
                    toast({
                        title: "Avertissement",
                        description: "Aucun plan d'abonnement trouvé. Veuillez exécuter le script SQL insert-plans.sql",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Impossible de charger les plans";
                toast({
                    title: "Erreur",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        };
        fetchPlans();
    }, [toast]);

    const filteredHotels = hotels.filter(hotel =>
        hotel.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        hotel.email?.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.planId) {
            toast({
                title: "Erreur",
                description: "Le nom et le plan sont obligatoires",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await apiService.createHotel(formData);
            toast({
                title: "Succès",
                description: "Hôtel créé avec succès",
            });
            setFormData({
                name: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                country: "",
                zipCode: "",
                planId: "",
            });
            setShowForm(false);
            onHotelCreated();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Formulaire de création */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            {showForm ? "Créer un nouvel hôtel" : "Hôtels"}
                        </CardTitle>
                        <Button
                            variant={showForm ? "outline" : "default"}
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? "Annuler" : "+ Créer un hôtel"}
                        </Button>
                    </div>
                </CardHeader>
                {showForm && (
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom de l'hôtel *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Nom de l'hôtel"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="planId">Plan d'abonnement *</Label>
                                    <Select
                                        value={formData.planId}
                                        onValueChange={(value) => setFormData({ ...formData, planId: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {plans.map((plan) => (
                                                <SelectItem key={plan.id} value={plan.id}>
                                                    {plan.name} - {plan.baseCost}€/mois
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="contact@hotel.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+33 1 23 45 67 89"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Adresse</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="123 Rue de la République"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Ville</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Paris"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Pays</Label>
                                    <Input
                                        id="country"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        placeholder="France"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zipCode">Code postal</Label>
                                    <Input
                                        id="zipCode"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        placeholder="75001"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Création..." : "Créer l'hôtel"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                )}
            </Card>

            {/* Liste des hôtels */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Liste des Hôtels ({filteredHotels.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredHotels.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun hôtel trouvé</p>
                    ) : (
                        <div className="space-y-2">
                            {filteredHotels.map((hotel) => (
                                <div key={hotel.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{hotel.name}</p>
                                        {hotel.email && <p className="text-sm text-muted-foreground">{hotel.email}</p>}
                                        {hotel.phone && <p className="text-sm text-muted-foreground">{hotel.phone}</p>}
                                        {hotel.address && (
                                            <p className="text-sm text-muted-foreground">
                                                {hotel.address}
                                                {hotel.city && `, ${hotel.city}`}
                                                {hotel.zipCode && ` ${hotel.zipCode}`}
                                            </p>
                                        )}
                                    </div>
                                    <Badge variant="outline">Actif</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// Users view
const UsersView = ({ users, searchFilter }: { users: User[]; searchFilter: string }) => {
    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchFilter.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Utilisateurs ({filteredUsers.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {filteredUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé</p>
                ) : (
                    <div className="space-y-2">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">{user.fullName || user.email}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <Badge variant="outline">{user.role || 'N/A'}</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Categories view
interface CategoriesViewProps {
    categories: Category[];
    searchFilter: string;
    onRefresh: () => void;
}

const CategoriesView = ({ categories, searchFilter, onRefresh }: CategoriesViewProps) => {
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        icon: 'Package',
        color: '#6C757D',
        isMandatory: false,
        additionalCost: 0,
    });

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const handleCreateCategory = async () => {
        if (!formData.name.trim()) {
            toast({
                title: "Erreur",
                description: "Le nom de la catégorie est requis",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await apiService.createCategory({
                name: formData.name,
                icon: formData.icon,
                color: formData.color,
                isMandatory: formData.isMandatory,
                additionalCost: formData.additionalCost,
            });
            toast({
                title: "Succès",
                description: "Catégorie créée avec succès",
            });
            setDialogOpen(false);
            setFormData({
                name: '',
                icon: 'Package',
                color: '#6C757D',
                isMandatory: false,
                additionalCost: 0,
            });
            onRefresh();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const iconOptions = [
        { value: 'Zap', label: '⚡ Électricité' },
        { value: 'Droplet', label: '💧 Plomberie' },
        { value: 'Snowflake', label: '❄️ Climatisation' },
        { value: 'Wifi', label: '📶 WiFi' },
        { value: 'Key', label: '🔑 Serrurerie' },
        { value: 'BedDouble', label: '🛏️ Chambre' },
        { value: 'Bath', label: '🛁 Salle de bain' },
        { value: 'Volume2', label: '🔊 Bruit' },
        { value: 'Sparkles', label: '✨ Propreté' },
        { value: 'Shield', label: '🛡️ Sécurité' },
        { value: 'UtensilsCrossed', label: '🍴 Restauration' },
        { value: 'Package', label: '📦 Autres' },
    ];

    const colorOptions = [
        { value: '#FF6B6B', label: 'Rouge' },
        { value: '#4ECDC4', label: 'Turquoise' },
        { value: '#95E1D3', label: 'Vert clair' },
        { value: '#A8E6CF', label: 'Vert menthe' },
        { value: '#FFD93D', label: 'Jaune' },
        { value: '#F38181', label: 'Rose' },
        { value: '#6C5CE7', label: 'Violet' },
        { value: '#74B9FF', label: 'Bleu clair' },
        { value: '#A29BFE', label: 'Lavande' },
        { value: '#FD79A8', label: 'Rose vif' },
        { value: '#FDCB6E', label: 'Orange' },
        { value: '#00B894', label: 'Vert' },
        { value: '#6C757D', label: 'Gris' },
    ];

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5" />
                            Catégories ({filteredCategories.length})
                        </CardTitle>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle Catégorie
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredCategories.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucune catégorie trouvée</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCategories.map((category) => (
                                <div key={category.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-2 rounded-full`} style={{ backgroundColor: category.color + '20' }}>
                                            <span style={{ color: category.color }}>{category.icon}</span>
                                        </div>
                                        <p className="font-medium">{category.name}</p>
                                    </div>
                                    {category.isMandatory && (
                                        <Badge variant="outline" className="mt-2">Obligatoire</Badge>
                                    )}
                                    {category.additionalCost && category.additionalCost > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Coût supplémentaire: {category.additionalCost.toFixed(2)}€
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de création */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nouvelle Catégorie</DialogTitle>
                        <DialogDescription>
                            Créez une nouvelle catégorie pour les tickets
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom de la catégorie *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Maintenance"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="icon">Icône</Label>
                            <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une icône" />
                                </SelectTrigger>
                                <SelectContent>
                                    {iconOptions.map((icon) => (
                                        <SelectItem key={icon.value} value={icon.value}>
                                            {icon.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="color">Couleur</Label>
                            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une couleur" />
                                </SelectTrigger>
                                <SelectContent>
                                    {colorOptions.map((color) => (
                                        <SelectItem key={color.value} value={color.value}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                                                {color.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="additionalCost">Coût supplémentaire (€)</Label>
                            <Input
                                id="additionalCost"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.additionalCost}
                                onChange={(e) => setFormData({ ...formData, additionalCost: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isMandatory"
                                checked={formData.isMandatory}
                                onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="isMandatory" className="cursor-pointer">
                                Catégorie obligatoire
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleCreateCategory} disabled={loading}>
                            {loading ? "Création..." : "Créer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

// Payments view
interface PaymentsViewProps {
    overduePayments: Payment[];
    allPayments: Payment[];
}

const PaymentsView = ({ overduePayments, allPayments }: PaymentsViewProps) => {
    // Filter received payments (not overdue)
    const receivedPayments = allPayments.filter(payment =>
        payment.status === 'PAID' &&
        !overduePayments.some(overdue => overdue.id === payment.id)
    );

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Paiements en Retard */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Paiements en Retard ({overduePayments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {overduePayments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun paiement en retard</p>
                    ) : (
                        <div className="space-y-2">
                            {overduePayments.map((payment) => (
                                <div key={payment.id} className="p-4 border border-destructive/40 rounded-lg bg-destructive/5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium">{payment.hotelName || 'Hôtel inconnu'}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Montant: {formatAmount(payment.amount)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Date de paiement: {formatDate(payment.paymentDate)}
                                            </p>
                                            {payment.nextPaymentDate && (
                                                <p className="text-sm text-muted-foreground">
                                                    Prochain paiement: {formatDate(payment.nextPaymentDate)}
                                                </p>
                                            )}
                                            {payment.paymentMethod && (
                                                <p className="text-sm text-muted-foreground">
                                                    Méthode: {payment.paymentMethod}
                                                </p>
                                            )}
                                            {payment.paymentReference && (
                                                <p className="text-sm text-muted-foreground">
                                                    Référence: {payment.paymentReference}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="destructive">En retard</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Paiements Reçus */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Paiements Reçus ({receivedPayments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {receivedPayments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun paiement reçu</p>
                    ) : (
                        <div className="space-y-2">
                            {receivedPayments.map((payment) => (
                                <div key={payment.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="font-medium text-lg">{payment.hotelName || 'Hôtel inconnu'}</p>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {payment.status}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Montant</p>
                                                    <p className="font-semibold text-lg text-green-600">
                                                        {formatAmount(payment.amount)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Date de paiement</p>
                                                    <p className="font-medium">{formatDate(payment.paymentDate)}</p>
                                                </div>
                                                {payment.nextPaymentDate && (
                                                    <div>
                                                        <p className="text-muted-foreground">Prochain paiement</p>
                                                        <p className="font-medium">{formatDate(payment.nextPaymentDate)}</p>
                                                    </div>
                                                )}
                                                {payment.paymentMethod && (
                                                    <div>
                                                        <p className="text-muted-foreground">Méthode</p>
                                                        <p className="font-medium">{payment.paymentMethod}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {payment.paymentReference && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-muted-foreground">Référence: {payment.paymentReference}</p>
                                                </div>
                                            )}
                                            {payment.notes && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-muted-foreground italic">Note: {payment.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// Escalations view
const EscalationsView = ({ tickets }: { tickets: TicketResponse[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Tickets Urgents ({tickets.length})
            </CardTitle>
        </CardHeader>
        <CardContent>
            {tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun ticket urgent</p>
            ) : (
                <div className="space-y-2">
                    {tickets.map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-4 border border-destructive/40 rounded-lg bg-destructive/5">
                            <div>
                                <p className="font-medium">{ticket.ticketNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                    {ticket.hotelName} • {ticket.categoryName}
                                </p>
                            </div>
                            <Badge variant="destructive">Urgent</Badge>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
);

// Reports view
interface ReportsViewProps {
    stats: Record<string, number>;
    tickets: TicketResponse[];
    hotels: Hotel[];
    users: User[];
}
interface TechnicianReport {
    technicianId: string;
    technicianName: string;
    totalTickets?: number;
    resolvedTickets?: number;
    [key: string]: string | number | undefined;
}

interface GlobalReport {
    totalTickets?: number;
    openTickets?: number;
    resolvedTickets?: number;
    urgentTickets?: number;
    totalHotels?: number;
    activeHotels?: number;
    overduePayments?: number;
    technicians?: TechnicianReport[];
    [key: string]: string | number | undefined | TechnicianReport[] | unknown;
}
const ReportsView = ({ stats, tickets, hotels, users }: ReportsViewProps) => {
    const [globalReport, setGlobalReport] = useState<GlobalReport | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchGlobalReport = async () => {
            setLoading(true);
            try {
                const report = await apiService.getGlobalReport();
                setGlobalReport(report);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Impossible de charger le rapport";
                toast({
                    title: "Erreur",
                    description: errorMessage,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchGlobalReport();
    }, [toast]);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Rapport Global
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : globalReport ? (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                                    <p className="text-2xl font-bold">{globalReport.totalTickets}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tickets Ouverts</p>
                                    <p className="text-2xl font-bold text-blue-600">{globalReport.openTickets}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tickets Résolus</p>
                                    <p className="text-2xl font-bold text-green-600">{globalReport.resolvedTickets}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tickets Urgents</p>
                                    <p className="text-2xl font-bold text-red-600">{globalReport.urgentTickets}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Hôtels</p>
                                    <p className="text-2xl font-bold">{globalReport.totalHotels}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {globalReport.activeHotels} actifs
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Paiements en Retard</p>
                                    <p className="text-2xl font-bold text-destructive">{globalReport.overduePayments}</p>
                                </div>
                            </div>

                            {globalReport.technicians && globalReport.technicians.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium mb-2">Performances Techniciens</p>
                                    <div className="space-y-2">
                                        {globalReport.technicians?.slice(0, 5).map((tech) => (
                                            <div key={tech.technicianId} className="p-3 border rounded-lg">
                                                <p className="font-medium">{tech.technicianName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {tech.totalTickets} tickets • {tech.resolvedTickets} résolus
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Aucun rapport disponible</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// Logs view
interface LogsViewProps {
    logs: AuditLog[];
    onRefresh: () => void;
}

const LogsView = ({ logs, onRefresh }: LogsViewProps) => {
    const [searchFilter, setSearchFilter] = useState("");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [loading, setLoading] = useState(false);

    const filteredLogs = useMemo(() => {
        let filtered = logs;

        // Filtre par action
        if (actionFilter !== "all") {
            filtered = filtered.filter(log => log.action === actionFilter);
        }

        // Filtre par recherche
        if (searchFilter.trim()) {
            const filter = searchFilter.toLowerCase();
            filtered = filtered.filter(log =>
                log.userName?.toLowerCase().includes(filter) ||
                log.userEmail?.toLowerCase().includes(filter) ||
                log.action?.toLowerCase().includes(filter) ||
                log.entityType?.toLowerCase().includes(filter) ||
                log.hotelName?.toLowerCase().includes(filter) ||
                log.description?.toLowerCase().includes(filter)
            );
        }

        return filtered;
    }, [logs, searchFilter, actionFilter]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionBadgeVariant = (action: string) => {
        if (action?.includes('CREATE')) return 'default';
        if (action?.includes('UPDATE')) return 'secondary';
        if (action?.includes('DELETE')) return 'destructive';
        if (action?.includes('ASSIGN')) return 'outline';
        if (action?.includes('ESCALATE')) return 'destructive';
        return 'outline';
    };

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            'CREATE_TICKET': 'Création de ticket',
            'UPDATE_TICKET': 'Mise à jour ticket',
            'ASSIGN_TICKET': 'Assignation ticket',
            'REASSIGN_TICKET': 'Réassignation ticket',
            'ESCALATE_TICKET': 'Escalade ticket',
            'ADD_COMMENT': 'Ajout commentaire',
            'CREATE_PAYMENT': 'Création paiement',
            'PAYMENT_OVERDUE': 'Paiement en retard',
            'PLAN_CHANGED': 'Changement de plan',
            'USER_CREATED': 'Création utilisateur',
            'USER_DELETED': 'Suppression utilisateur',
            'USER_ASSIGNED': 'Assignation utilisateur',
            'HOTEL_CREATED': 'Création hôtel',
            'HOTEL_UPDATED': 'Mise à jour hôtel',
        };
        return labels[action] || action;
    };

    const uniqueActions = useMemo(() => {
        return Array.from(new Set(logs.map(log => log.action).filter(Boolean))).sort();
    }, [logs]);

    return (
        <div className="space-y-6">
            {/* En-tête avec filtres */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <History className="h-6 w-6" />
                        Logs Système ({filteredLogs.length})
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Historique de toutes les actions critiques du système
                    </p>
                </div>
                <Button onClick={onRefresh} variant="outline" disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Rafraîchir
                </Button>
            </div>

            {/* Filtres */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Rechercher</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher par utilisateur, action, hôtel..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Filtrer par action</Label>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Toutes les actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes les actions</SelectItem>
                                    {uniqueActions.map((action) => (
                                        <SelectItem key={action} value={action}>
                                            {getActionLabel(action)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des logs */}
            <Card>
                <CardContent className="pt-6">
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">
                                {searchFilter || actionFilter !== "all" ? "Aucun log trouvé" : "Aucun log disponible"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {searchFilter || actionFilter !== "all"
                                    ? "Essayez avec d'autres critères de recherche"
                                    : "Les logs apparaîtront ici au fur et à mesure des actions"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant={getActionBadgeVariant(log.action)}>
                                                    {getActionLabel(log.action)}
                                                </Badge>
                                                {log.entityType && (
                                                    <Badge variant="outline">
                                                        {log.entityType}
                                                    </Badge>
                                                )}
                                                {log.hotelName && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {log.hotelName}
                                                    </Badge>
                                                )}
                                            </div>
                                            {log.description && (
                                                <p className="text-sm font-medium">{log.description}</p>
                                            )}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                {log.userName && (
                                                    <div>
                                                        <p className="text-muted-foreground">Utilisateur</p>
                                                        <p className="font-medium">{log.userName}</p>
                                                        {log.userEmail && (
                                                            <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                                                        )}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-muted-foreground">Date</p>
                                                    <p className="font-medium">{formatDate(log.timestamp)}</p>
                                                </div>
                                                {log.ipAddress && (
                                                    <div>
                                                        <p className="text-muted-foreground">IP</p>
                                                        <p className="font-medium font-mono text-xs">{log.ipAddress}</p>
                                                    </div>
                                                )}
                                                {log.entityId && (
                                                    <div>
                                                        <p className="text-muted-foreground">ID Entité</p>
                                                        <p className="font-medium font-mono text-xs">{log.entityId.substring(0, 8)}...</p>
                                                    </div>
                                                )}
                                            </div>
                                            {log.changes && (
                                                <details className="mt-2">
                                                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                                        Voir les changements
                                                    </summary>
                                                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                                        {typeof log.changes === 'string'
                                                            ? JSON.stringify(JSON.parse(log.changes), null, 2)
                                                            : JSON.stringify(log.changes, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// Settings view
const SettingsView = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [systemInfo, setSystemInfo] = useState({
        version: '1.0.0',
        environment: import.meta.env.MODE || 'development',
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    Paramètres Système
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Configuration et informations sur l'application
                </p>
            </div>

            {/* Informations Système */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations Système</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label className="text-muted-foreground">Version</Label>
                            <p className="font-medium">{systemInfo.version}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Environnement</Label>
                            <Badge variant={systemInfo.environment === 'production' ? 'default' : 'secondary'}>
                                {systemInfo.environment}
                            </Badge>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">URL API</Label>
                            <p className="font-medium font-mono text-sm">{systemInfo.apiUrl}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Utilisateur Connecté</Label>
                            <p className="font-medium">{user?.fullName || user?.email || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Notifications Email</Label>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="email-notifications" defaultChecked className="h-4 w-4" />
                            <Label htmlFor="email-notifications" className="cursor-pointer">
                                Activer les notifications par email
                            </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Recevoir des notifications pour les événements importants
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Rapports Automatiques</Label>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="auto-reports" defaultChecked className="h-4 w-4" />
                            <Label htmlFor="auto-reports" className="cursor-pointer">
                                Générer automatiquement les rapports mensuels
                            </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Les rapports seront envoyés automatiquement chaque mois
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Journalisation</Label>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="audit-logs" defaultChecked className="h-4 w-4" />
                            <Label htmlFor="audit-logs" className="cursor-pointer">
                                Activer le journal d'audit
                            </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Enregistrer toutes les actions critiques dans le journal d'audit
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Actions Système */}
            <Card>
                <CardHeader>
                    <CardTitle>Actions Système</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" onClick={() => {
                            toast({
                                title: "Info",
                                description: "Fonctionnalité de sauvegarde à implémenter",
                            });
                        }}>
                            <Download className="h-4 w-4 mr-2" />
                            Exporter la Configuration
                        </Button>
                        <Button variant="outline" onClick={() => {
                            toast({
                                title: "Info",
                                description: "Fonctionnalité de cache à implémenter",
                            });
                        }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Vider le Cache
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Informations Légales */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations Légales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>© 2024 Hotel Ticket Hub. Tous droits réservés.</p>
                    <p>Application de gestion de tickets pour hôtels.</p>
                </CardContent>
            </Card>
        </div>
    );
};

// Plans view
interface PlansViewProps {
    plans: Plan[];
    onRefresh: () => void;
}

const PlansView = ({ plans, onRefresh }: PlansViewProps) => {
    const { toast } = useToast();
    const [searchFilter, setSearchFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState<{
        total: number;
        avgPrice: number;
        avgQuota: number;
        avgSla: number;
    } | null>(null);

    const filteredPlans = useMemo(() => {
        if (!searchFilter.trim()) return plans;
        const filter = searchFilter.toLowerCase();
        return plans.filter(plan =>
            plan.name.toLowerCase().includes(filter) ||
            plan.baseCost.toString().includes(filter) ||
            plan.ticketQuota.toString().includes(filter)
        );
    }, [plans, searchFilter]);

    // Charger les statistiques au montage du composant et quand les plans changent
    useEffect(() => {
        const loadStatistics = async () => {
            try {
                const stats = await apiService.getPlanStatistics();
                setStatistics(stats);
            } catch (error: unknown) {
                // On error, don't block display
                console.error("Error loading statistics:", error);
            }
        };
        loadStatistics();
    }, [plans]);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const plansData = await apiService.getAllPlans();
            if (plansData && plansData.length > 0) {
                // Update plans in parent via onRefresh
                onRefresh();
                // Recharger les statistiques
                const stats = await apiService.getPlanStatistics();
                setStatistics(stats);
                toast({
                    title: "Succès",
                    description: "Liste des plans actualisée",
                });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête avec recherche et actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Layers className="h-6 w-6" />
                        Gestion des Plans
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gérez les plans d'abonnement disponibles pour les hôtels
                    </p>
                </div>
                <Button onClick={handleRefresh} disabled={loading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Rafraîchir
                </Button>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher par nom, coût ou quota..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-8"
                />
            </div>

            {/* Liste des plans */}
            {filteredPlans.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">
                            {searchFilter ? "Aucun plan trouvé" : "Aucun plan disponible"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {searchFilter
                                ? "Essayez avec d'autres critères de recherche"
                                : "Les plans seront affichés ici une fois créés"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPlans.map((plan) => (
                        <Card key={plan.id} className="relative">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                        <p className="text-2xl font-bold text-primary mt-2">
                                            {plan.baseCost.toFixed(2)}€
                                            <span className="text-sm font-normal text-muted-foreground">/mois</span>
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="ml-2">
                                        {plan.name}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Caractéristiques du plan */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <TicketCheck className="h-4 w-4" />
                                            Quota tickets
                                        </span>
                                        <span className="font-medium">{plan.ticketQuota} tickets/mois</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Techniciens max
                                        </span>
                                        <span className="font-medium">
                                            {plan.maxTechnicians === 999 ? "Illimité" : plan.maxTechnicians}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            SLA
                                        </span>
                                        <span className="font-medium">{plan.slaHours}h</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Coût ticket supplémentaire
                                        </span>
                                        <span className="font-medium">{plan.excessTicketCost.toFixed(2)}€</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Statistiques */}
            {statistics && statistics.total > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Statistiques</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total plans</p>
                                <p className="text-2xl font-bold">{statistics.total}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Prix moyen</p>
                                <p className="text-2xl font-bold">
                                    {statistics.avgPrice.toFixed(2)}€
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Quota moyen</p>
                                <p className="text-2xl font-bold">
                                    {statistics.avgQuota}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">SLA moyen</p>
                                <p className="text-2xl font-bold">
                                    {statistics.avgSla}h
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    variant = "default"
}: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    variant?: "default" | "destructive";
}) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <div>
                    <div className={`text-2xl font-bold ${variant === 'destructive' ? 'text-destructive' : ''}`}>
                        {value}
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                <div className={`p-2 rounded-full ${variant === 'destructive' ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <Icon className={`h-5 w-5 ${variant === 'destructive' ? 'text-destructive' : 'text-primary'}`} />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default SuperAdminDashboard;
