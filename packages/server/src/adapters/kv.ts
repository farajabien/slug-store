import type { PersistenceAdapter, ServerSlugStoreOptions } from '../types.js'

/**
 * KV adapter for Slug Store Server
 * Works with Vercel KV, Cloudflare KV, and similar key-value stores
 */
export class KVAdapter implements PersistenceAdapter {
  name = 'kv'
  private client: any

  constructor(private options: ServerSlugStoreOptions = {}) {
    throw new Error(
      'KVAdapter is not yet implemented. ' +
      'Please use MemoryAdapter or FileAdapter for now.'
    )
  }

  async get(key: string): Promise<any> {
    throw new Error('KVAdapter not implemented')
  }

  async set(key: string, data: any, ttl?: number): Promise<void> {
    throw new Error('KVAdapter not implemented')
  }

  async delete(key: string): Promise<void> {
    throw new Error('KVAdapter not implemented')
  }

  async clear(): Promise<void> {
    throw new Error('KVAdapter not implemented')
  }

  async keys(): Promise<string[]> {
    throw new Error('KVAdapter not implemented')
  }
} 