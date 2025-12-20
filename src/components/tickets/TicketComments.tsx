import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Send, User } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user?: { fullName?: string } | null;
}

interface TicketCommentsProps {
  ticketId: string;
  readOnly?: boolean;
}

export const TicketComments = ({ ticketId, readOnly = false }: TicketCommentsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getTicketComments(ticketId);
      setComments(
        (data || []).map((c: { id: string; content: string; createdAt?: string; created_at?: string; user?: { fullName?: string } | null }) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt || c.created_at || '',
          user: c.user || null,
        }))
      );
    } catch (error) {
      // Error fetching comments
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    if (!user?.userId) {
      toast({ title: "Erreur", description: "Vous devez être connecté pour ajouter un commentaire", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await apiService.addTicketComment(ticketId, newComment.trim(), user.userId);
      toast({ title: "Commentaire ajouté", description: "Votre commentaire a été ajouté avec succès" });
      setNewComment("");
      fetchComments();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible d'ajouter le commentaire";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>Commentaires ({comments.length})</span>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucun commentaire</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  {comment.user?.fullName || "Utilisateur"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comment.createdAt), "dd MMM yyyy à HH:mm", { locale: fr })}
                </span>
              </div>
              <p className="text-sm pl-8">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {!readOnly && user && (
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || submitting}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};