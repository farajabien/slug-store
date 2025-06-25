import type { PersistenceAdapter, ServerSlugStoreOptions } from '../types.js'

/**
 * Redis adapter for Slug Store Server
 * Requires 'redis' or 'ioredis' package to be installed
 */
export class RedisAdapter implements PersistenceAdapter {
  name = 'redis'
  private client: any

  constructor(private options: ServerSlugStoreOptions = {}) {
    throw new Error(
      'RedisAdapter is not yet implemented. ' +
      'Please use MemoryAdapter or FileAdapter for now.'
    )
  }

  async get(key: string): Promise<any> {
    throw new Error('RedisAdapter not implemented')
  }

  async set(key: string, data: any, ttl?: number): Promise<void> {
    throw new Error('RedisAdapter not implemented')
  }

  async delete(key: string): Promise<void> {
    throw new Error('RedisAdapter not implemented')
  }

  async clear(): Promise<void> {
    throw new Error('RedisAdapter not implemented')
  }

  async keys(): Promise<string[]> {
    throw new Error('RedisAdapter not implemented')
  }
} 