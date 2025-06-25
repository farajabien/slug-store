import type { 
  PersistenceAdapter, 
  CachedData, 
  ServerSlugStoreOptions,
  MemoryAdapterConfig 
} from '../types.js'

/**
 * In-memory persistence adapter
 * Fast but data is lost on process restart
 */
export class MemoryAdapter implements PersistenceAdapter {
  name = 'memory'
  private cache = new Map<string, CachedData>()
  private config: MemoryAdapterConfig
  private cleanupInterval?: ReturnType<typeof setInterval>

  constructor(options: ServerSlugStoreOptions = {}) {
    this.config = {
      maxSize: 1000,
      cleanupInterval: 60000, // 1 minute
      ...options
    }

    // Start cleanup interval
    if (this.config.cleanupInterval && this.config.cleanupInterval > 0) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, this.config.cleanupInterval)
    }
  }

  async get(key: string): Promise<CachedData | null> {
    const data = this.cache.get(key)
    
    if (!data) return null

    // Check if expired
    if (data.ttl && (Date.now() - data.timestamp) > (data.ttl * 1000)) {
      this.cache.delete(key)
      return null
    }

    return data
  }

  async set(key: string, data: CachedData, ttl?: number): Promise<void> {
    // Apply TTL from parameter or data
    const finalTTL = ttl ?? data.ttl
    
    const cachedData: CachedData = {
      ...data,
      ttl: finalTTL,
      timestamp: Date.now()
    }

    this.cache.set(key, cachedData)

    // Enforce max size by removing oldest entries
    if (this.config.maxSize && this.cache.size > this.config.maxSize) {
      this.evictOldest()
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys())
  }

  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, data] of this.cache.entries()) {
      if (data.ttl && (now - data.timestamp) > (data.ttl * 1000)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    if (this.cache.size === 0) return

    // Find oldest entry
    let oldestKey: string | null = null
    let oldestTimestamp = Infinity

    for (const [key, data] of this.cache.entries()) {
      if (data.timestamp < oldestTimestamp) {
        oldestTimestamp = data.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let expired = 0
    let total = this.cache.size

    for (const data of this.cache.values()) {
      if (data.ttl && (now - data.timestamp) > (data.ttl * 1000)) {
        expired++
      }
    }

    return {
      total,
      expired,
      active: total - expired,
      maxSize: this.config.maxSize
    }
  }
} 