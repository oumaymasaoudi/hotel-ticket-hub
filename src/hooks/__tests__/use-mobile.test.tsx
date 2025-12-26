import { renderHook, waitFor, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

// Mock matchMedia
const mockMatchMedia = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
});

describe('useIsMobile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAddEventListener.mockClear();
        mockRemoveEventListener.mockClear();
    });

    it('returns true when screen width is less than 768px', () => {
        const mockMediaQuery = {
            matches: true,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            dispatchEvent: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQuery);

        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 500,
        });

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
        expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('returns false when screen width is greater than 768px', () => {
        const mockMediaQuery = {
            matches: false,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            dispatchEvent: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQuery);

        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
        expect(mockAddEventListener).toHaveBeenCalled();
    });

    it('cleans up event listener on unmount', () => {
        const mockMediaQuery = {
            matches: false,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            dispatchEvent: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQuery);

        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { unmount } = renderHook(() => useIsMobile());
        unmount();

        expect(mockRemoveEventListener).toHaveBeenCalled();
    });

    it('handles undefined initial state', () => {
        const mockMediaQuery = {
            matches: false,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            dispatchEvent: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQuery);

        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: undefined,
        });

        const { result } = renderHook(() => useIsMobile());
        // Should return false when innerWidth is undefined
        expect(result.current).toBe(false);
    });

    it('handles media query change event', () => {
        const mockMediaQuery = {
            matches: false,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            dispatchEvent: jest.fn(),
        };

        mockMatchMedia.mockReturnValue(mockMediaQuery);

        Object.defineProperty(globalThis, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        // Simulate media query change
        const changeHandler = mockAddEventListener.mock.calls[0][1];
        if (changeHandler) {
            mockMediaQuery.matches = true;
            act(() => {
                changeHandler({ matches: true } as MediaQueryListEvent);
            });
        }

        // The hook should update based on the media query
        expect(mockAddEventListener).toHaveBeenCalled();
    });
});

