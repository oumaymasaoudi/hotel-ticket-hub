import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const AdminDashboardCharts = () => {
  const { hotelId } = useAuth();
  const [ticketsByStatus, setTicketsByStatus] = useState<any[]>([]);
  const [ticketsByCategory, setTicketsByCategory] = useState<any[]>([]);
  const [ticketsTrend, setTicketsTrend] = useState<any[]>([]);
  const [techPerformance, setTechPerformance] = useState<any[]>([]);

  useEffect(() => {
    if (hotelId) fetchChartData();
  }, [hotelId]);

  const fetchChartData = async () => {
    // Fetch all tickets for this hotel
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*, categories(name, color)')
      .eq('hotel_id', hotelId);

    if (!tickets) return;

    // Tickets by status
    const statusCounts: Record<string, number> = {
      'Ouvert': 0,
      'En cours': 0,
      'En attente': 0,
      'Résolu': 0,
      'Fermé': 0
    };
    tickets.forEach(t => {
      if (t.status === 'open') statusCounts['Ouvert']++;
      else if (t.status === 'in_progress') statusCounts['En cours']++;
      else if (t.status === 'pending') statusCounts['En attente']++;
      else if (t.status === 'resolved') statusCounts['Résolu']++;
      else if (t.status === 'closed') statusCounts['Fermé']++;
    });
    setTicketsByStatus(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

    // Tickets by category
    const categoryCounts: Record<string, { count: number; color: string }> = {};
    tickets.forEach(t => {
      const catName = t.categories?.name || 'Autre';
      const catColor = t.categories?.color || '#888';
      if (!categoryCounts[catName]) {
        categoryCounts[catName] = { count: 0, color: catColor };
      }
      categoryCounts[catName].count++;
    });
    setTicketsByCategory(Object.entries(categoryCounts).map(([name, data]) => ({ 
      name, 
      value: data.count,
      color: data.color 
    })));

    // Tickets trend (last 7 days)
    const trendData: { date: string; created: number; resolved: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, 'yyyy-MM-dd');
      const displayDate = format(day, 'EEE', { locale: fr });
      
      const created = tickets.filter(t => 
        t.created_at && format(new Date(t.created_at), 'yyyy-MM-dd') === dayStr
      ).length;
      
      const resolved = tickets.filter(t => 
        t.resolved_at && format(new Date(t.resolved_at), 'yyyy-MM-dd') === dayStr
      ).length;
      
      trendData.push({ date: displayDate, created, resolved });
    }
    setTicketsTrend(trendData);

    // Technician performance
    const { data: techRoles } = await supabase
      .from('user_roles')
      .select('user_id, profiles(full_name)')
      .eq('role', 'technician');

    if (techRoles) {
      const perfData = techRoles.map(tech => {
        const assigned = tickets.filter(t => t.assigned_technician_id === tech.user_id).length;
        const resolved = tickets.filter(t => 
          t.assigned_technician_id === tech.user_id && 
          (t.status === 'resolved' || t.status === 'closed')
        ).length;
        return {
          name: tech.profiles?.full_name?.split(' ')[0] || 'N/A',
          assignés: assigned,
          résolus: resolved
        };
      }).filter(p => p.assignés > 0);
      setTechPerformance(perfData);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Tickets by Status */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Tickets par statut</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={ticketsByStatus}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
            >
              {ticketsByStatus.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Tickets Trend */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Évolution sur 7 jours</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={ticketsTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="created" 
              name="Créés"
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line 
              type="monotone" 
              dataKey="resolved" 
              name="Résolus"
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-2))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Tickets by Category */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Tickets par catégorie</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ticketsByCategory} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="name" type="category" width={100} className="text-xs" />
            <Tooltip />
            <Bar dataKey="value" name="Tickets" radius={[0, 4, 4, 0]}>
              {ticketsByCategory.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Technician Performance */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Performance techniciens</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={techPerformance}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Bar dataKey="assignés" name="Assignés" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="résolus" name="Résolus" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default AdminDashboardCharts;
