import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Lightbulb, X, CheckCircle } from "lucide-react"
import { useState } from "react"

interface Suggestion {
  id: string
  type: "info" | "warning" | "success" | "action"
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
}

interface SmartSuggestionsProps {
  suggestions: Suggestion[]
  onDismiss?: (suggestionId: string) => void
  className?: string
}

export function SmartSuggestions({ suggestions, onDismiss, className }: SmartSuggestionsProps) {
  const [dismissed, setDismissed] = useState<string[]>([])

  const visibleSuggestions = suggestions.filter((s) => !dismissed.includes(s.id))

  if (visibleSuggestions.length === 0) {
    return null
  }

  const handleDismiss = (id: string) => {
    setDismissed([...dismissed, id])
    if (onDismiss) {
      onDismiss(id)
    }
  }

  return (
    <div className={className}>
      {visibleSuggestions.map((suggestion) => (
        <Alert
          key={suggestion.id}
          variant={
            suggestion.type === "warning"
              ? "destructive"
              : suggestion.type === "success"
              ? "default"
              : "default"
          }
          className="mb-4"
        >
          <Lightbulb className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>{suggestion.title}</span>
            {suggestion.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleDismiss(suggestion.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{suggestion.message}</span>
            {suggestion.action && (
              <Button size="sm" variant="outline" onClick={suggestion.action.onClick} className="ml-4">
                {suggestion.action.label}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

// Hook pour generer des suggestions intelligentes
export function useSmartSuggestions(tickets: any[], technicians: any[]) {
  const suggestions: Suggestion[] = []

  // Suggestion : Tickets non assignes depuis longtemps
  const unassignedTickets = tickets.filter(
    (t) => t.status === "OPEN" && !t.assignedTechnicianId
  )
  const oldUnassigned = unassignedTickets.filter((t) => {
    if (!t.createdAt) return false
    const daysSinceCreation = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceCreation > 2
  })

  if (oldUnassigned.length > 0) {
    suggestions.push({
      id: "unassigned-old",
      type: "warning",
      title: "Action suggeree",
      message: `${oldUnassigned.length} ticket(s) ouvert(s) depuis plus de 2 jours sans assignation.`,
      action: {
        label: "Voir les tickets",
        onClick: () => {
          // Navigation vers les tickets non assignes
        },
      },
      dismissible: true,
    })
  }

  // Suggestion : Tickets proches de l'echeance SLA
  const nearDeadline = tickets.filter((t) => {
    if (!t.slaDeadline) return false
    const hoursUntilDeadline = (new Date(t.slaDeadline).getTime() - Date.now()) / (1000 * 60 * 60)
    return hoursUntilDeadline > 0 && hoursUntilDeadline < 4
  })

  if (nearDeadline.length > 0) {
    suggestions.push({
      id: "near-deadline",
      type: "warning",
      title: "Echeance proche",
      message: `${nearDeadline.length} ticket(s) approche(nt) de l'echeance SLA.`,
      action: {
        label: "Voir les tickets",
        onClick: () => {
          // Navigation vers les tickets urgents
        },
      },
      dismissible: true,
    })
  }

  // Suggestion : Aucun commentaire depuis longtemps
  const ticketsWithoutComments = tickets.filter((t) => {
    if (!t.comments || t.comments.length === 0) {
      if (!t.createdAt) return false
      const daysSinceCreation = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceCreation > 3
    }
    return false
  })

  if (ticketsWithoutComments.length > 0) {
    suggestions.push({
      id: "no-comments",
      type: "info",
      title: "Suggestion",
      message: `${ticketsWithoutComments.length} ticket(s) sans commentaire depuis 3+ jours.`,
      dismissible: true,
    })
  }

  return suggestions
}

