import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TicketResponse } from "@/services/apiService"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface KanbanBoardProps {
  tickets: TicketResponse[]
  onStatusChange: (ticketId: string, newStatus: TicketResponse["status"]) => Promise<void>
  onTicketClick?: (ticket: TicketResponse) => void
}

const statusColumns: Array<{
  id: TicketResponse["status"]
  title: string
  color: string
}> = [
  { id: "OPEN", title: "Ouverts", color: "bg-red-100 border-red-300" },
  { id: "IN_PROGRESS", title: "En cours", color: "bg-blue-100 border-blue-300" },
  { id: "PENDING", title: "En attente", color: "bg-yellow-100 border-yellow-300" },
  { id: "RESOLVED", title: "Résolus", color: "bg-green-100 border-green-300" },
  { id: "CLOSED", title: "Fermés", color: "bg-gray-100 border-gray-300" },
]

function TicketCard({
  ticket,
  onTicketClick,
}: {
  ticket: TicketResponse
  onTicketClick?: (ticket: TicketResponse) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onTicketClick?.(ticket)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-sm font-medium">{ticket.ticketNumber}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {ticket.description}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {ticket.isUrgent && (
              <Badge variant="destructive" className="text-xs">
                Urgent
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {ticket.categoryName}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          {ticket.assignedTechnicianName && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{ticket.assignedTechnicianName}</span>
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
  )
}

function KanbanColumn({
  status,
  tickets,
  onTicketClick,
}: {
  status: typeof statusColumns[0]
  tickets: TicketResponse[]
  onTicketClick?: (ticket: TicketResponse) => void
}) {
  return (
    <div className="flex-1 min-w-[280px]">
      <Card className={`${status.color} border-2`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>{status.title}</span>
            <Badge variant="secondary" className="text-xs">
              {tickets.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 min-h-[200px]">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onTicketClick={onTicketClick} />
              ))}
              {tickets.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Aucun ticket
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  )
}

export function KanbanBoard({ tickets, onStatusChange, onTicketClick }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isChanging, setIsChanging] = useState(false)

  const ticketsByStatus = statusColumns.reduce((acc, column) => {
    acc[column.id] = tickets.filter((t) => t.status === column.id)
    return acc
  }, {} as Record<TicketResponse["status"], TicketResponse[]>)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const ticketId = active.id as string
    const newStatus = over.id as TicketResponse["status"]

    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket || ticket.status === newStatus) return

    setIsChanging(true)
    try {
      await onStatusChange(ticketId, newStatus)
    } catch (error) {
      console.error("Error changing ticket status:", error)
    } finally {
      setIsChanging(false)
    }
  }

  const activeTicket = activeId ? tickets.find((t) => t.id === activeId) : null

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            status={column}
            tickets={ticketsByStatus[column.id] || []}
            onTicketClick={onTicketClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTicket ? (
          <div className="opacity-50">
            <TicketCard ticket={activeTicket} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

