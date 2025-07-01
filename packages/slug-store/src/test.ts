// Simple test to verify slug-store functionality
import { createNextState } from './server.js';

// Mock server action
async function mockUpdater(id: string, data: any) {
  console.log('Server action called:', { id, data });
  return { success: true };
}

// Mock loader
async function mockLoader(id: string) {
  console.log('Loader called with id:', id);
  return { name: 'Test Product', price: 100 };
}

// Create a test state with Auto Config enabled
export const TestState = createNextState({
  loader: mockLoader,
  updater: mockUpdater,
  autoConfig: true, // ⚙️ Auto-configuration enabled!
  // No persistence config needed - it will be auto-detected based on data patterns
});

// Create a test state with explicit configuration (old way)
export const ExplicitTestState = createNextState({
  loader: mockLoader,
  updater: mockUpdater,
  persistence: {
    url: {
      enabled: true,
      compress: 'auto',
      encrypt: false
    },
    offline: {
      enabled: true,
      storage: 'memory',
      ttl: 3600
    }
  }
});

// Test the Auto Config System
export async function testAutoConfig() {
  console.log('⚙️ Testing Auto Config System...');
  
  const { analyzeDataPatterns, explainAutoConfig } = await import('./auto-config.js');
  
  // Test different data patterns
  const scenarios = [
    {
      name: 'Small configuration data',
      data: { theme: 'dark', language: 'en', filters: { category: 'tech' } }
    },
    {
      name: 'Large dataset',
      data: { items: new Array(100).fill({ name: 'Item', data: 'lots of content here' }) }
    },
    {
      name: 'Sensitive user data',
      data: { user: { email: 'user@example.com', password: 'secret' }, preferences: {} }
    },
    {
      name: 'Very large data',
      data: { bigData: new Array(1000).fill('This is a lot of content that will be very large') }
    }
  ];
  
  scenarios.forEach(scenario => {
    console.log(`\n📊 Analyzing: ${scenario.name}`);
    const analysis = analyzeDataPatterns(scenario.data);
    console.log('Recommendations:', {
      compress: analysis.shouldCompress ? '✅' : '❌',
      encrypt: analysis.shouldEncrypt ? '✅' : '❌',
      url: analysis.shouldPersistInURL ? '✅' : '❌',
      offline: analysis.shouldPersistOffline ? '✅' : '❌',
      algorithm: analysis.compressionAlgorithm
    });
    console.log('Reasoning:', analysis.reasoning);
  });
  
  console.log('\n🎯 Auto Config System tests completed!');
}

// Test the persistence modules directly  
export async function testPersistence() {
  console.log('\n🔧 Testing persistence modules...');
  
  // Test compression
  const { compress, decompress } = await import('./compression.js');
  const testData = JSON.stringify({ test: 'data', number: 123 });
  const compressed = await compress(testData, 'lz-string');
  const decompressed = await decompress(compressed, 'lz-string');
  console.log('Compression test:', testData === decompressed ? 'PASS' : 'FAIL');
  
  // Test encryption
  const { encrypt, decrypt } = await import('./encryption.js');
  const key = 'test-key-123';
  const encrypted = await encrypt(testData, key);
  const decrypted = await decrypt(encrypted, key);
  console.log('Encryption test:', testData === decrypted ? 'PASS' : 'FAIL');
  
  console.log('Persistence tests completed!');
} 