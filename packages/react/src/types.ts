import { EncodeOptions, DecodeOptions } from '@farajabien/slug-store-core'

// ===== OFFLINE SYNC TYPES =====
export interface OfflineSyncOptions<T> {
  /** Enable offline-sync functionality (default: false) */
  offlineSync?: boolean
  /** Sync endpoint URL (auto-detected: /api/sync/[storeId]) */
  syncEndpoint?: string
  /** Conflict resolution strategy (default: 'merge') */
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge' | 'timestamp' | ((client: T, server: T) => T)
  /** Auto-sync interval when online in seconds (default: 30) */
  syncInterval?: number
  /** Retry attempts for failed syncs (default: 3) */
  retryAttempts?: number
  /** Encryption key for user data (auto-generated if not provided) */
  encryptionKey?: string
  /** Callbacks */
  onSync?: (data: T, direction: 'upload' | 'download') => void
  onConflict?: (client: T, server: T, resolved: T) => void
  onOffline?: () => void
  onOnline?: () => void
  onSyncError?: (error: Error, retryCount: number) => void
}

export interface SyncStatus {
  /** Current online/offline status */
  online: boolean
  /** Currently syncing */
  syncing: boolean
  /** Last successful sync timestamp */
  lastSync: number | null
  /** Number of pending changes to sync */
  pendingChanges: number
  /** Number of unresolved conflicts */
  conflicts: number
  /** Current retry attempt (0 when not retrying) */
  retryCount: number
}

export interface AppStateSnapshot<T> {
  /** The actual data */
  data: T
  /** When this snapshot was created */
  timestamp: number
  /** Version for conflict resolution */
  version: number
  /** Checksum for data integrity */
  checksum: string
  /** Whether data is encrypted */
  encrypted: boolean
  /** Unique client identifier */
  clientId: string
  /** User identifier (if applicable) */
  userId?: string
}

// ===== EXISTING TYPES (EXTENDED) =====
export interface SlugStoreOptions extends Omit<EncodeOptions, 'version'> {
  /** URL parameter key to use for the state (default: 'state') */
  key?: string
  /** Whether to sync state to URL immediately on changes (default: true) */
  syncToUrl?: boolean
  /** Debounce URL updates in milliseconds (default: 0) */
  debounceMs?: number
  /** Decode options for reading state from URL */
  decodeOptions?: DecodeOptions
  /** Offline-sync configuration */
  offlineSync?: boolean | OfflineSyncOptions<any>
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
  /** Offline-sync configuration */
  offlineSync?: boolean | OfflineSyncOptions<any>
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
  /** Sync status (only if offlineSync enabled) */
  syncStatus?: SyncStatus
  /** Manual sync trigger */
  sync?: () => Promise<void>
  /** Force sync from server */
  pullFromServer?: () => Promise<void>
  /** Force sync to server */
  pushToServer?: () => Promise<void>
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
  /** Sync status (only if offlineSync enabled) */
  syncStatus?: SyncStatus
  /** Manual sync trigger */
  sync?: () => Promise<void>
} 