// Configuration de l'API pour Vite
// Ce fichier est remplacé par config.jest.ts dans Jest via moduleNameMapper
export const API_BASE_URL = (() => {
  // @ts-expect-error - import.meta n'est disponible que dans Vite
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
})();
