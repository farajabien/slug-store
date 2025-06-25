// Basic usage example for @farajabien/slug-store-server
import { useServerSlugStore } from '@farajabien/slug-store-server'

// Mock database function
async function fetchUserData(params, searchParams) {
  // Simulate database call
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    id: params.userId,
    name: `User ${params.userId}`,
    status: searchParams.filter || 'active',
    page: parseInt(searchParams.page || '1'),
    timestamp: new Date().toISOString()
  }
}

// Example 1: Basic caching with memory adapter
async function example1() {
  console.log('🔥 Example 1: Basic Memory Caching')
  
  const { data, cached, loading, error } = await useServerSlugStore(
    fetchUserData,
    { userId: '123' },
    { filter: 'active', page: '1' },
    {
      persist: 'memory',
      ttl: 60, // 1 minute cache
      compress: true
    }
  )

  console.log('📊 Result:', {
    data,
    cached,
    loading,
    error: error?.message
  })
}

// Example 2: Cache hit demonstration
async function example2() {
  console.log('\n🚀 Example 2: Cache Hit Demonstration')
  
  const params = { userId: '456' }
  const searchParams = { filter: 'premium' }
  const options = { persist: 'memory', ttl: 300 }

  // First call - cache miss
  console.time('First call (cache miss)')
  const result1 = await useServerSlugStore(fetchUserData, params, searchParams, options)
  console.timeEnd('First call (cache miss)')
  console.log('First call - cached:', result1.cached)

  // Second call - cache hit
  console.time('Second call (cache hit)')
  const result2 = await useServerSlugStore(fetchUserData, params, searchParams, options)
  console.timeEnd('Second call (cache hit)')
  console.log('Second call - cached:', result2.cached)
}

// Example 3: URL adapter for shareable state
async function example3() {
  console.log('\n🔗 Example 3: URL Adapter for Shareable State')
  
  const { data, getCacheInfo } = await useServerSlugStore(
    fetchUserData,
    { userId: '789' },
    { filter: 'vip', search: 'john' },
    {
      persist: 'url',
      compress: true,
      encrypt: false
    }
  )

  const cacheInfo = await getCacheInfo()
  console.log('📈 Cache Info:', cacheInfo)
  console.log('📋 Data:', data)
}

// Example 4: Error handling
async function example4() {
  console.log('\n⚠️ Example 4: Error Handling')
  
  const failingFetcher = async () => {
    throw new Error('Database connection failed')
  }

  try {
    const result = await useServerSlugStore(
      failingFetcher,
      { userId: 'error' },
      {},
      { persist: 'memory', fallback: true }
    )
    
    console.log('🔄 Fallback result:', result)
  } catch (error) {
    console.log('❌ Error caught:', error.message)
  }
}

// Example 5: Cache management
async function example5() {
  console.log('\n🎛️ Example 5: Cache Management')
  
  const result = await useServerSlugStore(
    fetchUserData,
    { userId: '999' },
    { filter: 'admin' },
    { persist: 'memory', ttl: 30 }
  )

  console.log('📊 Initial data:', result.data)
  
  // Get cache information
  const cacheInfo = await result.getCacheInfo()
  console.log('🔍 Cache info:', cacheInfo)
  
  // Manual revalidation
  console.log('🔄 Revalidating cache...')
  await result.revalidate()
  console.log('✅ Cache revalidated')
  
  // Cache invalidation
  console.log('🗑️ Invalidating cache...')
  await result.invalidate()
  console.log('✅ Cache invalidated')
}

// Run all examples
async function runExamples() {
  console.log('🌟 Slug Store Server Examples\n')
  
  try {
    await example1()
    await example2()
    await example3()
    await example4()
    await example5()
    
    console.log('\n✨ All examples completed successfully!')
  } catch (error) {
    console.error('💥 Example failed:', error)
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples()
}

export {
  example1,
  example2,
  example3,
  example4,
  example5,
  runExamples
} 