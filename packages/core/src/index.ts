// Core functions
export { encodeState, decodeState } from './core.js'

// v3.0: Unified API
export { 
  slugStore,
  loadSlugStore,
  urlState,
  offlineState,
  dbState
} from './unified.js'

// Offline storage
export { 
  saveOffline, 
  loadOffline, 
  clearOffline, 
  listOfflineKeys 
} from './offline.js'

// Types
export type { 
  EncodeOptions, 
  DecodeOptions,
  SlugStoreOptions,
  SlugStoreResult,
  OfflineOptions,
  OfflineStorage,
  SlugInfo,
  EncodedData
} from './types.js'

export { SlugStoreError } from './types.js'

// Utilities
export { 
  compress, 
  decompress, 
  encrypt, 
  decrypt,
  validateVersion,
  isBase64,
  safeJsonParse,
  safeJsonStringify,
  CURRENT_VERSION
} from './utils.js'

// Validation
export { 
  createStateValidator,
  validators
} from './validation.js'

export type {
  ValidationResult,
  SchemaValidator,
  InferState
} from './validation.js'

// Migration and adapters
export * from './migration.js'
export * from './adapters.js' 