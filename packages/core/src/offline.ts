import { OfflineOptions, OfflineStorage, SlugStoreError } from './types.js'
import { encodeState, decodeState } from './core.js'

// Storage implementations
class IndexedDBStorage implements OfflineStorage {
  private dbName = 'slug-store-offline'
  private storeName = 'data'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      throw new SlugStoreError('IndexedDB not available', 'OFFLINE_ERROR')
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(new SlugStoreError('Failed to open IndexedDB', 'OFFLINE_ERROR'))
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' })
          store.createIndex('timestamp', 'timestamp')
          store.createIndex('ttl', 'ttl')
        }
      }
    })
  }

  async get(key: string): Promise<any> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)
      
      request.onsuccess = () => {
        const result = request.result
        if (!result) {
          resolve(null)
          return
        }
        
        // Check TTL
        if (result.ttl && Date.now() > result.ttl) {
          this.delete(key) // Clean up expired data
          resolve(null)
          return
        }
        
        resolve(result.value)
      }
      
      request.onerror = () => reject(new SlugStoreError('Failed to get from IndexedDB', 'OFFLINE_ERROR'))
    })
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      const data = {
        key,
        value,
        timestamp: Date.now(),
        ttl: ttl ? Date.now() + (ttl * 1000) : null
      }
      
      const request = store.put(data)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new SlugStoreError('Failed to set in IndexedDB', 'OFFLINE_ERROR'))
    })
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new SlugStoreError('Failed to delete from IndexedDB', 'OFFLINE_ERROR'))
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(new SlugStoreError('Failed to clear IndexedDB', 'OFFLINE_ERROR'))
    })
  }

  async keys(): Promise<string[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAllKeys()
      
      request.onsuccess = () => resolve(request.result as string[])
      request.onerror = () => reject(new SlugStoreError('Failed to get keys from IndexedDB', 'OFFLINE_ERROR'))
    })
  }
}

class LocalStorageStorage implements OfflineStorage {
  private prefix = 'slug-store:'

  async get(key: string): Promise<any> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new SlugStoreError('localStorage not available', 'OFFLINE_ERROR')
    }

    try {
      const data = localStorage.getItem(this.prefix + key)
      if (!data) return null
      
      const parsed = JSON.parse(data)
      
      // Check TTL
      if (parsed.ttl && Date.now() > parsed.ttl) {
        this.delete(key)
        return null
      }
      
      return parsed.value
    } catch (error) {
      throw new SlugStoreError('Failed to get from localStorage', 'OFFLINE_ERROR', error as Error)
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new SlugStoreError('localStorage not available', 'OFFLINE_ERROR')
    }

    try {
      const data = {
        value,
        timestamp: Date.now(),
        ttl: ttl ? Date.now() + (ttl * 1000) : null
      }
      
      localStorage.setItem(this.prefix + key, JSON.stringify(data))
    } catch (error) {
      throw new SlugStoreError('Failed to set in localStorage', 'OFFLINE_ERROR', error as Error)
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new SlugStoreError('localStorage not available', 'OFFLINE_ERROR')
    }

    localStorage.removeItem(this.prefix + key)
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new SlugStoreError('localStorage not available', 'OFFLINE_ERROR')
    }

    const keys = await this.keys()
    keys.forEach(key => localStorage.removeItem(this.prefix + key))
  }

  async keys(): Promise<string[]> {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new SlugStoreError('localStorage not available', 'OFFLINE_ERROR')
    }

    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length))
      }
    }
    return keys
  }
}

class MemoryStorage implements OfflineStorage {
  private data = new Map<string, { value: any, timestamp: number, ttl: number | null }>()

  async get(key: string): Promise<any> {
    const item = this.data.get(key)
    if (!item) return null
    
    // Check TTL
    if (item.ttl && Date.now() > item.ttl) {
      this.data.delete(key)
      return null
    }
    
    return item.value
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.data.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl ? Date.now() + (ttl * 1000) : null
    })
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key)
  }

  async clear(): Promise<void> {
    this.data.clear()
  }

  async keys(): Promise<string[]> {
    return Array.from(this.data.keys())
  }
}

// Storage factory
function createStorage(type: OfflineOptions['storage'] = 'indexeddb'): OfflineStorage {
  switch (type) {
    case 'indexeddb':
      return new IndexedDBStorage()
    case 'localstorage':
      return new LocalStorageStorage()
    case 'memory':
      return new MemoryStorage()
    default:
      throw new SlugStoreError(`Unsupported storage type: ${type}`, 'OFFLINE_ERROR')
  }
}

// Global storage instance with fallback chain
let globalStorage: OfflineStorage | null = null
let storageTypeUsed: OfflineOptions['storage'] | null = null

async function getStorage(options: OfflineOptions = {}): Promise<OfflineStorage> {
  const preferredType = options.storage || 'indexeddb'

  if (globalStorage && storageTypeUsed === preferredType) {
    return globalStorage
  }

  const fallbackChain: (OfflineOptions['storage'])[] = ['indexeddb', 'localstorage', 'memory']
  
  // Create a unique, ordered list of storage types to try
  const tryOrder = [...new Set([preferredType, ...fallbackChain])]

  for (const storageType of tryOrder) {
    try {
      const storage = createStorage(storageType)
      // Test if it works by performing a real-but-harmless operation
      await storage.set('__slug-store-test__', '1')
      await storage.get('__slug-store-test__')
      await storage.delete('__slug-store-test__')
      
      // If we got here, it works. Cache it.
      globalStorage = storage
      storageTypeUsed = storageType
      return storage
    } catch (error) {
      // Log the error for debugging but continue to the next fallback
      console.warn(`Slug Store: storage type '${storageType}' failed, trying next.`, error)
    }
  }
  
  throw new SlugStoreError('No available storage backend', 'OFFLINE_ERROR')
}

// Public API functions
export async function saveOffline<T>(key: string, state: T, options: OfflineOptions = {}): Promise<void> {
  const storage = await getStorage(options)
  
  let data = state
  
  // Apply encryption if requested
  if (options.encryption && options.password) {
    const encoded = await encodeState(state, {
      encrypt: true,
      password: options.password,
      compress: true
    })
    data = encoded as any
  } else if (options.encryption && !options.password) {
    throw new SlugStoreError('Password is required for encryption', 'INVALID_PASSWORD')
  }
  
  await storage.set(key, data, options.ttl)
}

export async function loadOffline<T>(key: string, options: OfflineOptions = {}): Promise<T | null> {
  const storage = await getStorage(options)
  const data = await storage.get(key)
  
  if (data === null) return null
  if (data === undefined) return undefined as any // Explicitly handle undefined
  
  // Decrypt if needed
  if (options.encryption && options.password && typeof data === 'string') {
    try {
      return await decodeState(data, { password: options.password })
    } catch (error) {
      throw new SlugStoreError('Failed to decrypt offline data', 'OFFLINE_ERROR', error as Error)
    }
  } else if (options.encryption && !options.password && typeof data === 'string') {
    throw new SlugStoreError('Password is required for decryption', 'INVALID_PASSWORD')
  }
  
  return data
}

export async function clearOffline(key?: string, options: OfflineOptions = {}): Promise<void> {
  const storage = await getStorage(options)
  
  if (key) {
    await storage.delete(key)
  } else {
    await storage.clear()
  }
}

export async function listOfflineKeys(options: OfflineOptions = {}): Promise<string[]> {
  const storage = await getStorage(options)
  return await storage.keys()
}

/**
 * FOR TESTING PURPOSES ONLY
 * Resets the cached global storage instance.
 * @private
 */
export function _resetStorage() {
  globalStorage = null
  storageTypeUsed = null
} 