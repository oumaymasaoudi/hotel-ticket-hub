import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, X, Ticket, User, AlertTriangle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export interface Notification {
  id: string
  type: "ticket" | "user" | "system" | "alert" | "success"
  title: string
  message: string
  timestamp: Date | string
  read: boolean
  actionUrl?: string
  metadata?: {
    ticketId?: string
    userId?: string
  }
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onDelete: (notificationId: string) => void
  onNotificationClick?: (notification: Notification) => void
}

const notificationIcons = {
  ticket: Ticket,
  user: User,
  system: AlertTriangle,
  alert: AlertTriangle,
  success: CheckCircle,
}

const notificationColors = {
  ticket: "text-blue-500",
  user: "text-purple-500",
  system: "text-gray-500",
  alert: "text-red-500",
  success: "text-green-500",
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = typeof a.timestamp === "string" ? new Date(a.timestamp) : a.timestamp
    const dateB = typeof b.timestamp === "string" ? new Date(b.timestamp) : b.timestamp
    return dateB.getTime() - dateA.getTime()
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onMarkAllAsRead()
              }}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {sortedNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type]
                const iconColor = notificationColors[notification.type]
                const timestamp = typeof notification.timestamp === "string" 
                  ? new Date(notification.timestamp) 
                  : notification.timestamp

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      !notification.read 
                        ? "bg-primary/5 hover:bg-primary/10" 
                        : "hover:bg-muted"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={cn("mt-0.5", iconColor)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm font-medium",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(timestamp, "PPp", { locale: fr })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(notification.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

