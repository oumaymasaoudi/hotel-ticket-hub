import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: 'ticket_created' | 'ticket_assigned' | 'ticket_updated' | 'payment_overdue' | 'ticket_escalated';
  title: string;
  message: string;
  ticketId?: string;
  timestamp: Date;
  read: boolean;
}

export function useNotifications(pollInterval: number = 30000) {
  const { user, hotelId } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isPollingRef = useRef(false);

  const checkForUpdates = useCallback(async () => {
    if (!user || !hotelId || isPollingRef.current) return;

    isPollingRef.current = true;
    try {
      // Check for new tickets
      const tickets = await apiService.getTicketsByHotel(hotelId);

      // Check for urgent unassigned tickets
      const urgentUnassigned = tickets.filter(
        t => t.isUrgent && !t.assignedTechnicianId && t.status === 'OPEN'
      );

      if (urgentUnassigned.length > 0) {
        const newNotifications: Notification[] = urgentUnassigned.map(ticket => ({
          id: `urgent-${ticket.id}`,
          type: 'ticket_escalated',
          title: 'Ticket urgent non assigné',
          message: `Le ticket ${ticket.ticketNumber} nécessite une attention immédiate`,
          ticketId: ticket.id,
          timestamp: new Date(ticket.createdAt),
          read: false,
        }));

        // Ajouter seulement les nouvelles notifications
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const toAdd = newNotifications.filter(n => !existingIds.has(n.id));

          if (toAdd.length > 0) {
            toAdd.forEach(notif => {
              toast({
                title: notif.title,
                description: notif.message,
                variant: 'destructive',
              });
            });
          }

          return [...prev, ...toAdd];
        });
      }
    } catch (error) {
      // Error checking notifications - avoid infinite loops on error
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Don't log repeated connection errors to avoid spam
      if (!errorMessage.includes('Failed to fetch') && !errorMessage.includes('ERR_CONNECTION_REFUSED')) {
        console.error('Error checking notifications:', error);
      }
      
      // If backend unavailable, stop polling temporarily
      if (errorMessage.includes('ERR_CONNECTION_REFUSED') || errorMessage.includes('Failed to fetch')) {
        // Le polling reprendra au prochain interval
        isPollingRef.current = false;
        return;
      }
    } finally {
      isPollingRef.current = false;
    }
  }, [user, hotelId, toast]);

  useEffect(() => {
    if (!user || !hotelId) return;

    // Immediate check with small delay to avoid multiple calls
    const timeoutId = setTimeout(() => {
      checkForUpdates();
    }, 1000);

    // Periodic polling
    const interval = setInterval(() => {
      checkForUpdates();
    }, pollInterval);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [user, hotelId, checkForUpdates, pollInterval]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

