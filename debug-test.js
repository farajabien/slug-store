// Simple test to debug URL encoding
import { encodeState, decodeState } from './packages/core/dist/index.js'

async function testEncoding() {
  console.log('🧪 Testing URL encoding...')
  
  const testState = {
    items: [
      { id: '1', name: 'MacBook Pro', price: 2499, emoji: '💻', priority: 'high' },
      { id: '2', name: 'AirPods Pro', price: 249, emoji: '🎧', priority: 'medium' }
    ],
    view: 'grid',
    filter: 'all'
  }
  
  try {
    // Test basic encoding
    console.log('📦 Original state:', JSON.stringify(testState, null, 2))
    
    const encoded = await encodeState(testState)
    console.log('🔗 Encoded slug:', encoded)
    console.log('📏 Slug length:', encoded.length)
    
    // Test with compression
    const compressedEncoded = await encodeState(testState, { compress: true })
    console.log('🗜️ Compressed slug:', compressedEncoded)
    console.log('📏 Compressed length:', compressedEncoded.length)
    
    // Test decoding
    const decoded = await decodeState(encoded)
    console.log('📤 Decoded state:', JSON.stringify(decoded, null, 2))
    
    // Test compressed decoding
    const compressedDecoded = await decodeState(compressedEncoded)
    console.log('📤 Compressed decoded:', JSON.stringify(compressedDecoded, null, 2))
    
    // Verify they match
    const matches = JSON.stringify(testState) === JSON.stringify(decoded)
    const compressedMatches = JSON.stringify(testState) === JSON.stringify(compressedDecoded)
    
    console.log('✅ Basic encoding/decoding works:', matches)
    console.log('✅ Compressed encoding/decoding works:', compressedMatches)
    
    // Test URL generation
    const testUrl = 'https://example.com/demo'
    const urlWithState = `${testUrl}?state=${encodeURIComponent(compressedEncoded)}`
    console.log('🌐 Example URL:', urlWithState)
    console.log('📏 URL length:', urlWithState.length)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testEncoding() 