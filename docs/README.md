# Slug Store Documentation 📚

Welcome to the comprehensive documentation for **Slug Store** - the revolutionary state persistence library that bridges the gap between ephemeral client state and complex database architectures.

## 🎯 **What is Slug Store?**

Slug Store is **more than state management, not quite a database, but with true persistence and infinite scalability**. It provides multiple layers of intelligent state management that work seamlessly together:

### 🌟 **The Three Pillars**

1. **🌐 URL Persistence** (Client-side)
   - State encoded directly into URLs
   - Instantly shareable across devices and users
   - Zero backend infrastructure required
   - Perfect for demos, prototypes, and stateless applications

2. **⚡ Server Caching** (Server-side)
   - Multi-backend persistence (Redis, Memory, File, URL)
   - Intelligent caching with TTL and stale-while-revalidate
   - Framework-agnostic server-side integration
   - Production-ready performance optimization

3. **🔗 Hybrid Architecture** (Full-stack)
   - Combine URL state + server caching for maximum flexibility
   - User data in traditional databases, app state in URLs
   - Server cache for performance, URLs for shareability
   - Enterprise-ready scalability

## 🚀 **Who Should Use Slug Store?**

### 👨‍💻 **Solo Developers & Startups**
**Perfect for rapid prototyping and MVP development**

- **AI/LLM Applications**: ChatGPT clones where every conversation is a shareable URL
- **Creative Tools**: Design apps, configuration builders, code playgrounds
- **Demo Applications**: Showcase your ideas without backend complexity
- **Portfolio Projects**: Stand out with instantly shareable state

**Why Slug Store?**
- ⚡ Zero backend setup required
- 🚀 Deploy anywhere (Vercel, Netlify, GitHub Pages)
- 💰 No database costs
- 🔗 Built-in sharing functionality

### 🏢 **Growing Companies**
**Scale efficiently with intelligent persistence**

- **SaaS Dashboards**: Shareable filtered views and custom configurations
- **E-commerce Platforms**: Persistent carts that work across devices
- **Analytics Tools**: Shareable reports and data visualizations
- **Collaboration Apps**: URL-based state sharing between team members

**Why Slug Store?**
- 📈 Scale from prototype to production seamlessly
- 💡 Reduce infrastructure complexity
- 🔄 Zero migration needed from simple to complex
- 🛡️ Built-in error resilience and fallbacks

### 🏗️ **Enterprise Applications**
**Enterprise-grade persistence with maximum flexibility**

- **Complex Workflows**: Multi-step processes with URL checkpoints
- **A/B Testing**: Share configurations and experimental states
- **Customer Support**: Reproducible issue states for debugging
- **Training Platforms**: Trackable lesson progress and shareable states

**Why Slug Store?**
- 🔐 Enterprise security with encryption support
- 📊 Built-in analytics and performance monitoring
- 🌐 Multi-backend persistence for redundancy
- 🔧 Custom adapters for existing infrastructure

## 📦 **Package Ecosystem**

### 🌐 **Client-Side State Management**

#### `@farajabien/slug-store` ✅ Production Ready
React hooks with Zustand-like simplicity

```bash
npm install @farajabien/slug-store
```

**Features:**
- `useSlugStore()` - useState-like hook with URL persistence
- `create()` - Zustand-like store creator with URL synchronization
- Automatic compression and optional encryption
- Debounced URL updates for performance
- TypeScript support with full type inference

**Perfect for:**
- React applications requiring shareable state
- URL-based application state management
- Demo applications and prototypes

#### `@farajabien/slug-store-core` ✅ Production Ready
Framework-agnostic core functionality

```bash
npm install @farajabien/slug-store-core
```

**Features:**
- State ⇄ URL slug conversion
- LZ-String compression (30-70% size reduction)
- Web Crypto API encryption
- Schema migration support
- Error handling and validation

**Perfect for:**
- Vue, Angular, Svelte, or vanilla JavaScript apps
- Custom framework integrations
- Server-side rendering applications

### ⚡ **Server-Side Persistence** 

#### `@farajabien/slug-store-server` 🆕 Production Ready
Multi-backend server caching and persistence

```bash
npm install @farajabien/slug-store-server
```

**Features:**
- Multiple persistence backends (Redis, Memory, File, URL)
- Stale-while-revalidate caching patterns
- Automatic fallback chains
- Framework-agnostic (Next.js, Remix, Astro, Express)
- Built-in performance monitoring

**Perfect for:**
- High-performance server-side applications
- API caching and optimization
- Hybrid client-server architectures

### 🔧 **Development Tools**

#### `@workspace/ui` - Shared Component Library
Production-ready UI components built on Radix UI

#### `@workspace/eslint-config` - Shared Linting Rules
Consistent code quality across the entire ecosystem

#### `@workspace/typescript-config` - TypeScript Configurations
Optimized TypeScript settings for different use cases

## 🏗️ **Architecture Patterns**

### 🎯 **Pattern 1: Pure URL State** (Simplest)
Perfect for demos, prototypes, and simple applications

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function SimpleApp() {
  const { state, setState } = useSlugStore({
    tasks: [],
    filter: 'all',
    theme: 'light'
  })
  
  // All state is in URL - instantly shareable!
  // No backend required
}
```

**Use Cases:**
- Todo applications
- Configuration builders
- Design tools
- AI chat interfaces

### ⚡ **Pattern 2: Server Caching** (Performance)
Add server-side caching for expensive operations

```tsx
import { useServerSlugStore } from '@farajabien/slug-store-server'

// Server component (Next.js App Router)
export default async function DashboardPage({ params, searchParams }) {
  const { data, cached, stale } = await useServerSlugStore(
    async (params, searchParams) => {
      // Expensive database query
      return await runAnalyticsQuery(searchParams)
    },
    params,
    searchParams,
    { persist: 'redis', ttl: 1800 } // 30 min cache
  )

  return <AnalyticsDashboard data={data} />
}
```

**Use Cases:**
- Analytics dashboards
- E-commerce product listings
- API responses with heavy computation
- Database query optimization

### 🔗 **Pattern 3: Hybrid Architecture** (Enterprise)
Combine URL state + server caching + traditional database

```tsx
// Client: UI state in URLs
const { state: uiState } = useSlugStore({
  filters: { category: 'electronics', priceRange: [0, 1000] },
  view: 'grid',
  sortBy: 'popularity'
})

// Server: Data caching for performance
const { data: products } = await useServerSlugStore(
  async (params, searchParams) => {
    return await db.products.findMany({
      where: buildWhereClause(searchParams),
      orderBy: buildOrderBy(searchParams)
    })
  },
  params,
  searchParams,
  { persist: 'redis', ttl: 300 }
)

// Database: User data and relationships
const user = await db.users.findUnique({ where: { id: userId }})
```

**Use Cases:**
- Large-scale SaaS applications
- E-commerce platforms
- Content management systems
- Enterprise workflow applications

## 🛠️ **Server Persistence Backends**

### 🧠 **Memory Adapter** (Development)
In-memory caching for development and testing

```tsx
{
  persist: 'memory',
  maxSize: 1000,
  cleanupInterval: 60000
}
```

**Characteristics:**
- ⚡ Sub-millisecond access time
- 💾 Lost on process restart
- 🔄 Automatic cleanup of expired entries
- 🧪 Perfect for development and testing

### 🔴 **Redis Adapter** (Production)
High-performance distributed caching

```tsx
{
  persist: 'redis',
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  ttl: 3600
}
```

**Characteristics:**
- ⚡ 1-5ms access time (network dependent)
- 🌐 Distributed caching across multiple servers
- 📈 Production-ready with clustering support
- 🔄 Automatic expiration and eviction

### 📁 **File System Adapter** (Persistent)
Disk-based persistence for single-server deployments

```tsx
{
  persist: 'file',
  baseDir: './cache',
  maxFiles: 10000,
  compression: true
}
```

**Characteristics:**
- 💾 Survives process restarts
- 📊 Good for analytics and historical data
- 🔧 Simple setup with no external dependencies
- 🗜️ Optional compression for storage efficiency

### 🔗 **URL Adapter** (Shareable)
Leverage core URL encoding for server-side caching

```tsx
{
  persist: 'url',
  compress: true,
  encrypt: true,
  password: 'encryption-key'
}
```

**Characteristics:**
- 📤 Instantly shareable cache entries
- 🗜️ Automatic compression via LZ-String
- 🔐 Optional encryption for sensitive data
- 🔗 Perfect for shareable configurations

### ⛓️ **Fallback Chain** (Reliability)
Multiple backends with automatic failover

```tsx
{
  persist: ['memory', 'redis', 'file'],
  fallbackStrategy: 'write-all-read-first'
}
```

**Characteristics:**
- 🛡️ Automatic failover on backend failures
- ⚡ Read from fastest available backend
- 💾 Write to all backends for redundancy
- 🔄 Self-healing when backends recover

## 💡 **Real-World Examples**

### 🤖 **AI Chat Application**
```tsx
// Client: Conversation state in URL
const { state: chat } = useSlugStore({
  messages: [],
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant',
  temperature: 0.7
})

// Server: Model responses cached for reuse
const { data: response } = await useServerSlugStore(
  async (params, searchParams) => {
    return await openai.chat.completions.create({
      model: searchParams.model,
      messages: JSON.parse(searchParams.messages)
    })
  },
  params,
  searchParams,
  { persist: 'redis', ttl: 86400 } // 24 hour cache
)
```

**Benefits:**
- 🔗 Every conversation is shareable via URL
- ⚡ Cached responses reduce API costs
- 📱 Works across devices seamlessly
- 🚀 Zero database setup required

### 📊 **Analytics Dashboard**
```tsx
// Client: UI filters and preferences in URL
const { state: filters } = useSlugStore({
  dateRange: 'last_30_days',
  metrics: ['revenue', 'users', 'conversions'],
  breakdown: 'daily',
  segmentation: 'traffic_source'
})

// Server: Expensive analytics queries cached
const { data: analytics, stale } = await useServerSlugStore(
  async (params, searchParams) => {
    return await runAnalyticsQuery({
      dateRange: searchParams.dateRange,
      metrics: searchParams.metrics,
      breakdown: searchParams.breakdown
    })
  },
  params,
  searchParams,
  { 
    persist: 'redis',
    ttl: 1800, // 30 minutes
    staleWhileRevalidate: true // Background updates
  }
)
```

**Benefits:**
- 🔗 Shareable dashboard configurations
- ⚡ Fast loading with server-side caching
- 🔄 Background updates for fresh data
- 💰 Reduced database query costs

### 🛒 **E-commerce Platform**
```tsx
// Client: Shopping cart in URL (works across devices!)
const { state: cart } = useSlugStore({
  items: [],
  couponCode: null,
  shippingAddress: null,
  paymentMethod: null
})

// Server: Product catalog cached for performance
const { data: products } = await useServerSlugStore(
  async (params, searchParams) => {
    return await db.products.findMany({
      where: {
        category: params.category,
        priceRange: searchParams.priceRange,
        inStock: true
      },
      include: { reviews: true, variants: true }
    })
  },
  params,
  searchParams,
  { persist: 'redis', ttl: 300 } // 5 minutes
)

// Database: User accounts and order history
const user = await db.users.findUnique({
  where: { id: userId },
  include: { orders: true, preferences: true }
})
```

**Benefits:**
- 🛒 Cart persists across device switches
- 🔗 Share carts with family/friends
- ⚡ Fast product browsing with caching
- 💾 Traditional user data in database

## 🌟 **Advanced Features**

### 🗜️ **Smart Compression**
Automatic payload optimization for large state objects

```tsx
const { state } = useSlugStore(largeState, {
  compress: true, // Enables LZ-String compression
  threshold: 1000 // Only compress if > 1000 chars
})
```

### 🔐 **Secure Encryption**
Protect sensitive data with Web Crypto API

```tsx
const { state } = useSlugStore(sensitiveData, {
  encrypt: true,
  password: 'user-provided-password'
})
```

### 🔄 **Schema Migration**
Handle state structure changes gracefully

```tsx
const { state } = useSlugStore(initialState, {
  version: 2,
  migrations: {
    1: (oldState) => ({ ...oldState, newField: 'default' }),
    2: (oldState) => ({ ...oldState, renamedField: oldState.oldField })
  }
})
```

### 📊 **Performance Monitoring**
Built-in analytics for cache performance

```tsx
const { data, getCacheInfo } = await useServerSlugStore(fetcher, params, searchParams)

const cacheInfo = await getCacheInfo()
console.log(cacheInfo)
// {
//   key: "abc123",
//   size: 1024,
//   hit: true,
//   timestamp: 1698765432000,
//   backend: "redis"
// }
```

## 🚀 **Migration Strategies**

### From Traditional State Management
```tsx
// Before: Lost on refresh
const [state, setState] = useState({ items: [] })

// After: Persistent in URL
const { state, setState } = useSlugStore({ items: [] })
```

### From Database-Heavy Applications
```tsx
// Before: Everything in database
const items = await db.items.findMany({ where: filters })

// After: Cache expensive queries
const { data: items } = await useServerSlugStore(
  () => db.items.findMany({ where: filters }),
  params,
  searchParams,
  { persist: 'redis', ttl: 300 }
)
```

### From Client-Only to Full-Stack
```tsx
// Phase 1: Client-side URL state
const { state } = useSlugStore(appState)

// Phase 2: Add server caching
const { data } = await useServerSlugStore(fetcher, params, searchParams)

// Phase 3: Hybrid architecture
// Client state + Server cache + Database
```

## 📚 **Quick Links**

### 📘 **Getting Started**
- [Installation Guide](./installation.md)
- [Quick Start Tutorial](./quick-start.md)
- [Basic Examples](./examples/basic.md)

### 🔧 **API Reference**
- [Core API](./api/core.md)
- [React Hooks](./api/react.md)
- [Server Functions](./api/server.md)

### 🎯 **Use Cases**
- [AI Applications](./use-cases/ai.md)
- [E-commerce](./use-cases/ecommerce.md)
- [Analytics Dashboards](./use-cases/analytics.md)
- [Collaboration Tools](./use-cases/collaboration.md)

### 🌟 **Advanced Topics**
- [Performance Optimization](./advanced/performance.md)
- [Security Best Practices](./advanced/security.md)
- [Custom Adapters](./advanced/custom-adapters.md)
- [Migration Strategies](./advanced/migrations.md)

### ❓ **Help & Support**
- [FAQ](./faq.md)
- [Troubleshooting](./troubleshooting.md)
- [GitHub Issues](https://github.com/farajabien/slug-store/issues)
- [GitHub Discussions](https://github.com/farajabien/slug-store/discussions)

## 🤝 **Contributing**

We welcome contributions! See our [Contributing Guide](../CONTRIBUTING.md) for details on:

- Code contribution guidelines
- Development setup
- Testing requirements
- Documentation standards
- Release process

## 📄 **License**

MIT License - see [LICENSE](../LICENSE) for details.

---

**Built with ❤️ by [Faraja Bien](https://github.com/farajabien)** 