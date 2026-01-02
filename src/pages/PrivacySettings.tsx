import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiService, GdprConsent, GdprDataExport } from "@/services/apiService";
import { Download, Trash2, Shield, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CONSENT_TYPES = [
  {
    id: 'DATA_PROCESSING',
    label: 'Traitement des données personnelles',
    description: 'Autoriser le traitement de vos données pour la fourniture du service',
    required: true,
  },
  {
    id: 'MARKETING',
    label: 'Communications marketing',
    description: 'Recevoir des emails promotionnels et des offres spéciales',
    required: false,
  },
  {
    id: 'ANALYTICS',
    label: 'Analyse et statistiques',
    description: 'Autoriser l\'utilisation de vos données pour améliorer le service',
    required: false,
  },
  {
    id: 'THIRD_PARTY',
    label: 'Partage avec des tiers',
    description: 'Autoriser le partage de données avec nos partenaires de confiance',
    required: false,
  },
];

const PrivacySettings = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [consents, setConsents] = useState<GdprConsent[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchConsents();
    }
  }, [authLoading, user]);

  const fetchConsents = async () => {
    try {
      const data = await apiService.getUserConsents();
      setConsents(data);
    } catch (error) {
      console.error('Error fetching consents:', error);
    }
  };

  const updateConsent = async (consentType: string, consented: boolean) => {
    setLoading(true);
    try {
      await apiService.recordGdprConsent(consentType, consented);
      await fetchConsents();
      toast({
        title: "Consentement mis à jour",
        description: `Votre consentement pour "${CONSENT_TYPES.find(c => c.id === consentType)?.label}" a été ${consented ? 'accordé' : 'révoqué'}.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le consentement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data: GdprDataExport = await apiService.exportUserData();
      
      // Créer un fichier JSON téléchargeable
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Vos données personnelles ont été téléchargées.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'exporter vos données",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleRequestDeletion = async () => {
    setDeleting(true);
    try {
      const result = await apiService.requestDataDeletion();
      toast({
        title: "Demande enregistrée",
        description: result.message || "Votre demande de suppression a été enregistrée. Elle sera traitée dans les 30 jours.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer la demande de suppression",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getConsentStatus = (consentType: string): boolean => {
    const consent = consents.find(c => c.consentType === consentType);
    return consent?.consented ?? false;
  };

  if (authLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <DashboardLayout allowedRoles={['client', 'technician', 'admin', 'superadmin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Paramètres de confidentialité</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos préférences de confidentialité et vos données personnelles conformément au RGPD
          </p>
        </div>

        {/* Consentements RGPD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Consentements RGPD
            </CardTitle>
            <CardDescription>
              Gérez vos consentements pour le traitement de vos données personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {CONSENT_TYPES.map((consentType) => {
              const isConsented = getConsentStatus(consentType.id);
              const isRequired = consentType.required;

              return (
                <div key={consentType.id} className="flex items-start justify-between space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={consentType.id} className="text-base font-medium">
                        {consentType.label}
                      </Label>
                      {isRequired && (
                        <span className="text-xs text-muted-foreground">(Requis)</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{consentType.description}</p>
                    {consents.find(c => c.consentType === consentType.id) && (
                      <p className="text-xs text-muted-foreground">
                        Dernière mise à jour : {new Date(consents.find(c => c.consentType === consentType.id)!.updatedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={consentType.id}
                      checked={isConsented}
                      onCheckedChange={(checked) => {
                        if (isRequired && !checked) {
                          toast({
                            title: "Consentement requis",
                            description: "Ce consentement est requis pour utiliser le service.",
                            variant: "destructive",
                          });
                          return;
                        }
                        updateConsent(consentType.id, checked);
                      }}
                      disabled={loading || (isRequired && isConsented)}
                    />
                    {isConsented ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Export des données */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export de vos données (Article 15 RGPD)
            </CardTitle>
            <CardDescription>
              Téléchargez une copie de toutes vos données personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Vous avez le droit de recevoir une copie de toutes vos données personnelles que nous détenons.
              Les données seront exportées au format JSON.
            </p>
            <Button
              onClick={handleExportData}
              disabled={exporting}
              variant="outline"
            >
              {exporting ? (
                <>
                  <FileText className="mr-2 h-4 w-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter mes données
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Droit à l'oubli */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Droit à l'oubli (Article 17 RGPD)
            </CardTitle>
            <CardDescription>
              Demander la suppression de toutes vos données personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-destructive mb-2">
                  ⚠️ Attention : Cette action est irréversible
                </p>
                <p className="text-sm text-muted-foreground">
                  La suppression de vos données entraînera :
                </p>
                <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
                  <li>La suppression de votre compte utilisateur</li>
                  <li>L'anonymisation de vos tickets (pour statistiques)</li>
                  <li>La suppression de vos consentements RGPD</li>
                  <li>L'anonymisation de vos logs d'audit</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  Votre demande sera traitée dans un délai maximum de 30 jours.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    {deleting ? (
                      <>
                        <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Demander la suppression de mes données
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la demande de suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir demander la suppression de toutes vos données personnelles ?
                      Cette action est irréversible et votre compte sera supprimé après traitement de la demande.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRequestDeletion}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirmer la demande
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Informations légales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations légales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez de droits sur vos données personnelles.
            </p>
            <p>
              Pour plus d'informations, consultez notre{" "}
              <a href="/privacy-policy" className="text-primary hover:underline">
                politique de confidentialité
              </a>
              .
            </p>
            <p>
              Pour toute question, contactez-nous à :{" "}
              <a href="mailto:privacy@hotel-tickethub.com" className="text-primary hover:underline">
                privacy@hotel-tickethub.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PrivacySettings;

