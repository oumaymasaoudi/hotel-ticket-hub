import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Eye, Clock, Building2, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketDetailDialog } from '@/components/tickets/TicketDetailDialog';

interface EscalatedTicket {
  id: string;
  ticket_number: string;
  description: string;
  status: string;
  created_at: string;
  sla_deadline: string | null;
  client_email: string;
  hotel_id: string;
  category_id: string;
  categories: { name: string; color: string } | null;
  hotels: { name: string } | null;
  assigned_technician_id: string | null;
}

interface Technician {
  user_id: string;
  profiles: { full_name: string } | null;
  specialties: string[];
}

const SuperAdminEscalationsView = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<EscalatedTicket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<EscalatedTicket | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [showSpecialistsOnly, setShowSpecialistsOnly] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch escalated tickets (pending status, usually without technician or marked as escalated)
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select(`
          id, ticket_number, description, status, created_at, sla_deadline, 
          client_email, hotel_id, category_id, assigned_technician_id,
          categories(name, color),
          hotels(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Fetch all technicians with their categories
      const { data: techData } = await supabase
        .from('user_roles')
        .select('user_id, profiles(full_name)')
        .eq('role', 'technician');

      // Fetch technician categories
      const { data: techCategories } = await supabase
        .from('technician_categories')
        .select('technician_id, category_id, categories(name)');

      // Fetch all categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*');

      // Map technicians with their specialties
      const techsWithSpecialties = (techData || []).map(tech => ({
        ...tech,
        specialties: (techCategories || [])
          .filter(tc => tc.technician_id === tech.user_id)
          .map(tc => tc.categories?.name || '')
          .filter(Boolean)
      }));

      setTickets(ticketsData || []);
      setTechnicians(techsWithSpecialties);
      setCategories(categoriesData || []);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = (ticket: EscalatedTicket) => {
    setSelectedTicket(ticket);
    setSelectedTechnician('');
    setShowAssignModal(true);
  };

  const handleOpenDetail = (ticket: EscalatedTicket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleAssign = async () => {
    if (!selectedTicket || !selectedTechnician) return;

    setLoading(true);
    try {
      // Update ticket with new technician and change status to in_progress
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({
          assigned_technician_id: selectedTechnician,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (ticketError) throw ticketError;

      // Add to ticket history
      const { error: historyError } = await supabase
        .from('ticket_history')
        .insert({
          ticket_id: selectedTicket.id,
          action_type: 'technician_reassigned_by_superadmin',
          old_value: selectedTicket.assigned_technician_id || 'Non assigné',
          new_value: selectedTechnician
        });

      if (historyError) console.error('History error:', historyError);

      toast({
        title: "Ticket réassigné",
        description: `Le ticket ${selectedTicket.ticket_number} a été réassigné avec succès.`
      });

      setShowAssignModal(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réassigner le ticket.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.hotels?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFilteredTechnicians = () => {
    if (!selectedTicket || !showSpecialistsOnly) return technicians;
    
    const ticketCategory = categories.find(c => c.id === selectedTicket.category_id);
    if (!ticketCategory) return technicians;

    return technicians.filter(tech => 
      tech.specialties.includes(ticketCategory.name)
    );
  };

  const getSlaStatus = (deadline: string | null) => {
    if (!deadline) return { label: 'N/A', variant: 'outline' as const };
    
    const now = new Date();
    const slaDate = new Date(deadline);
    
    if (now > slaDate) {
      return { label: 'Dépassé', variant: 'destructive' as const };
    }
    
    const hoursLeft = Math.round((slaDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (hoursLeft <= 4) {
      return { label: `${hoursLeft}h restantes`, variant: 'default' as const, className: 'bg-orange-500/10 text-orange-500' };
    }
    
    return { label: `${hoursLeft}h restantes`, variant: 'outline' as const };
  };

  const specialistCount = selectedTicket 
    ? technicians.filter(t => {
        const cat = categories.find(c => c.id === selectedTicket.category_id);
        return cat && t.specialties.includes(cat.name);
      }).length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-3xl font-bold">{tickets.length}</p>
              <p className="text-sm text-muted-foreground">Tickets escaladés</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-orange-500/10 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {tickets.filter(t => t.sla_deadline && new Date() > new Date(t.sla_deadline)).length}
              </p>
              <p className="text-sm text-muted-foreground">SLA dépassé</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {new Set(tickets.map(t => t.hotel_id)).size}
              </p>
              <p className="text-sm text-muted-foreground">Hôtels concernés</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro, hôtel ou catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Hôtel</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Date escalade</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <p className="text-muted-foreground">Aucun ticket escaladé</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => {
                const slaStatus = getSlaStatus(ticket.sla_deadline);
                return (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.ticket_number}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {ticket.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {ticket.hotels?.name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          borderColor: ticket.categories?.color, 
                          color: ticket.categories?.color 
                        }}
                      >
                        {ticket.categories?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm')}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={slaStatus.variant}
                        className={slaStatus.className}
                      >
                        {slaStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(ticket)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenAssign(ticket)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Réassigner
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Assign Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réassigner le ticket</DialogTitle>
            <DialogDescription>
              Assignez ce ticket escaladé à un nouveau technicien
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ticket</span>
                  <span className="font-medium">{selectedTicket.ticket_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hôtel</span>
                  <span>{selectedTicket.hotels?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Catégorie</span>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: selectedTicket.categories?.color, 
                      color: selectedTicket.categories?.color 
                    }}
                  >
                    {selectedTicket.categories?.name}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Technicien</Label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showSpecialistsOnly}
                      onChange={(e) => setShowSpecialistsOnly(e.target.checked)}
                      className="rounded"
                    />
                    Spécialistes uniquement ({specialistCount})
                  </label>
                </div>
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un technicien" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredTechnicians().map((tech) => (
                      <SelectItem key={tech.user_id} value={tech.user_id}>
                        <div className="flex items-center gap-2">
                          <span>{tech.profiles?.full_name || 'N/A'}</span>
                          {tech.specialties.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({tech.specialties.slice(0, 2).join(', ')}{tech.specialties.length > 2 ? '...' : ''})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssign} disabled={loading || !selectedTechnician}>
              {loading ? "Réassignation..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <TicketDetailDialog
        ticket={selectedTicket ? {
          ...selectedTicket,
          is_urgent: false,
          client_phone: null,
          resolved_at: null,
          updated_at: null
        } : null}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
    </div>
  );
};

export default SuperAdminEscalationsView;
