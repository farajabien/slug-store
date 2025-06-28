import { useState, useEffect, useCallback, useRef } from 'react'
import { slugStore, loadSlugStore, SlugStoreOptions } from '@farajabien/slug-store-core'

export interface UseSlugStoreOptions<T> extends SlugStoreOptions {
  /**
   * Default state to use while loading or if no state is found.
   */
  default?: T
}

export function useSlugStore<T>(
  key: string,
  initialState: T,
  options: UseSlugStoreOptions<T> = {}
) {
  const [state, setState] = useState<T>(initialState)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [slug, setSlug] = useState<string>('')
  
  const optionsRef = useRef(options)
  optionsRef.current = options

  // Load state on initial render
  useEffect(() => {
    let isMounted = true
    
    async function loadState() {
      setIsLoading(true)
      setError(null)
      try {
        const loadedState = await loadSlugStore<T>(key, initialState, optionsRef.current)
        if (isMounted) {
          setState(loadedState)
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    loadState()
    
    return () => {
      isMounted = false
    }
  }, [key])

  // Persist state when it changes - FIXED: removed state dependency
  const setAndPersistState = useCallback(async (newState: T | ((prevState: T) => T)) => {
    setState(prevState => {
      const resolvedState = typeof newState === 'function' 
        ? (newState as (prevState: T) => T)(prevState) 
        : newState
      
      // Persist the resolved state
      slugStore(key, resolvedState, optionsRef.current)
        .then(result => {
          // Update browser URL if URL persistence is enabled
          if (optionsRef.current.url !== false && result.slug && typeof window !== 'undefined') {
            const currentUrl = new URL(window.location.href)
            currentUrl.searchParams.set('state', result.slug)
            const newUrl = currentUrl.toString()
            
            // Update browser URL without triggering a page reload
            window.history.pushState({}, '', newUrl)
            setSlug(newUrl)
          } else if (typeof window !== 'undefined') {
            setSlug(window.location.href)
          }
        })
        .catch(e => {
          setError(e)
        })
      
      return resolvedState
    })
  }, [key]) // Only depend on key, not state

  // Initialize slug on mount and when URL changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSlug(window.location.href)
    }
  }, [])

  return [state, setAndPersistState, { isLoading, error, slug }] as const
}
