// Main hook - useState-like interface for universal state management
export { useSlugStore } from './useSlugStore.js'

// v3.1: Specialized hooks for focused use cases
export { 
  useUrlState,
  useOfflineState, 
  useDbState,
  useSharedOfflineState,
  useFullState
} from './specialized-hooks.js'

// Re-export core types for convenience
export type { 
  SlugStoreOptions,
  SlugStoreResult,
  OfflineOptions,
  EncodedData,
  SlugInfo,
  SlugStoreError
} from '@farajabien/slug-store-core' 