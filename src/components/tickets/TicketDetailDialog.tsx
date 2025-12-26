import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketComments } from "./TicketComments";
import { TicketImageUpload } from "./TicketImageUpload";
import {
  Clock,
  User,
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Mail,
  Phone,
  Tag,
  Download
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { exportTicketToPDF } from "@/utils/exportUtils";
import { TicketResponse } from "@/services/apiService";

interface TicketDetailDialogProps {
  ticket: TicketResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface HistoryEntry {
  id: string;
  action_type: string;
  old_value: string | null;
  new_value: string | null;
  performed_by: string | null;
  created_at: string;
  performer_name?: string;
}

const statusLabels: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  pending: "En attente",
  resolved: "Résolu",
  closed: "Fermé",
};

const statusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  in_progress: "bg-yellow-500/10 text-yellow-500",
  pending: "bg-orange-500/10 text-orange-500",
  resolved: "bg-green-500/10 text-green-500",
  closed: "bg-muted text-muted-foreground",
};

const actionLabels: Record<string, string> = {
  created: "Ticket créé",
  status_change: "Changement de statut",
  technician_assigned: "Technicien assigné",
  technician_removed: "Technicien retiré",
  comment: "Commentaire ajouté",
};

export const TicketDetailDialog = ({ ticket, open, onOpenChange }: TicketDetailDialogProps) => {
  const [history] = useState<HistoryEntry[]>([]);
  const [images, setImages] = useState<{ id: string; storage_path: string; file_name: string }[]>(ticket?.images || []);

  useEffect(() => {
    if (ticket?.images) {
      setImages(ticket.images);
    }
  }, [ticket, open]);

  const getTimelineIcon = (actionType: string) => {
    switch (actionType) {
      case "created":
        return <Circle className="h-4 w-4 text-primary" />;
      case "status_change":
        return <ArrowRight className="h-4 w-4 text-yellow-500" />;
      case "technician_assigned":
        return <User className="h-4 w-4 text-green-500" />;
      case "technician_removed":
        return <User className="h-4 w-4 text-destructive" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatHistoryMessage = (entry: HistoryEntry) => {
    switch (entry.action_type) {
      case "created":
        return "Ticket créé par le client";
      case "status_change":
        return `Statut: ${statusLabels[entry.old_value || ""] || entry.old_value} → ${statusLabels[entry.new_value || ""] || entry.new_value}`;
      case "technician_assigned":
        return `Technicien assigné: ${entry.new_value}`;
      case "technician_removed":
        return `Technicien retiré: ${entry.old_value}`;
      case "comment":
        return `Commentaire: ${entry.new_value}`;
      default:
        return entry.action_type;
    }
  };

  if (!ticket) return null;

  const slaDeadline = ticket.slaDeadline;
  const status = (ticket.status || "").toString();
  const slaRemaining = slaDeadline
    ? formatDistanceToNow(new Date(slaDeadline), { locale: fr, addSuffix: true })
    : null;

  const isSlaOverdue = slaDeadline && new Date(slaDeadline) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{ticket.ticketNumber}</span>
            <Badge className={statusColors[status.toLowerCase()] || statusColors.open}>
              {statusLabels[status.toLowerCase()] || status}
            </Badge>
            {ticket.isUrgent && (
              <Badge variant="destructive">Urgent</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <Card className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Catégorie:</span>
                <span className="font-medium">{ticket.categoryName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Créé:</span>
                <span className="font-medium">
                  {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="font-medium">{ticket.clientEmail}</span>
              </div>
              {ticket.clientPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tél:</span>
                  <span className="font-medium">{ticket.clientPhone}</span>
                </div>
              )}
            </div>

            {/* SLA */}
            {slaDeadline && (
              <div className={`flex items-center gap-2 p-2 rounded-md ${isSlaOverdue ? "bg-destructive/10" : "bg-primary/10"}`}>
                <Clock className={`h-4 w-4 ${isSlaOverdue ? "text-destructive" : "text-primary"}`} />
                <span className="text-sm">
                  SLA: {isSlaOverdue ? "Dépassé " : "Expire "}
                  {slaRemaining}
                </span>
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description:</p>
              <p className="text-sm bg-accent/50 p-3 rounded-md">{ticket.description}</p>
            </div>

            {/* Photos */}
            <div>
              <TicketImageUpload
                ticketId={ticket.id}
                existingImages={images}
                readOnly={false}
                onImagesChange={(newImages) => {
                  // Les images sont automatiquement mises à jour via l'API
                  // On peut recharger le ticket si nécessaire
                }}
              />
            </div>
          </Card>

          {/* Technicien actuel */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Technicien assigné
            </h4>
            {ticket.assignedTechnicianName ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{ticket.assignedTechnicianName}</p>
                  <p className="text-sm text-muted-foreground">Technicien actif</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun technicien assigné</p>
            )}
          </Card>

          {/* Timeline des statuts */}
          <Card className="p-4">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timeline des événements
            </h4>

            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Historique détaillé non disponible.</p>
            ) : (
              <div className="relative">
                {/* Ligne verticale */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

                <div className="space-y-4">
                  {history.map((entry, index) => (
                    <div key={entry.id} className="flex gap-4 relative">
                      {/* Point sur la timeline */}
                      <div className="z-10 flex items-center justify-center h-6 w-6 rounded-full bg-background border-2 border-border">
                        {getTimelineIcon(entry.action_type)}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{actionLabels[entry.action_type] || entry.action_type}</p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatHistoryMessage(entry)}</p>
                        {entry.performer_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Par: {entry.performer_name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* État actuel */}
                  <div className="flex gap-4 relative">
                    <div className="z-10 flex items-center justify-center h-6 w-6 rounded-full bg-primary">
                      <Circle className="h-3 w-3 text-primary-foreground fill-current" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">État actuel</p>
                      <Badge className={statusColors[ticket.status] || statusColors.open}>
                        {statusLabels[ticket.status] || ticket.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Commentaires */}
          <Card className="p-4">
            <TicketComments ticketId={ticket.id} />
          </Card>

          {/* Bouton Export PDF */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => exportTicketToPDF(ticket)}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
