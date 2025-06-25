import type { 
  PersistenceAdapter, 
  PersistenceBackend, 
  ServerSlugStoreOptions 
} from '../types.js'
import { MemoryAdapter } from './memory.js'
import { URLAdapter } from './url.js'
import { FileAdapter } from './file.js'
// Redis adapters will be imported conditionally

/**
 * Create persistence adapter based on configuration
 */
export async function createAdapter(
  backend: PersistenceBackend | PersistenceBackend[],
  options: ServerSlugStoreOptions = {}
): Promise<PersistenceAdapter> {
  
  // If array of backends, try them in order (fallback chain)
  if (Array.isArray(backend)) {
    return createFallbackAdapter(backend, options)
  }

  // Single backend
  switch (backend) {
    case 'memory':
      return new MemoryAdapter(options)
    
    case 'url':
      return new URLAdapter(options)
    
    case 'file':
      return new FileAdapter(options)
    
    case 'redis':
      return await createRedisAdapter(options)
    
    case 'redis-cluster':
      return await createRedisClusterAdapter(options)
    
    case 'kv':
      return await createKVAdapter(options)
    
    default:
      throw new Error(`Unknown persistence backend: ${backend}`)
  }
}

/**
 * Create fallback adapter that tries multiple backends
 */
function createFallbackAdapter(
  backends: PersistenceBackend[],
  options: ServerSlugStoreOptions
): PersistenceAdapter {
  return {
    name: `fallback(${backends.join(',')})`,
    
    async get(key: string) {
      for (const backend of backends) {
        try {
          const adapter = await createAdapter(backend, options)
          const result = await adapter.get(key)
          if (result) return result
        } catch {
          // Try next backend
          continue
        }
      }
      return null
    },
    
    async set(key: string, data: any, ttl?: number) {
      // Write to all backends (best effort)
      const promises = backends.map(async backend => {
        try {
          const adapter = await createAdapter(backend, options)
          await adapter.set(key, data, ttl)
        } catch {
          // Ignore write failures in fallback mode
        }
      })
      await Promise.allSettled(promises)
    },
    
    async delete(key: string) {
      const promises = backends.map(async backend => {
        try {
          const adapter = await createAdapter(backend, options)
          await adapter.delete(key)
        } catch {
          // Ignore delete failures
        }
      })
      await Promise.allSettled(promises)
    },
    
    async clear() {
      const promises = backends.map(async backend => {
        try {
          const adapter = await createAdapter(backend, options)
          await adapter.clear()
        } catch {
          // Ignore clear failures
        }
      })
      await Promise.allSettled(promises)
    },
    
    async keys() {
      // Return keys from first available backend
      for (const backend of backends) {
        try {
          const adapter = await createAdapter(backend, options)
          return await adapter.keys()
        } catch {
          continue
        }
      }
      return []
    }
  }
}

/**
 * Dynamically import and create Redis adapter
 */
async function createRedisAdapter(options: ServerSlugStoreOptions): Promise<PersistenceAdapter> {
  const { RedisAdapter } = await import('./redis.js')
  return new RedisAdapter(options)
}

/**
 * Dynamically import and create Redis Cluster adapter  
 */
async function createRedisClusterAdapter(options: ServerSlugStoreOptions): Promise<PersistenceAdapter> {
  const { RedisClusterAdapter } = await import('./redis-cluster.js')
  return new RedisClusterAdapter(options)
}

/**
 * Dynamically import and create KV adapter (Vercel KV, Cloudflare KV)
 */
async function createKVAdapter(options: ServerSlugStoreOptions): Promise<PersistenceAdapter> {
  const { KVAdapter } = await import('./kv.js')
  return new KVAdapter(options)
}

// Re-export adapters for direct use
export { MemoryAdapter } from './memory.js'
export { URLAdapter } from './url.js'
export { FileAdapter } from './file.js' 