import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useServerSlugStore } from './useServerSlugStore.js'
import { MemoryAdapter } from './adapters/memory.js'

describe('useServerSlugStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch data on cache miss', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({ id: 1, name: 'John Doe' })
    
    const result = await useServerSlugStore(
      mockFetcher,
      { userId: '1', testId: 'test1' },
      { filter: 'active' },
      { persist: 'memory', ttl: 300 }
    )

    expect(mockFetcher).toHaveBeenCalledTimes(1)
    expect(mockFetcher).toHaveBeenCalledWith(
      { userId: '1', testId: 'test1' },
      { filter: 'active' },
      expect.objectContaining({ cacheStatus: 'miss' })
    )
    expect(result.data).toEqual({ id: 1, name: 'John Doe' })
    expect(result.cached).toBe(false)
    expect(result.loading).toBe(false)
    expect(result.error).toBe(null)
  })

  it('should return cached data on cache hit', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({ id: 1, name: 'John Doe' })
    
    // First call - cache miss
    await useServerSlugStore(
      mockFetcher,
      { userId: '2', testId: 'test2' },
      { filter: 'active' },
      { persist: 'memory', ttl: 300 }
    )

    // Second call - cache hit
    const result = await useServerSlugStore(
      mockFetcher,
      { userId: '2', testId: 'test2' },
      { filter: 'active' },
      { persist: 'memory', ttl: 300 }
    )

    expect(mockFetcher).toHaveBeenCalledTimes(1) // Only called once
    expect(result.data).toEqual({ id: 1, name: 'John Doe' })
    expect(result.cached).toBe(true)
  })

  it('should handle errors gracefully with fallback', async () => {
    const mockFetcher = vi.fn().mockRejectedValue(new Error('Network error'))
    
    const result = await useServerSlugStore(
      mockFetcher,
      { userId: '3', testId: 'test3' },
      {},
      { persist: 'memory', fallback: true }
    )

    expect(result.error).toBeInstanceOf(Error)
    expect(result.data).toBeUndefined()
  })

  it('should provide cache management functions', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({ id: 1, name: 'John Doe' })
    
    const result = await useServerSlugStore(
      mockFetcher,
      { userId: '4', testId: 'test4' },
      {},
      { persist: 'memory', ttl: 300 }
    )

    // Test revalidate function exists
    expect(typeof result.revalidate).toBe('function')
    expect(typeof result.invalidate).toBe('function')
    expect(typeof result.getCacheInfo).toBe('function')

    // Test cache info
    const cacheInfo = await result.getCacheInfo()
    expect(cacheInfo).toMatchObject({
      backend: 'memory',
      compressed: false,
      encrypted: false
    })
  })
})

describe('MemoryAdapter', () => {
  it('should store and retrieve data correctly', async () => {
    const adapter = new MemoryAdapter()
    const testData = {
      value: { test: 'data' },
      timestamp: Date.now(),
      ttl: 300
    }

    await adapter.set('test-key', testData, 300)
    const retrieved = await adapter.get('test-key')

    expect(retrieved).toEqual(testData)
  })

  it('should handle TTL expiration', async () => {
    const adapter = new MemoryAdapter()
    const testData = {
      value: { test: 'data' },
      timestamp: Date.now() - 10000, // This will be overridden by adapter.set
      ttl: 0.001 // Very short TTL (1ms)
    }

    await adapter.set('test-key', testData, 0.001)
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const retrieved = await adapter.get('test-key')

    expect(retrieved).toBeNull()
  })

  it('should delete entries correctly', async () => {
    const adapter = new MemoryAdapter()
    const testData = {
      value: { test: 'data' },
      timestamp: Date.now(),
      ttl: 300
    }

    await adapter.set('test-key', testData, 300)
    await adapter.delete('test-key')
    const retrieved = await adapter.get('test-key')

    expect(retrieved).toBeNull()
  })
}) 