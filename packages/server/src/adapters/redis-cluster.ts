import type { PersistenceAdapter, ServerSlugStoreOptions } from '../types.js'

/**
 * Redis Cluster adapter for Slug Store Server
 * Requires 'ioredis' package to be installed
 */
export class RedisClusterAdapter implements PersistenceAdapter {
  name = 'redis-cluster'
  private client: any

  constructor(private options: ServerSlugStoreOptions = {}) {
    throw new Error(
      'RedisClusterAdapter is not yet implemented. ' +
      'Please use MemoryAdapter or FileAdapter for now.'
    )
  }

  async get(key: string): Promise<any> {
    throw new Error('RedisClusterAdapter not implemented')
  }

  async set(key: string, data: any, ttl?: number): Promise<void> {
    throw new Error('RedisClusterAdapter not implemented')
  }

  async delete(key: string): Promise<void> {
    throw new Error('RedisClusterAdapter not implemented')
  }

  async clear(): Promise<void> {
    throw new Error('RedisClusterAdapter not implemented')
  }

  async keys(): Promise<string[]> {
    throw new Error('RedisClusterAdapter not implemented')
  }
} 