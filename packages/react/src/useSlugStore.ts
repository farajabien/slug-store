import { useState, useEffect, useRef, useCallback } from 'react'
import { encodeState, decodeState, validateSlug } from '@farajabien/slug-store-core'
import type { UseSlugStoreOptions, UseSlugStoreReturn, OfflineSyncOptions, SyncStatus } from './types.js'
import { createOfflineSync, type OfflineSyncEngine } from './offline-sync.js'

/**
 * React hook for URL state persistence with optional offline-sync
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { state, setState } = useSlugStore({ items: [] })
 * 
 * // With offline sync
 * const { state, setState, syncStatus } = useSlugStore(
 *   { todos: [], filters: {} },
 *   { offlineSync: true }
 * )
 * 
 * // Advanced offline sync
 * const { state, setState, sync } = useSlugStore(
 *   initialData,
 *   { 
 *     offlineSync: {
 *       conflictResolution: 'merge',
 *       syncInterval: 30,
 *       onSync: (data, direction) => console.log('Synced', direction, data)
 *     }
 *   }
 * )
 * ```
 */
export function useSlugStore<T>(
  initialState: T,
  options: UseSlugStoreOptions = {}
): UseSlugStoreReturn<T> {
  const {
    key = 'state',
    syncToUrl = true,
    debounceMs = 100,
    compress = false,
    encrypt = false,
    password,
    fallback = true,
    offlineSync = false
  } = options

  const [state, setState] = useState<T>(initialState)
  const [hasUrlState, setHasUrlState] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | undefined>()
  
  const debounceTimeoutRef = useRef<number>()
  const offlineSyncEngineRef = useRef<OfflineSyncEngine<T> | null>(null)
  const isInitialLoadRef = useRef(false)

  // Initialize offline sync if enabled
  useEffect(() => {
    if (!offlineSync) return

    const syncOptions: OfflineSyncOptions<T> = typeof offlineSync === 'boolean' 
      ? {} 
      : offlineSync

    // Create unique store ID
    const storeId = `${key}-${window.location.pathname}`
    
    // Initialize offline sync engine
    const engine = createOfflineSync(storeId, {
      conflictResolution: 'merge',
      syncInterval: 30,
      retryAttempts: 3,
      encryptionKey: password,
      ...syncOptions
    })

    offlineSyncEngineRef.current = engine

    // Listen to sync status changes
    const unsubscribe = engine.addListener((status) => {
      setSyncStatus(status)
    })

    // Load state from offline storage first
    engine.loadState().then((offlineState) => {
      if (offlineState) {
        setState(offlineState)
        setHasUrlState(true)
      }
    })

    return () => {
      unsubscribe()
      engine.destroy()
      offlineSyncEngineRef.current = null
    }
  }, [offlineSync, key, password])

  // Load from URL on mount
  useEffect(() => {
    const loadFromUrl = async () => {
      if (typeof window === 'undefined') return

      const params = new URLSearchParams(window.location.search)
      const urlSlug = params.get(key)

      if (urlSlug && validateSlug(urlSlug)) {
        try {
          const decodedState = await decodeState(urlSlug, { password })
          setState(decodedState)
          setHasUrlState(true)
          
          // Save to offline storage if enabled
          if (offlineSyncEngineRef.current) {
            await offlineSyncEngineRef.current.saveState(decodedState)
          }
        } catch (error) {
          if (fallback) {
            console.warn('Failed to decode URL state:', error)
          } else {
            throw error
          }
        }
      }
      
      isInitialLoadRef.current = true
    }

    loadFromUrl()
  }, [key, password, fallback])

  // Update state handler
  const updateState = useCallback((newState: T | ((prev: T) => T)) => {
    const nextState = typeof newState === 'function' 
      ? (newState as (prev: T) => T)(state)
      : newState

    setState(nextState)

    // Save to offline storage immediately if enabled
    if (offlineSyncEngineRef.current) {
      offlineSyncEngineRef.current.saveState(nextState)
    }

    // Update URL with debounce
    if (syncToUrl && isInitialLoadRef.current && typeof window !== 'undefined') {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = window.setTimeout(async () => {
        try {
          const slug = await encodeState(nextState, { compress, encrypt, password })
          const url = new URL(window.location.href)
          url.searchParams.set(key, slug)
          window.history.replaceState({}, '', url.toString())
          setHasUrlState(true)
        } catch (error) {
          console.warn('Failed to encode state for URL:', error)
        }
      }, debounceMs)
    }
  }, [state, syncToUrl, key, compress, encrypt, password, debounceMs])

  // Reset state handler
  const resetState = useCallback(() => {
    setState(initialState)
    setHasUrlState(false)
    
    // Clear from offline storage if enabled
    if (offlineSyncEngineRef.current) {
      offlineSyncEngineRef.current.saveState(initialState)
    }

    // Clear URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete(key)
      window.history.replaceState({}, '', url.toString())
    }
  }, [initialState, key])

  // Get shareable URL
  const getShareableUrl = useCallback(async (): Promise<string> => {
    const slug = await encodeState(state, { compress, encrypt, password })
    const url = new URL(window.location.href)
    url.searchParams.set(key, slug)
    return url.toString()
  }, [state, key, compress, encrypt, password])

  // Manual sync functions (only available if offline sync is enabled)
  const sync = offlineSyncEngineRef.current ? 
    () => offlineSyncEngineRef.current!.sync() : 
    undefined

  const pullFromServer = offlineSyncEngineRef.current ?
    async () => {
      // Force pull from server and update local state
      await offlineSyncEngineRef.current!.sync()
      const newState = await offlineSyncEngineRef.current!.loadState()
      if (newState) {
        setState(newState)
      }
    } :
    undefined

  const pushToServer = offlineSyncEngineRef.current ?
    async () => {
      // Force push current state to server
      await offlineSyncEngineRef.current!.saveState(state)
    } :
    undefined

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    state,
    setState: updateState,
    resetState,
    getShareableUrl,
    hasUrlState,
    ...(offlineSync && {
      syncStatus,
      sync,
      pullFromServer,
      pushToServer
    })
  }
} 