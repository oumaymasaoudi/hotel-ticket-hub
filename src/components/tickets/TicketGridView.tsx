import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TicketResponse } from "@/services/apiService"
import { Clock, User, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface TicketGridViewProps {
  tickets: TicketResponse[]
  onTicketClick?: (ticket: TicketResponse) => void
  className?: string
}

export function TicketGridView({ tickets, onTicketClick, className }: TicketGridViewProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onTicketClick?.(ticket)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium">{ticket.ticketNumber}</CardTitle>
              {ticket.isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
            <Badge variant="outline" className="text-xs">
              {ticket.categoryName}
            </Badge>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              {ticket.assignedTechnicianName && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{ticket.assignedTechnicianName}</span>
                </div>
              )}
              {ticket.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(ticket.createdAt), "dd MMM", { locale: fr })}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {tickets.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          Aucun ticket trouvé
        </div>
      )}
    </div>
  )
}

