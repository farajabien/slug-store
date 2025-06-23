import { SlugStoreError } from './types.js'

/**
 * Storage adapter interface
 */
export interface StorageAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

/**
 * Browser localStorage adapter
 */
export class LocalStorageAdapter implements StorageAdapter {
  constructor(private prefix = 'slug-store:') {}

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get(key: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(this.getKey(key))
    } catch (error) {
      throw new SlugStoreError(
        `Failed to read from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(this.getKey(key), value)
    } catch (error) {
      throw new SlugStoreError(
        `Failed to write to localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(this.getKey(key))
    } catch (error) {
      throw new SlugStoreError(
        `Failed to remove from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.prefix)) {
          keys.push(key)
        }
      }
      
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      throw new SlugStoreError(
        `Failed to clear localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }

  async keys(): Promise<string[]> {
    try {
      if (typeof window === 'undefined') return []
      
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(this.prefix)) {
          keys.push(key.slice(this.prefix.length))
        }
      }
      
      return keys
    } catch (error) {
      throw new SlugStoreError(
        `Failed to list localStorage keys: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }
}

/**
 * Browser sessionStorage adapter
 */
export class SessionStorageAdapter implements StorageAdapter {
  constructor(private prefix = 'slug-store:') {}

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get(key: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null
      return sessionStorage.getItem(this.getKey(key))
    } catch (error) {
      throw new SlugStoreError(
        `Failed to read from sessionStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      sessionStorage.setItem(this.getKey(key), value)
    } catch (error) {
      throw new SlugStoreError(
        `Failed to write to sessionStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      sessionStorage.removeItem(this.getKey(key))
    } catch (error) {
      throw new SlugStoreError(
        `Failed to remove from sessionStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      
      const keys = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith(this.prefix)) {
          keys.push(key)
        }
      }
      
      keys.forEach(key => sessionStorage.removeItem(key))
    } catch (error) {
      throw new SlugStoreError(
        `Failed to clear sessionStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }

  async keys(): Promise<string[]> {
    try {
      if (typeof window === 'undefined') return []
      
      const keys = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith(this.prefix)) {
          keys.push(key.slice(this.prefix.length))
        }
      }
      
      return keys
    } catch (error) {
      throw new SlugStoreError(
        `Failed to list sessionStorage keys: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }
}

/**
 * In-memory adapter (useful for testing or SSR)
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>()

  constructor(private prefix = 'slug-store:') {}

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get(key: string): Promise<string | null> {
    return this.storage.get(this.getKey(key)) || null
  }

  async set(key: string, value: string): Promise<void> {
    this.storage.set(this.getKey(key), value)
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(this.getKey(key))
  }

  async clear(): Promise<void> {
    const keysToDelete = Array.from(this.storage.keys()).filter(key => 
      key.startsWith(this.prefix)
    )
    keysToDelete.forEach(key => this.storage.delete(key))
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys())
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.slice(this.prefix.length))
  }
}

/**
 * Adapter factory
 */
export const adapters = {
  localStorage: (prefix?: string) => new LocalStorageAdapter(prefix),
  sessionStorage: (prefix?: string) => new SessionStorageAdapter(prefix),
  memory: (prefix?: string) => new MemoryStorageAdapter(prefix)
}

/**
 * Storage manager with adapter support
 */
export class StorageManager {
  constructor(private adapter: StorageAdapter) {}

  /**
   * Store state with key
   */
  async store(key: string, state: any): Promise<void> {
    const serialized = JSON.stringify(state)
    await this.adapter.set(key, serialized)
  }

  /**
   * Retrieve state by key
   */
  async retrieve(key: string): Promise<any | null> {
    const serialized = await this.adapter.get(key)
    if (!serialized) return null
    
    try {
      return JSON.parse(serialized)
    } catch (error) {
      throw new SlugStoreError(
        `Failed to parse stored state: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STORAGE_ERROR'
      )
    }
  }

  /**
   * Remove stored state
   */
  async remove(key: string): Promise<void> {
    await this.adapter.remove(key)
  }

  /**
   * List all stored keys
   */
  async list(): Promise<string[]> {
    return this.adapter.keys()
  }

  /**
   * Clear all stored states
   */
  async clear(): Promise<void> {
    await this.adapter.clear()
  }
} 