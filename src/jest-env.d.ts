/// <reference types="jest" />

// Extend ImportMeta for Jest environment
interface ImportMeta {
  env: {
    VITE_API_BASE_URL?: string;
    [key: string]: string | undefined;
  };
}

