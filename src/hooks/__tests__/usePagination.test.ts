import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../usePagination';

describe('usePagination', () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  it('returns initial pagination state', () => {
    const { result } = renderHook(() => usePagination({ items }));
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.itemsPerPage).toBe(10);
    expect(result.current.paginatedItems.length).toBe(10);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(10);
    expect(result.current.totalItems).toBe(25);
  });

  it('uses custom itemsPerPage', () => {
    const { result } = renderHook(() => usePagination({ items, itemsPerPage: 5 }));
    
    expect(result.current.itemsPerPage).toBe(5);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.paginatedItems.length).toBe(5);
  });

  it('goes to specific page', () => {
    const { result } = renderHook(() => usePagination({ items }));
    
    act(() => {
      result.current.goToPage(2);
    });
    
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems[0].id).toBe(11);
    expect(result.current.startIndex).toBe(10);
    expect(result.current.endIndex).toBe(20);
  });

  it('goes to next page', () => {
    const { result } = renderHook(() => usePagination({ items }));
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(2);
  });

  it('does not go beyond last page', () => {
    const { result } = renderHook(() => usePagination({ items }));

    act(() => {
      result.current.goToPage(3);
    });
    
    expect(result.current.currentPage).toBe(3);
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(3);
  });

  it('goes to previous page', () => {
    const { result } = renderHook(() => usePagination({ items }));

    act(() => {
      result.current.goToPage(2);
    });
    
    expect(result.current.currentPage).toBe(2);
    
    act(() => {
      result.current.previousPage();
    });
    
    expect(result.current.currentPage).toBe(1);
  });

  it('does not go below first page', () => {
    const { result } = renderHook(() => usePagination({ items }));
    
    act(() => {
      result.current.previousPage();
    });
    
    expect(result.current.currentPage).toBe(1);
  });

  it('clamps page number to valid range', () => {
    const { result } = renderHook(() => usePagination({ items }));
    
    act(() => {
      result.current.goToPage(0);
    });
    
    expect(result.current.currentPage).toBe(1);
    
    act(() => {
      result.current.goToPage(100);
    });
    
    expect(result.current.currentPage).toBe(3);
  });

  it('changes items per page', () => {
    const { result } = renderHook(() => usePagination({ items }));
    
    act(() => {
      result.current.setItemsPerPage(20);
    });
    
    expect(result.current.itemsPerPage).toBe(20);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.currentPage).toBe(1); // Should reset to page 1
  });

  it('handles empty items array', () => {
    const { result } = renderHook(() => usePagination({ items: [] }));
    
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it('calculates correct endIndex for last page', () => {
    const { result } = renderHook(() => usePagination({ items }));
    
    act(() => {
      result.current.goToPage(3);
    });
    
    expect(result.current.endIndex).toBe(25);
    expect(result.current.paginatedItems.length).toBe(5);
  });

  it('updates paginated items when items change', () => {
    const { result, rerender } = renderHook(
      ({ items }) => usePagination({ items }),
      { initialProps: { items } }
    );
    
    const newItems = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
    
    rerender({ items: newItems });
    
    expect(result.current.totalItems).toBe(15);
    expect(result.current.totalPages).toBe(2);
  });
});

