// ===== CLIENT-SIDE EXPORTS =====
// React hooks for URL state persistence
export { useSlugStore } from './useSlugStore.js'
export { create } from './create.js'

export type { 
  SlugStoreOptions, 
  UseSlugStoreOptions,
  UseSlugStoreReturn, 
  SlugStoreCreator, 
  SlugStore,
  // Offline-sync types
  OfflineSyncOptions,
  SyncStatus,
  AppStateSnapshot
} from './types.js'

// ===== OFFLINE-SYNC EXPORTS =====
// Universal offline-sync for any webapp
export { createOfflineSync, resolveConflict } from './offline-sync.js'
export type { OfflineSyncEngine } from './offline-sync.js'

// ===== SERVER-SIDE EXPORTS =====
// Zero-obstruction state persistence
export { 
  // Use Case 1: URL Sharing
  createShareableUrl,
  loadFromShareableUrl,
  
  // Use Case 2: User Database Storage  
  createUserState,
  loadUserState,
  saveUserState,
  
  // Unified Interface (recommended)
  persistState,
  restoreState,
  
  // Offline-sync server helpers
  handleSyncRequest,
  
  // Legacy server hook
  useSlugStore as useServerSlugStore,
  fromDatabase,
  createSlugForDatabase
} from './server.js'

export type { 
  ShareableOptions,
  UserStateOptions,
  DatabaseStateResult,
  UniversalOptions,
  SlugStoreServerOptions,
  SlugStoreServerReturn,
  // Sync server types
  SyncHandlerOptions
} from './server.js'

// ===== CORE EXPORTS =====
// Re-export core for convenience
export { 
  encodeState, 
  decodeState, 
  validateSlug, 
  getSlugInfo,
  type EncodeOptions,
  type DecodeOptions,
  type SlugInfo,
  type SlugStoreError
} from '@farajabien/slug-store-core' 