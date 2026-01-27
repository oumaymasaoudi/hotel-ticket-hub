import { Clock, User, MessageSquare, ArrowUp, CheckCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface TimelineEvent {
  id: string
  type: "created" | "assigned" | "status_changed" | "commented" | "escalated" | "resolved"
  user: string
  date: Date | string
  description: string
  metadata?: {
    oldStatus?: string
    newStatus?: string
    technicianName?: string
    comment?: string
  }
}

interface TicketTimelineProps {
  events: TimelineEvent[]
}

const eventIcons = {
  created: FileText,
  assigned: User,
  status_changed: Clock,
  commented: MessageSquare,
  escalated: ArrowUp,
  resolved: CheckCircle,
}

const eventColors = {
  created: "bg-blue-500",
  assigned: "bg-purple-500",
  status_changed: "bg-yellow-500",
  commented: "bg-green-500",
  escalated: "bg-red-500",
  resolved: "bg-emerald-500",
}

export function TicketTimeline({ events }: TicketTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = typeof a.date === "string" ? new Date(a.date) : a.date
    const dateB = typeof b.date === "string" ? new Date(b.date) : b.date
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-6">
        {sortedEvents.map((event, index) => {
          const Icon = eventIcons[event.type]
          const color = eventColors[event.type]
          const eventDate = typeof event.date === "string" ? new Date(event.date) : event.date

          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Point sur la ligne */}
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border">
                <div className={cn("h-3 w-3 rounded-full", color)} />
              </div>

              {/* Contenu */}
              <div className="flex-1 space-y-1 pb-6">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{event.description}</p>
                </div>

                {event.metadata && (
                  <div className="ml-6 space-y-1 text-sm text-muted-foreground">
                    {event.metadata.oldStatus && event.metadata.newStatus && (
                      <p>
                        Statut: <span className="font-medium">{event.metadata.oldStatus}</span> →{" "}
                        <span className="font-medium">{event.metadata.newStatus}</span>
                      </p>
                    )}
                    {event.metadata.technicianName && (
                      <p>
                        Assigné à: <span className="font-medium">{event.metadata.technicianName}</span>
                      </p>
                    )}
                    {event.metadata.comment && (
                      <p className="italic">"{event.metadata.comment}"</p>
                    )}
                  </div>
                )}

                <div className="ml-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{event.user}</span>
                  <span>•</span>
                  <span>{format(eventDate, "PPp", { locale: fr })}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

