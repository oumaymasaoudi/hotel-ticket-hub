import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Search, Download, Filter, Eye } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ExportButton } from "@/components/export/ExportButton"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  userRole: string
  action: string
  entity: string
  entityId: string
  details: string
  ipAddress: string
  status: "success" | "failure" | "warning"
  changes?: {
    field: string
    oldValue: string
    newValue: string
  }[]
}

export function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<string>("all")
  const [filterUser, setFilterUser] = useState<string>("all")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, filterAction, filterUser])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // Simuler l'appel API - a implementer dans apiService
      const mockLogs: AuditLog[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          user: "admin@hotel.com",
          userRole: "ADMIN",
          action: "UPDATE_TICKET",
          entity: "Ticket",
          entityId: "TKT-001",
          details: "Statut change de OPEN a IN_PROGRESS",
          ipAddress: "192.168.1.1",
          status: "success",
          changes: [
            { field: "status", oldValue: "OPEN", newValue: "IN_PROGRESS" },
            { field: "assignedTechnicianId", oldValue: "", newValue: "tech-123" },
          ],
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: "tech@hotel.com",
          userRole: "TECHNICIAN",
          action: "CREATE_COMMENT",
          entity: "Comment",
          entityId: "CMT-001",
          details: "Commentaire ajoute au ticket TKT-001",
          ipAddress: "192.168.1.2",
          status: "success",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: "admin@hotel.com",
          userRole: "ADMIN",
          action: "DELETE_USER",
          entity: "User",
          entityId: "user-456",
          details: "Utilisateur supprime",
          ipAddress: "192.168.1.1",
          status: "warning",
        },
      ]
      setLogs(mockLogs)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = [...logs]

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterAction !== "all") {
      filtered = filtered.filter((log) => log.action === filterAction)
    }

    if (filterUser !== "all") {
      filtered = filtered.filter((log) => log.user === filterUser)
    }

    setFilteredLogs(filtered)
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE_TICKET: "Creation ticket",
      UPDATE_TICKET: "Modification ticket",
      DELETE_TICKET: "Suppression ticket",
      CREATE_COMMENT: "Ajout commentaire",
      UPDATE_USER: "Modification utilisateur",
      DELETE_USER: "Suppression utilisateur",
      ASSIGN_TICKET: "Assignation ticket",
      ESCALATE_TICKET: "Escalade ticket",
    }
    return labels[action] || action
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default"
      case "failure":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)))
  const uniqueUsers = Array.from(new Set(logs.map((log) => log.user)))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Journal d'audit
            </CardTitle>
            <CardDescription>Historique complet de toutes les actions effectuees</CardDescription>
          </div>
          <ExportButton data={filteredLogs} filename="audit-trail" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {getActionLabel(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Utilisateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tableau des logs */}
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Heure</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entite</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucun log trouve
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.timestamp), "dd MMM yyyy HH:mm:ss", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.user}</div>
                          <div className="text-xs text-muted-foreground">{log.userRole}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getActionLabel(log.action)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{log.entity}</div>
                          <div className="text-xs text-muted-foreground">{log.entityId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{log.details}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(log.status)}>
                          {log.status === "success" ? "Succes" : log.status === "failure" ? "Echec" : "Avertissement"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>

      {/* Dialog pour voir les details */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full m-4">
            <CardHeader>
              <CardTitle>Details de l'action</CardTitle>
              <CardDescription>
                {format(new Date(selectedLog.timestamp), "dd MMM yyyy HH:mm:ss", { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Utilisateur</div>
                <div className="text-sm text-muted-foreground">
                  {selectedLog.user} ({selectedLog.userRole})
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Action</div>
                <div className="text-sm text-muted-foreground">{getActionLabel(selectedLog.action)}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Entite</div>
                <div className="text-sm text-muted-foreground">
                  {selectedLog.entity} ({selectedLog.entityId})
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Details</div>
                <div className="text-sm text-muted-foreground">{selectedLog.details}</div>
              </div>
              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Modifications</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Champ</TableHead>
                        <TableHead>Ancienne valeur</TableHead>
                        <TableHead>Nouvelle valeur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedLog.changes.map((change, index) => (
                        <TableRow key={index}>
                          <TableCell>{change.field}</TableCell>
                          <TableCell className="text-muted-foreground">{change.oldValue || "-"}</TableCell>
                          <TableCell className="font-medium">{change.newValue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div>
                <div className="text-sm font-medium mb-2">Adresse IP</div>
                <div className="text-sm text-muted-foreground">{selectedLog.ipAddress}</div>
              </div>
              <Button onClick={() => setSelectedLog(null)} className="w-full">
                Fermer
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}

