export interface EncodeOptions {
  compress?: boolean
  encrypt?: boolean
  password?: string
  version?: string
}

export interface DecodeOptions {
  password?: string
  validateVersion?: boolean
}

// v3.0: New offline storage interfaces
export interface OfflineOptions {
  enabled?: boolean
  storage?: 'indexeddb' | 'localstorage' | 'memory'
  encryption?: boolean
  password?: string
  ttl?: number // Time to live in seconds
}

export interface OfflineStorage {
  get(key: string): Promise<any>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
}

// v3.0: Main options interface (renamed for consistency)
export interface SlugStoreOptions {
  // URL persistence
  url?: boolean
  compress?: boolean
  
  // Offline storage
  offline?: boolean | OfflineOptions
  
  // Database sync
  db?: {
    endpoint: string
    method?: 'POST' | 'PUT'
    headers?: Record<string, string>
  }
  
  // Legacy support
  encrypt?: boolean
  password?: string
}

export interface SlugStoreResult<T = any> {
  slug?: string
  state: T
  shareableUrl?: string
  dbKey?: string
  offline?: boolean
}

export interface SlugInfo {
  version: string
  compressed: boolean
  encrypted: boolean
  size: number
  originalSize?: number
}

export interface EncodedData {
  version: string
  data: string
  compressed: boolean
  encrypted: boolean
}

export class SlugStoreError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_FORMAT' | 'DECRYPTION_FAILED' | 'VERSION_MISMATCH' | 'DECOMPRESSION_FAILED' | 'ENCRYPTION_FAILED' | 'INVALID_PASSWORD' | 'STORAGE_ERROR' | 'VALIDATION_ERROR' | 'MIGRATION_ERROR' | 'UNKNOWN_VERSION' | 'MISSING_MIGRATION' | 'MIGRATION_FAILED' | 'MISSING_DOWN_MIGRATION' | 'DOWN_MIGRATION_FAILED' | 'OFFLINE_ERROR',
    public cause?: Error
  ) {
    super(message)
    this.name = 'SlugStoreError'
  }
} 