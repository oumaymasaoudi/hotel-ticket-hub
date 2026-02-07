import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { TicketResponse } from "@/services/apiService"
import { BulkActions, SelectAllCheckbox } from "./BulkActions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface TicketListWithBulkActionsProps {
  tickets: TicketResponse[]
  onTicketClick?: (ticket: TicketResponse) => void
  onBulkAssign?: (ticketIds: string[], technicianId: string) => Promise<void>
  onBulkStatusChange?: (ticketIds: string[], status: string) => Promise<void>
  onBulkExport?: (ticketIds: string[]) => void
  technicians?: Array<{ id: string; fullName: string }>
}

export function TicketListWithBulkActions({
  tickets,
  onTicketClick,
  onBulkAssign,
  onBulkStatusChange,
  onBulkExport,
  technicians = [],
}: TicketListWithBulkActionsProps) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])

  const handleSelectAll = () => {
    setSelectedTickets(tickets.map((t) => t.id))
  }

  const handleDeselectAll = () => {
    setSelectedTickets([])
  }

  const handleToggleTicket = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]
    )
  }

  const statusLabels: Record<TicketResponse["status"], string> = {
    OPEN: "Ouvert",
    IN_PROGRESS: "En cours",
    PENDING: "En attente",
    RESOLVED: "Résolu",
    CLOSED: "Fermé",
  }

  const statusVariants: Record<TicketResponse["status"], "default" | "secondary" | "destructive" | "outline"> = {
    OPEN: "destructive",
    IN_PROGRESS: "secondary",
    PENDING: "outline",
    RESOLVED: "default",
    CLOSED: "default",
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <SelectAllCheckbox
                  totalCount={tickets.length}
                  selectedCount={selectedTickets.length}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                />
              </TableHead>
              <TableHead>Numéro</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Technicien</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTickets.includes(ticket.id)}
                    onCheckedChange={() => handleToggleTicket(ticket.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                <TableCell className="max-w-[300px] truncate">{ticket.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.categoryName}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[ticket.status]}>
                    {statusLabels[ticket.status]}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.assignedTechnicianName || "-"}</TableCell>
                <TableCell>
                  {ticket.createdAt
                    ? format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: fr })
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onTicketClick?.(ticket)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BulkActions
        selectedTickets={selectedTickets}
        onSelectionChange={setSelectedTickets}
        onBulkAssign={onBulkAssign}
        onBulkStatusChange={onBulkStatusChange}
        onBulkExport={onBulkExport}
        technicians={technicians}
      />
    </>
  )
}

