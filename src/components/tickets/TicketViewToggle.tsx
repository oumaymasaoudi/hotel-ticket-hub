import { Button } from "@/components/ui/button"
import { List, LayoutGrid, Columns3 } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewMode = "list" | "kanban" | "grid"

interface TicketViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  className?: string
}

export function TicketViewToggle({ viewMode, onViewModeChange, className }: TicketViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-2 border rounded-lg p-1", className)}>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className="flex items-center gap-2"
      >
        <List className="h-4 w-4" />
        Liste
      </Button>
      <Button
        variant={viewMode === "kanban" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("kanban")}
        className="flex items-center gap-2"
      >
        <Columns3 className="h-4 w-4" />
        Kanban
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="flex items-center gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        Grille
      </Button>
    </div>
  )
}

