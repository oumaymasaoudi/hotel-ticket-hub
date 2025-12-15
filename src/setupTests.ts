// Setup file for Jest tests
import '@testing-library/jest-dom';

// Mock API_BASE_URL for Jest
(globalThis as any).__API_BASE_URL__ = 'http://localhost:8080/api';

