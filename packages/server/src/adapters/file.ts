import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import type { 
  PersistenceAdapter, 
  CachedData, 
  ServerSlugStoreOptions,
  FileAdapterConfig 
} from '../types.js'

/**
 * File system persistence adapter
 * Stores data as JSON files on disk
 */
export class FileAdapter implements PersistenceAdapter {
  name = 'file'
  private config: Required<FileAdapterConfig>
  private cleanupInterval?: ReturnType<typeof setInterval>

  constructor(options: ServerSlugStoreOptions = {}) {
    this.config = {
      baseDir: './cache',
      compression: false,
      maxFiles: 10000,
      cleanupInterval: 300000, // 5 minutes
      ...options
    }

    // Start cleanup interval
    if (this.config.cleanupInterval > 0) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup().catch(console.error)
      }, this.config.cleanupInterval)
    }
  }

  async get(key: string): Promise<CachedData | null> {
    const filePath = this.getFilePath(key)
    
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const data: CachedData = JSON.parse(content)

      // Check if expired
      if (data.ttl && (Date.now() - data.timestamp) > (data.ttl * 1000)) {
        await this.delete(key).catch(() => {}) // Best effort cleanup
        return null
      }

      return data
    } catch {
      return null
    }
  }

  async set(key: string, data: CachedData, ttl?: number): Promise<void> {
    const filePath = this.getFilePath(key)
    const finalTTL = ttl ?? data.ttl

    const cachedData: CachedData = {
      ...data,
      ttl: finalTTL,
      timestamp: Date.now()
    }

    try {
      // Ensure directory exists
      await fs.mkdir(dirname(filePath), { recursive: true })
      
      // Write to temporary file first, then rename for atomicity
      const tempPath = `${filePath}.tmp`
      await fs.writeFile(tempPath, JSON.stringify(cachedData), 'utf-8')
      await fs.rename(tempPath, filePath)

      // Enforce max files limit
      await this.enforceMaxFiles()
    } catch (error) {
      throw new Error(`Failed to write cache file: ${error}`)
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key)
    
    try {
      await fs.unlink(filePath)
    } catch {
      // File might not exist, that's ok
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.rm(this.config.baseDir, { recursive: true, force: true })
    } catch {
      // Directory might not exist, that's ok
    }
  }

  async keys(): Promise<string[]> {
    try {
      const files = await this.getAllFiles(this.config.baseDir)
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''))
    } catch {
      return []
    }
  }

  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }

  /**
   * Get file path for a cache key
   */
  private getFilePath(key: string): string {
    // Hash the key to avoid filesystem issues with special characters
    const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_')
    return join(this.config.baseDir, `${safeKey}.json`)
  }

  /**
   * Get all files recursively
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      const files: string[] = []

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
          const subFiles = await this.getAllFiles(fullPath)
          files.push(...subFiles)
        } else {
          files.push(entry.name)
        }
      }

      return files
    } catch {
      return []
    }
  }

  /**
   * Remove expired files
   */
  private async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.baseDir)
      const now = Date.now()

      for (const file of files) {
        if (!file.endsWith('.json')) continue

        const filePath = join(this.config.baseDir, file)
        try {
          const content = await fs.readFile(filePath, 'utf-8')
          const data: CachedData = JSON.parse(content)

          if (data.ttl && (now - data.timestamp) > (data.ttl * 1000)) {
            await fs.unlink(filePath)
          }
        } catch {
          // Invalid file, remove it
          await fs.unlink(filePath).catch(() => {})
        }
      }
    } catch {
      // Cleanup is best effort
    }
  }

  /**
   * Enforce maximum number of files
   */
  private async enforceMaxFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.baseDir)
      const jsonFiles = files.filter(f => f.endsWith('.json'))

      if (jsonFiles.length <= this.config.maxFiles) return

      // Get file stats and sort by modification time
      const fileStats = await Promise.all(
        jsonFiles.map(async file => {
          const filePath = join(this.config.baseDir, file)
          const stats = await fs.stat(filePath)
          return { file, mtime: stats.mtime }
        })
      )

      // Sort by oldest first
      fileStats.sort((a, b) => a.mtime.getTime() - b.mtime.getTime())

      // Remove oldest files
      const toRemove = fileStats.slice(0, jsonFiles.length - this.config.maxFiles)
      await Promise.all(
        toRemove.map(({ file }) => 
          fs.unlink(join(this.config.baseDir, file)).catch(() => {})
        )
      )
    } catch {
      // Best effort
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const files = await fs.readdir(this.config.baseDir)
      const jsonFiles = files.filter(f => f.endsWith('.json'))
      
      let totalSize = 0
      let expired = 0
      const now = Date.now()

      for (const file of jsonFiles) {
        const filePath = join(this.config.baseDir, file)
        try {
          const stats = await fs.stat(filePath)
          totalSize += stats.size

          const content = await fs.readFile(filePath, 'utf-8')
          const data: CachedData = JSON.parse(content)
          
          if (data.ttl && (now - data.timestamp) > (data.ttl * 1000)) {
            expired++
          }
        } catch {
          // Skip invalid files
        }
      }

      return {
        total: jsonFiles.length,
        expired,
        active: jsonFiles.length - expired,
        totalSizeBytes: totalSize,
        baseDir: this.config.baseDir,
        maxFiles: this.config.maxFiles
      }
    } catch {
      return {
        total: 0,
        expired: 0,
        active: 0,
        totalSizeBytes: 0,
        baseDir: this.config.baseDir,
        maxFiles: this.config.maxFiles
      }
    }
  }
} 