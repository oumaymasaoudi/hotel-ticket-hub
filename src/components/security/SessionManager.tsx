import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Shield, Monitor, Smartphone, Tablet, Globe } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/services/apiService"

interface Session {
  id: string
  device: string
  browser: string
  location?: string
  ipAddress: string
  lastActivity: string
  isCurrent: boolean
}

export function SessionManager() {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      // Simuler l'appel API - a implementer dans apiService
      const mockSessions: Session[] = [
        {
          id: "1",
          device: "Windows",
          browser: "Chrome",
          location: "Paris, France",
          ipAddress: "192.168.1.1",
          lastActivity: new Date().toISOString(),
          isCurrent: true,
        },
        {
          id: "2",
          device: "iPhone",
          browser: "Safari",
          location: "Lyon, France",
          ipAddress: "192.168.1.2",
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          isCurrent: false,
        },
      ]
      setSessions(mockSessions)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les sessions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // Appel API pour revoquer la session
      setSessions(sessions.filter((s) => s.id !== sessionId))
      toast({
        title: "Session revoquee",
        description: "La session a ete deconnectee avec succes",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de revoquer la session",
        variant: "destructive",
      })
    }
  }

  const handleRevokeAllOtherSessions = async () => {
    try {
      // Appel API pour revoquer toutes les autres sessions
      setSessions(sessions.filter((s) => s.isCurrent))
      toast({
        title: "Sessions revoquees",
        description: "Toutes les autres sessions ont ete deconnectees",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de revoquer les sessions",
        variant: "destructive",
      })
    }
  }

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("android")) {
      return <Smartphone className="h-4 w-4" />
    } else if (device.toLowerCase().includes("ipad") || device.toLowerCase().includes("tablet")) {
      return <Tablet className="h-4 w-4" />
    } else {
      return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sessions actives
            </CardTitle>
            <CardDescription>Gerez vos sessions actives et votre securite</CardDescription>
          </div>
          {sessions.filter((s) => !s.isCurrent).length > 0 && (
            <Button variant="outline" size="sm" onClick={handleRevokeAllOtherSessions}>
              <LogOut className="h-4 w-4 mr-2" />
              Deconnecter toutes les autres
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Appareil</TableHead>
              <TableHead>Navigateur</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Derniere activite</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(session.device)}
                    <span>{session.device}</span>
                  </div>
                </TableCell>
                <TableCell>{session.browser}</TableCell>
                <TableCell>
                  {session.location ? (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {session.location}
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(session.lastActivity), "dd MMM yyyy HH:mm", { locale: fr })}
                </TableCell>
                <TableCell>
                  {session.isCurrent ? (
                    <Badge variant="default">Session actuelle</Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

