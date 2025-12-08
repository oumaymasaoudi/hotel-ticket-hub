import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const SuperAdminDashboardCharts = () => {
  const [ticketsByStatus, setTicketsByStatus] = useState<any[]>([]);
  const [ticketsByHotel, setTicketsByHotel] = useState<any[]>([]);
  const [ticketsTrend, setTicketsTrend] = useState<any[]>([]);
  const [hotelsByPlan, setHotelsByPlan] = useState<any[]>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    // Fetch all data
    const [ticketsRes, hotelsRes, categoriesRes, plansRes] = await Promise.all([
      supabase.from('tickets').select('*, categories(name, color), hotels(name)'),
      supabase.from('hotels').select('*, plans(name, base_cost)'),
      supabase.from('categories').select('*'),
      supabase.from('plans').select('*')
    ]);

    const tickets = ticketsRes.data || [];
    const hotels = hotelsRes.data || [];
    const categories = categoriesRes.data || [];
    const plans = plansRes.data || [];

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

    // Tickets by hotel (top 5)
    const hotelCounts: Record<string, number> = {};
    tickets.forEach(t => {
      const hotelName = t.hotels?.name || 'Inconnu';
      hotelCounts[hotelName] = (hotelCounts[hotelName] || 0) + 1;
    });
    const sortedHotels = Object.entries(hotelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, tickets: count }));
    setTicketsByHotel(sortedHotels);

    // Tickets trend (last 14 days)
    const trendData: { date: string; tickets: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, 'yyyy-MM-dd');
      const displayDate = format(day, 'dd/MM', { locale: fr });
      
      const count = tickets.filter(t => 
        t.created_at && format(new Date(t.created_at), 'yyyy-MM-dd') === dayStr
      ).length;
      
      trendData.push({ date: displayDate, tickets: count });
    }
    setTicketsTrend(trendData);

    // Hotels by plan
    const planCounts: Record<string, number> = {};
    hotels.forEach(h => {
      const planName = h.plans?.name || 'Inconnu';
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });
    setHotelsByPlan(Object.entries(planCounts).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    })));

    // Revenue by plan
    const revenueData = plans.map(p => {
      const hotelCount = hotels.filter(h => h.plan_id === p.id).length;
      return {
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        revenue: hotelCount * p.base_cost,
        hotels: hotelCount
      };
    });
    setRevenueByPlan(revenueData);

    // Category distribution
    const catCounts: Record<string, { count: number; color: string }> = {};
    tickets.forEach(t => {
      const catName = t.categories?.name || 'Autre';
      const catColor = t.categories?.color || '#888';
      if (!catCounts[catName]) {
        catCounts[catName] = { count: 0, color: catColor };
      }
      catCounts[catName].count++;
    });
    const sortedCats = Object.entries(catCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([name, data]) => ({ name, value: data.count, color: data.color }));
    setCategoryDistribution(sortedCats);
  };

  return (
    <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Tickets Trend */}
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-bold mb-4">Évolution des tickets (14 jours)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={ticketsTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="tickets" 
              name="Tickets créés"
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Hotels by Plan */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Hôtels par plan</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={hotelsByPlan}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {hotelsByPlan.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Tickets by Hotel */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Top 5 hôtels (tickets)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ticketsByHotel} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="name" type="category" width={80} className="text-xs" />
            <Tooltip />
            <Bar dataKey="tickets" name="Tickets" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Revenue by Plan */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Revenus mensuels par plan</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueByPlan}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip formatter={(value) => `${value}€`} />
            <Bar dataKey="revenue" name="Revenus (€)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tickets by Status */}
      <Card className="p-6">
        <h3 className="font-bold mb-4">Tickets par statut</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={ticketsByStatus}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => value > 0 ? `${name}` : ''}
            >
              {ticketsByStatus.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Category Distribution */}
      <Card className="p-6 lg:col-span-2 xl:col-span-1">
        <h3 className="font-bold mb-4">Top catégories</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={categoryDistribution}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="value" name="Tickets" radius={[4, 4, 0, 0]}>
              {categoryDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default SuperAdminDashboardCharts;
