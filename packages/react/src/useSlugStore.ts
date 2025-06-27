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

  // Persist state when it changes
  const setAndPersistState = useCallback(async (newState: T | ((prevState: T) => T)) => {
    const resolvedState = typeof newState === 'function' 
      ? (newState as (prevState: T) => T)(state) 
      : newState
      
    setState(resolvedState)
    
    try {
      await slugStore(key, resolvedState, optionsRef.current)
    } catch (e: any) {
      setError(e)
    }
  }, [key, state])

  return [state, setAndPersistState, { isLoading, error }] as const
}
