import { encodeState, decodeState } from '@farajabien/slug-store-core'
import type {
  ServerSlugStoreOptions,
  ServerSlugStoreReturn,
  ServerFetcher,
  ServerContext,
  PersistenceAdapter,
  CachedData,
  CacheInfo,
  RevalidateCondition
} from './types.js'
import { ServerSlugStoreError } from './types.js'
import { generateCacheKey, shouldRevalidateData, createContext } from './utils/index.js'
import { createAdapter } from './adapters/index.js'

/**
 * Server-side state persistence hook with multiple backends
 * 
 * @example
 * ```typescript
 * const { data, loading, error } = await useServerSlugStore(
 *   async (params, searchParams) => {
 *     return await db.users.findMany({
 *       where: { status: searchParams.status }
 *     })
 *   },
 *   { 
 *     persist: 'redis',
 *     ttl: 300,
 *     revalidateOn: ['searchParams.status']
 *   }
 * )
 * ```
 */
export async function useServerSlugStore<T>(
  fetcher: ServerFetcher<T>,
  params: Record<string, any> = {},
  searchParams: Record<string, any> = {},
  options: ServerSlugStoreOptions = {}
): Promise<ServerSlugStoreReturn<T>> {
  const {
    persist = 'memory',
    ttl = 3600,
    debounceMs = 0,
    revalidateOn = ['params', 'searchParams'],
    cacheKey: customCacheKey,
    shouldRevalidate: customShouldRevalidate,
    staleWhileRevalidate = false,
    backgroundSync,
    fallback = true,
    compress = false,
    encrypt = false,
    password,
    decodeOptions = {}
  } = options

  // Create persistence adapter
  const adapter = await createAdapter(persist, options)
  
  // Generate cache key
  const cacheKey = customCacheKey 
    ? await customCacheKey(params, searchParams)
    : await generateCacheKey(params, searchParams, options)

  let data: T | undefined
  let loading = true
  let error: Error | null = null
  let cached = false
  let stale = false

  // Create server context
  const context: ServerContext = createContext()

  try {
    // Try to load from cache first
    const cachedData = await adapter.get(cacheKey)
    
    if (cachedData) {
      const isExpired = cachedData.ttl && 
        (Date.now() - cachedData.timestamp) > (cachedData.ttl * 1000)
      
      if (!isExpired) {
        // Cache hit - return cached data
        data = cachedData.value
        cached = true
        loading = false
        context.cacheStatus = 'hit'
      } else {
        stale = true
        if (staleWhileRevalidate) {
          // Return stale data, fetch fresh in background
          data = cachedData.value
          cached = true
          loading = false
          context.cacheStatus = 'stale'
          
          // Background refresh (don't await)
          refreshCache(fetcher, params, searchParams, context, adapter, cacheKey, options)
            .catch(err => {
              if (!fallback) throw err
              console.warn('Background refresh failed:', err)
            })
        } else {
          // Fetch fresh data
          data = await fetchAndCache(fetcher, params, searchParams, context, adapter, cacheKey, options)
          loading = false
          context.cacheStatus = 'miss'
        }
      }
    } else {
      // Cache miss - fetch fresh data
      data = await fetchAndCache(fetcher, params, searchParams, context, adapter, cacheKey, options)
      loading = false
      context.cacheStatus = 'miss'
    }
  } catch (err) {
    error = err instanceof Error ? err : new Error(String(err))
    loading = false
    
    if (!fallback) {
      throw new ServerSlugStoreError(
        `Failed to fetch data: ${error.message}`,
        'FETCHER_ERROR',
        error
      )
    }
    
    // Fallback: try to return any cached data, even if stale
    const cachedData = await adapter.get(cacheKey).catch(() => null)
    if (cachedData) {
      data = cachedData.value
      cached = true
      stale = true
    }
    // If fallback is enabled and no cached data, return undefined data with error
  }

  // Helper functions for the return object
  const revalidate = async (): Promise<void> => {
    try {
      await fetchAndCache(fetcher, params, searchParams, context, adapter, cacheKey, options)
    } catch (err) {
      throw new ServerSlugStoreError(
        'Failed to revalidate cache',
        'REVALIDATION_ERROR',
        err instanceof Error ? err : new Error(String(err))
      )
    }
  }

  const invalidate = async (): Promise<void> => {
    try {
      await adapter.delete(cacheKey)
    } catch (err) {
      throw new ServerSlugStoreError(
        'Failed to invalidate cache',
        'PERSISTENCE_ERROR',
        err instanceof Error ? err : new Error(String(err))
      )
    }
  }

  const getCacheInfo = async (): Promise<CacheInfo | null> => {
    try {
      const cachedData = await adapter.get(cacheKey)
      if (!cachedData) return null

      const encoded = await encodeState(cachedData.value, { compress, encrypt, password })
      
      return {
        key: cacheKey,
        size: encoded.length,
        timestamp: cachedData.timestamp,
        ttl: cachedData.ttl,
        compressed: compress || false,
        encrypted: encrypt || false,
        backend: adapter.name
      }
    } catch {
      return null
    }
  }

  return {
    data: data!,
    loading,
    error,
    cached,
    stale,
    revalidate,
    invalidate,
    getCacheInfo
  }
}

/**
 * Fetch data and cache the result
 */
async function fetchAndCache<T>(
  fetcher: ServerFetcher<T>,
  params: Record<string, any>,
  searchParams: Record<string, any>,
  context: ServerContext,
  adapter: PersistenceAdapter,
  cacheKey: string,
  options: ServerSlugStoreOptions
): Promise<T> {
  const { ttl = 3600, compress = false, encrypt = false, password } = options

  // Fetch fresh data
  const freshData = await fetcher(params, searchParams, context)

  // Cache the result
  const cachedData: CachedData = {
    value: freshData,
    timestamp: Date.now(),
    ttl,
    metadata: {
      params,
      searchParams,
      context: {
        timestamp: context.timestamp,
        cacheStatus: context.cacheStatus
      }
    }
  }

  await adapter.set(cacheKey, cachedData, ttl)
  
  return freshData
}

/**
 * Background cache refresh for stale-while-revalidate
 */
async function refreshCache<T>(
  fetcher: ServerFetcher<T>,
  params: Record<string, any>,
  searchParams: Record<string, any>,
  context: ServerContext,
  adapter: PersistenceAdapter,
  cacheKey: string,
  options: ServerSlugStoreOptions
): Promise<void> {
  await fetchAndCache(fetcher, params, searchParams, context, adapter, cacheKey, options)
} 