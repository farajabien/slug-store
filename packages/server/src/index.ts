// Main server hook
export { useServerSlugStore } from './useServerSlugStore.js'

// Types
export type {
  ServerSlugStoreOptions,
  ServerSlugStoreReturn,
  ServerFetcher,
  ServerContext,
  PersistenceAdapter,
  PersistenceBackend,
  CachedData,
  CacheInfo,
  RevalidateCondition,
  NextJSContext,
  RemixContext,
  AstroContext,
  RedisAdapterConfig,
  FileAdapterConfig,
  MemoryAdapterConfig,
  KVAdapterConfig
} from './types.js'

// Error class
export { ServerSlugStoreError } from './types.js'

// Utilities
export {
  generateCacheKey,
  shouldRevalidateData,
  createContext,
  safeStringify,
  safeParse,
  isServerEnvironment,
  debounce
} from './utils/index.js'

// Adapters
export {
  createAdapter,
  MemoryAdapter,
  URLAdapter,
  FileAdapter
} from './adapters/index.js' 