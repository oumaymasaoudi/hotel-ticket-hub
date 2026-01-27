import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowUpDown, Archive, Download, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface BulkActionsProps {
  selectedTickets: string[]
  onSelectionChange: (ticketIds: string[]) => void
  onBulkAssign?: (ticketIds: string[], technicianId: string) => Promise<void>
  onBulkStatusChange?: (ticketIds: string[], status: string) => Promise<void>
  onBulkExport?: (ticketIds: string[]) => void
  technicians?: Array<{ id: string; fullName: string }>
  className?: string
}

export function BulkActions({
  selectedTickets,
  onSelectionChange,
  onBulkAssign,
  onBulkStatusChange,
  onBulkExport,
  technicians = [],
  className,
}: BulkActionsProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const handleBulkAssign = async () => {
    if (!selectedTechnician || !onBulkAssign) return
    setLoading(true)
    try {
      await onBulkAssign(selectedTickets, selectedTechnician)
      setAssignDialogOpen(false)
      setSelectedTechnician("")
      onSelectionChange([])
    } catch (error) {
      console.error("Error assigning tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkStatusChange = async () => {
    if (!selectedStatus || !onBulkStatusChange) return
    setLoading(true)
    try {
      await onBulkStatusChange(selectedTickets, selectedStatus)
      setStatusDialogOpen(false)
      setSelectedStatus("")
      onSelectionChange([])
    } catch (error) {
      console.error("Error changing status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (selectedTickets.length === 0) {
    return null
  }

  return (
    <>
      <div className={className}>
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-lg p-4 z-50 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedTickets.length} sélectionné(s)</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onBulkAssign && technicians.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAssignDialogOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Assigner
              </Button>
            )}

            {onBulkStatusChange && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatusDialogOpen(true)}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Changer statut
              </Button>
            )}

            {onBulkExport && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkExport(selectedTickets)}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Assignation */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner {selectedTickets.length} ticket(s)</DialogTitle>
            <DialogDescription>
              Sélectionnez un technicien pour assigner les tickets sélectionnés.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Technicien</Label>
              <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un technicien" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleBulkAssign} disabled={!selectedTechnician || loading}>
              {loading ? "Assignation..." : "Assigner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Changement de statut */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le statut de {selectedTickets.length} ticket(s)</DialogTitle>
            <DialogDescription>
              Sélectionnez le nouveau statut pour les tickets sélectionnés.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nouveau statut</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Ouvert</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="RESOLVED">Résolu</SelectItem>
                  <SelectItem value="CLOSED">Fermé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleBulkStatusChange} disabled={!selectedStatus || loading}>
              {loading ? "Changement..." : "Changer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SelectAllCheckbox({
  totalCount,
  selectedCount,
  onSelectAll,
  onDeselectAll,
}: {
  totalCount: number
  selectedCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
}) {
  const isAllSelected = selectedCount === totalCount
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount

  return (
    <Checkbox
      checked={isAllSelected}
      ref={(el) => {
        if (el) el.indeterminate = isIndeterminate
      }}
      onCheckedChange={(checked) => {
        if (checked) {
          onSelectAll()
        } else {
          onDeselectAll()
        }
      }}
    />
  )
}

