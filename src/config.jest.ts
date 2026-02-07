// Configuration pour Jest (tests)
interface GlobalWithAPI {
  __API_BASE_URL__?: string;
}
export const API_BASE_URL = (globalThis as unknown as GlobalWithAPI).__API_BASE_URL__ || 'http://localhost:8080/api';

