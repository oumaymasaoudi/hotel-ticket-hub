import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, TrendingUp, TicketCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ hotels: 0, tickets: 0, revenue: "0€" });
  const [hotels, setHotels] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: hotelsData } = await supabase.from("hotels").select("*, plans(name)").limit(10);
    const { count: ticketCount } = await supabase.from("tickets").select("id", { count: "exact", head: true });
    
    setHotels(hotelsData || []);
    setStats({ hotels: hotelsData?.length || 0, tickets: ticketCount || 0, revenue: "47.2K€" });
  };

  return (
    <DashboardLayout allowedRoles={["superadmin"]} title="SuperAdmin">
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-card to-accent"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.hotels}</span></div><h3 className="font-semibold">Hôtels actifs</h3></Card>
          <Card className="p-6 bg-gradient-to-br from-card to-accent"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><DollarSign className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.revenue}</span></div><h3 className="font-semibold">Revenus</h3></Card>
          <Card className="p-6 bg-gradient-to-br from-card to-accent"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><TicketCheck className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">{stats.tickets}</span></div><h3 className="font-semibold">Tickets</h3></Card>
          <Card className="p-6 bg-gradient-to-br from-card to-accent"><div className="flex items-center justify-between mb-4"><div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center"><TrendingUp className="h-6 w-6 text-primary" /></div><span className="text-3xl font-bold">94%</span></div><h3 className="font-semibold">SLA global</h3></Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Hôtels</h2>
          <div className="space-y-3">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div><p className="font-medium">{hotel.name}</p><p className="text-sm text-muted-foreground">Plan {hotel.plans?.name}</p></div>
                <Badge className={hotel.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}>{hotel.is_active ? "Actif" : "Inactif"}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
