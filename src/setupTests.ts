// Setup file for Jest tests
import '@testing-library/jest-dom';

// Mock API_BASE_URL for Jest
interface GlobalWithAPI {
  __API_BASE_URL__?: string;
}
(globalThis as unknown as GlobalWithAPI).__API_BASE_URL__ = 'http://localhost:8080/api';

// Mock window.matchMedia for components that use it (e.g., sonner, theme providers)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollIntoView for jsdom (Radix UI Select needs it)
Element.prototype.scrollIntoView = jest.fn();

// Suppress console errors and warnings for jsdom navigation and React Router
// jsdom doesn't support navigation, so we suppress these expected errors
// Apply filters immediately (not in beforeAll) to catch errors during module loading
const originalError = console.error;
const originalWarn = console.warn;

console.error = jest.fn((...args: unknown[]) => {
  const firstArg = args[0];
  // Ignore jsdom navigation errors (expected in tests)
  if (
    (typeof firstArg === 'string' &&
      (firstArg.includes('Not implemented: navigation') ||
        firstArg.includes('Error: Not implemented: navigation'))) ||
    (firstArg && typeof firstArg === 'object' && 'type' in firstArg && firstArg.type === 'not implemented')
  ) {
    return;
  }
  // Ignore React warnings about act() in tests (we handle them properly)
  if (
    typeof firstArg === 'string' &&
    firstArg.includes('An update to') &&
    firstArg.includes('was not wrapped in act')
  ) {
    return;
  }
  // Ignore error boundary warnings in tests
  if (
    typeof firstArg === 'string' &&
    firstArg.includes('Consider adding an error boundary')
  ) {
    return;
  }
  // Call original error for other errors
  if (originalError) {
    originalError(...args);
  }
}) as typeof console.error;

console.warn = jest.fn((...args: unknown[]) => {
  const firstArg = args[0];
  // Ignore React Router future flag warnings
  if (
    typeof firstArg === 'string' &&
    (firstArg.includes('React Router Future Flag Warning') ||
      firstArg.includes('v7_startTransition') ||
      firstArg.includes('v7_relativeSplatPath'))
  ) {
    return;
  }
  // Call original warn for other warnings
  if (originalWarn) {
    originalWarn(...args);
  }
}) as typeof console.warn;

