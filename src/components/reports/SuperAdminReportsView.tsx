import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Loader2, Building2, BarChart3, Clock } from 'lucide-react';
import { useReports } from '@/hooks/useReports';

const SuperAdminReportsView = () => {
  const { loading, generateSuperAdminPDF, generateSuperAdminExcel } = useReports();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Rapport Mensuel Global</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Statistiques globales de la plateforme : tickets, catégories, performance générale.
              </p>
              <Button onClick={() => generateSuperAdminPDF('monthly')} disabled={loading}>
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
              <h3 className="font-bold mb-2">Rapport Financier</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Revenus détaillés, paiements par hôtel, analyse financière complète.
              </p>
              <Button variant="outline" onClick={generateSuperAdminExcel} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Télécharger Excel
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Rapport SLA</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Performance des interventions, conformité SLA par hôtel et globale.
              </p>
              <Button variant="outline" onClick={() => generateSuperAdminPDF('sla')} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Télécharger PDF
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Rapport par Hôtel</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Statistiques détaillées par établissement : tickets, résolutions, SLA.
              </p>
              <Button variant="outline" onClick={() => generateSuperAdminPDF('hotel')} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Télécharger PDF
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold mb-4">Détail des rapports disponibles</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Rapport Mensuel
            </h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Total tickets par statut</li>
              <li>Répartition par catégorie</li>
              <li>Tickets escaladés</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-500" />
              Rapport Financier
            </h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Revenus par hôtel</li>
              <li>Détail par plan</li>
              <li>Liste complète tickets</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Rapport SLA
            </h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Conformité par hôtel</li>
              <li>Temps de résolution</li>
              <li>Tickets hors délai</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              Rapport Hôtels
            </h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Stats par hôtel</li>
              <li>Plan et quotas</li>
              <li>Performance globale</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminReportsView;
