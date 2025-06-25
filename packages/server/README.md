# @farajabien/slug-store-server

> **Server-side state persistence with multiple backends for Slug Store**

Extend your Slug Store capabilities to the server-side with powerful caching, persistence, and state management. Perfect for Next.js, Remix, Astro, and other server-side frameworks.

## 🌟 Features

- **🚀 Multiple Backends**: Memory, File System, Redis, URL, and more
- **⚡ Server-Side Caching**: Fast data persistence across requests
- **🔄 Stale-While-Revalidate**: Background updates for optimal performance
- **🎯 Framework Agnostic**: Works with any Node.js server framework
- **📦 Zero Dependencies**: Core functionality with optional peer dependencies
- **🔧 TypeScript First**: Full type safety and IntelliSense support
- **🛡️ Error Resilient**: Graceful fallbacks and error handling

## 📦 Installation

```bash
npm install @farajabien/slug-store-server @farajabien/slug-store-core

# Optional: for specific adapters
npm install redis          # For Redis adapter
npm install ioredis        # Alternative Redis client
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { useServerSlugStore } from '@farajabien/slug-store-server'

// Simple in-memory caching
const { data, loading, error } = await useServerSlugStore(
  async (params, searchParams) => {
    // Your data fetching logic
    return await db.users.findMany({
      where: { 
        status: searchParams.status || 'active',
        departmentId: params.departmentId
      }
    })
  },
  { departmentId: '123' },           // params
  { status: 'active', page: '1' },   // searchParams
  {
    persist: 'memory',     // Backend choice
    ttl: 300,             // 5 minutes cache
    compress: true        // Enable compression
  }
)

console.log(data)       // Your fetched/cached data
console.log(loading)    // false (server-side is synchronous)
console.log(error)      // null or Error object
```

### Next.js App Router Integration

```typescript
// app/dashboard/[userId]/page.tsx
import { useServerSlugStore } from '@farajabien/slug-store-server'

interface PageProps {
  params: { userId: string }
  searchParams: { filter?: string; page?: string }
}

export default async function UserDashboard({ params, searchParams }: PageProps) {
  const { data: userData, cached, stale } = await useServerSlugStore(
    async (params, searchParams) => {
      // This only runs on cache miss
      const users = await prisma.user.findMany({
        where: {
          id: params.userId,
          status: searchParams.filter || 'active'
        },
        skip: (parseInt(searchParams.page || '1') - 1) * 10,
        take: 10
      })
      return users
    },
    params,
    searchParams,
    {
      persist: 'redis',               // Use Redis for production
      ttl: 600,                      // 10 minutes
      staleWhileRevalidate: true,    // Background updates
      revalidateOn: ['searchParams.filter', 'searchParams.page']
    }
  )

  return (
    <div>
      <h1>Users Dashboard</h1>
      {cached && <p>✨ Served from cache</p>}
      {stale && <p>🔄 Updating in background</p>}
      <UserList users={userData} />
    </div>
  )
}
```

## 🎛️ Persistence Backends

### Memory (Development)
```typescript
{
  persist: 'memory',
  maxSize: 1000,           // Max entries
  cleanupInterval: 60000   // Cleanup every minute
}
```

### Redis (Production)
```typescript
{
  persist: 'redis',
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  keyPrefix: 'myapp:'
}
```

### File System
```typescript
{
  persist: 'file',
  baseDir: './cache',
  maxFiles: 10000,
  cleanupInterval: 300000  // 5 minutes
}
```

### URL (Shareable State)
```typescript
{
  persist: 'url',
  compress: true,
  encrypt: true,
  password: 'secret-key'
}
```

### Fallback Chain
```typescript
{
  persist: ['memory', 'redis', 'file'],  // Try in order
  fallbackChain: true
}
```

## ⚙️ Advanced Configuration

### Revalidation Strategies

```typescript
{
  // Revalidate when specific params change
  revalidateOn: ['params.userId', 'searchParams.filter'],
  
  // Custom revalidation logic
  shouldRevalidate: (oldParams, newParams, oldSearch, newSearch) => {
    return oldParams.userId !== newParams.userId
  },
  
  // Stale-while-revalidate pattern
  staleWhileRevalidate: true,
  
  // Background sync interval
  backgroundSync: 30000  // 30 seconds
}
```

### Cache Management

```typescript
const result = await useServerSlugStore(fetcher, params, searchParams, options)

// Manual cache control
await result.revalidate()           // Force refresh
await result.invalidate()           // Clear cache entry
const info = await result.getCacheInfo()  // Get metadata

console.log(info)
// {
//   key: "abc123",
//   size: 1024,
//   timestamp: 1698765432000,
//   ttl: 300,
//   compressed: true,
//   encrypted: false,
//   backend: "redis"
// }
```

### Error Handling

```typescript
{
  fallback: true,  // Graceful error handling (default)
  
  // Custom error handling
  onError: (error, context) => {
    console.error('Cache error:', error)
    // Log to monitoring service
  }
}
```

## 🔌 Framework Integration Examples

### Remix
```typescript
// routes/users.$userId.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useServerSlugStore } from '@farajabien/slug-store-server'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams)

  const { data } = await useServerSlugStore(
    async (params, searchParams) => {
      return await getUser(params.userId, searchParams)
    },
    params,
    searchParams,
    { persist: 'memory', ttl: 300 }
  )

  return json({ user: data })
}
```

### Astro
```typescript
// src/pages/users/[userId].astro
---
import { useServerSlugStore } from '@farajabien/slug-store-server'

const { userId } = Astro.params
const searchParams = Object.fromEntries(Astro.url.searchParams)

const { data: user } = await useServerSlugStore(
  async (params, searchParams) => {
    return await fetchUser(params.userId, searchParams)
  },
  { userId },
  searchParams,
  { persist: 'file', ttl: 600 }
)
---

<h1>User: {user.name}</h1>
<p>Email: {user.email}</p>
```

## 🧪 Testing

```typescript
import { useServerSlugStore, MemoryAdapter } from '@farajabien/slug-store-server'

describe('Server Cache', () => {
  it('should cache data correctly', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({ id: 1, name: 'John' })
    
    const result1 = await useServerSlugStore(
      mockFetcher,
      { id: '1' },
      {},
      { persist: 'memory' }
    )
    
    const result2 = await useServerSlugStore(
      mockFetcher,
      { id: '1' },
      {},
      { persist: 'memory' }
    )
    
    expect(mockFetcher).toHaveBeenCalledTimes(1)  // Cached on second call
    expect(result1.data).toEqual(result2.data)
    expect(result2.cached).toBe(true)
  })
})
```

## 📊 Performance

- **Memory Adapter**: ~0.1ms access time
- **Redis Adapter**: ~1-5ms access time (network dependent)
- **File Adapter**: ~5-20ms access time (disk dependent)
- **URL Adapter**: ~0.5ms encoding/decoding time

## 🤝 Migration from v1

```typescript
// v1: Client-side only
import { useSlugStore } from '@farajabien/slug-store'
const { state, setState } = useSlugStore({ items: [] })

// v2: Server-side caching
import { useServerSlugStore } from '@farajabien/slug-store-server'
const { data } = await useServerSlugStore(
  fetchItems,
  params,
  searchParams,
  { persist: 'redis' }
)

// Hybrid: Use both together
// Server for data fetching, client for UI state
```

## 📚 API Reference

### `useServerSlugStore<T>(fetcher, params, searchParams, options)`

**Parameters:**
- `fetcher`: `(params, searchParams, context) => Promise<T>` - Data fetching function
- `params`: `Record<string, any>` - Route parameters
- `searchParams`: `Record<string, any>` - Query parameters
- `options`: `ServerSlugStoreOptions` - Configuration options

**Returns:** `Promise<ServerSlugStoreReturn<T>>`
- `data`: The fetched/cached data
- `loading`: Whether currently loading (always false on server)
- `error`: Any error that occurred
- `cached`: Whether data came from cache
- `stale`: Whether data is stale
- `revalidate()`: Manually refresh cache
- `invalidate()`: Clear cache entry
- `getCacheInfo()`: Get cache metadata

## 🔗 Related Packages

- [`@farajabien/slug-store-core`](../core) - Core encoding/decoding functionality
- [`@farajabien/slug-store`](../react) - React hooks for client-side state

## 📄 License

MIT © [Faraja Bien](https://github.com/farajabien) 