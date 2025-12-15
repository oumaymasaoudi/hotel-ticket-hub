import { apiService } from '../apiService';

// Mock fetch
const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

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
});

