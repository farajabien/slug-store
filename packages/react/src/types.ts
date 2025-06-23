import { EncodeOptions, DecodeOptions } from '@farajabien/slug-store-core'

export interface SlugStoreOptions extends Omit<EncodeOptions, 'version'> {
  /** URL parameter key to use for the state (default: 'state') */
  key?: string
  /** Whether to sync state to URL immediately on changes (default: true) */
  syncToUrl?: boolean
  /** Debounce URL updates in milliseconds (default: 0) */
  debounceMs?: number
  /** Decode options for reading state from URL */
  decodeOptions?: DecodeOptions
}

export interface UseSlugStoreOptions extends Omit<EncodeOptions, 'version'> {
  /** URL parameter key to use for the state (default: 'state') */
  key?: string
  /** Whether to sync state to URL immediately on changes (default: true) */
  syncToUrl?: boolean
  /** Debounce URL updates in milliseconds (default: 100) */
  debounceMs?: number
  /** Enable graceful error handling with fallbacks (default: true) */
  fallback?: boolean
}

export interface UseSlugStoreReturn<T> {
  /** Current state value */
  state: T
  /** Set state (like useState) */
  setState: (value: T | ((prev: T) => T)) => void
  /** Reset state to initial value */
  resetState: () => void
  /** Get shareable URL for current state */
  getShareableUrl: () => Promise<string>
  /** Check if current URL has valid state */
  hasUrlState: boolean
}

export type SlugStoreCreator<T> = (set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void, get: () => T) => T

export interface SlugStore<T> {
  (): T
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
  getState: () => T
  reset: () => void
  getSlug: () => Promise<string>
  loadFromSlug: (slug: string) => Promise<void>
  clearUrl: () => void
  hasUrlState: boolean
} 