import { renderHook } from '@testing-library/react';
import { useReports } from '../useReports';

describe('useReports', () => {
  it('returns loading state', () => {
    const { result } = renderHook(() => useReports());
    
    expect(result.current.loading).toBe(false);
  });

  it('throws error when generateAdminPDF is called', async () => {
    const { result } = renderHook(() => useReports());
    
    await expect(result.current.generateAdminPDF()).rejects.toThrow(
      "Rapports indisponibles (Supabase retiré). À implémenter avec l'API backend."
    );
  });

  it('throws error when generateAdminExcel is called', async () => {
    const { result } = renderHook(() => useReports());
    
    await expect(result.current.generateAdminExcel()).rejects.toThrow(
      "Rapports indisponibles (Supabase retiré). À implémenter avec l'API backend."
    );
  });

  it('throws error when generateSuperAdminPDF is called', async () => {
    const { result } = renderHook(() => useReports());
    
    await expect(result.current.generateSuperAdminPDF()).rejects.toThrow(
      "Rapports indisponibles (Supabase retiré). À implémenter avec l'API backend."
    );
  });

  it('throws error when generateSuperAdminExcel is called', async () => {
    const { result } = renderHook(() => useReports());
    
    await expect(result.current.generateSuperAdminExcel()).rejects.toThrow(
      "Rapports indisponibles (Supabase retiré). À implémenter avec l'API backend."
    );
  });
});

