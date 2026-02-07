import { renderHook, waitFor, act } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import { useAuth, type UserRole } from '../useAuth';
import { useToast } from '../use-toast';
import { apiService, type TicketResponse } from '@/services/apiService';

jest.mock('../useAuth');
jest.mock('../use-toast');
jest.mock('@/services/apiService');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useNotifications', () => {
    const mockToast = jest.fn();
    const mockUser = {
        email: 'test@example.com',
        fullName: 'Test User',
        userId: 'user-1',
    };
    const mockHotelId = 'hotel-1';

    beforeEach(() => {
        jest.clearAllMocks();
        // Use real timers for these tests to allow promises to resolve properly
        jest.useRealTimers();

        mockUseAuth.mockReturnValue({
            user: mockUser,
            session: { token: 'test-token' },
            role: 'admin' as UserRole,
            hotelId: mockHotelId,
            loading: false,
        });

        mockUseToast.mockReturnValue({
            toast: mockToast,
            toasts: [],
            dismiss: jest.fn(),
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns initial state', () => {
        mockApiService.getTicketsByHotel.mockResolvedValue([]);

        const { result } = renderHook(() => useNotifications());

        expect(result.current.notifications).toEqual([]);
        expect(result.current.unreadCount).toBe(0);
    });

    it('creates notifications for urgent unassigned tickets', async () => {
        const urgentTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(urgentTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications(30000));

        // Wait for the initial check to complete - the hook calls checkForUpdates immediately
        await waitFor(() => {
            expect(result.current.notifications.length).toBeGreaterThan(0);
        }, { timeout: 5000 });

        expect(result.current.notifications[0].type).toBe('ticket_escalated');
        expect(result.current.notifications[0].title).toBe('Ticket urgent non assigné');
    });

    it('does not create duplicate notifications', async () => {
        const urgentTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(urgentTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications(100));

        // Wait for the initial check
        await waitFor(() => {
            expect(result.current.notifications.length).toBe(1);
        }, { timeout: 5000 });

        const initialNotificationId = result.current.notifications[0].id;

        // Wait for polling interval to trigger again
        await new Promise(resolve => setTimeout(resolve, 150));

        // Should still have only one notification with the same ID
        await waitFor(() => {
            expect(result.current.notifications.length).toBe(1);
            expect(result.current.notifications[0].id).toBe(initialNotificationId);
        }, { timeout: 3000 });
    });

    it('marks notification as read', async () => {
        // Create a notification via the hook mechanism
        const urgentTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(urgentTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications());

        // Wait for notification to be created
        await waitFor(() => {
            expect(result.current.notifications.length).toBeGreaterThan(0);
        }, { timeout: 5000 });

        const notificationId = result.current.notifications[0].id;

        // Mark as read
        act(() => {
            result.current.markAsRead(notificationId);
        });

        await waitFor(() => {
            const notification = result.current.notifications.find(n => n.id === notificationId);
            expect(notification?.read).toBe(true);
        }, { timeout: 3000 });
    });

    it('marks all notifications as read', async () => {
        // Create notifications via the hook mechanism
        const urgentTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
            {
                id: 'ticket-2',
                ticketNumber: 'TKT-002',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(urgentTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications());

        // Wait for notifications to be created
        await waitFor(() => {
            expect(result.current.notifications.length).toBeGreaterThan(1);
        }, { timeout: 5000 });

        // Mark all as read
        act(() => {
            result.current.markAllAsRead();
        });

        await waitFor(() => {
            expect(result.current.notifications.every(n => n.read)).toBe(true);
        }, { timeout: 3000 });
    });

    it('clears all notifications', async () => {
        // Create a notification via the hook mechanism
        const urgentTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(urgentTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications());

        // Wait for notification to be created
        await waitFor(() => {
            expect(result.current.notifications.length).toBeGreaterThan(0);
        }, { timeout: 5000 });

        // Clear notifications
        act(() => {
            result.current.clearNotifications();
        });

        await waitFor(() => {
            expect(result.current.notifications).toEqual([]);
        }, { timeout: 3000 });
    });

    it('updates unread count', async () => {
        // Create notifications via the hook mechanism
        const urgentTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(urgentTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications());

        // Wait for notification to be created
        await waitFor(() => {
            expect(result.current.notifications.length).toBe(1);
            expect(result.current.unreadCount).toBe(1);
        }, { timeout: 5000 });

        // Mark one as read
        act(() => {
            result.current.markAsRead(result.current.notifications[0].id);
        });

        await waitFor(() => {
            expect(result.current.unreadCount).toBe(0);
        }, { timeout: 3000 });
    });

    it('does not poll when user is not available', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            session: null,
            role: null,
            hotelId: null,
            loading: false,
        });

        renderHook(() => useNotifications());

        expect(mockApiService.getTicketsByHotel).not.toHaveBeenCalled();
    });

    it('stops polling on unmount', async () => {
        mockApiService.getTicketsByHotel.mockResolvedValue([]);

        const { unmount } = renderHook(() => useNotifications(30000));

        // Wait for initial call to complete
        await waitFor(() => {
            expect(mockApiService.getTicketsByHotel).toHaveBeenCalled();
        }, { timeout: 5000 });

        const initialCallCount = mockApiService.getTicketsByHotel.mock.calls.length;

        unmount();

        // Wait a bit to ensure polling interval would have fired if not cleaned up
        await new Promise(resolve => setTimeout(resolve, 100));

        // Should not have called again after unmount
        expect(mockApiService.getTicketsByHotel).toHaveBeenCalledTimes(initialCallCount);
    });

    it('handles API errors gracefully', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        mockApiService.getTicketsByHotel.mockRejectedValue(new Error('API Error'));

        const { result } = renderHook(() => useNotifications());

        // Wait a bit to allow the error to be handled
        await new Promise(resolve => setTimeout(resolve, 100));

        // Should not crash and should have empty notifications
        expect(result.current.notifications).toEqual([]);
        expect(result.current.unreadCount).toBe(0);

        consoleErrorSpy.mockRestore();
    });

    it('does not poll when isPolling is true', async () => {
        let resolveFirstCall: (value: TicketResponse[]) => void;
        const firstCallPromise = new Promise<TicketResponse[]>(resolve => {
            resolveFirstCall = resolve;
        });

        mockApiService.getTicketsByHotel.mockImplementation(() => {
            return firstCallPromise;
        });

        renderHook(() => useNotifications(50));

        // Wait for first call to start
        await waitFor(() => {
            expect(mockApiService.getTicketsByHotel).toHaveBeenCalled();
        }, { timeout: 5000 });

        const firstCallCount = mockApiService.getTicketsByHotel.mock.calls.length;

        // Wait a bit - the polling interval should try to call again
        // but it should be prevented by isPolling flag
        await new Promise(resolve => setTimeout(resolve, 100));

        // Should not have called again while the first call is still pending
        expect(mockApiService.getTicketsByHotel).toHaveBeenCalledTimes(firstCallCount);

        // Resolve the first call
        if (resolveFirstCall) {
            resolveFirstCall([]);
        }
        await firstCallPromise;
    });

    it('does not create notifications when no urgent tickets exist', async () => {
        const normalTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: false,
                assignedTechnicianId: 'tech-1',
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(normalTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications());

        // Wait for the check to complete
        await waitFor(() => {
            expect(mockApiService.getTicketsByHotel).toHaveBeenCalled();
        }, { timeout: 5000 });

        // Should not create any notifications
        expect(result.current.notifications).toEqual([]);
        expect(result.current.unreadCount).toBe(0);
    });

    it('does not add notifications that already exist', async () => {
        const urgentTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(urgentTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications(100));

        // Wait for first notification
        await waitFor(() => {
            expect(result.current.notifications.length).toBe(1);
        }, { timeout: 5000 });

        const firstNotificationId = result.current.notifications[0].id;
        const firstCallCount = mockApiService.getTicketsByHotel.mock.calls.length;
        const toastCallCountBefore = mockToast.mock.calls.length;

        // Wait for polling interval to trigger again (100ms)
        await waitFor(() => {
            expect(mockApiService.getTicketsByHotel.mock.calls.length).toBeGreaterThan(firstCallCount);
        }, { timeout: 5000 });

        // Should still have only one notification with the same ID
        expect(result.current.notifications.length).toBe(1);
        expect(result.current.notifications[0].id).toBe(firstNotificationId);

        // Toast should not be called again since notification already exists (toAdd.length === 0)
        expect(mockToast.mock.calls.length).toBe(toastCallCountBefore);
    });

    it('handles markAsRead with non-existent notification id', () => {
        mockApiService.getTicketsByHotel.mockResolvedValue([]);

        const { result } = renderHook(() => useNotifications());

        // Try to mark a non-existent notification as read
        act(() => {
            result.current.markAsRead('non-existent-id');
        });

        // Should not crash and notifications should remain empty
        expect(result.current.notifications).toEqual([]);
    });

    it('marks only the specified notification as read when multiple exist', async () => {
        const urgentTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
            {
                id: 'ticket-2',
                ticketNumber: 'TKT-002',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(urgentTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications());

        // Wait for notifications to be created
        await waitFor(() => {
            expect(result.current.notifications.length).toBe(2);
        }, { timeout: 5000 });

        const firstNotificationId = result.current.notifications[0].id;
        const secondNotificationId = result.current.notifications[1].id;

        // Mark only the first one as read
        act(() => {
            result.current.markAsRead(firstNotificationId);
        });

        await waitFor(() => {
            const first = result.current.notifications.find(n => n.id === firstNotificationId);
            const second = result.current.notifications.find(n => n.id === secondNotificationId);
            expect(first?.read).toBe(true);
            expect(second?.read).toBe(false); // Should remain unread
        }, { timeout: 3000 });
    });

    it('uses custom pollInterval', async () => {
        mockApiService.getTicketsByHotel.mockResolvedValue([]);

        renderHook(() => useNotifications(5000));

        // Wait for initial call
        await waitFor(() => {
            expect(mockApiService.getTicketsByHotel).toHaveBeenCalled();
        }, { timeout: 5000 });

        // The pollInterval should be set (we can't directly test it, but we verify it doesn't crash)
        expect(mockApiService.getTicketsByHotel).toHaveBeenCalled();
    });

    it('does not poll when hotelId is missing', () => {
        mockUseAuth.mockReturnValue({
            user: mockUser,
            session: { token: 'test-token' },
            role: 'admin' as UserRole,
            hotelId: null,
            loading: false,
        });

        renderHook(() => useNotifications());

        expect(mockApiService.getTicketsByHotel).not.toHaveBeenCalled();
    });

    it('does not poll when user is missing but hotelId exists', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            session: null,
            role: null,
            hotelId: mockHotelId,
            loading: false,
        });

        renderHook(() => useNotifications());

        expect(mockApiService.getTicketsByHotel).not.toHaveBeenCalled();
    });

    it('shows toast notification when urgent ticket is found', async () => {
        const urgentTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(urgentTickets as TicketResponse[]);

        renderHook(() => useNotifications());

        // Wait for notification to be created
        await waitFor(() => {
            expect(mockToast).toHaveBeenCalled();
        }, { timeout: 5000 });

        expect(mockToast).toHaveBeenCalledWith({
            title: 'Ticket urgent non assigné',
            description: 'Le ticket TKT-001 nécessite une attention immédiate',
            variant: 'destructive',
        });
    });

    it('filters tickets correctly - only urgent, unassigned, and OPEN', async () => {
        const mixedTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'TKT-001',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
            {
                id: 'ticket-2',
                ticketNumber: 'TKT-002',
                isUrgent: true,
                assignedTechnicianId: 'tech-1', // Assigned - should not create notification
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
            {
                id: 'ticket-3',
                ticketNumber: 'TKT-003',
                isUrgent: true,
                assignedTechnicianId: null,
                status: 'CLOSED', // Closed - should not create notification
                createdAt: '2024-01-01T00:00:00Z',
            },
            {
                id: 'ticket-4',
                ticketNumber: 'TKT-004',
                isUrgent: false, // Not urgent - should not create notification
                assignedTechnicianId: null,
                status: 'OPEN',
                createdAt: '2024-01-01T00:00:00Z',
            },
        ];

        mockApiService.getTicketsByHotel.mockResolvedValue(mixedTickets as TicketResponse[]);

        const { result } = renderHook(() => useNotifications());

        // Wait for notification to be created
        await waitFor(() => {
            expect(result.current.notifications.length).toBe(1);
        }, { timeout: 5000 });

        // Should only have notification for ticket-1
        expect(result.current.notifications[0].ticketId).toBe('ticket-1');
        expect(result.current.notifications[0].message).toContain('TKT-001');
    });
});

