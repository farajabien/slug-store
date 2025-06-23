import { useState, useEffect } from 'react'
import { encodeState, decodeState, validateSlug } from '@farajabien/slug-store-core'
import type { SlugStoreCreator, SlugStore, SlugStoreOptions } from './types.js'

let storeCounter = 0

/**
 * Create a Zustand-like store with URL persistence
 * 
 * @example
 * ```tsx
 * const useWishlistStore = create<WishlistState>((set, get) => ({
 *   items: [],
 *   addItem: (item) => set(state => ({ items: [...state.items, item] })),
 *   removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) }))
 * }), { compress: true })
 * 
 * // Use in component
 * const { items, addItem } = useWishlistStore()
 * ```
 */
export function create<T>(
  createState: SlugStoreCreator<T>,
  options: SlugStoreOptions = {}
): SlugStore<T> {
  const {
    key = `store-${++storeCounter}`,
    syncToUrl = true,
    debounceMs = 100,
    compress = false,
    encrypt = false,
    password,
    decodeOptions = {}
  } = options

  let state: T
  let listeners: Array<() => void> = []
  let hasUrlState = false
  let debounceTimeout: number | undefined
  let initialLoad = false

  // Initialize state
  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const partialState = typeof partial === 'function' 
      ? (partial as (state: T) => Partial<T>)(state)
      : partial
    
    const nextState = { ...state, ...partialState }
    
    if (Object.is(nextState, state)) return
    
    state = nextState
    listeners.forEach(listener => listener())
    
    // Update URL
    if (syncToUrl && initialLoad && typeof window !== 'undefined') {
      if (debounceTimeout) clearTimeout(debounceTimeout)
      
      debounceTimeout = window.setTimeout(async () => {
        try {
          const slug = await encodeState(state, { compress, encrypt, password })
          const url = new URL(window.location.href)
          url.searchParams.set(key, slug)
          window.history.replaceState({}, '', url.toString())
          hasUrlState = true
        } catch (error) {
          console.warn('Failed to encode state for URL:', error)
        }
      }, debounceMs)
    }
  }

  const getState = () => state

  // Initialize state from creator first
  state = createState(setState, getState)
  
  // Load from URL if available (async)
  const loadFromUrl = async () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlSlug = params.get(key)
      
      if (urlSlug && validateSlug(urlSlug)) {
        try {
          const decodedState = await decodeState(urlSlug, decodeOptions)
          setState(decodedState)
          hasUrlState = true
        } catch (error) {
          console.warn('Failed to decode state from URL:', error)
        }
      }
    }
    initialLoad = true
  }

  // Load from URL after initialization
  loadFromUrl()

  const reset = () => {
    state = createState(setState, getState)
    hasUrlState = false
    listeners.forEach(listener => listener())
    
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete(key)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const getSlug = async (): Promise<string> => {
    return encodeState(state, { compress, encrypt, password })
  }

  const loadFromSlug = async (slug: string): Promise<void> => {
    try {
      const decodedState = await decodeState(slug, decodeOptions)
      setState(decodedState)
      hasUrlState = true
    } catch (error) {
      throw new Error(`Failed to load state from slug: ${error}`)
    }
  }

  const clearUrl = () => {
    if (typeof window === 'undefined') return
    
    const url = new URL(window.location.href)
    url.searchParams.delete(key)
    window.history.replaceState({}, '', url.toString())
    hasUrlState = false
  }

  const useStore = () => {
    const [, forceUpdate] = useState({})
    
    useEffect(() => {
      const listener = () => forceUpdate({})
      listeners.push(listener)
      
      return () => {
        listeners = listeners.filter(l => l !== listener)
      }
    }, [])
    
    return state
  }

  // Add store methods to hook
  useStore.setState = setState
  useStore.getState = getState
  useStore.reset = reset
  useStore.getSlug = getSlug
  useStore.loadFromSlug = loadFromSlug
  useStore.clearUrl = clearUrl
  Object.defineProperty(useStore, 'hasUrlState', {
    get: () => hasUrlState
  })

  return useStore as SlugStore<T>
} 