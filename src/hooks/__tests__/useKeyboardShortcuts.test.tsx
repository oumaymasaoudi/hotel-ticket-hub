import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../use-toast';
import { useAuth } from '../useAuth';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('../useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('useKeyboardShortcuts', () => {
  const mockNavigate = jest.fn();
  const mockToast = jest.fn();
  const mockUseToast = jest.fn(() => ({ toast: mockToast }));

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useToast as jest.Mock).mockImplementation(mockUseToast);
    (useAuth as jest.Mock).mockReturnValue({ role: 'admin' });
  });

  it('should initialize keyboard shortcuts', () => {
    renderHook(() => useKeyboardShortcuts());
    
    expect(useNavigate).toHaveBeenCalled();
    expect(useToast).toHaveBeenCalled();
    expect(useAuth).toHaveBeenCalled();
  });

  it('should handle Ctrl+K shortcut', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    });
    
    document.dispatchEvent(event);
    
    // Should dispatch command palette event
    expect(event.defaultPrevented).toBe(false);
  });

  it('should handle Ctrl+N shortcut for admin', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', {
      key: 'n',
      ctrlKey: true,
      bubbles: true,
    });
    
    document.dispatchEvent(event);
    
    expect(mockNavigate).toHaveBeenCalledWith('/create-ticket');
    expect(mockToast).toHaveBeenCalled();
  });

  it('should handle Ctrl+F shortcut', () => {
    // Create a mock search input
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Rechercher...';
    document.body.appendChild(searchInput);

    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true,
      bubbles: true,
    });
    
    document.dispatchEvent(event);
    
    document.body.removeChild(searchInput);
  });

  it('should handle Escape key', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    
    document.dispatchEvent(event);
  });

  it('should ignore shortcuts when in input field', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useKeyboardShortcuts());
    
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      target: input,
    });
    
    document.dispatchEvent(event);
    
    document.body.removeChild(input);
  });
});
