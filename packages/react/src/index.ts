export { useSlugStore } from './useSlugStore.js'
export { create } from './create.js'
export type { 
  SlugStoreOptions, 
  UseSlugStoreReturn, 
  SlugStoreCreator, 
  SlugStore 
} from './types.js'

// Re-export core types and functions for convenience
export type { 
  EncodeOptions, 
  DecodeOptions, 
  SlugInfo,
  SlugStoreError
} from '@farajabien/slug-store-core'

export { 
  encodeState, 
  decodeState, 
  validateSlug, 
  getSlugInfo 
} from '@farajabien/slug-store-core' 