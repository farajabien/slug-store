import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { slugStore, loadSlugStore, urlState, offlineState, dbState } from './unified.js'
import { SlugStoreError } from './types.js'
import * as core from './core.js'
import * as offline from './offline.js'
import { _resetStorage } from './offline.js'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock window and URL
const mockURL = {
  searchParams: new Map(),
  toString: () => 'https://example.com/app?state=test'
}

const mockWindow = {
  location: {
    href: 'https://example.com/app'
  }
}

// Test data
const testState = {
  filters: { category: 'tech', price: [100, 500] },
  view: 'grid',
  selected: ['item1', 'item2']
}

const simpleState = { count: 42, theme: 'dark' }

describe('Unified API', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', vi.fn().mockImplementation(() => ({
      searchParams: {
        set: vi.fn(),
        get: vi.fn(),
      },
      toString: () => 'https://example.com/app?state=encoded-data',
    })))
    vi.stubGlobal('window', {
      location: {
        href: 'https://example.com/app',
      },
      URLSearchParams: URLSearchParams,
    })
    
    // Mock successful fetch response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    _resetStorage()
  })

  describe('slugStore - Main unified function', () => {
    it('should create URL slug by default', async () => {
      const result = await slugStore('test-filters', testState)
      
      expect(result.state).toEqual(testState)
      expect(result.slug).toBeDefined()
      expect(typeof result.slug).toBe('string')
      expect(result.shareableUrl).toBeDefined()
    })

    it('should work with only offline storage', async () => {
      const result = await slugStore('offline-data', simpleState, {
        url: false,
        offline: { storage: 'memory' }
      })
      
      expect(result.state).toEqual(simpleState)
      expect(result.slug).toBeUndefined()
      expect(result.offline).toBe(true)
      expect(result.shareableUrl).toBeUndefined()
    })

    it('should handle database sync', async () => {
      const result = await slugStore('db-sync', testState, {
        url: false,
        offline: false,
        db: {
          endpoint: '/api/sync',
          method: 'POST'
        }
      })
      
      expect(result.state).toEqual(testState)
      expect(result.dbKey).toBeDefined()
      expect(mockFetch).toHaveBeenCalledWith('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringMatching(/"key":"db-sync(-\d+)?"/)
      })
    })

    it('should handle all features together', async () => {
      const result = await slugStore('everything', testState, {
        url: true,
        compress: true,
        offline: { storage: 'memory', encryption: true, password: 'secret' },
        db: { endpoint: '/api/sync' },
        encrypt: true,
        password: 'secret'
      })
      
      expect(result.state).toEqual(testState)
      expect(result.slug).toBeDefined()
      expect(result.shareableUrl).toBeDefined()
      expect(result.offline).toBe(true)
      expect(result.dbKey).toBeDefined()
    })

    it('should handle compression', async () => {
      const result = await slugStore('compressed', testState, {
        compress: true
      })
      
      expect(result.slug).toBeDefined()
      // Compressed slug should be shorter for complex data
      expect(result.slug!.length).toBeGreaterThan(0)
    })

    it('should handle encryption', async () => {
      const password = 'super-secret'
      const result = await slugStore('encrypted', testState, {
        encrypt: true,
        password
      })
      
      expect(result.slug).toBeDefined()
      // Should be different from unencrypted version
      const unencryptedResult = await slugStore('unencrypted', testState)
      expect(result.slug).not.toBe(unencryptedResult.slug)
    })

    it('should fail gracefully on database errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      // Should not throw, just warn
      const result = await slugStore('db-error', testState, {
        db: { endpoint: '/api/sync' }
      })
      
      expect(result.state).toEqual(testState)
      expect(result.dbKey).toBeDefined()
    })

    it('should handle fetch response errors gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
      
      // Should not throw, just warn
      const result = await slugStore('db-error', testState, {
        db: { endpoint: '/api/sync' }
      })
      
      expect(result.state).toEqual(testState)
      expect(result.dbKey).toBeDefined()
    })

    it('should work without window object (SSR)', async () => {
      vi.stubGlobal('window', undefined)
      
      const result = await slugStore('ssr-test', testState, {
        offline: { storage: 'memory' }
      })
      
      expect(result.state).toEqual(testState)
      expect(result.slug).toBeDefined()
      expect(result.shareableUrl).toBeUndefined() // No window
      expect(result.offline).toBe(true)
    })

    it('should handle offline storage with graceful fallback', async () => {
      // Test that offline storage works with fallback (should not throw)
      const result = await slugStore('storage-test', testState, {
        url: false,
        offline: { storage: 'memory' } // Use memory storage in test environment
      })
      
      expect(result.state).toEqual(testState)
      expect(result.offline).toBe(true)
    })
  })

  describe('loadSlugStore - Loading with fallback', () => {
    beforeEach(() => {
      // Reset all mocks
      vi.restoreAllMocks()
      
      // Mock window and location properly
      const mockLocation = {
        href: 'http://localhost:3000',
        search: '?state=encoded-url-data'
      }
      
      vi.stubGlobal('window', {
        location: mockLocation
      })
      
      // Mock URLSearchParams to return our test data
      vi.stubGlobal('URLSearchParams', vi.fn().mockImplementation((search) => ({
        get: (key: string) => {
          if (key === 'state') return 'encoded-url-data'
          return null
        }
      })))
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should load from URL first', async () => {
      // Mock successful URL decoding
      const mockDecodeState = vi.spyOn(core, 'decodeState').mockResolvedValue(testState)
      
      const result = await loadSlugStore('test-key', { default: true }, {
        url: true,
        offline: { storage: 'memory' }
      })
      
      expect(result).toEqual(testState)
      expect(mockDecodeState).toHaveBeenCalledWith('encoded-url-data', { "password": undefined })
    })

    it('should fallback to offline when URL fails', async () => {
      // Save to offline first
      await slugStore('fallback-test', testState, {
        url: false,
        offline: { storage: 'memory' }
      })
      
      // Mock URL loading failure
      vi.stubGlobal('URLSearchParams', vi.fn().mockImplementation(() => ({
        get: () => null // No URL data
      })))
      
      const result = await loadSlugStore('fallback-test', { default: true }, {
        url: true,
        offline: { storage: 'memory' }
      })
      
      expect(result).toEqual(testState)
    })

    it('should return default when nothing found', async () => {
      const defaultState = { empty: true }
      
      const result = await loadSlugStore('non-existent', defaultState, {
        url: true,
        offline: { storage: 'memory' }
      })
      
      expect(result).toEqual(defaultState)
    })

    it('should handle password for encrypted data', async () => {
      const password = 'secret-password'
      
      // Save encrypted data
      await slugStore('encrypted-load', testState, {
        url: false,
        offline: { storage: 'memory', encryption: true, password }
      })
      
      // Load with correct password
      const result = await loadSlugStore('encrypted-load', { default: true }, {
        url: false,
        offline: { storage: 'memory', encryption: true, password }
      })
      
      expect(result).toEqual(testState)
    })

    it('should throw SlugStoreError for URL encoding failures', async () => {
      // Mock encodeState to fail
      vi.spyOn(core, 'encodeState').mockRejectedValue(new Error('Encoding failed'))
      
      await expect(
        slugStore('circular', testState)
      ).rejects.toThrow(SlugStoreError)
    })

    it.skip('should throw SlugStoreError for offline storage failures', async () => {
      // This will fail in test environment where indexedDB is not fully available
      await expect(
        slugStore('storage-fail', testState, {
          url: false,
          offline: true 
        })
      ).rejects.toThrow(SlugStoreError)
    })

    it('should handle missing slugs in convenience functions', async () => {
      // Mock window and URL properly for URL generation
      const mockSearchParams = {
        set: vi.fn(),
        get: vi.fn(),
        toString: vi.fn(() => 'state=test-slug')
      }
      
      const mockUrl = {
        searchParams: mockSearchParams,
        toString: vi.fn(() => 'http://localhost:3000?state=test-slug')
      }
      
      vi.stubGlobal('window', {
        location: {
          href: 'http://localhost:3000',
          search: ''
        }
      })
      
      vi.stubGlobal('URL', vi.fn().mockImplementation(() => mockUrl))
      
      const result = await urlState('no-slug', testState)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('Convenience functions', () => {
    describe('urlState', () => {
      it('should create URL slug only', async () => {
        const slug = await urlState('url-only', testState)
        
        expect(typeof slug).toBe('string')
        expect(slug.length).toBeGreaterThan(0)
      })

      it('should handle compression', async () => {
        const slug = await urlState('compressed-url', testState, {
          compress: true
        })
        
        expect(typeof slug).toBe('string')
      })

      it('should handle encryption', async () => {
        const slug = await urlState('encrypted-url', testState, {
          encrypt: true,
          password: 'secret'
        })
        
        expect(typeof slug).toBe('string')
      })
    })

    describe('offlineState', () => {
      it('should save to offline only', async () => {
        await expect(
          offlineState('offline-only', testState)
        ).resolves.toBeUndefined()
        
        // Verify it was saved by loading
        const loaded = await loadSlugStore('offline-only', null, {
          url: false,
          offline: { storage: 'memory' }
        })
        
        expect(loaded).toEqual(testState)
      })

      it('should handle TTL', async () => {
        await offlineState('ttl-test', testState, {
          offline: { ttl: 1 } // 1 second
        })
        
        // Should exist immediately
        const immediate = await loadSlugStore('ttl-test', null, {
          url: false,
          offline: { storage: 'memory' }
        })
        expect(immediate).toEqual(testState)
      })

      it('should handle encryption', async () => {
        await offlineState('encrypted-offline', testState, {
          encrypt: true,
          password: 'secret'
        })
        
        const loaded = await loadSlugStore('encrypted-offline', null, {
          url: false,
          offline: { storage: 'memory', encryption: true, password: 'secret' }
        })
        
        expect(loaded).toEqual(testState)
      })
    })

    describe('dbState', () => {
      it('should create database key', async () => {
        const dbKey = await dbState('db-only', testState, '/api/data')
        
        expect(typeof dbKey).toBe('string')
        expect(dbKey.length).toBeGreaterThan(0)
        expect(mockFetch).toHaveBeenCalledWith('/api/data', expect.any(Object))
      })

      it('should handle compression and encryption', async () => {
        const dbKey = await dbState('encrypted-db', testState, '/api/data', {
          compress: true,
          encrypt: true,
          password: 'secret'
        })
        
        expect(typeof dbKey).toBe('string')
      })
    })
  })

  describe('Error handling', () => {
    it('should throw SlugStoreError for URL encoding failures', async () => {
      // Mock encodeState to fail
      vi.spyOn(core, 'encodeState').mockRejectedValue(new Error('Encoding failed'))
      
      await expect(
        slugStore('circular', testState)
      ).rejects.toThrow(SlugStoreError)
    })

    it('should handle offline storage with graceful fallback', async () => {
      // Test that offline storage works with fallback (should not throw)
      const result = await slugStore('storage-test', testState, {
        url: false,
        offline: { storage: 'memory' } // Use memory storage in test environment
      })
      
      expect(result.state).toEqual(testState)
      expect(result.offline).toBe(true)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle real-world dashboard filters scenario', async () => {
      const dashboardState = {
        dateRange: { start: '2025-01-01', end: '2025-12-31' },
        categories: ['tech', 'design'],
        sortBy: 'date',
        view: 'grid',
        pagination: { page: 1, size: 20 }
      }
      
      const result = await slugStore('dashboard-filters', dashboardState, {
        url: true,
        compress: true,
        offline: { storage: 'memory', ttl: 3600 }
      })
      
      expect(result.state).toEqual(dashboardState)
      expect(result.slug).toBeDefined()
      expect(result.offline).toBe(true)
      expect(result.shareableUrl).toBeDefined()
    })

    it('should handle e-commerce cart scenario', async () => {
      const cartState = {
        items: [
          { id: 1, name: 'Product A', price: 99.99, quantity: 2 },
          { id: 2, name: 'Product B', price: 149.99, quantity: 1 }
        ],
        total: 349.97,
        currency: 'USD'
      }
      
      const result = await slugStore('shopping-cart', cartState, {
        url: false, // Private data
        offline: { storage: 'memory', encryption: true, password: 'user-123' },
        db: { endpoint: '/api/cart/sync' }
      })
      
      expect(result.state).toEqual(cartState)
      expect(result.slug).toBeUndefined()
      expect(result.offline).toBe(true)
      expect(result.dbKey).toBeDefined()
    })

    it('should handle AI chat conversation scenario', async () => {
      const chatState = {
        messages: [
          { role: 'user', content: 'Hello AI!' },
          { role: 'assistant', content: 'Hello! How can I help you today?' }
        ],
        model: 'gpt-4',
        temperature: 0.7,
        conversationId: 'conv-123'
      }
      
      const result = await slugStore('ai-chat', chatState, {
        url: true,
        compress: true // Important for long conversations
      })
      
      expect(result.state).toEqual(chatState)
      expect(result.slug).toBeDefined()
      expect(result.shareableUrl).toBeDefined()
    })
  })
}) 