// Server-side state persistence with multiple backends
import { encodeState, decodeState } from '@farajabien/slug-store-core'

// ===== Types =====
export interface SlugStoreServerOptions {
  /** Persistence backend */
  persist?: 'memory' | 'url' | 'database' | 'redis' | 'file'
  /** Cache TTL in seconds */
  ttl?: number
  /** Compression */
  compress?: boolean
  /** Encryption */
  encrypt?: boolean
  /** Encryption password */
  password?: string
  /** Database connection (for database persist) */
  database?: any
  /** Custom key generator */
  keyGenerator?: (params: any, searchParams: any) => string
}

export interface SlugStoreServerReturn<T> {
  /** The data */
  data: T
  /** Whether data is cached */
  cached: boolean
  /** Cache the current state */
  cache: () => Promise<void>
  /** Clear cache */
  clearCache: () => Promise<void>
  /** Get encoded slug */
  getSlug: () => Promise<string>
}

// ===== SYNC ENDPOINT TYPES =====
export interface SyncRequest {
  slug: string
  timestamp: number
  version: number
  clientId: string
}

export interface SyncResponse {
  slug?: string
  timestamp: number
  version: number
  conflict?: boolean
  serverWins?: boolean
}

// ===== MAIN FUNCTIONS =====


// ===== USE CASE 1: URL SHARING =====
/**
 * Store state in URL for external sharing
 * Perfect for: dashboards, filters, configurations that need to be shared
 */
export interface ShareableOptions {
  compress?: boolean
  encrypt?: boolean
  password?: string
}

/**
 * Create a shareable URL with state
 * Zero obstruction - just pass your state, get a URL
 */
export async function createShareableUrl<T>(
  state: T,
  baseUrl?: string,
  options: ShareableOptions = {}
): Promise<string> {
  const { compress = true, encrypt = false, password } = options
  
  const slug = await encodeState(state, { compress, encrypt, password })
  
  const url = new URL(baseUrl || (typeof window !== 'undefined' ? window.location.href : 'http://localhost'))
  url.searchParams.set('state', slug)
  
  return url.toString()
}

/**
 * Load state from shareable URL
 * Zero obstruction - just pass the URL, get your state back
 */
export async function loadFromShareableUrl<T>(
  url: string,
  options: { password?: string } = {}
): Promise<T> {
  const urlObj = new URL(url)
  const slug = urlObj.searchParams.get('state')
  
  if (!slug) {
    throw new Error('No state found in URL')
  }
  
  return await decodeState(slug, options)
}

// ===== USE CASE 2: DATABASE STORAGE =====
/**
 * Store state in user's database record
 * Perfect for: user preferences, app state, private data that doesn't need sharing
 * Works with: Supabase, Firebase, PostgreSQL, MySQL, MongoDB, any database
 */

export interface UserStateOptions {
  compress?: boolean
  encrypt?: boolean
  password?: string
  userId?: string
}

/**
 * Create state for database storage
 * Zero obstruction - pass state, get encoded string for your database
 */
export async function createUserState<T>(
  state: T,
  options: UserStateOptions = {}
): Promise<string> {
  const { compress = true, encrypt = true, password } = options
  
  return await encodeState(state, { compress, encrypt, password })
}

/**
 * Load state from database
 * Zero obstruction - pass the stored string, get your state back
 */
export async function loadUserState<T>(
  storedState: string,
  options: { password?: string } = {}
): Promise<T> {
  return await decodeState(storedState, options)
}

// ===== DATABASE INTEGRATION HELPERS =====
/**
 * Perfect database integration - works with any database
 * 
 * @example
 * ```typescript
 * // SUPABASE
 * const { slug } = await saveUserState({ theme: 'dark', preferences: {...} })
 * await supabase.from('profiles').insert({ user_id: user.id, app_state: slug })
 * 
 * // FIREBASE
 * const { slug } = await saveUserState(userData)
 * await db.collection('users').doc(userId).set({ appState: slug })
 * 
 * // PRISMA + POSTGRESQL
 * const { slug } = await saveUserState(userPrefs)
 * await prisma.user.update({ where: { id: userId }, data: { appState: slug } })
 * 
 * // MONGOOSE + MONGODB
 * const { slug } = await saveUserState(settings)
 * await User.findByIdAndUpdate(userId, { appState: slug })
 * 
 * // MYSQL / ANY SQL
 * const { slug } = await saveUserState(config)
 * await db.query('UPDATE users SET app_state = ? WHERE id = ?', [slug, userId])
 * ```
 */

export interface DatabaseStateResult<T> {
  data: T
  slug: string
}

export async function saveUserState<T>(
  state: T,
  options: UserStateOptions = {}
): Promise<DatabaseStateResult<T>> {
  const slug = await createUserState(state, options)
  return { data: state, slug }
}

// ===== OFFLINE SYNC SERVER HELPERS =====
/**
 * Create sync endpoint handler for any backend
 * Zero configuration - works with any database, any framework
 * 
 * @example
 * ```typescript
 * // Next.js API route: /api/sync/[storeId]/route.ts
 * export async function GET(request: Request, { params }: { params: { storeId: string } }) {
 *   return handleSyncRequest(params.storeId, request, {
 *     loadState: async (storeId) => {
 *       const result = await db.query('SELECT app_state FROM stores WHERE id = ?', [storeId])
 *       return result.rows[0]?.app_state
 *     }
 *   })
 * }
 * 
 * export async function POST(request: Request, { params }: { params: { storeId: string } }) {
 *   return handleSyncRequest(params.storeId, request, {
 *     saveState: async (storeId, slug, metadata) => {
 *       await db.query(
 *         'INSERT INTO stores (id, app_state, updated_at) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET app_state = ?, updated_at = ?',
 *         [storeId, slug, metadata.timestamp, slug, metadata.timestamp]
 *       )
 *     }
 *   })
 * }
 * ```
 */
export interface SyncHandlerOptions {
  /** Load state from your database */
  loadState?: (storeId: string) => Promise<string | null>
  /** Save state to your database */
  saveState?: (storeId: string, slug: string, metadata: { timestamp: number, version: number, clientId: string }) => Promise<void>
  /** Custom conflict resolution */
  resolveConflict?: (client: any, server: any) => any
  /** Encryption password */
  password?: string
}

/**
 * Universal sync endpoint handler - works with any framework, any database
 */
export async function handleSyncRequest(
  storeId: string,
  request: Request,
  options: SyncHandlerOptions = {}
): Promise<Response> {
  const { loadState, saveState, resolveConflict, password } = options

  try {
    if (request.method === 'GET') {
      // Client requesting latest state from server
      if (!loadState) {
        return new Response('Load function not provided', { status: 500 })
      }

      const serverSlug = await loadState(storeId)
      
      if (!serverSlug) {
        return new Response('', { status: 204 }) // No content
      }

      return new Response(serverSlug, {
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    if (request.method === 'POST') {
      // Client pushing state to server
      if (!saveState) {
        return new Response('Save function not provided', { status: 500 })
      }

      const syncRequest: SyncRequest = await request.json()
      const { slug, timestamp, version, clientId } = syncRequest

      // Load existing state for conflict detection
      let conflict = false
      if (loadState) {
        const existingSlug = await loadState(storeId)
        
        if (existingSlug && existingSlug !== slug) {
          conflict = true
          
          if (resolveConflict) {
            // Custom conflict resolution
            const clientData = await decodeState(slug, { password })
            const serverData = await decodeState(existingSlug, { password })
            const resolved = resolveConflict(clientData, serverData)
            
            // Re-encode resolved state
            const resolvedSlug = await encodeState(resolved, { 
              compress: true, 
              encrypt: !!password, 
              password 
            })
            
            await saveState(storeId, resolvedSlug, { timestamp: Date.now(), version: version + 1, clientId })
            
            return Response.json({
              slug: resolvedSlug,
              timestamp: Date.now(),
              version: version + 1,
              conflict: true
            } as SyncResponse)
          }
        }
      }

      // Save state
      await saveState(storeId, slug, { timestamp, version, clientId })

      return Response.json({
        timestamp,
        version,
        conflict: false
      } as SyncResponse)
    }

    return new Response('Method not allowed', { status: 405 })
  } catch (error) {
    console.error('Sync error:', error)
    return new Response('Sync failed', { status: 500 })
  }
}

/**
 * Create sync endpoints for popular frameworks
 */
export const syncEndpoints = {
  /**
   * Next.js App Router sync endpoints
   */
  nextjs: {
    /**
     * GET handler for /api/sync/[storeId]/route.ts
     */
    GET: (params: { storeId: string }, options: SyncHandlerOptions) => 
      (request: Request) => handleSyncRequest(params.storeId, request, options),

    /**
     * POST handler for /api/sync/[storeId]/route.ts
     */
    POST: (params: { storeId: string }, options: SyncHandlerOptions) => 
      (request: Request) => handleSyncRequest(params.storeId, request, options)
  },

  /**
   * Remix action/loader helpers
   */
  remix: {
    /**
     * Loader for sync routes
     */
    loader: (params: { storeId: string }, options: SyncHandlerOptions) =>
      async ({ request }: { request: Request }) => {
        const response = await handleSyncRequest(params.storeId, request, options)
        return response
      },

    /**
     * Action for sync routes
     */
    action: (params: { storeId: string }, options: SyncHandlerOptions) =>
      async ({ request }: { request: Request }) => {
        const response = await handleSyncRequest(params.storeId, request, options)
        return response
      }
  }
}

// ===== OFFLINE SYNC SERVER HELPERS =====
/**
 * Create sync endpoint handler for any backend
 * Zero configuration - works with any database, any framework
 * 
 * @example
 * ```typescript
 * // Next.js API route: /api/sync/[storeId]/route.ts
 * export async function GET(request: Request, { params }: { params: { storeId: string } }) {
 *   return handleSyncRequest(params.storeId, request, {
 *     loadState: async (storeId) => {
 *       const result = await db.query('SELECT app_state FROM stores WHERE id = ?', [storeId])
 *       return result.rows[0]?.app_state
 *     }
 *   })
 * }
 * 
 * export async function POST(request: Request, { params }: { params: { storeId: string } }) {
 *   return handleSyncRequest(params.storeId, request, {
 *     saveState: async (storeId, slug, metadata) => {
 *       await db.query(
 *         'INSERT INTO stores (id, app_state, updated_at) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET app_state = ?, updated_at = ?',
 *         [storeId, slug, metadata.timestamp, slug, metadata.timestamp]
 *       )
 *     }
 *   })
 * }
 * ```
 */
// ===== UNIFIED INTERFACE =====
/**
 * Universal state persistence - automatically chooses best strategy
 * Zero obstruction - the library decides the optimal approach
 */
export interface UniversalOptions {
  /** 'share' for URLs, 'user' for database storage */
  purpose?: 'share' | 'user'
  /** Auto-encrypt user data, plain for sharing (unless specified) */
  encrypt?: boolean
  /** Always compress for better performance */
  compress?: boolean
  /** Password for encryption */
  password?: string
  /** Base URL for sharing */
  baseUrl?: string
}

/**
 * The ultimate zero-obstruction state persistence
 * Just tell us the purpose, we handle everything else
 */
export async function persistState<T>(
  state: T,
  purpose: 'share' | 'user' = 'user',
  options: Omit<UniversalOptions, 'purpose'> = {}
): Promise<string> {
  if (purpose === 'share') {
    // Optimized for sharing: compress but don't encrypt by default
    return await encodeState(state, {
      compress: options.compress ?? true,
      encrypt: options.encrypt ?? false,
      password: options.password
    })
  } else {
    // Optimized for user storage: compress and encrypt by default
    return await encodeState(state, {
      compress: options.compress ?? true,
      encrypt: options.encrypt ?? true,
      password: options.password
    })
  }
}

/**
 * Load state - automatically handles any format
 */
export async function restoreState<T>(
  stateOrUrl: string,
  options: { password?: string } = {}
): Promise<T> {
  // Check if it's a URL
  try {
    if (stateOrUrl.includes('http') || stateOrUrl.includes('state=')) {
      return await loadFromShareableUrl<T>(stateOrUrl, options)
    }
  } catch {
    // Not a URL, treat as encoded state
  }
  
  // Treat as direct encoded state
  return await decodeState(stateOrUrl, options)
}

// ===== LEGACY SUPPORT =====
// Keep the old interface for backwards compatibility
export interface SlugStoreServerOptions {
  /** Persistence backend */
  persist?: 'memory' | 'url' | 'database' | 'redis' | 'file'
  /** Cache TTL in seconds */
  ttl?: number
  /** Compression */
  compress?: boolean
  /** Encryption */
  encrypt?: boolean
  /** Encryption password */
  password?: string
  /** Database connection (for database persist) */
  database?: any
  /** Custom key generator */
  keyGenerator?: (params: any, searchParams: any) => string
}

export interface SlugStoreServerReturn<T> {
  /** The data */
  data: T
  /** Whether data is cached */
  cached: boolean
  /** Cache the current state */
  cache: () => Promise<void>
  /** Clear cache */
  clearCache: () => Promise<void>
  /** Get encoded slug */
  getSlug: () => Promise<string>
}

/**
 * @deprecated Use persistState/restoreState instead for simpler API
 */
export async function useSlugStore<T>(
  slug: string,
  key?: string,
  options: SlugStoreServerOptions = {}
): Promise<SlugStoreServerReturn<T>> {
  const { password } = options
  
  let data: T
  
  try {
    data = await decodeState(slug, { password })
  } catch (error) {
    throw new Error(`Failed to decode slug: ${error}`)
  }

  return {
    data,
    cached: false,
    cache: async () => {},
    clearCache: async () => {},
    getSlug: async () => slug
  }
}

/**
 * @deprecated Use saveUserState instead
 */
export async function fromDatabase<T>(
  appstate: string,
  slugkey?: string,
  options: Omit<SlugStoreServerOptions, 'persist'> = {}
): Promise<T> {
  return await loadUserState<T>(appstate, { password: options.password })
}

/**
 * @deprecated Use saveUserState instead
 */
export async function createSlugForDatabase<T>(
  initialState: T,
  options: SlugStoreServerOptions = {}
): Promise<{ data: T; slug: string; key?: string }> {
  const { slug } = await saveUserState(initialState, options)
  return { data: initialState, slug, key: options.password ? 'encrypted' : 'plain' }
} 