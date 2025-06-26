// Offline-sync engine for universal webapp support
import { encodeState, decodeState } from '@farajabien/slug-store-core'
import type { OfflineSyncOptions, SyncStatus, AppStateSnapshot } from './types.js'

// ===== STORAGE MANAGER =====
class OfflineStorage {
  private dbName = 'slug-store-offline'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return // SSR or no IndexedDB support
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = () => {
        const db = request.result
        
        // Store for app state snapshots
        if (!db.objectStoreNames.contains('snapshots')) {
          const snapshots = db.createObjectStore('snapshots', { keyPath: 'storeId' })
          snapshots.createIndex('timestamp', 'timestamp')
          snapshots.createIndex('userId', 'userId')
        }
        
        // Store for pending sync operations
        if (!db.objectStoreNames.contains('pending')) {
          const pending = db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true })
          pending.createIndex('storeId', 'storeId')
          pending.createIndex('timestamp', 'timestamp')
        }
        
        // Store for sync metadata
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }
      }
    })
  }

  async saveSnapshot<T>(storeId: string, snapshot: AppStateSnapshot<T>): Promise<void> {
    if (!this.db) return
    
    const transaction = this.db.transaction(['snapshots'], 'readwrite')
    const store = transaction.objectStore('snapshots')
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ storeId, ...snapshot })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getSnapshot<T>(storeId: string): Promise<AppStateSnapshot<T> | null> {
    if (!this.db) return null
    
    const transaction = this.db.transaction(['snapshots'], 'readonly')
    const store = transaction.objectStore('snapshots')
    
    return new Promise((resolve, reject) => {
      const request = store.get(storeId)
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? { ...result } : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async addPendingSync(storeId: string, operation: 'upload' | 'download', data: any): Promise<void> {
    if (!this.db) return
    
    const transaction = this.db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add({
        storeId,
        operation,
        data,
        timestamp: Date.now(),
        retries: 0
      })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingSync(storeId: string): Promise<any[]> {
    if (!this.db) return []
    
    const transaction = this.db.transaction(['pending'], 'readonly')
    const store = transaction.objectStore('pending')
    const index = store.index('storeId')
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(storeId)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async clearPendingSync(storeId: string): Promise<void> {
    if (!this.db) return
    
    const transaction = this.db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    const index = store.index('storeId')
    
    const pending = await this.getPendingSync(storeId)
    for (const item of pending) {
      store.delete(item.id)
    }
  }
}

// ===== CONFLICT RESOLUTION =====
export function resolveConflict<T>(
  client: AppStateSnapshot<T>, 
  server: AppStateSnapshot<T>, 
  strategy: OfflineSyncOptions<T>['conflictResolution'] = 'merge'
): AppStateSnapshot<T> {
  if (typeof strategy === 'function') {
    return {
      ...client,
      data: strategy(client.data, server.data),
      timestamp: Date.now(),
      version: Math.max(client.version, server.version) + 1
    }
  }

  switch (strategy) {
    case 'client-wins':
      return { ...client, version: server.version + 1 }
    
    case 'server-wins':
      return { ...server, clientId: client.clientId }
    
    case 'timestamp':
      return client.timestamp > server.timestamp ? client : server
    
    case 'merge':
    default:
      // Intelligent merge for common data types
      const merged = smartMerge(client.data, server.data)
      return {
        ...client,
        data: merged,
        timestamp: Date.now(),
        version: Math.max(client.version, server.version) + 1
      }
  }
}

function smartMerge<T>(client: T, server: T): T {
  if (client === null || client === undefined) return server
  if (server === null || server === undefined) return client
  
  // For objects, merge properties
  if (typeof client === 'object' && typeof server === 'object' && !Array.isArray(client) && !Array.isArray(server)) {
    const merged = { ...server } as any
    
    for (const [key, value] of Object.entries(client as any)) {
      if (Array.isArray(value) && Array.isArray((server as any)[key])) {
        // Merge arrays by combining unique items
        const serverArray = (server as any)[key] || []
        const combined = [...serverArray]
        
        for (const item of value) {
          if (!combined.some(existing => JSON.stringify(existing) === JSON.stringify(item))) {
            combined.push(item)
          }
        }
        merged[key] = combined
      } else if (typeof value === 'object' && value !== null) {
        merged[key] = smartMerge(value, (server as any)[key] || {})
      } else {
        // Client value wins for primitives (assume it's more recent)
        merged[key] = value
      }
    }
    
    return merged as T
  }
  
  // For arrays, combine unique items
  if (Array.isArray(client) && Array.isArray(server)) {
    const combined = [...server]
    for (const item of client) {
      if (!combined.some(existing => JSON.stringify(existing) === JSON.stringify(item))) {
        combined.push(item)
      }
    }
    return combined as T
  }
  
  // For primitives, client wins
  return client
}

// ===== NETWORK DETECTOR =====
class NetworkDetector {
  private listeners: Array<(online: boolean) => void> = []
  public online = typeof navigator !== 'undefined' ? navigator.onLine : true

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  private handleOnline = () => {
    this.online = true
    this.listeners.forEach(listener => listener(true))
  }

  private handleOffline = () => {
    this.online = false
    this.listeners.forEach(listener => listener(false))
  }

  addListener(listener: (online: boolean) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
    this.listeners = []
  }
}

// ===== SYNC ENGINE =====
export class OfflineSyncEngine<T> {
  private storage = new OfflineStorage()
  private networkDetector = new NetworkDetector()
  private syncInterval?: number
  private clientId = this.generateClientId()
  
  public status: SyncStatus = {
    online: true,
    syncing: false,
    lastSync: null,
    pendingChanges: 0,
    conflicts: 0,
    retryCount: 0
  }

  private listeners: Array<(status: SyncStatus) => void> = []

  constructor(
    private storeId: string,
    private options: OfflineSyncOptions<T>,
    private encryptionKey?: string
  ) {
    this.status.online = this.networkDetector.online
    this.init()
  }

  private async init() {
    await this.storage.init()
    
    // Listen for network changes
    this.networkDetector.addListener((online) => {
      this.status.online = online
      this.notifyListeners()
      
      if (online) {
        this.options.onOnline?.()
        this.syncWhenOnline()
      } else {
        this.options.onOffline?.()
      }
    })

    // Setup auto-sync interval
    if (this.options.syncInterval && this.options.syncInterval > 0) {
      this.syncInterval = window.setInterval(() => {
        if (this.status.online && !this.status.syncing) {
          this.sync()
        }
      }, this.options.syncInterval * 1000)
    }
  }

  private generateClientId(): string {
    return `client-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`
  }

  private async createSnapshot(data: T): Promise<AppStateSnapshot<T>> {
    const snapshot: AppStateSnapshot<T> = {
      data,
      timestamp: Date.now(),
      version: 1,
      checksum: await this.calculateChecksum(data),
      encrypted: !!this.encryptionKey,
      clientId: this.clientId,
      userId: this.options.encryptionKey // Use encryption key as user identifier
    }
    
    return snapshot
  }

  private async calculateChecksum(data: T): Promise<string> {
    const jsonString = JSON.stringify(data)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(jsonString))
      return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    }
    // Fallback simple hash
    let hash = 0
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  async saveState(data: T): Promise<void> {
    const snapshot = await this.createSnapshot(data)
    await this.storage.saveSnapshot(this.storeId, snapshot)
    
    if (this.status.online) {
      this.syncToServer(snapshot)
    } else {
      await this.storage.addPendingSync(this.storeId, 'upload', snapshot)
      this.status.pendingChanges++
      this.notifyListeners()
    }
  }

  async loadState(): Promise<T | null> {
    const snapshot = await this.storage.getSnapshot<T>(this.storeId)
    return snapshot?.data || null
  }

  async sync(): Promise<void> {
    if (!this.status.online || this.status.syncing) return
    
    this.status.syncing = true
    this.notifyListeners()

    try {
      // Process pending syncs
      await this.processPendingSync()
      
      // Sync with server
      await this.syncWithServer()
      
      this.status.lastSync = Date.now()
      this.status.retryCount = 0
      this.status.pendingChanges = 0
      
    } catch (error) {
      this.status.retryCount++
      this.options.onSyncError?.(error as Error, this.status.retryCount)
      
      // Retry with exponential backoff
      if (this.status.retryCount < (this.options.retryAttempts || 3)) {
        setTimeout(() => this.sync(), Math.pow(2, this.status.retryCount) * 1000)
      }
    } finally {
      this.status.syncing = false
      this.notifyListeners()
    }
  }

  private async processPendingSync(): Promise<void> {
    const pending = await this.storage.getPendingSync(this.storeId)
    
    for (const item of pending) {
      if (item.operation === 'upload') {
        await this.syncToServer(item.data)
      }
    }
    
    await this.storage.clearPendingSync(this.storeId)
  }

  private async syncWithServer(): Promise<void> {
    const endpoint = this.options.syncEndpoint || `/api/sync/${this.storeId}`
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const serverSlug = await response.text()
        if (serverSlug) {
          const serverData = await decodeState(serverSlug, { 
            password: this.encryptionKey 
          })
          const serverSnapshot = await this.createSnapshot(serverData)
          
          const clientSnapshot = await this.storage.getSnapshot<T>(this.storeId)
          
          if (clientSnapshot && clientSnapshot.checksum !== serverSnapshot.checksum) {
            // Conflict detected - resolve it
            const resolved = resolveConflict(clientSnapshot, serverSnapshot, this.options.conflictResolution)
            await this.storage.saveSnapshot(this.storeId, resolved)
            this.options.onConflict?.(clientSnapshot.data, serverSnapshot.data, resolved.data)
            this.status.conflicts++
          }
        }
      }
    } catch (error) {
      throw new Error(`Sync failed: ${error}`)
    }
  }

  private async syncToServer(snapshot: AppStateSnapshot<T>): Promise<void> {
    const endpoint = this.options.syncEndpoint || `/api/sync/${this.storeId}`
    
    // Encode the state for database storage
    const slug = await encodeState(snapshot.data, {
      compress: true,
      encrypt: !!this.encryptionKey,
      password: this.encryptionKey
    })
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          slug,
          timestamp: snapshot.timestamp,
          version: snapshot.version,
          clientId: snapshot.clientId
        })
      })
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }
      
      this.options.onSync?.(snapshot.data, 'upload')
    } catch (error) {
      throw error
    }
  }

  private async syncWhenOnline(): Promise<void> {
    // Wait a bit after coming online before syncing
    setTimeout(() => {
      if (this.status.online) {
        this.sync()
      }
    }, 1000)
  }

  addListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.status }))
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    this.networkDetector.destroy()
    this.listeners = []
  }
}

// ===== PUBLIC API =====
export function createOfflineSync<T>(
  storeId: string, 
  options: OfflineSyncOptions<T>
): OfflineSyncEngine<T> {
  // Auto-generate encryption key if not provided
  const encryptionKey = options.encryptionKey || `${storeId}-${Date.now()}`
  
  return new OfflineSyncEngine(storeId, options, encryptionKey)
} 