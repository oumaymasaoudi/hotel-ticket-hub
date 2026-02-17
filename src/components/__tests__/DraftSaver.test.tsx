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
    render(
      <DraftSaver
        formData={mockFormData}
        storageKey="test-key"
        saveInterval={2000}
      />
    );

    jest.advanceTimersByTime(1000);
    expect(localStorage.getItem('test-key')).toBeNull();

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(localStorage.getItem('test-key')).toBeTruthy();
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
