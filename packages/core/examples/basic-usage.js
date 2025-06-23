// Basic usage example for @slug-store/core
import { encodeState, decodeState, encodeStateSync, decodeStateSync } from '@slug-store/core'

// Example 1: Basic encoding/decoding
async function basicExample() {
  const state = {
    items: ['apple', 'banana', 'cherry'],
    filters: { category: 'fruits', price: 'low' },
    view: 'grid'
  }

  console.log('Original state:', state)

  // Encode state
  const slug = await encodeState(state)
  console.log('Encoded slug:', slug)

  // Decode state
  const restoredState = await decodeState(slug)
  console.log('Restored state:', restoredState)
}

// Example 2: With compression
async function compressionExample() {
  const state = {
    items: Array.from({ length: 100 }, (_, i) => `item-${i}`),
    filters: { category: 'electronics', price: 'high' },
    view: 'list'
  }

  console.log('Original state size:', JSON.stringify(state).length)

  // Without compression
  const uncompressedSlug = await encodeState(state)
  console.log('Uncompressed slug size:', uncompressedSlug.length)

  // With compression
  const compressedSlug = await encodeState(state, { compress: true })
  console.log('Compressed slug size:', compressedSlug.length)
  console.log('Compression ratio:', ((1 - compressedSlug.length / uncompressedSlug.length) * 100).toFixed(1) + '%')
}

// Example 3: Synchronous version (no encryption)
function syncExample() {
  const state = { theme: 'dark', language: 'en' }

  // Synchronous encoding/decoding
  const slug = encodeStateSync(state, { compress: true })
  const restoredState = decodeStateSync(slug)

  console.log('Sync example - Original:', state)
  console.log('Sync example - Restored:', restoredState)
}

// Example 4: Error handling
async function errorHandlingExample() {
  try {
    // Try to decode invalid slug
    await decodeState('invalid-slug')
  } catch (error) {
    console.log('Error caught:', error.message)
    console.log('Error code:', error.code)
  }
}

// Run examples
async function runExamples() {
  console.log('=== Basic Example ===')
  await basicExample()
  
  console.log('\n=== Compression Example ===')
  await compressionExample()
  
  console.log('\n=== Sync Example ===')
  syncExample()
  
  console.log('\n=== Error Handling Example ===')
  await errorHandlingExample()
}

// Run if this file is executed directly
if (typeof window === 'undefined') {
  runExamples().catch(console.error)
} 