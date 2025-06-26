import { describe, it, expect } from 'vitest'
import { 
  resolveConflict, 
  OfflineSyncEngine,
  createOfflineSync
} from './offline-sync.js'

// Helper to create mock snapshots
const createSnapshot = <T>(data: T, timestamp = Date.now()): any => ({
  data,
  timestamp,
  version: 1,
  checksum: 'mock-checksum',
  encrypted: false,
  clientId: 'test-client',
  userId: 'test-user'
})

describe('Conflict Resolution', () => {
  it('should merge objects intelligently', () => {
    const clientData = { name: 'John', age: 25, settings: { theme: 'dark' } }
    const serverData = { name: 'John', age: 26, settings: { language: 'en' }, email: 'john@example.com' }
    
    const client = createSnapshot(clientData, 1000)
    const server = createSnapshot(serverData, 2000)
    
    const result = resolveConflict(client, server, 'merge')
    // Client values win for primitives, objects are merged
    expect(result.data).toEqual({
      name: 'John',
      age: 25, // client wins for conflicting primitives  
      settings: { theme: 'dark', language: 'en' }, // objects merged
      email: 'john@example.com'
    })
  })

  it('should merge arrays by combining unique items', () => {
    const client = createSnapshot([1, 2, 3])
    const server = createSnapshot([3, 4, 5])
    
    const result = resolveConflict(client, server, 'merge')
    // Arrays are combined with server first, then unique client items
    expect(result.data).toEqual([3, 4, 5, 1, 2])
  })

  it('should handle client-wins strategy', () => {
    const clientData = { name: 'John', age: 25 }
    const serverData = { name: 'Jane', age: 30 }
    
    const client = createSnapshot(clientData)
    const server = createSnapshot(serverData)
    
    const result = resolveConflict(client, server, 'client-wins')
    expect(result.data).toEqual(clientData)
  })

  it('should handle server-wins strategy', () => {
    const clientData = { name: 'John', age: 25 }
    const serverData = { name: 'Jane', age: 30 }
    
    const client = createSnapshot(clientData)
    const server = createSnapshot(serverData)
    
    const result = resolveConflict(client, server, 'server-wins')
    expect(result.data).toEqual(serverData)
  })

  it('should handle timestamp-based resolution', () => {
    const clientData = { score: 100 }
    const serverData = { score: 150 }
    
    const client = createSnapshot(clientData, 1000) // older
    const server = createSnapshot(serverData, 2000) // newer
    
    const result = resolveConflict(client, server, 'timestamp')
    expect(result.data).toEqual(serverData) // server data is newer
  })

  it('should handle custom merge function', () => {
    const clientData = { score: 100 }
    const serverData = { score: 150 }
    
    const client = createSnapshot(clientData)
    const server = createSnapshot(serverData)
    
    const customMerge = (c: any, s: any) => ({ score: Math.max(c.score, s.score) })
    const result = resolveConflict(client, server, customMerge)
    expect(result.data).toEqual({ score: 150 })
  })
})

describe('createOfflineSync', () => {
  it('should create offline sync engine with default options', () => {
    const storeId = 'test-store'
    const options = {
      syncEndpoint: '/api/sync/test'
    }

    const engine = createOfflineSync(storeId, options)
    expect(engine).toBeInstanceOf(OfflineSyncEngine)
  })

  it('should use provided encryption key', () => {
    const storeId = 'test-store'
    const options = {
      syncEndpoint: '/api/sync/test',
      encryptionKey: 'my-secret-key'
    }

    const engine = createOfflineSync(storeId, options)
    expect(engine).toBeInstanceOf(OfflineSyncEngine)
  })

  it('should create engine with sync interval', () => {
    const storeId = 'test-store'
    const options = {
      syncEndpoint: '/api/sync/test',
      syncInterval: 5000
    }

    const engine = createOfflineSync(storeId, options)
    expect(engine).toBeInstanceOf(OfflineSyncEngine)
  })
}) 