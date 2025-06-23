import { useState, useEffect, useRef, useCallback } from 'react'
import { encodeState, decodeState } from '@farajabien/slug-store-core'
import type { UseSlugStoreOptions, UseSlugStoreReturn } from './types.js'

/**
 * A useState-like hook that automatically persists state to URL
 * 
 * @example
 * ```tsx
 * const { state, setState } = useSlugStore({ count: 0 }, { compress: true })
 * ```
 */
export function useSlugStore<T extends Record<string, any>>(
  initialState: T,
  options: UseSlugStoreOptions = {}
): UseSlugStoreReturn<T> {
  const {
    key = 'state',
    compress = false,
    encrypt = false,
    password,
    debounceMs = 100,
    syncToUrl = true,
    fallback = true
  } = options

  const [state, setStateInternal] = useState<T>(initialState)
  const [hasUrlState, setHasUrlState] = useState(false)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialLoadRef = useRef(false)

  // Load state from URL on component mount
  useEffect(() => {
    if (typeof window === 'undefined' || initialLoadRef.current) return
    
    const urlParams = new URLSearchParams(window.location.search)
    const urlSlug = urlParams.get(key)
    
    if (urlSlug) {
      decodeState(urlSlug, { password })
        .then((decodedState) => {
          if (decodedState && typeof decodedState === 'object') {
            setStateInternal(decodedState as T)
            setHasUrlState(true)
          }
        })
        .catch((error) => {
          console.warn('Failed to decode URL state:', error)
          if (!fallback) {
            throw error
          }
        })
    }
    
    initialLoadRef.current = true
  }, [key, password, fallback])

  // Sync state to URL when state changes
  useEffect(() => {
    if (!syncToUrl || typeof window === 'undefined' || !initialLoadRef.current) return

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const slug = await encodeState(state, { compress, encrypt, password })
        const url = new URL(window.location.href)
        url.searchParams.set(key, slug)
        
        window.history.replaceState(
          window.history.state,
          '',
          url.toString()
        )
      } catch (error) {
        console.warn('Failed to encode state to URL:', error)
        if (!fallback) {
          throw error
        }
      }
    }, debounceMs)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [state, key, compress, encrypt, password, debounceMs, syncToUrl, fallback])

  const setState = useCallback((update: T | ((prevState: T) => T)) => {
    setStateInternal(prevState => {
      const newState = typeof update === 'function' ? update(prevState) : update
      return newState
    })
  }, [])

  const resetState = useCallback(() => {
    setStateInternal(initialState)
    if (typeof window !== 'undefined' && syncToUrl) {
      const url = new URL(window.location.href)
      url.searchParams.delete(key)
      window.history.replaceState(window.history.state, '', url.toString())
    }
  }, [initialState, syncToUrl, key])

  const getShareableUrl = useCallback(async (): Promise<string> => {
    if (typeof window === 'undefined') return ''
    
    try {
      const slug = await encodeState(state, { compress, encrypt, password })
      const url = new URL(window.location.href)
      url.searchParams.set(key, slug)
      return url.toString()
    } catch (error) {
      console.warn('Failed to create shareable URL:', error)
      if (!fallback) {
        throw error
      }
      return window.location.href
    }
  }, [state, key, compress, encrypt, password, fallback])

  return {
    state,
    setState,
    resetState,
    getShareableUrl,
    hasUrlState
  }
} 