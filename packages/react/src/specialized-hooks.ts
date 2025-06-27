import { useSlugStore } from './useSlugStore.js'
import type { SlugStoreOptions } from '@farajabien/slug-store-core'

/**
 * Hook for URL-only state sharing
 * Perfect for dashboard filters, search parameters, etc.
 * 
 * @example
 * ```typescript
 * const [filters, setFilters] = useUrlState('filters', {
 *   category: 'tech',
 *   dateRange: '30d'
 * })
 * ```
 */
export function useUrlState<T>(
  key: string,
  initialState: T,
  options?: Pick<SlugStoreOptions, 'compress' | 'encrypt' | 'password'>
) {
  return useSlugStore(key, initialState, {
    url: true,
    offline: false,
    ...options
  })
}

/**
 * Hook for offline-only state storage
 * Perfect for user preferences, cached data, etc.
 * 
 * @example
 * ```typescript
 * const [todos, setTodos] = useOfflineState('todos', [], {
 *   encryption: true,
 *   ttl: 86400 // 24 hours
 * })
 * ```
 */
export function useOfflineState<T>(
  key: string,
  initialState: T,
  options?: {
    storage?: 'indexeddb' | 'localstorage' | 'memory'
    encryption?: boolean
    password?: string
    ttl?: number
  }
) {
  return useSlugStore(key, initialState, {
    url: false,
    offline: options ? {
      storage: options.storage,
      encryption: options.encryption,
      password: options.password,
      ttl: options.ttl
    } : true
  })
}

/**
 * Hook for database-synced state
 * Perfect for user profiles, settings, private data, etc.
 * 
 * @example
 * ```typescript
 * const [preferences, setPreferences] = useDbState('preferences', {
 *   theme: 'dark'
 * }, '/api/user/preferences')
 * ```
 */
export function useDbState<T>(
  key: string,
  initialState: T,
  endpoint: string,
  options?: {
    method?: 'POST' | 'PUT'
    headers?: Record<string, string>
    offline?: boolean
    compress?: boolean
    encrypt?: boolean
    password?: string
  }
) {
  return useSlugStore(key, initialState, {
    url: false,
    offline: options?.offline,
    db: {
      endpoint,
      method: options?.method || 'POST',
      headers: options?.headers
    },
    compress: options?.compress,
    encrypt: options?.encrypt,
    password: options?.password
  })
}

/**
 * Hook for combined URL + Offline state
 * Perfect for dashboards that work offline and can be shared
 * 
 * @example
 * ```typescript
 * const [dashboardState, setDashboardState] = useSharedOfflineState('dashboard', {
 *   filters: {},
 *   view: 'grid'
 * })
 * ```
 */
export function useSharedOfflineState<T>(
  key: string,
  initialState: T,
  options?: {
    compress?: boolean
    encryption?: boolean
    password?: string
    ttl?: number
  }
) {
  return useSlugStore(key, initialState, {
    url: true,
    offline: {
      encryption: options?.encryption,
      password: options?.password,
      ttl: options?.ttl
    },
    compress: options?.compress
  })
}

/**
 * Hook for full-featured state (URL + Offline + Database)
 * Perfect for complex applications with all features needed
 * 
 * @example
 * ```typescript
 * const [appState, setAppState] = useFullState('app', initialState, {
 *   endpoint: '/api/sync',
 *   encryption: true
 * })
 * ```
 */
export function useFullState<T>(
  key: string,
  initialState: T,
  options: {
    endpoint: string
    method?: 'POST' | 'PUT'
    headers?: Record<string, string>
    compress?: boolean
    encryption?: boolean
    password?: string
    ttl?: number
  }
) {
  return useSlugStore(key, initialState, {
    url: true,
    offline: {
      encryption: options.encryption,
      password: options.password,
      ttl: options.ttl
    },
    db: {
      endpoint: options.endpoint,
      method: options.method || 'POST',
      headers: options.headers
    },
    compress: options.compress
  })
} 