import { useState } from 'react';

/**
 * Rapport désactivé : Supabase retiré. À réimplémenter avec l'API backend si besoin.
 */
export const useReports = () => {
  const [loading] = useState(false);

  const notAvailable = async () => {
    throw new Error("Rapports indisponibles (Supabase retiré). À implémenter avec l'API backend.");
  };

  return {
    loading,
    generateAdminPDF: notAvailable,
    generateAdminExcel: notAvailable,
    generateSuperAdminPDF: notAvailable,
    generateSuperAdminExcel: notAvailable,
  };
};
