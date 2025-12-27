import { apiService } from '../apiService';

// Mock fetch
const mockFetch = jest.fn();
interface GlobalWithFetch {
    fetch: typeof fetch;
}
(globalThis as unknown as GlobalWithFetch).fetch = mockFetch as typeof fetch;

// Note: window.location.assign is read-only in JSDOM and cannot be mocked
// The navigation errors from JSDOM will be suppressed by setupTests.ts
// We don't need to mock location.assign - the errors are expected and will be filtered

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

    it('register should handle errors with text response (lines 212-213)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => 'Registration failed: Email already exists'
        });

        await expect(apiService.register({
            email: 'existing@example.com',
            password: 'password123',
            fullName: 'New User'
        })).rejects.toThrow('Registration failed');
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

    it('getActiveHotels should call correct endpoint', async () => {
        const mockHotels = [{ id: 'hotel-1', name: 'Hotel 1' }];
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHotels
        });

        const result = await apiService.getActiveHotels();

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/api\/hotels\/public/);
        expect(result).toEqual(mockHotels);
    });

    it('getActiveHotels should handle errors (line 229)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getActiveHotels()).rejects.toThrow('Failed to fetch hotels');
    });

    it('getHotelById should call correct endpoint', async () => {
        const mockHotel = {
            id: 'hotel-1',
            name: 'Test Hotel'
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHotel
        });

        const result = await apiService.getHotelById('hotel-1');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/hotels/hotel-1'),
            expect.any(Object)
        );
        expect(result).toEqual(mockHotel); // Cover line 260
    });

    it('getHotelById should handle errors (line 260)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Hotel not found' })
        });

        await expect(apiService.getHotelById('hotel-999')).rejects.toThrow('Failed to fetch hotel');
    });

    it('getHotelSubscription should call correct endpoint', async () => {
        const mockSubscription = {
            id: 'sub-1',
            hotelId: 'hotel-1',
            planId: 'plan-1'
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSubscription
        });

        const result = await apiService.getHotelSubscription('hotel-1');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/subscriptions/hotel/hotel-1'),
            expect.any(Object)
        );
        expect(result).toEqual(mockSubscription);
    });

    it('getHotelSubscription should return data on success', async () => {
        const mockSubscription = {
            id: 'sub-1',
            hotelId: 'hotel-1',
            planId: 'plan-1'
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockSubscription
        });

        const result = await apiService.getHotelSubscription('hotel-1');

        expect(result).toEqual(mockSubscription);
    });

    it('getHotelSubscription should handle errors (line 273)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Subscription not found' })
        });

        await expect(apiService.getHotelSubscription('hotel-999')).rejects.toThrow('Failed to fetch subscription');
    });

    // Tests for createHotel (lines 312-326)
    it('createHotel should call correct endpoint', async () => {
        const mockHotel = {
            id: 'hotel-1',
            name: 'New Hotel',
            planId: 'plan-1'
        };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHotel
        });

        const hotelData = {
            name: 'New Hotel',
            email: 'hotel@example.com',
            phone: '1234567890',
            planId: 'plan-1'
        };

        const result = await apiService.createHotel(hotelData);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/hotels'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );
        expect(result).toEqual(mockHotel); // Cover line 326
    });

    it('createHotel should handle errors with message (lines 312-326)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Hotel creation failed' })
        });

        await expect(apiService.createHotel({
            name: 'New Hotel',
            planId: 'plan-1'
        })).rejects.toThrow('Hotel creation failed');
    });

    it('createHotel should handle errors with catch (lines 312-326)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => { throw new Error('Parse error'); } // This will trigger the catch
        });

        await expect(apiService.createHotel({
            name: 'New Hotel',
            planId: 'plan-1'
        })).rejects.toThrow('Failed to create hotel');
    });

    it('createHotel should handle errors without message property (line 323)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({})
        });

        await expect(apiService.createHotel({
            name: 'New Hotel',
            planId: 'plan-1'
        })).rejects.toThrow('Failed to create hotel');
    });

    it('logout should not throw error', () => {
        expect(() => apiService.logout()).not.toThrow();
    });

    it('getAllHotels should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        // Simply verify that the error is thrown - window.location.assign is not easily mockable in jsdom
        await expect(apiService.getAllHotels()).rejects.toThrow('Session expirée');
    });

    it('getAllHotels should handle other errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        // Simply verify that the error is thrown - window.location.assign is not easily mockable in jsdom
        await expect(apiService.getAllHotels()).rejects.toThrow('Failed to fetch hotels');
    });

    it('getAllHotels should return data on success (line 251)', async () => {
        const mockHotels = [{ id: 'hotel-1', name: 'Hotel 1' }];
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHotels
        });

        const result = await apiService.getAllHotels();

        expect(result).toEqual(mockHotels); // Cover line 251
    });

    it('getAllHotels should return data on success (line 251)', async () => {
        const mockHotels = [{ id: 'hotel-1', name: 'Hotel 1' }];
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockHotels
        });

        const result = await apiService.getAllHotels();

        expect(result).toEqual(mockHotels); // Cover line 251
    });

    it('getTicketByNumber should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                id: 'ticket-1',
                ticketNumber: 'TKT-001'
            })
        });

        const result = await apiService.getTicketByNumber('TKT-001');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/api\/tickets\/public\/TKT-001/);
        expect(result.ticketNumber).toBe('TKT-001');
    });

    it('getTicketByNumber should handle errors (line 489)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ error: 'Ticket not found' })
        });

        await expect(apiService.getTicketByNumber('TKT-999')).rejects.toThrow('Failed to fetch ticket');
    });

    it('getTicketsByEmail should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => []
        });

        await apiService.getTicketsByEmail('test@example.com');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/api\/tickets\/public\/email\/test@example\.com/);
    });

    it('getTicketsByEmail should handle errors (line 499)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getTicketsByEmail('test@example.com')).rejects.toThrow('Failed to fetch tickets');
    });

    it('getTicketsByTechnician should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getTicketsByTechnician('tech-1');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/tickets/technician/tech-1'),
            expect.any(Object)
        );
    });

    it('getTicketsByTechnician should handle errors (line 524)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getTicketsByTechnician('tech-1')).rejects.toThrow('Failed to fetch tickets');
    });

    it('getAllTickets should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getAllTickets();

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/tickets'),
            expect.any(Object)
        );
    });

    it('getAllTickets should handle 401 error (lines 559-561)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.getAllTickets()).rejects.toThrow('Session expirée');
    });

    it('getAllTickets should handle other errors (line 565)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getAllTickets()).rejects.toThrow('Failed to fetch tickets');
    });

    it('getAllUsers should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getAllUsers();

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/users'),
            expect.any(Object)
        );
    });

    it('getAllUsers should handle 401 error (lines 578-580)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.getAllUsers()).rejects.toThrow('Session expirée');
    });

    it('getAllUsers should handle other errors (line 584)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getAllUsers()).rejects.toThrow('Failed to fetch users');
    });

    it('getAllPlans should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getAllPlans();

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/plans'),
            expect.any(Object)
        );
    });

    it('getAllPlans should handle errors (line 336)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getAllPlans()).rejects.toThrow('Failed to fetch plans');
    });

    it('getCategories should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getCategories();

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/api\/categories\/public/);
    });

    it('getCategories should handle errors (line 368)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getCategories()).rejects.toThrow('Failed to fetch categories');
    });

    it('getAllAuditLogs should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        // Simply verify that the error is thrown - window.location.assign is not easily mockable in jsdom 
        await expect(apiService.getAllAuditLogs()).rejects.toThrow('Session expirée');
    });

    it('getAllAuditLogs should handle other errors (lines 408-412)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getAllAuditLogs()).rejects.toThrow('Failed to fetch audit logs');
    });

    it('getAllAuditLogs should return data on success (line 412)', async () => {
        const mockLogs = [{ id: 'log-1', action: 'CREATE', userId: 'user-1' }];
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockLogs
        });

        const result = await apiService.getAllAuditLogs();

        expect(result).toEqual(mockLogs); // Cover line 412
    });

    it('getAuthHeaders should return correct headers', () => {
        // getAuthHeaders is a private function, but we can test it indirectly
        // by checking that API calls use the correct headers
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'hotel-1', name: 'Test Hotel' })
        });

        apiService.getHotelById('hotel-1');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/hotels/hotel-1'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );
    });

    it('addImagesToTicket should use FormData for multipart request', async () => {
        // addImagesToTicket uses FormData which means it uses getMultipartHeaders (empty headers)
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const images = [file];

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ id: 'ticket-1', ticketNumber: 'TKT-001' })
        });

        await apiService.addImagesToTicket('ticket-1', images);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/tickets/ticket-1/images'),
            expect.objectContaining({
                method: 'POST'
            })
        );
    });

    it('addImagesToTicket should handle errors with catch (lines 478-479)', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const images = [file];

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => { throw new Error('Parse error'); } // This will trigger the catch
        });

        await expect(apiService.addImagesToTicket('ticket-1', images)).rejects.toThrow('Failed to upload images');
    });

    it('addImagesToTicket should handle errors with message property (line 479)', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const images = [file];

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Upload failed: file too large' })
        });

        await expect(apiService.addImagesToTicket('ticket-1', images)).rejects.toThrow('Upload failed: file too large');
    });

    it('addImagesToTicket should handle errors without message property (line 479)', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const images = [file];

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({})
        });

        await expect(apiService.addImagesToTicket('ticket-1', images)).rejects.toThrow('Failed to upload images');
    });

    // Tests for getTechniciansByHotel error handling (lines 598-600, 605-608, 614-619)
    it('getTechniciansByHotel should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.getTechniciansByHotel('hotel-1')).rejects.toThrow('Session expirée');
    });

    it('getTechniciansByHotel should handle connection error (status 0)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 0,
            type: 'opaque',
            json: async () => ({})
        });

        await expect(apiService.getTechniciansByHotel('hotel-1')).rejects.toThrow('Le serveur backend n\'est pas accessible');
    });

    it('getTechniciansByHotel should handle network error (lines 614, 618)', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

        await expect(apiService.getTechniciansByHotel('hotel-1')).rejects.toThrow('Le serveur backend n\'est pas accessible');
    });

    it('getTechniciansByHotel should handle ERR_CONNECTION_REFUSED error (lines 614, 618)', async () => {
        mockFetch.mockRejectedValueOnce(new Error('ERR_CONNECTION_REFUSED'));

        await expect(apiService.getTechniciansByHotel('hotel-1')).rejects.toThrow('Le serveur backend n\'est pas accessible');
    });

    it('getTechniciansByHotel should handle other error types (lines 614, 618)', async () => {
        mockFetch.mockRejectedValueOnce('String error');

        await expect(apiService.getTechniciansByHotel('hotel-1')).rejects.toThrow();
    });

    it('getTechniciansByHotel should handle other errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getTechniciansByHotel('hotel-1')).rejects.toThrow('Erreur lors de la récupération des techniciens');
    });

    // Tests for createTechnician
    it('createTechnician should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'tech-1',
                email: 'tech@example.com',
                fullName: 'Tech User',
                hotelId: 'hotel-1'
            })
        });

        const result = await apiService.createTechnician({
            email: 'tech@example.com',
            password: 'password',
            fullName: 'Tech User',
            hotelId: 'hotel-1'
        });

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/users\/technicians/);
        expect(result.email).toBe('tech@example.com');
    });

    it('createTechnician should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.createTechnician({
            email: 'tech@example.com',
            password: 'password',
            fullName: 'Tech User',
            hotelId: 'hotel-1'
        })).rejects.toThrow('Session expirée');
    });

    it('createTechnician should handle errors (line 647)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => 'Error message'
        });

        await expect(apiService.createTechnician({
            email: 'tech@example.com',
            password: 'password',
            fullName: 'Tech User',
            hotelId: 'hotel-1'
        })).rejects.toThrow('Error message');
    });

    it('createTechnician should handle errors with empty text (line 647)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => ''
        });

        await expect(apiService.createTechnician({
            email: 'tech@example.com',
            password: 'password',
            fullName: 'Tech User',
            hotelId: 'hotel-1'
        })).rejects.toThrow('Erreur lors de la création du technicien');
    });

    // Tests for updateTechnician
    it('updateTechnician should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'tech-1',
                email: 'updated@example.com',
                fullName: 'Updated User'
            })
        });

        const result = await apiService.updateTechnician('tech-1', {
            email: 'updated@example.com'
        });

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/users\/technicians\/tech-1/);
        expect(result.email).toBe('updated@example.com');
    });

    it('updateTechnician should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.updateTechnician('tech-1', {
            email: 'updated@example.com'
        })).rejects.toThrow('Session expirée');
    });

    it('updateTechnician should handle errors (line 678)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => 'Error message'
        });

        await expect(apiService.updateTechnician('tech-1', {
            email: 'updated@example.com'
        })).rejects.toThrow('Error message');
    });

    it('updateTechnician should handle errors with empty text (line 678)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => ''
        });

        await expect(apiService.updateTechnician('tech-1', {
            email: 'updated@example.com'
        })).rejects.toThrow('Erreur lors de la modification du technicien');
    });

    // Tests for deleteTechnician
    it('deleteTechnician should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        await apiService.deleteTechnician('tech-1');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/users\/technicians\/tech-1/);
        expect(callArgs[1]?.method).toBe('DELETE');
    });

    it('deleteTechnician should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.deleteTechnician('tech-1')).rejects.toThrow('Session expirée');
    });

    it('deleteTechnician should handle errors (line 699)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => 'Error message'
        });

        await expect(apiService.deleteTechnician('tech-1')).rejects.toThrow('Error message');
    });

    it('deleteTechnician should handle errors with empty text (line 699)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => ''
        });

        await expect(apiService.deleteTechnician('tech-1')).rejects.toThrow('Erreur lors de la suppression du technicien');
    });

    // Tests for getTicketComments
    it('getTicketComments should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getTicketComments('ticket-1');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/tickets\/ticket-1\/comments/);
    });

    it('getTicketComments should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.getTicketComments('ticket-1')).rejects.toThrow('Session expirée');
    });

    it('getTicketComments should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getTicketComments('ticket-1')).rejects.toThrow('Erreur lors de la récupération des commentaires');
    });

    // Tests for addTicketComment
    it('addTicketComment should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'comment-1',
                content: 'Test comment',
                userId: 'user-1'
            })
        });

        const result = await apiService.addTicketComment('ticket-1', 'Test comment', 'user-1');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/tickets\/ticket-1\/comments/);
        expect(result.content).toBe('Test comment');
    });

    it('addTicketComment should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.addTicketComment('ticket-1', 'Test comment', 'user-1')).rejects.toThrow('Session expirée');
    });

    it('addTicketComment should handle errors (line 740)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => 'Error message'
        });

        await expect(apiService.addTicketComment('ticket-1', 'Test comment', 'user-1')).rejects.toThrow('Error message');
    });

    it('addTicketComment should handle errors with empty text (line 740)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            text: async () => ''
        });

        await expect(apiService.addTicketComment('ticket-1', 'Test comment', 'user-1')).rejects.toThrow('Erreur lors de l\'ajout du commentaire');
    });

    // Tests for getOverduePayments
    it('getOverduePayments should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getOverduePayments();

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/payments\/overdue/);
    });

    it('getOverduePayments should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.getOverduePayments()).rejects.toThrow('Session expirée');
    });

    it('getOverduePayments should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getOverduePayments()).rejects.toThrow('Failed to fetch overdue payments');
    });

    // Tests for getAllPayments
    it('getAllPayments should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        await apiService.getAllPayments();

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/payments\/all/);
    });

    it('getAllPayments should handle 401 error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' })
        });

        await expect(apiService.getAllPayments()).rejects.toThrow('Session expirée');
    });

    it('getAllPayments should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getAllPayments()).rejects.toThrow('Failed to fetch all payments');
    });

    // Tests for getMonthlyReport
    it('getMonthlyReport should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ totalTickets: 10 })
        });

        await apiService.getMonthlyReport('hotel-1', 2024, 1);

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/reports\/hotel\/hotel-1\/monthly/);
        expect(callArgs[0]).toContain('year=2024');
        expect(callArgs[0]).toContain('month=1');
    });

    it('getMonthlyReport should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getMonthlyReport('hotel-1')).rejects.toThrow('Failed to fetch monthly report');
    });

    // Tests for getWeeklyReport
    it('getWeeklyReport should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ totalTickets: 10 })
        });

        await apiService.getWeeklyReport('hotel-1', '2024-01-01');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/reports\/hotel\/hotel-1\/weekly/);
        expect(callArgs[0]).toContain('startDate=2024-01-01');
    });

    it('getWeeklyReport should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getWeeklyReport('hotel-1')).rejects.toThrow('Failed to fetch weekly report');
    });

    // Tests for getDailyReport
    it('getDailyReport should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ totalTickets: 10 })
        });

        await apiService.getDailyReport('hotel-1', '2024-01-01');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/reports\/hotel\/hotel-1\/daily/);
        expect(callArgs[0]).toContain('date=2024-01-01');
    });

    it('getDailyReport should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getDailyReport('hotel-1')).rejects.toThrow('Failed to fetch daily report');
    });

    // Tests for getGlobalReport
    it('getGlobalReport should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ totalTickets: 100 })
        });

        await apiService.getGlobalReport('2024-01-01', '2024-12-31');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/reports\/global/);
        expect(callArgs[0]).toContain('startDate=2024-01-01');
        expect(callArgs[0]).toContain('endDate=2024-12-31');
    });

    it('getGlobalReport should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getGlobalReport()).rejects.toThrow('Failed to fetch global report');
    });

    // Tests for updateTicketStatus
    it('updateTicketStatus should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'ticket-1',
                status: 'IN_PROGRESS'
            })
        });

        const result = await apiService.updateTicketStatus('ticket-1', 'IN_PROGRESS', 'user-1', 'tech-1');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/tickets\/ticket-1\/status/);
        expect(callArgs[0]).toContain('userId=user-1');
        expect(result.status).toBe('IN_PROGRESS');
    });

    it('updateTicketStatus should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.updateTicketStatus('ticket-1', 'IN_PROGRESS', 'user-1')).rejects.toThrow('Failed to update ticket status');
    });

    // Tests for login error handling (lines 175-188)
    it('login should handle JSON error response', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            headers: {
                get: (name: string) => name === 'content-type' ? 'application/json' : null
            },
            json: async () => ({ message: 'Invalid credentials' })
        });

        await expect(apiService.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('login should handle text error response (lines 182-184)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            headers: {
                get: (name: string) => name === 'content-type' ? 'text/plain' : null
            },
            text: async () => 'Invalid credentials'
        });

        await expect(apiService.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('login should handle text error response with empty text (line 184)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            headers: {
                get: (name: string) => name === 'content-type' ? 'text/plain' : null
            },
            text: async () => ''
        });

        await expect(apiService.login('test@example.com', 'wrong')).rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('login should handle JSON error response with error property (line 180)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            headers: {
                get: (name: string) => name === 'content-type' ? 'application/json' : null
            },
            json: async () => ({ error: 'Invalid credentials error' })
        });

        await expect(apiService.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials error');
    });

    it('login should handle parse error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            headers: {
                get: (name: string) => name === 'content-type' ? 'application/json' : null
            },
            json: async () => { throw new Error('Parse error'); }
        });

        await expect(apiService.login('test@example.com', 'wrong')).rejects.toThrow('Email or password incorrect');
    });

    // Tests for createTicket error handling
    it('createTicket should handle JSON error response', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            headers: {
                get: (name: string) => name === 'content-type' ? 'application/json' : null
            },
            json: async () => ({ message: 'Validation error' })
        });

        await expect(apiService.createTicket({
            hotelId: 'hotel-1',
            categoryId: 'cat-1',
            clientEmail: 'test@example.com',
            description: 'Test'
        })).rejects.toThrow('Validation error');
    });

    it('createTicket should handle JSON error response with error property when message is absent (line 451)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            headers: {
                get: (name: string) => name === 'content-type' ? 'application/json' : null
            },
            json: async () => ({ error: 'Validation error from error property' })
        });

        await expect(apiService.createTicket({
            hotelId: 'hotel-1',
            categoryId: 'cat-1',
            clientEmail: 'test@example.com',
            description: 'Test'
        })).rejects.toThrow('Validation error from error property');
    });

    it('createTicket should handle text error response (lines 451-454)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            headers: {
                get: (name: string) => name === 'content-type' ? 'text/plain' : null
            },
            text: async () => 'Validation error'
        });

        await expect(apiService.createTicket({
            hotelId: 'hotel-1',
            categoryId: 'cat-1',
            clientEmail: 'test@example.com',
            description: 'Test'
        })).rejects.toThrow('Validation error');
    });

    it('createTicket should handle text error response with empty text (lines 451-454)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            headers: {
                get: (name: string) => name === 'content-type' ? 'text/plain' : null
            },
            text: async () => ''
        });

        await expect(apiService.createTicket({
            hotelId: 'hotel-1',
            categoryId: 'cat-1',
            clientEmail: 'test@example.com',
            description: 'Test'
        })).rejects.toThrow('Impossible de créer le ticket');
    });

    it('createTicket should handle parse error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            headers: {
                get: (name: string) => name === 'content-type' ? 'application/json' : null
            },
            json: async () => { throw new Error('Parse error'); }
        });

        await expect(apiService.createTicket({
            hotelId: 'hotel-1',
            categoryId: 'cat-1',
            clientEmail: 'test@example.com',
            description: 'Test'
        })).rejects.toThrow('Impossible de créer le ticket');
    });

    it('createTicket should handle tickets with images', async () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'ticket-1',
                ticketNumber: 'TKT-001'
            })
        });

        await apiService.createTicket({
            hotelId: 'hotel-1',
            categoryId: 'cat-1',
            clientEmail: 'test@example.com',
            description: 'Test'
        }, [file]);

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/tickets\/public/);
        expect(callArgs[1]?.body).toBeInstanceOf(FormData);
    });


    // Tests for createCategory
    it('createCategory should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'cat-1',
                name: 'New Category'
            })
        });

        const result = await apiService.createCategory({
            name: 'New Category',
            icon: 'icon',
            color: '#FF0000'
        });

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/categories/);
        expect(callArgs[1]?.method).toBe('POST');
        expect(result.name).toBe('New Category');
    });

    it('createCategory should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Error message' })
        });

        await expect(apiService.createCategory({
            name: 'New Category'
        })).rejects.toThrow('Error message');
    });

    it('createCategory should handle errors with message property (line 390)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Error message from server' })
        });

        await expect(apiService.createCategory({
            name: 'New Category'
        })).rejects.toThrow('Error message from server');
    });

    it('createCategory should handle errors with neither error nor message (line 390)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({})
        });

        await expect(apiService.createCategory({
            name: 'New Category'
        })).rejects.toThrow('Failed to create category');
    });

    it('createCategory should handle parse error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => { throw new Error('Parse error'); }
        });

        await expect(apiService.createCategory({
            name: 'New Category'
        })).rejects.toThrow('Failed to create category');
    });

    // Tests for getPlanStatistics
    it('getPlanStatistics should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                total: 3,
                avgPrice: 100,
                avgQuota: 50,
                avgSla: 24
            })
        });

        const result = await apiService.getPlanStatistics();

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/plans\/statistics/);
        expect(result.total).toBe(3);
    });

    it('getPlanStatistics should handle errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
        });

        await expect(apiService.getPlanStatistics()).rejects.toThrow('Failed to fetch plan statistics');
    });

    // Tests for createStripeCheckoutSession
    it('createStripeCheckoutSession should call correct endpoint', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                url: 'https://checkout.stripe.com/session',
                sessionId: 'session-123'
            })
        });

        const result = await apiService.createStripeCheckoutSession('hotel-1', 'plan-1');

        expect(mockFetch).toHaveBeenCalled();
        const callArgs = mockFetch.mock.calls[0];
        expect(callArgs[0]).toMatch(/\/stripe\/create-checkout-session/);
        expect(callArgs[1]?.method).toBe('POST');
        expect(result.url).toBe('https://checkout.stripe.com/session');
    });

    it('createStripeCheckoutSession should handle errors with error property', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Error message' })
        });

        await expect(apiService.createStripeCheckoutSession('hotel-1', 'plan-1')).rejects.toThrow('Error message');
    });

    it('createStripeCheckoutSession should handle errors with message property (line 288)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Error message' })
        });

        await expect(apiService.createStripeCheckoutSession('hotel-1', 'plan-1')).rejects.toThrow('Error message');
    });

    it('createStripeCheckoutSession should handle errors with neither error nor message (line 288)', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({})
        });

        await expect(apiService.createStripeCheckoutSession('hotel-1', 'plan-1')).rejects.toThrow('Failed to create checkout session');
    });

    it('createStripeCheckoutSession should handle parse error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => { throw new Error('Parse error'); }
        });

        await expect(apiService.createStripeCheckoutSession('hotel-1', 'plan-1')).rejects.toThrow('Failed to create checkout session');
    });

    it('createStripeCheckoutSession should handle Invalid API Key error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ error: 'Invalid API Key' })
        });

        await expect(apiService.createStripeCheckoutSession('hotel-1', 'plan-1')).rejects.toThrow('Clé API Stripe non configurée');
    });
});

