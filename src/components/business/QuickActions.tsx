import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Zap, FileText, UserPlus, Settings, Download } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  shortcut?: string
  roles?: string[]
}

export function QuickActions() {
  const navigate = useNavigate()
  const { role } = useAuth()

  const actions: QuickAction[] = [
    {
      id: "create-ticket",
      label: "Nouveau ticket",
      icon: FileText,
      action: () => navigate("/create-ticket"),
      shortcut: "Ctrl+N",
      roles: ["admin", "client"],
    },
    {
      id: "create-technician",
      label: "Ajouter un technicien",
      icon: UserPlus,
      action: () => navigate("/dashboard/admin/technicians?action=create"),
      roles: ["admin"],
    },
    {
      id: "export-data",
      label: "Exporter les donnees",
      icon: Download,
      action: () => {
        // Action d'export
      },
      roles: ["admin", "superadmin"],
    },
    {
      id: "settings",
      label: "Parametres",
      icon: Settings,
      action: () => navigate("/dashboard/settings"),
    },
  ]

  const filteredActions = actions.filter(
    (action) => !action.roles || action.roles.includes(role || "")
  )

  if (filteredActions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Zap className="h-4 w-4" />
          Actions rapides
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions rapides</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredActions.map((action) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem key={action.id} onClick={action.action} className="cursor-pointer">
              <Icon className="h-4 w-4 mr-2" />
              <span>{action.label}</span>
              {action.shortcut && (
                <span className="ml-auto text-xs text-muted-foreground">{action.shortcut}</span>
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

