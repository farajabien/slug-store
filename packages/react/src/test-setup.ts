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

// Mock URLSearchParams if needed
(globalThis as any).URLSearchParams = URLSearchParams; 