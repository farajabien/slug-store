// Test setup for slug-store
import { vi } from 'vitest';

// Mock window.crypto for encryption tests
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      generateKey: vi.fn(),
      importKey: vi.fn(),
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      exportKey: vi.fn(),
    },
    getRandomValues: vi.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
  },
});

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(() => ({
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
    result: {
      objectStoreNames: { contains: vi.fn(() => false) },
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          put: vi.fn(),
          get: vi.fn(),
          delete: vi.fn(),
        })),
      })),
    },
  })),
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDB,
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
});

// Mock CompressionStream and DecompressionStream
Object.defineProperty(window, 'CompressionStream', {
  value: class CompressionStream {
    constructor(format: string) {}
    get readable() {
      return {
        getReader: vi.fn(() => ({
          read: vi.fn(() => Promise.resolve({ done: true })),
        })),
      };
    }
    get writable() {
      return {
        getWriter: vi.fn(() => ({
          write: vi.fn(),
          close: vi.fn(),
        })),
      };
    }
  },
});

Object.defineProperty(window, 'DecompressionStream', {
  value: class DecompressionStream {
    constructor(format: string) {}
    get readable() {
      return {
        getReader: vi.fn(() => ({
          read: vi.fn(() => Promise.resolve({ done: true })),
        })),
      };
    }
    get writable() {
      return {
        getWriter: vi.fn(() => ({
          write: vi.fn(),
          close: vi.fn(),
        })),
      };
    }
  },
}); 