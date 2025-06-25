import { createHash } from 'node:crypto'
import type { ServerContext, ServerSlugStoreOptions } from '../types.js'

/**
 * Generate a deterministic cache key from params and searchParams
 */
export function generateCacheKey(
  params: Record<string, any>,
  searchParams: Record<string, any>,
  options: ServerSlugStoreOptions = {}
): string {
  // Create a stable string representation
  const paramsStr = JSON.stringify(sortObject(params))
  const searchParamsStr = JSON.stringify(sortObject(searchParams))
  
  // Include compression/encryption options in key to avoid conflicts
  const optionsStr = JSON.stringify({
    compress: options.compress || false,
    encrypt: options.encrypt || false,
    // Don't include password in key for security
  })
  
  const combined = `params:${paramsStr}|searchParams:${searchParamsStr}|options:${optionsStr}`
  
  // Hash for shorter, consistent keys
  return createHash('sha256').update(combined).digest('hex').substring(0, 16)
}

/**
 * Create server context for the current request
 */
export function createContext(): ServerContext {
  return {
    timestamp: Date.now(),
    cacheStatus: 'miss' // Will be updated during processing
  }
}

/**
 * Check if data should be revalidated based on conditions
 */
export function shouldRevalidateData(
  oldParams: any,
  newParams: any,
  oldSearchParams: any,
  newSearchParams: any,
  conditions: string[] = ['params', 'searchParams']
): boolean {
  for (const condition of conditions) {
    if (condition === 'params') {
      if (!deepEqual(oldParams, newParams)) return true
    } else if (condition === 'searchParams') {
      if (!deepEqual(oldSearchParams, newSearchParams)) return true
    } else if (condition.startsWith('params.')) {
      const key = condition.replace('params.', '')
      if (oldParams[key] !== newParams[key]) return true
    } else if (condition.startsWith('searchParams.')) {
      const key = condition.replace('searchParams.', '')
      if (oldSearchParams[key] !== newSearchParams[key]) return true
    }
  }
  
  return false
}

/**
 * Sort object keys for consistent serialization
 */
function sortObject(obj: Record<string, any>): Record<string, any> {
  if (obj === null || typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return obj.map(sortObject)
  }
  
  const sorted: Record<string, any> = {}
  const keys = Object.keys(obj).sort()
  
  for (const key of keys) {
    sorted[key] = sortObject(obj[key])
  }
  
  return sorted
}

/**
 * Deep equality check for objects
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a === null || b === null) return false
  if (typeof a !== typeof b) return false
  
  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false
      }
      return true
    }
    
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!deepEqual(a[key], b[key])) return false
    }
    
    return true
  }
  
  return false
}

/**
 * Safe JSON stringify with error handling
 */
export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return String(obj)
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeParse(str: string): any {
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}

/**
 * Check if code is running in server environment
 */
export function isServerEnvironment(): boolean {
  return typeof window === 'undefined' && typeof global !== 'undefined'
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
} 