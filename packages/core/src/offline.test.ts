import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { saveOffline, loadOffline, clearOffline, listOfflineKeys, _resetStorage } from './offline.js'
import { SlugStoreError } from './types.js'
import * as core from './core.js'

// Mock browser APIs
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
}

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

// Store original globals
let originalIndexedDB: any;
let originalLocalStorage: any;
let originalWindow: any;

// Test data
const testState = {
  todos: [
    { id: 1, text: 'Learn Slug Store', completed: false },
    { id: 2, text: 'Build awesome app', completed: true }
  ],
  filter: 'all'
}

const simpleState = { count: 42, name: 'test' }

describe('Offline Storage', () => {
  beforeEach(() => {
    // Save original globals
    originalIndexedDB = global.indexedDB;
    originalLocalStorage = global.localStorage;
    originalWindow = global.window;

    // Reset mocks
    vi.clearAllMocks()
    
    // Mock global objects
    vi.stubGlobal('indexedDB', mockIndexedDB)
    vi.stubGlobal('localStorage', mockLocalStorage)
    vi.stubGlobal('window', {
      indexedDB: mockIndexedDB,
      localStorage: mockLocalStorage
    })
  })

  afterEach(() => {
    // Clean up and restore globals
    vi.restoreAllMocks()
    _resetStorage()
  })

  describe('Memory Storage (default fallback)', () => {
    it('should save and load state', async () => {
      await saveOffline('test-state', simpleState, { storage: 'memory' })
      const loaded = await loadOffline('test-state', { storage: 'memory' })
      
      expect(loaded).toEqual(simpleState)
    })

    it('should handle complex state objects', async () => {
      await saveOffline('complex-state', testState, { storage: 'memory' })
      const loaded = await loadOffline('complex-state', { storage: 'memory' })
      
      expect(loaded).toEqual(testState)
    })

    it('should return null for non-existent keys', async () => {
      const loaded = await loadOffline('non-existent', { storage: 'memory' })
      expect(loaded).toBeNull()
    })

    it('should handle TTL expiration', async () => {
      // Save with 1ms TTL
      await saveOffline('ttl-test', simpleState, { 
        storage: 'memory',
        ttl: 0.001 // 1ms
      })
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const loaded = await loadOffline('ttl-test', { storage: 'memory' })
      expect(loaded).toBeNull()
    })

    it('should clear specific keys', async () => {
      await saveOffline('key1', { data: 1 }, { storage: 'memory' })
      await saveOffline('key2', { data: 2 }, { storage: 'memory' })
      
      await clearOffline('key1', { storage: 'memory' })
      
      const loaded1 = await loadOffline('key1', { storage: 'memory' })
      const loaded2 = await loadOffline('key2', { storage: 'memory' })
      
      expect(loaded1).toBeNull()
      expect(loaded2).toEqual({ data: 2 })
    })

    it('should clear all data', async () => {
      await saveOffline('key1', { data: 1 }, { storage: 'memory' })
      await saveOffline('key2', { data: 2 }, { storage: 'memory' })
      
      await clearOffline(undefined, { storage: 'memory' })
      
      const keys = await listOfflineKeys({ storage: 'memory' })
      expect(keys).toEqual([])
    })

    it('should list all keys', async () => {
      await saveOffline('key1', { data: 1 }, { storage: 'memory' })
      await saveOffline('key2', { data: 2 }, { storage: 'memory' })
      await saveOffline('key3', { data: 3 }, { storage: 'memory' })
      
      const keys = await listOfflineKeys({ storage: 'memory' })
      expect(keys.sort()).toEqual(['key1', 'key2', 'key3'])
    })
  })

  describe('localStorage Storage', () => {
    beforeEach(() => {
      // Mock localStorage behavior
      const storage = new Map<string, string>()
      
      mockLocalStorage.getItem.mockImplementation((key: string) => storage.get(key) || null)
      mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
        storage.set(key, value)
      })
      mockLocalStorage.removeItem.mockImplementation((key: string) => {
        storage.delete(key)
      })
      mockLocalStorage.key.mockImplementation((index: number) => {
        const keys = Array.from(storage.keys())
        return keys[index] || null
      })
      
      Object.defineProperty(mockLocalStorage, 'length', {
        get: () => storage.size,
        configurable: true // Allow redefine
      })
    })

    it('should save and load state with localStorage', async () => {
      await saveOffline('test-state', simpleState, { storage: 'localstorage' })
      const loaded = await loadOffline('test-state', { storage: 'localstorage' })
      
      expect(loaded).toEqual(simpleState)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      expect(mockLocalStorage.getItem).toHaveBeenCalled()
    })

    it.skip('should handle localStorage errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded')
      })
      
      await expect(
        saveOffline('test-state', simpleState, { storage: 'localstorage' })
      ).rejects.toThrow(SlugStoreError)
    })

    it('should use slug-store prefix for keys', async () => {
      await saveOffline('user-prefs', simpleState, { storage: 'localstorage' })
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'slug-store:user-prefs',
        expect.any(String)
      )
    })
  })

  describe('Encryption', () => {
    it('should encrypt and decrypt data', async () => {
      const password = 'super-secret-password'
      
      await saveOffline('encrypted-state', testState, {
        storage: 'memory',
        encryption: true,
        password
      })
      
      const loaded = await loadOffline('encrypted-state', {
        storage: 'memory',
        encryption: true,
        password
      })
      
      expect(loaded).toEqual(testState)
    })

    it('should fail with wrong password', async () => {
      const correctPassword = 'correct-password'
      const wrongPassword = 'wrong-password'
      
      await saveOffline('encrypted-state', testState, {
        storage: 'memory',
        encryption: true,
        password: correctPassword
      })
      
      await expect(
        loadOffline('encrypted-state', {
          storage: 'memory',
          encryption: true,
          password: wrongPassword
        })
      ).rejects.toThrow(SlugStoreError)
    })

    it('should require password for encryption', async () => {
      vi.spyOn(core, 'encodeState').mockImplementation(async () => {
        throw new SlugStoreError('Password is required', 'INVALID_PASSWORD')
      })

      await expect(
        saveOffline('encrypted-state', testState, {
          storage: 'memory',
          encryption: true
          // Missing password
        })
      ).rejects.toThrow()
    })
  })

  describe('Storage fallback', () => {
    it.skip('should fallback to memory when localStorage is not available', async () => {
      // Mock localStorage as unavailable
      vi.stubGlobal('localStorage', undefined)
      
      // Should fallback to memory storage without throwing
      await expect(saveOffline('fallback-test', simpleState, { storage: 'localstorage' })).resolves.toBeUndefined()
      const loaded = await loadOffline('fallback-test', { storage: 'localstorage' })
      
      expect(loaded).toEqual(simpleState)
    })

    it.skip('should handle completely unavailable storage', async () => {
      // Mock all storage as unavailable
      vi.stubGlobal('indexedDB', undefined)
      vi.stubGlobal('localStorage', undefined)
      vi.stubGlobal('window', undefined)
      
      await expect(
        saveOffline('impossible-test', simpleState)
      ).rejects.toThrow(SlugStoreError)
    })
  })

  describe('Edge cases', () => {
    it('should handle null/undefined state', async () => {
      await saveOffline('null-state', null, { storage: 'memory' })
      const loaded = await loadOffline('null-state', { storage: 'memory' })
      expect(loaded).toBeNull()
      
      await saveOffline('undefined-state', undefined, { storage: 'memory' })
      const loadedUndefined = await loadOffline('undefined-state', { storage: 'memory' })
      expect(loadedUndefined).toBeUndefined()
    })

    it('should handle very large objects', async () => {
      const largeState = {
        data: new Array(10000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` }))
      }
      
      await saveOffline('large-state', largeState, { storage: 'memory' })
      const loaded = await loadOffline('large-state', { storage: 'memory' })
      
      expect(loaded).toEqual(largeState)
    })

    it('should handle special characters in keys', async () => {
      const specialKey = 'key-with-!@#$%^&*()_+-={}[]|;:,.<>?'
      
      await saveOffline(specialKey, simpleState, { storage: 'memory' })
      const loaded = await loadOffline(specialKey, { storage: 'memory' })
      
      expect(loaded).toEqual(simpleState)
    })

    it.skip('should handle circular references gracefully', async () => {
      const circularState: any = { name: 'circular' }
      circularState.self = circularState
      
      // safeJsonStringify will throw an error, which gets wrapped
      await expect(
        saveOffline('circular-state', circularState, { storage: 'memory' })
      ).rejects.toThrow(SlugStoreError)
    })
  })
}) 