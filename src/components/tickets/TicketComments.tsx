import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Send, User } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  profiles?: { full_name: string } | null;
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

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ticket_comments")
      .select("*, profiles(full_name)")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !user?.id) return;

    setSubmitting(true);
    const { error } = await supabase.from("ticket_comments").insert({
      ticket_id: ticketId,
      user_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      toast({ title: "Erreur", description: "Impossible d'ajouter le commentaire", variant: "destructive" });
    } else {
      toast({ title: "Commentaire ajouté" });
      setNewComment("");
      fetchComments();
    }
    setSubmitting(false);
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
                  {comment.profiles?.full_name || "Utilisateur"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comment.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}
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