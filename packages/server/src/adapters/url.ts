import { encodeState, decodeState } from '@farajabien/slug-store-core'
import type { 
  PersistenceAdapter, 
  CachedData, 
  ServerSlugStoreOptions 
} from '../types.js'

/**
 * URL persistence adapter
 * Uses the existing slug-store-core URL encoding/decoding
 * Data is "persisted" by encoding it into a URL-safe format
 */
export class URLAdapter implements PersistenceAdapter {
  name = 'url'
  private urlCache = new Map<string, string>() // key -> encoded URL slug
  private options: ServerSlugStoreOptions

  constructor(options: ServerSlugStoreOptions = {}) {
    this.options = {
      compress: true,
      encrypt: false,
      ...options
    }
  }

  async get(key: string): Promise<CachedData | null> {
    const slug = this.urlCache.get(key)
    if (!slug) return null

    try {
      const decodedValue = await decodeState(slug, {
        password: this.options.password,
        ...this.options.decodeOptions
      })

      // URL adapter doesn't have built-in TTL, 
      // so we wrap the value with timestamp
      if (decodedValue && typeof decodedValue === 'object' && decodedValue.__urlAdapterMeta) {
        const { value, timestamp, ttl } = decodedValue.__urlAdapterMeta
        
        // Check if expired
        if (ttl && (Date.now() - timestamp) > (ttl * 1000)) {
          this.urlCache.delete(key)
          return null
        }

        return {
          value,
          timestamp,
          ttl
        }
      }

      // Legacy format without metadata
      return {
        value: decodedValue,
        timestamp: Date.now(),
        ttl: undefined
      }
    } catch {
      // Invalid or corrupted data
      this.urlCache.delete(key)
      return null
    }
  }

  async set(key: string, data: CachedData, ttl?: number): Promise<void> {
    const finalTTL = ttl ?? data.ttl

    // Wrap value with metadata for TTL support
    const wrappedValue = {
      __urlAdapterMeta: {
        value: data.value,
        timestamp: Date.now(),
        ttl: finalTTL,
        metadata: data.metadata
      }
    }

    try {
      const slug = await encodeState(wrappedValue, {
        compress: this.options.compress,
        encrypt: this.options.encrypt,
        password: this.options.password
      })

      this.urlCache.set(key, slug)
    } catch (error) {
      throw new Error(`Failed to encode data for URL storage: ${error}`)
    }
  }

  async delete(key: string): Promise<void> {
    this.urlCache.delete(key)
  }

  async clear(): Promise<void> {
    this.urlCache.clear()
  }

  async keys(): Promise<string[]> {
    return Array.from(this.urlCache.keys())
  }

  /**
   * Get the URL slug for a specific key
   * Useful for generating shareable URLs
   */
  getSlug(key: string): string | null {
    return this.urlCache.get(key) || null
  }

  /**
   * Set data directly from a URL slug
   * Useful for hydrating cache from URL parameters
   */
  async setFromSlug(key: string, slug: string): Promise<void> {
    // Validate the slug first
    try {
      const data = await decodeState(slug, {
        password: this.options.password,
        ...this.options.decodeOptions
      })

      // Store the slug directly
      this.urlCache.set(key, slug)
    } catch (error) {
      throw new Error(`Invalid slug provided: ${error}`)
    }
  }

  /**
   * Generate a complete URL with the cached data
   */
  generateShareableUrl(
    key: string, 
    baseUrl: string, 
    paramName: string = 'state'
  ): string | null {
    const slug = this.getSlug(key)
    if (!slug) return null

    const url = new URL(baseUrl)
    url.searchParams.set(paramName, slug)
    return url.toString()
  }

  /**
   * Load data from URL search parameters
   */
  async loadFromUrl(
    key: string,
    url: string | URL,
    paramName: string = 'state'
  ): Promise<boolean> {
    const urlObj = typeof url === 'string' ? new URL(url) : url
    const slug = urlObj.searchParams.get(paramName)
    
    if (!slug) return false

    try {
      await this.setFromSlug(key, slug)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get statistics about the URL cache
   */
  getStats() {
    const keys = Array.from(this.urlCache.keys())
    const slugs = Array.from(this.urlCache.values())
    
    const totalSize = slugs.reduce((sum, slug) => sum + slug.length, 0)
    const avgSize = keys.length > 0 ? Math.round(totalSize / keys.length) : 0

    return {
      total: keys.length,
      totalSizeBytes: totalSize,
      averageSizeBytes: avgSize,
      compression: this.options.compress,
      encryption: this.options.encrypt
    }
  }
} 