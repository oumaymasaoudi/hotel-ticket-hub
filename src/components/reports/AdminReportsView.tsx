import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const AdminReportsView = () => {
  const { loading, generateAdminPDF, generateAdminExcel } = useReports();
  const { user } = useAuth();
  const [hotelInfo, setHotelInfo] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchHotelInfo = async () => {
      if (!user) return;
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('hotel_id')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleData?.hotel_id) {
        const { data: hotel } = await supabase
          .from('hotels')
          .select('id, name')
          .eq('id', roleData.hotel_id)
          .single();

        if (hotel) {
          setHotelInfo(hotel);
        }
      }
    };

    fetchHotelInfo();
  }, [user]);

  const handleDownloadPDF = async () => {
    if (!hotelInfo) return;
    await generateAdminPDF(hotelInfo.id, hotelInfo.name);
  };

  const handleDownloadExcel = async () => {
    if (!hotelInfo) return;
    await generateAdminExcel(hotelInfo.id, hotelInfo.name);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Rapport Mensuel des Tickets</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Statistiques complètes des tickets : ouverts, résolus, escaladés, répartition par catégorie.
              </p>
              <Button onClick={handleDownloadPDF} disabled={loading || !hotelInfo}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Télécharger PDF
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <FileSpreadsheet className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Rapport Performance Techniciens</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Performance détaillée : tickets assignés, résolus, temps de résolution moyen.
              </p>
              <Button variant="outline" onClick={handleDownloadExcel} disabled={loading || !hotelInfo}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Télécharger Excel
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold mb-4">Contenu des rapports</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2">Rapport PDF</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Statistiques des tickets par statut</li>
              <li>Performance des techniciens</li>
              <li>Répartition par catégorie</li>
              <li>Date de génération</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Rapport Excel</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Feuille résumé avec statistiques</li>
              <li>Feuille détail techniciens</li>
              <li>Liste complète des tickets</li>
              <li>Données exportables et filtrables</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminReportsView;
