import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window location for URL manipulation tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    search: '',
  },
  writable: true, 
});

// Mock history API
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn(),
    pushState: vi.fn(),
    state: {},
  },
  writable: true,
});

// Mock IndexedDB for offline-sync tests
class MockIDBKeyRange {
  static bound(lower: any, upper: any) {
    return { lower, upper };
  }
  static only(value: any) {
    return { value };
  }
}

const mockIndexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          get: vi.fn(() => ({ onsuccess: null, result: null })),
          put: vi.fn(() => ({ onsuccess: null })),
          delete: vi.fn(() => ({ onsuccess: null })),
          index: vi.fn(() => ({
            getAll: vi.fn(() => ({ onsuccess: null, result: [] }))
          })),
          createIndex: vi.fn(),
        })),
      })),
      createObjectStore: vi.fn(() => ({
        createIndex: vi.fn(),
      })),
    },
  })),
  deleteDatabase: vi.fn(),
};

(globalThis as any).indexedDB = mockIndexedDB;
(globalThis as any).IDBKeyRange = MockIDBKeyRange;

// Mock URLSearchParams if needed
(globalThis as any).URLSearchParams = URLSearchParams;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock service worker registration
(globalThis as any).ServiceWorkerRegistration = class MockServiceWorkerRegistration {
  sync = {
    register: vi.fn(),
  };
}; 