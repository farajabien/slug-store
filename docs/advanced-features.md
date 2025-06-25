# Advanced Features: Full-Stack Persistence

This guide covers advanced features across Slug Store's **three pillars of persistence**: URL State, Server Caching, and Hybrid Architecture.

## 📦 NPM Packages

### Client-Side Packages
- **[@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core)** - Framework-agnostic core library
- **[@farajabien/slug-store-react](https://www.npmjs.com/package/@farajabien/slug-store-react)** - React hooks with Zustand-like API

### Server-Side Packages (NEW!)
- **[@farajabien/slug-store-server](https://www.npmjs.com/package/@farajabien/slug-store-server)** - Multi-backend server caching
- **[@farajabien/slug-store-frameworks](https://www.npmjs.com/package/@farajabien/slug-store-frameworks)** - Framework integrations (Next.js, Remix, Astro)

## 🌟 The Three Pillars

### 1. 🌐 URL Persistence (Client-Side)

Perfect for applications requiring instant shareability without backend complexity.

#### State Schema Validation with Zod

```typescript
import { z } from 'zod'
import { createStateValidator, encodeState, decodeState } from '@farajabien/slug-store-core'

// Define your state schema
const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  })
})

type UserProfile = z.infer<typeof UserProfileSchema>

// Create validator
const validator = createStateValidator(UserProfileSchema)

// Validate before encoding
const userState: UserProfile = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
}

try {
  const validatedState = validator.validateState(userState)
  const slug = await encodeState(validatedState, { compress: true })
  console.log('Encoded slug:', slug)
} catch (error) {
  console.error('Validation failed:', error.message)
}
```

#### Safe Validation

```typescript
// Safe validation with detailed error handling
const result = validator.safeValidateState(potentiallyInvalidState)

if (result.success) {
  const slug = await encodeState(result.data, { compress: true })
} else {
  console.error('Validation error:', result.error)
}
```

#### React Hook with Validation

```typescript
import { useSlugStore } from '@farajabien/slug-store-react'
import { z } from 'zod'

const TodoSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.string().datetime()
})

const TodoListSchema = z.object({
  todos: z.array(TodoSchema),
  filter: z.enum(['all', 'active', 'completed'])
})

type TodoState = z.infer<typeof TodoListSchema>

function TodoApp() {
  const { state, setState } = useSlugStore<TodoState>(
    { todos: [], filter: 'all' },
    { 
      compress: true,
      validator: createStateValidator(TodoListSchema)
    }
  )

  const addTodo = (text: string) => {
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setState({
      ...state,
      todos: [...state.todos, newTodo]
    })
  }

  return (
    <div>
      {/* Your todo UI */}
    </div>
  )
}
```

### 2. ⚡ Server Caching (Server-Side)

High-performance caching with multiple backend support and intelligent invalidation.

#### Basic Server Usage

```typescript
import { useServerSlugStore } from '@farajabien/slug-store-server'

// Next.js App Router example
export default async function DashboardPage({ params, searchParams }) {
  const { data, cached, stale, revalidate } = await useServerSlugStore(
    // Fetcher function
    async (params, searchParams) => {
      return await db.analytics.getMetrics({
        dateRange: searchParams.dateRange,
        userId: params.userId
      })
    },
    params,
    searchParams,
    {
      persist: 'redis',           // Backend adapter
      ttl: 1800,                 // 30 minutes cache
      staleWhileRevalidate: true, // Background updates
      fallback: true,            // Graceful error handling
      tags: ['analytics', `user:${params.userId}`] // Cache tags for invalidation
    }
  )

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      {cached && <Badge>Cached {stale ? '(stale)' : '(fresh)'}</Badge>}
      <AnalyticsChart data={data} />
    </div>
  )
}
```

#### Multi-Backend Configuration

```typescript
import { createAdapterChain, MemoryAdapter, RedisAdapter, FileAdapter } from '@farajabien/slug-store-server'

// Create fallback chain: Redis → Memory → File
const adapter = createAdapterChain([
  new RedisAdapter({ url: process.env.REDIS_URL }),
  new MemoryAdapter({ maxSize: 1000 }),
  new FileAdapter({ directory: './cache' })
])

const { data } = await useServerSlugStore(
  fetchExpensiveData,
  params,
  searchParams,
  { 
    adapter,  // Use custom adapter chain
    ttl: 3600,
    onCacheHit: (key, data) => console.log(`Cache hit: ${key}`),
    onCacheMiss: (key) => console.log(`Cache miss: ${key}`)
  }
)
```

#### Performance Monitoring

```typescript
const { data, getCacheInfo } = await useServerSlugStore(
  fetchData,
  params,
  searchParams,
  { persist: 'redis', ttl: 300 }
)

// Get detailed cache information
const cacheInfo = await getCacheInfo()
console.log({
  hitRate: cacheInfo.hitRate,
  missRate: cacheInfo.missRate,
  averageResponseTime: cacheInfo.avgResponseTime,
  totalRequests: cacheInfo.totalRequests
})
```

#### Cache Invalidation

```typescript
import { invalidateCache, revalidateCache } from '@farajabien/slug-store-server'

// Invalidate specific cache entries
await invalidateCache({
  tags: ['user:123'],           // By tags
  patterns: ['analytics:*'],    // By patterns
  keys: ['specific-cache-key']  // By specific keys
})

// Revalidate cache entries (fetch fresh data)
await revalidateCache({
  tags: ['analytics'],
  background: true  // Don't wait for completion
})
```

### 3. 🏗️ Hybrid Architecture

Combine URL state, server caching, and traditional databases for maximum flexibility.

#### E-commerce Example

```typescript
// app/products/page.tsx - Next.js App Router
import { useSlugStore } from '@farajabien/slug-store-react'
import { useServerSlugStore } from '@farajabien/slug-store-server'

export default async function ProductsPage({ params, searchParams }) {
  // Server-side: Cache expensive product queries
  const { data: products } = await useServerSlugStore(
    async (params, searchParams) => {
      return await db.products.findMany({
        where: buildProductFilters(searchParams),
        include: { categories: true, reviews: true }
      })
    },
    params,
    searchParams,
    {
      persist: 'redis',
      ttl: 900, // 15 minutes
      tags: ['products', 'catalog']
    }
  )

  return (
    <div>
      <ProductFilters />
      <ProductGrid products={products} />
    </div>
  )
}

// components/ProductFilters.tsx - Client component
'use client'

function ProductFilters() {
  // Client-side: URL state for UI preferences (shareable!)
  const { state: filters, setState: setFilters } = useSlugStore({
    category: 'all',
    priceRange: [0, 1000],
    sortBy: 'popularity',
    view: 'grid'
  }, { compress: true })

  const updateFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value })
    // URL automatically updates, filters become shareable
  }

  return (
    <div>
      <CategoryFilter 
        value={filters.category}
        onChange={(category) => updateFilter('category', category)}
      />
      <PriceRangeFilter
        value={filters.priceRange}
        onChange={(range) => updateFilter('priceRange', range)}
      />
      {/* Filters are persisted in URL, instantly shareable */}
    </div>
  )
}
```

#### Analytics Dashboard Example

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage({ params, searchParams }) {
  // Server caching for expensive analytics queries
  const { data: metrics, cached } = await useServerSlugStore(
    async (params, searchParams) => {
      const queries = await Promise.all([
        db.analytics.getPageViews(searchParams),
        db.analytics.getUserMetrics(searchParams),
        db.analytics.getConversionRates(searchParams)
      ])
      
      return {
        pageViews: queries[0],
        userMetrics: queries[1],
        conversions: queries[2],
        generatedAt: new Date().toISOString()
      }
    },
    params,
    searchParams,
    {
      persist: 'redis',
      ttl: 1800,
      staleWhileRevalidate: true,
      tags: ['analytics', 'dashboard']
    }
  )

  return (
    <div>
      <DashboardControls />
      <MetricsDisplay data={metrics} cached={cached} />
    </div>
  )
}

// components/DashboardControls.tsx
'use client'

function DashboardControls() {
  // URL state for dashboard configuration (shareable reports!)
  const { state: config, setState: setConfig } = useSlugStore({
    dateRange: 'last_30_days',
    metrics: ['pageviews', 'users', 'conversions'],
    breakdown: 'daily',
    filters: {}
  })

  return (
    <div>
      <DateRangePicker
        value={config.dateRange}
        onChange={(range) => setConfig({ ...config, dateRange: range })}
      />
      <MetricSelector
        selected={config.metrics}
        onChange={(metrics) => setConfig({ ...config, metrics })}
      />
      {/* Share dashboard configuration via URL */}
      <ShareButton />
    </div>
  )
}
```

## State Migration

Handle schema changes gracefully with built-in migration support.

### Basic Migration Setup

```typescript
import { createMigrationManager, migrationHelpers } from '@farajabien/slug-store-core'

// Create migration manager
const migrationManager = createMigrationManager('2.0.0')

// Add migrations
migrationManager.addMigration({
  version: '1.1.0',
  up: migrationHelpers.addField('createdAt', new Date().toISOString()),
  down: migrationHelpers.removeField('createdAt')
})

migrationManager.addMigration({
  version: '2.0.0',
  up: (state) => ({
    ...state,
    user: {
      id: state.userId,
      name: state.userName
    },
    // Remove old fields
    userId: undefined,
    userName: undefined
  }),
  down: (state) => ({
    ...state,
    userId: state.user.id,
    userName: state.user.name,
    user: undefined
  })
})

// Use with decoding
async function decodeWithMigration(slug: string) {
  const decodedState = await decodeState(slug)
  
  // Check if migration is needed
  const stateVersion = decodedState.version || '1.0.0'
  if (migrationManager.needsMigration(stateVersion)) {
    return migrationManager.migrate(decodedState, stateVersion)
  }
  
  return decodedState
}
```

### React Hook with Migration

```typescript
import { useSlugStore } from '@farajabien/slug-store-react'

function AppWithMigration() {
  const { state, setState } = useSlugStore(
    { version: '2.0.0', todos: [] },
    {
      migrationManager,
      onMigration: (fromVersion, toVersion) => {
        console.log(`Migrated from ${fromVersion} to ${toVersion}`)
      }
    }
  )

  return <div>{/* Your app */}</div>
}
```

## Server Adapters

Slug Store Server includes multiple backend adapters for different use cases.

### Memory Adapter (Development/Testing)

```typescript
import { MemoryAdapter } from '@farajabien/slug-store-server'

const adapter = new MemoryAdapter({
  maxSize: 1000,           // Maximum number of entries
  ttl: 3600,              // Default TTL in seconds
  cleanupInterval: 300,    // Cleanup interval in seconds
  onEviction: (key, value) => {
    console.log(`Evicted: ${key}`)
  }
})
```

### Redis Adapter (Production)

```typescript
import { RedisAdapter } from '@farajabien/slug-store-server'

const adapter = new RedisAdapter({
  url: process.env.REDIS_URL,
  keyPrefix: 'slug-store:',
  retryAttempts: 3,
  retryDelay: 1000,
  onConnect: () => console.log('Redis connected'),
  onError: (error) => console.error('Redis error:', error)
})
```

### File Adapter (Simple Persistence)

```typescript
import { FileAdapter } from '@farajabien/slug-store-server'

const adapter = new FileAdapter({
  directory: './cache',
  extension: '.json',
  encoding: 'utf8',
  atomic: true,           // Use atomic writes
  compression: 'gzip'     // Optional compression
})
```

### URL Adapter (Serverless/Edge)

```typescript
import { URLAdapter } from '@farajabien/slug-store-server'

const adapter = new URLAdapter({
  compress: true,
  encrypt: true,
  secretKey: process.env.ENCRYPTION_KEY
})
```

## Framework Integrations

### Next.js App Router

```typescript
// app/api/revalidate/route.ts
import { revalidateCache } from '@farajabien/slug-store-server'

export async function POST(request: Request) {
  const { tags } = await request.json()
  
  await revalidateCache({ tags })
  
  return Response.json({ revalidated: true })
      }

// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return <div>Loading dashboard data...</div>
}
```

### Remix

```typescript
// app/routes/dashboard.tsx
import { useServerSlugStore } from '@farajabien/slug-store-server'

export const loader = async ({ request, params }) => {
  const url = new URL(request.url)
  const searchParams = Object.fromEntries(url.searchParams)
  
  const { data } = await useServerSlugStore(
    fetchDashboardData,
    params,
    searchParams,
    { persist: 'redis', ttl: 900 }
  )
  
  return json({ data })
}
```

### Astro

```typescript
---
// src/pages/products.astro
import { useServerSlugStore } from '@farajabien/slug-store-server'

const { data: products } = await useServerSlugStore(
  fetchProducts,
  Astro.params,
  Object.fromEntries(Astro.url.searchParams),
  { persist: 'memory', ttl: 600 }
)
---

<html>
  <body>
    <ProductList products={products} />
  </body>
</html>
```

## Performance Optimization

### Preloading and Prefetching

```typescript
import { preloadCache, prefetchCache } from '@farajabien/slug-store-server'

// Preload critical data
await preloadCache([
  { key: 'user:123', fetcher: () => fetchUser('123'), ttl: 3600 },
  { key: 'settings', fetcher: fetchSettings, ttl: 1800 }
])

// Prefetch likely-needed data
prefetchCache([
  { key: 'recommendations:123', fetcher: () => fetchRecommendations('123') }
])
```

### Batch Operations

```typescript
import { batchGet, batchSet, batchInvalidate } from '@farajabien/slug-store-server'

// Batch get multiple cache entries
const results = await batchGet([
  'user:123',
  'settings:123',
  'preferences:123'
])

// Batch set multiple entries
await batchSet([
  { key: 'user:123', value: userData, ttl: 3600 },
  { key: 'settings:123', value: settingsData, ttl: 1800 }
])

// Batch invalidate
await batchInvalidate(['user:*', 'settings:*'])
```

### Monitoring and Observability

```typescript
import { createMetricsCollector } from '@farajabien/slug-store-server'

const metrics = createMetricsCollector({
  onCacheHit: (key, duration) => {
    // Log to your monitoring service
    logger.info('cache.hit', { key, duration })
    },
  onCacheMiss: (key, duration) => {
    logger.info('cache.miss', { key, duration })
  },
  onError: (error, operation) => {
    logger.error('cache.error', { error: error.message, operation })
  }
})

// Use with server store
const { data } = await useServerSlugStore(
  fetchData,
  params,
  searchParams,
  { 
    persist: 'redis',
    metrics,
    ttl: 300
  }
)
```

This advanced guide showcases how Slug Store's three-pillar architecture enables you to build sophisticated applications that scale from simple prototypes to enterprise-grade systems without architectural rewrites. 