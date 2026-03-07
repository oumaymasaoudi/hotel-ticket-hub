import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Ticket, Users, Building2, Settings, FileText, CreditCard, BarChart3, Plus, Search } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { apiService } from "@/services/apiService"

interface CommandAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  keywords: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()
  const { user, role } = useAuth()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Charger les tickets pour la recherche
  useEffect(() => {
    if (open && user?.userId) {
      loadTickets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.userId])

  const loadTickets = async () => {
    try {
      if (role === "technician") {
        const data = await apiService.getTicketsByTechnician(user!.userId)
        setTickets(data)
      } else if (role === "admin") {
        const data = await apiService.getTicketsByHotel(user!.hotelId || "")
        setTickets(data)
      }
    } catch (error) {
      console.error("Error loading tickets:", error)
    }
  }

  const getNavigationActions = (): CommandAction[] => {
    const baseActions: CommandAction[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <BarChart3 className="h-4 w-4" />,
        action: () => {
          navigate(`/dashboard/${role}`)
          setOpen(false)
        },
        keywords: ["dashboard", "accueil", "home"],
      },
    ]

    if (role === "admin" || role === "superadmin") {
      baseActions.push(
        {
          id: "tickets",
          label: "Tickets",
          icon: <Ticket className="h-4 w-4" />,
          action: () => {
            navigate(`/dashboard/${role}?view=tickets`)
            setOpen(false)
          },
          keywords: ["tickets", "demandes"],
        },
        {
          id: "technicians",
          label: "Techniciens",
          icon: <Users className="h-4 w-4" />,
          action: () => {
            navigate(`/dashboard/${role}?view=technicians`)
            setOpen(false)
          },
          keywords: ["techniciens", "users", "utilisateurs"],
        },
        {
          id: "reports",
          label: "Rapports",
          icon: <FileText className="h-4 w-4" />,
          action: () => {
            navigate(`/dashboard/${role}?view=reports`)
            setOpen(false)
          },
          keywords: ["rapports", "reports", "statistiques"],
        },
        {
          id: "payments",
          label: "Paiements",
          icon: <CreditCard className="h-4 w-4" />,
          action: () => {
            navigate(`/dashboard/${role}?view=payments`)
            setOpen(false)
          },
          keywords: ["paiements", "payments", "factures"],
        }
      )
    }

    if (role === "superadmin") {
      baseActions.push(
        {
          id: "hotels",
          label: "Hôtels",
          icon: <Building2 className="h-4 w-4" />,
          action: () => {
            navigate(`/dashboard/${role}?view=hotels`)
            setOpen(false)
          },
          keywords: ["hotels", "hôtels"],
        },
        {
          id: "settings",
          label: "Paramètres",
          icon: <Settings className="h-4 w-4" />,
          action: () => {
            navigate(`/dashboard/${role}?view=settings`)
            setOpen(false)
          },
          keywords: ["paramètres", "settings", "config"],
        }
      )
    }

    return baseActions
  }

  const getQuickActions = (): CommandAction[] => {
    const actions: CommandAction[] = []

    if (role === "admin" || role === "client") {
      actions.push({
        id: "create-ticket",
        label: "Créer un ticket",
        icon: <Plus className="h-4 w-4" />,
        action: () => {
          navigate("/create-ticket")
          setOpen(false)
        },
        keywords: ["créer", "nouveau", "ticket", "create"],
      })
    }

    return actions
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return false
    const query = searchQuery.toLowerCase()
    return (
      ticket.ticketNumber?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query) ||
      ticket.clientEmail?.toLowerCase().includes(query)
    )
  })

  const navigationActions = getNavigationActions()
  const quickActions = getQuickActions()

  const filteredNavigation = navigationActions.filter((action) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      action.label.toLowerCase().includes(query) ||
      action.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    )
  })

  const filteredQuickActions = quickActions.filter((action) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      action.label.toLowerCase().includes(query) ||
      action.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    )
  })

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher des tickets, pages, actions..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

          {filteredQuickActions.length > 0 && (
            <>
              <CommandGroup heading="Actions rapides">
                {filteredQuickActions.map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => action.action()}
                    className="flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {filteredNavigation.length > 0 && (
            <CommandGroup heading="Navigation">
              {filteredNavigation.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => action.action()}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {filteredTickets.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Tickets">
                {filteredTickets.slice(0, 5).map((ticket) => (
                  <CommandItem
                    key={ticket.id}
                    onSelect={() => {
                      navigate(`/dashboard/${role}?ticketId=${ticket.id}`)
                      setOpen(false)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Ticket className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{ticket.ticketNumber}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {ticket.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>

      {/* Bouton pour ouvrir la palette (optionnel) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-50"
        title="Recherche globale (Ctrl+K)"
      >
        <Search className="h-5 w-5" />
      </button>
    </>
  )
}

