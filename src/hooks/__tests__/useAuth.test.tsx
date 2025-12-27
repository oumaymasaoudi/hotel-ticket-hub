import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
});

describe('useAuth', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('should return loading state', async () => {
        const { result } = renderHook(() => useAuth());
        // checkAuth runs synchronously in useEffect, so loading becomes false immediately
        // We just verify the hook returns a loading state
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it('should return null user when no token exists', async () => {
        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.session).toBeNull();
        expect(result.current.role).toBeNull();
        expect(result.current.hotelId).toBeNull();
    });

    it('should parse user data from localStorage', async () => {
        const userData = {
            token: 'test-token',
            email: 'test@example.com',
            userId: '123',
            fullName: 'Test User',
            role: 'ADMIN',
            hotelId: '456',
        };

        localStorageMock.setItem('auth_token', 'test-token');
        localStorageMock.setItem('user_data', JSON.stringify(userData));

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual({
            email: 'test@example.com',
            fullName: 'Test User',
            userId: '123',
        });
        expect(result.current.session).toEqual({ token: 'test-token' });
        expect(result.current.role).toBe('admin');
        expect(result.current.hotelId).toBe('456');
    });

    it('should handle corrupted localStorage data', async () => {
        localStorageMock.setItem('auth_token', 'test-token');
        localStorageMock.setItem('user_data', 'invalid-json');

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(localStorageMock.getItem('auth_token')).toBeNull();
        expect(localStorageMock.getItem('user_data')).toBeNull();
    });

    it('should handle different user roles', async () => {
        const roles = ['CLIENT', 'TECHNICIAN', 'ADMIN', 'SUPERADMIN'];

        for (const role of roles) {
            localStorageMock.clear();
            const userData = {
                token: 'test-token',
                email: 'test@example.com',
                userId: '123',
                fullName: 'Test User',
                role,
                hotelId: '456',
            };

            localStorageMock.setItem('auth_token', 'test-token');
            localStorageMock.setItem('user_data', JSON.stringify(userData));

            const { result } = renderHook(() => useAuth());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.role).toBe(role.toLowerCase());
        }
    });
});

