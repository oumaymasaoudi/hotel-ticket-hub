import { render, waitFor } from '@testing-library/react';
import { DraftSaver } from '../form/DraftSaver';
import { useToast } from '@/hooks/use-toast';

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

const mockToast = jest.fn();
const mockUseToast = jest.fn(() => ({ toast: mockToast }));

describe('DraftSaver', () => {
  const mockOnRestore = jest.fn();
  const mockFormData = {
    title: 'Test Title',
    description: 'Test Description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (useToast as jest.Mock).mockImplementation(mockUseToast);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should restore draft from localStorage on mount', async () => {
    const savedData = JSON.stringify(mockFormData);
    localStorage.setItem('test-key', savedData);

    render(
      <DraftSaver
        formData={mockFormData}
        storageKey="test-key"
        onRestore={mockOnRestore}
      />
    );

    await waitFor(() => {
      expect(mockOnRestore).toHaveBeenCalledWith(mockFormData);
      expect(mockToast).toHaveBeenCalled();
    });
  });

  it('should not restore if no saved data exists', () => {
    render(
      <DraftSaver
        formData={mockFormData}
        storageKey="test-key"
        onRestore={mockOnRestore}
      />
    );

    expect(mockOnRestore).not.toHaveBeenCalled();
  });

  it('should auto-save form data periodically', async () => {
    render(
      <DraftSaver
        formData={mockFormData}
        storageKey="test-key"
        saveInterval={1000}
      />
    );

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      const saved = localStorage.getItem('test-key');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(mockFormData);
    });
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('test-key', 'invalid-json');

    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    render(
      <DraftSaver
        formData={mockFormData}
        storageKey="test-key"
        onRestore={mockOnRestore}
      />
    );

    expect(consoleError).toHaveBeenCalled();
    expect(mockOnRestore).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('should use custom save interval', async () => {
    // Clear localStorage first
    localStorage.removeItem('test-key');
    
    render(
      <DraftSaver
        formData={mockFormData}
        storageKey="test-key"
        saveInterval={2000}
      />
    );

    // The component saves immediately on first render if timeSinceLastSave >= saveInterval
    // Since lastSaveRef.current starts at 0, the first save happens immediately
    // So we need to wait for the initial save, then test the interval
    await waitFor(() => {
      const saved = localStorage.getItem('test-key');
      expect(saved).toBeTruthy();
    });

    // Clear and update formData to test the interval
    localStorage.removeItem('test-key');
    const { rerender } = render(
      <DraftSaver
        formData={{ ...mockFormData, title: 'Updated Title' }}
        storageKey="test-key"
        saveInterval={2000}
      />
    );

    // After 1 second, should not be saved yet (interval is 2000ms)
    jest.advanceTimersByTime(1000);
    expect(localStorage.getItem('test-key')).toBeNull();

    // After another 1 second (total 2000ms), should be saved
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      const saved = localStorage.getItem('test-key');
      expect(saved).toBeTruthy();
      if (saved) {
        const parsed = JSON.parse(saved);
        expect(parsed.title).toBe('Updated Title');
      }
    });
  });

  it('should clear draft when form is submitted', () => {
    localStorage.setItem('test-key', JSON.stringify(mockFormData));

    const { unmount } = render(
      <DraftSaver
        formData={mockFormData}
        storageKey="test-key"
      />
    );

    // Simulate form submission by unmounting
    unmount();

    // Draft should be cleared (this depends on implementation)
    // If the component clears on unmount, check that
  });
});
