import type { EncodeOptions, DecodeOptions } from '@farajabien/slug-store-core'

// ===== Core Server Types =====

export interface ServerSlugStoreOptions extends Omit<EncodeOptions, 'version'> {
  /** Persistence backend to use */
  persist?: PersistenceBackend | PersistenceBackend[]
  /** Cache TTL in seconds (default: 3600) */
  ttl?: number
  /** Debounce cache writes in milliseconds (default: 0) */
  debounceMs?: number
  /** Revalidate when these change (default: ['params', 'searchParams']) */
  revalidateOn?: RevalidateCondition[]
  /** Custom cache key generator */
  cacheKey?: (params: any, searchParams: any) => string | Promise<string>
  /** Custom revalidation logic */
  shouldRevalidate?: (
    oldParams: any,
    newParams: any,
    oldSearchParams: any,
    newSearchParams: any
  ) => boolean | Promise<boolean>
  /** Enable stale-while-revalidate pattern */
  staleWhileRevalidate?: boolean
  /** Background sync interval in ms */
  backgroundSync?: number
  /** Graceful error handling */
  fallback?: boolean
  /** Decode options for reading cached state */
  decodeOptions?: DecodeOptions
}

export interface ServerSlugStoreReturn<T> {
  /** The fetched/cached data */
  data: T
  /** Whether data is currently loading */
  loading: boolean
  /** Any error that occurred */
  error: Error | null
  /** Whether data exists in cache */
  cached: boolean
  /** Whether data is stale (older than TTL) */
  stale: boolean
  /** Manually revalidate the cache */
  revalidate: () => Promise<void>
  /** Clear this entry from cache */
  invalidate: () => Promise<void>
  /** Get cache metadata */
  getCacheInfo: () => Promise<CacheInfo | null>
}

// ===== Persistence Backends =====

export type PersistenceBackend = 
  | 'memory'
  | 'url'
  | 'file' 
  | 'redis'
  | 'redis-cluster'
  | 'kv'
  | 'custom'

export interface PersistenceAdapter {
  name: string
  get(key: string): Promise<CachedData | null>
  set(key: string, data: CachedData, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
  close?(): Promise<void>
}

export interface CachedData {
  value: any
  timestamp: number
  ttl?: number
  metadata?: Record<string, any>
}

export interface CacheInfo {
  key: string
  size: number
  timestamp: number
  ttl?: number
  compressed: boolean
  encrypted: boolean
  backend: string
}

// ===== Revalidation =====

export type RevalidateCondition = 
  | 'params'
  | 'searchParams'
  | string // specific param key like 'params.userId'
  | { type: 'params' | 'searchParams'; keys: string[] }
  | { type: 'custom'; fn: (oldValue: any, newValue: any) => boolean }

// ===== Server Fetcher =====

export type ServerFetcher<T> = (
  params: Record<string, any>,
  searchParams: Record<string, any>,
  context?: ServerContext
) => Promise<T> | T

export interface ServerContext {
  /** Request headers (if available) */
  headers?: Record<string, string>
  /** User agent */
  userAgent?: string
  /** Client IP */
  ip?: string
  /** Request timestamp */
  timestamp: number
  /** Cache miss/hit info */
  cacheStatus: 'miss' | 'hit' | 'stale'
}

// ===== Framework Integration =====

export interface NextJSContext {
  params: Record<string, string | string[]>
  searchParams: Record<string, string | string[] | undefined>
  headers?: Headers
}

export interface RemixContext {
  params: Record<string, string | undefined>
  request: Request
}

export interface AstroContext {
  params: Record<string, string | undefined>
  url: URL
  request: Request
}

// ===== Adapter Configurations =====

export interface RedisAdapterConfig {
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
  maxRetriesPerRequest?: number
  retryDelayOnFailover?: number
  enableReadyCheck?: boolean
  lazyConnect?: boolean
}

export interface FileAdapterConfig {
  baseDir: string
  compression?: boolean
  maxFiles?: number
  cleanupInterval?: number
}

export interface MemoryAdapterConfig {
  maxSize?: number
  cleanupInterval?: number
}

export interface KVAdapterConfig {
  namespace?: string
  apiToken?: string
  accountId?: string
}

// ===== Error Types =====

export class ServerSlugStoreError extends Error {
  constructor(
    message: string,
    public code: 
      | 'ADAPTER_ERROR'
      | 'CACHE_MISS' 
      | 'FETCHER_ERROR'
      | 'SERIALIZATION_ERROR'
      | 'INVALID_CONFIG'
      | 'PERSISTENCE_ERROR'
      | 'REVALIDATION_ERROR',
    public cause?: Error
  ) {
    super(message)
    this.name = 'ServerSlugStoreError'
  }
} 