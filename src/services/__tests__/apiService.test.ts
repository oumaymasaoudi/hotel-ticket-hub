import { apiService } from '../apiService';

// Mock fetch
const mockFetch = jest.fn();
interface GlobalWithFetch {
    fetch: typeof fetch;
}
(globalThis as unknown as GlobalWithFetch).fetch = mockFetch as typeof fetch;

describe('apiService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
    });

    it('login should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                token: 'test-token',
                email: 'test@example.com',
                userId: '123',
                fullName: 'Test User',
                role: 'ADMIN',
                hotelId: '456'
            })
        });

        const result = await apiService.login('test@example.com', 'password');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/auth/login'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );
        expect(result.email).toBe('test@example.com');
    });

    it('getTechniciansByHotel should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getTechniciansByHotel('hotel-id');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/users/hotel/hotel-id/technicians'),
            expect.any(Object)
        );
    });

    it('should handle login errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Invalid credentials' })
        });

        await expect(apiService.login('test@example.com', 'wrong-password')).rejects.toThrow();
    });

    it('register should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                token: 'test-token',
                email: 'new@example.com',
                userId: '789',
                fullName: 'New User',
                role: 'CLIENT',
                hotelId: null
            })
        });

        const result = await apiService.register({
            email: 'new@example.com',
            password: 'password123',
            fullName: 'New User',
            phone: '1234567890'
        });

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/auth/register'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );
        expect(result.email).toBe('new@example.com');
    });

    it('getTicketsByHotel should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getTicketsByHotel('hotel-id');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/tickets/hotel/hotel-id'),
            expect.any(Object)
        );
    });

    it('should handle errors when fetching tickets', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getTicketsByHotel('hotel-id')).rejects.toThrow('Failed to fetch tickets');
    });

    it('createTicket should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'ticket-123',
                ticketNumber: 'TKT-001',
                status: 'OPEN'
            })
        });

        const result = await apiService.createTicket({
            hotelId: 'hotel-id',
            categoryId: 'cat-id',
            description: 'Test ticket',
            clientEmail: 'client@example.com',
            clientPhone: '1234567890'
        });

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/tickets/public'),
            expect.objectContaining({
                method: 'POST'
            })
        );
        expect(result.id).toBe('ticket-123');
    });
});

