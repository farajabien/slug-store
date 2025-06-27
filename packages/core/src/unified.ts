import { encodeState, decodeState } from './core.js'
import { saveOffline, loadOffline, clearOffline, listOfflineKeys } from './offline.js'
import { SlugStoreOptions, SlugStoreResult, SlugStoreError } from './types.js'

/**
 * Universal state persistence function
 * 
 * @param key - Unique identifier for the state
 * @param state - State to persist
 * @param options - Configuration options
 * @returns Promise<SlugStoreResult> - Result with slug, state, and metadata
 */
export async function slugStore<T = any>(
  key: string,
  state: T,
  options: SlugStoreOptions = {}
): Promise<SlugStoreResult<T>> {
  const {
    url = true,
    compress = false,
    offline = false,
    db,
    encrypt = false,
    password
  } = options

  const result: SlugStoreResult<T> = { state }

  try {
    // 1. URL persistence (default behavior)
    if (url) {
      const slug = await encodeState(state, {
        compress,
        encrypt,
        password
      })
      result.slug = slug
      
      // Generate shareable URL if window is available
      if (typeof window !== 'undefined') {
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('state', slug)
        result.shareableUrl = currentUrl.toString()
      }
    }

    // 2. Offline storage
    if (offline) {
      await saveOffline(key, state, typeof offline === 'object' ? offline : {})
      result.offline = true
    }

    // 3. Database sync
    if (db) {
      const dbKey = `${key}-${Date.now()}`
      const payload = {
        key: dbKey,
        state,
        timestamp: Date.now(),
        ...(compress && { compressed: true }),
        ...(encrypt && { encrypted: true })
      }

      try {
        const response = await fetch(db.endpoint, {
          method: db.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...db.headers
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          console.warn(`Database sync failed: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.warn(`Database sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      result.dbKey = dbKey
    }

    return result
  } catch (error) {
    throw new SlugStoreError(
      `Failed to persist state: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'STORAGE_ERROR',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Load state with automatic fallback: URL → Offline → Default
 * 
 * @param key - Unique identifier for the state
 * @param defaultState - Default state if no persisted state found
 * @param options - Configuration options
 * @returns Promise<T> - Loaded state
 */
export async function loadSlugStore<T = any>(
  key: string,
  defaultState: T,
  options: SlugStoreOptions = {}
): Promise<T> {
  const { url = true, offline = false } = options

  try {
    // 1. Try URL first (if enabled)
    if (url && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const slug = urlParams.get('state')
      
      if (slug) {
        try {
          const decoded = await decodeState(slug, {
            password: options.password
          })
          return decoded
        } catch (error) {
          console.warn('Failed to decode URL state, trying offline storage')
        }
      }
    }

    // 2. Try offline storage (if enabled)
    if (offline) {
      try {
        const offlineState = await loadOffline<T>(key, typeof offline === 'object' ? offline : {})
        if (offlineState !== null) {
          return offlineState
        }
      } catch (error) {
        console.warn('Failed to load offline state, using default')
      }
    }

    // 3. Return default state
    return defaultState
  } catch (error) {
    console.warn(`Failed to load state for key "${key}":`, error)
    return defaultState
  }
}

// Convenience functions for specific use cases

/**
 * Create URL-only state (for sharing)
 */
export async function urlState<T = any>(
  key: string,
  state: T,
  options: Omit<SlugStoreOptions, 'url' | 'offline'> = {}
): Promise<string> {
  const result = await slugStore(key, state, { ...options, url: true, offline: false })
  return result.slug!
}

/**
 * Save state offline only
 */
export async function offlineState<T = any>(
  key: string,
  state: T,
  options: Omit<SlugStoreOptions, 'url'> = {}
): Promise<void> {
  await slugStore(key, state, { ...options, url: false, offline: true })
}

/**
 * Sync state to database
 */
export async function dbState<T = any>(
  key: string,
  state: T,
  endpoint: string,
  options: Omit<SlugStoreOptions, 'db'> = {}
): Promise<string> {
  const result = await slugStore(key, state, { 
    ...options, 
    url: false,
    db: { endpoint }
  })
  return result.dbKey!
}

// Re-export offline functions for direct use
export { saveOffline, loadOffline, clearOffline, listOfflineKeys } 