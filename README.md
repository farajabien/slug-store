# Slug Store: The No-Database Revolution 🚀

**Building persistent apps with no database has never been easier.** Slug Store bridges the gap between ephemeral state management and complex database architectures - giving you **more than state, not quite a database, but with true persistence and infinite scalability**.

Perfect for the modern era where **simplicity meets persistence**.

## 🌟 **NEW: Server-Side Persistence** 

**Slug Store v2 is here!** Now with **server-side caching and persistence** alongside our revolutionary client-side URL state management.

```tsx
// Client-side: URL state management
const { state, setState } = useSlugStore({ items: [] })

// Server-side: Multi-backend caching  
const { data, cached } = await useServerSlugStore(
  fetchData, params, searchParams, 
  { persist: 'redis', ttl: 300 }
)
```

## 🎯 What is Slug Store?

Slug Store revolutionizes how we think about data persistence in web applications by providing **multiple layers of intelligent state management**:

### 🔄 The Three Pillars

1. **🌐 URL Persistence** (Client-side)
   - State lives in URLs, instantly shareable
   - No database needed for application state
   - Perfect for demos, prototypes, and stateless apps

2. **⚡ Server Caching** (Server-side)  
   - Intelligent multi-backend caching (Redis, Memory, File)
   - Stale-while-revalidate for optimal performance
   - Framework-agnostic server-side persistence

3. **🔗 Hybrid Architecture** (Full-stack)
   - Combine both for maximum flexibility
   - User data in database, app state in URLs
   - Server cache for performance, URLs for shareability

### 🎯 The Sweet Spot
```
Ephemeral State ←→ [SLUG STORE] ←→ Full Database
                    ↑
               Perfect Balance:
               • Instant persistence (URLs)
               • High performance (Server cache)
               • Zero infrastructure (for simple apps)
               • Infinite scalability (for complex apps)
```

## 🚀 Who Should Use Slug Store?

### 👨‍💻 **Solo Developers & Startups**
- **AI/ChatGPT clones**: Every conversation is a shareable URL
- **Creative tools**: Share designs, configs, and creations instantly
- **Demos & prototypes**: Zero backend, maximum impact
- **MVP development**: Focus on features, not infrastructure

### 🏢 **Growing Companies**
- **SaaS dashboards**: Shareable filtered views and configurations
- **E-commerce**: Persistent shopping carts across devices
- **Analytics platforms**: Shareable reports and visualizations
- **Collaboration tools**: URL-based state sharing

### 🏗️ **Enterprise Applications**
- **Complex workflows**: Multi-step processes with URL checkpoints
- **A/B testing**: Configuration sharing via URLs
- **Customer support**: Reproducible issue states
- **Training platforms**: Shareable lesson states and progress

## 🔥 Why Slug Store?

### ❌ **The Problem**
Modern web development forces you to choose:

- **Client State**: Fast but lost on refresh, not shareable
- **Server State**: Persistent but requires complex infrastructure
- **Databases**: Overkill for application state, slow setup
- **Local Storage**: Device-specific, not shareable, limited

### ✅ **The Slug Store Solution**

**🎯 For Simple Apps**: 100% URL-based state, zero backend required
```tsx
// Entire app state in URLs - instantly shareable!
const { state, setState } = useSlugStore({
  chatMessages: [],
  settings: { model: 'gpt-4', temperature: 0.7 }
})
```

**⚡ For Performance Apps**: Server caching with URL fallback
```tsx
// Server caching for speed, URLs for sharing
const { data, cached } = await useServerSlugStore(
  fetchExpensiveData,
  params,
  searchParams,
  { persist: 'redis', staleWhileRevalidate: true }
)
```

**🏗️ For Enterprise Apps**: Hybrid architecture with intelligent persistence
```tsx
// User data in DB, app state in URLs, cache for performance
const userData = await db.users.find(userId)
const { state } = useSlugStore(appState)
const { data } = await useServerSlugStore(fetchReports, params, searchParams)
```

## 📦 Packages & Installation

### 🌐 **Client-Side State** (React)
```bash
npm install @farajabien/slug-store-react
```

```tsx
import { useSlugStore } from '@farajabien/slug-store-react'

function ChatApp() {
  const { state, setState } = useSlugStore({
    messages: [],
    model: "gpt-4"
  }, { compress: true, encrypt: true })
  
  // ✨ Auto-saved to URL, instantly shareable!
  return <ChatInterface messages={state.messages} />
}
```

### ⚡ **Server-Side Caching** (NEW!)
```bash
npm install @farajabien/slug-store-server
```

```tsx
// Next.js App Router example
export default async function UserDashboard({ params, searchParams }) {
  const { data: userData, cached, stale } = await useServerSlugStore(
    async (params, searchParams) => {
      return await prisma.user.findMany({
        where: { status: searchParams.filter },
        skip: (parseInt(searchParams.page) - 1) * 10
      })
    },
    params,
    searchParams,
    {
      persist: 'redis',           // Redis, Memory, File, URL adapters
      ttl: 600,                  // 10 minutes
      staleWhileRevalidate: true // Background updates
    }
  )

  return (
    <div>
      {cached && <span>⚡ From cache</span>}
      {stale && <span>🔄 Updating...</span>}
      <UserList users={userData} />
    </div>
  )
}
```

### 🔧 **Core Library** (Framework Agnostic)
```bash
npm install @farajabien/slug-store-core
```

```javascript
import { encodeState, decodeState } from '@farajabien/slug-store-core'

// Store state in URL
const state = { items: ['apple', 'banana'], count: 2 }
const slug = await encodeState(state, { compress: true })

// Restore state from URL  
const urlSlug = new URLSearchParams(window.location.search).get('state')
const restoredState = await decodeState(urlSlug)
```

## 🎛️ Server Persistence Backends

### 🧠 **Memory** (Development)
```tsx
{ persist: 'memory', maxSize: 1000 }
```
- ⚡ Sub-millisecond access
- 🔄 Auto-cleanup of expired entries
- 💾 Lost on restart (perfect for dev)

### 🔴 **Redis** (Production)
```tsx
{ persist: 'redis', host: 'localhost', ttl: 3600 }
```
- ⚡ 1-5ms access time
- 🌐 Distributed caching
- 📈 Production-ready scaling

### 📁 **File System**
```tsx
{ persist: 'file', baseDir: './cache', maxFiles: 10000 }
```
- 💾 Persistent across restarts
- 📊 Good for analytics data
- 🔧 Simple setup

### 🔗 **URL** (Shareable)
```tsx
{ persist: 'url', compress: true, encrypt: true }
```
- 📤 Instantly shareable
- 🗜️ Automatic compression
- 🔐 Optional encryption

### ⛓️ **Fallback Chain**
```tsx
{ persist: ['memory', 'redis', 'file'] }
```
- 🛡️ Automatic failover
- ⚡ Best performance with redundancy

## 💡 Real-World Use Cases

### 🤖 **AI Applications**
```tsx
// ChatGPT Clone with persistence
const { state, setState } = useSlugStore({
  conversation: [],
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant'
})

// Every conversation becomes a shareable link!
// No database needed for the entire app
```

### 📊 **Analytics Dashboard**
```tsx
// Server caching for expensive queries
const { data: analytics } = await useServerSlugStore(
  async (params, searchParams) => {
    return await runExpensiveAnalyticsQuery(searchParams)
  },
  params,
  searchParams,
  { persist: 'redis', ttl: 1800 } // 30 min cache
)

// URL state for UI preferences
const { state: filters } = useSlugStore({
  dateRange: 'last_30_days',
  metrics: ['revenue', 'users'],
  breakdown: 'daily'
})
```

### 🛒 **E-commerce Cart**
```tsx
// Cart state in URL - works across devices!
const { state: cart } = useSlugStore({
  items: [],
  coupon: null,
  shippingAddress: null
})

// Product data cached on server
const { data: products } = await useServerSlugStore(
  fetchProducts,
  { category: params.category },
  searchParams,
  { persist: 'memory', ttl: 300 }
)
```

## 📋 Package Status

### ✅ **Production Ready**
- **@farajabien/slug-store-core** - Framework-agnostic encoding/decoding
- **@farajabien/slug-store-react** - React hooks with Zustand-like API
- **@farajabien/slug-store-server** - Multi-backend server caching (**NEW!**)

### 🔧 **Development Tools**
- **@workspace/ui** - Shared component library
- **@workspace/eslint-config** - Shared linting rules
- **@workspace/typescript-config** - TypeScript configurations

### 🌐 **Live Demo**
**Try it**: [slugstore.fbien.com](https://slugstore.fbien.com)

## 🏗️ Monorepo Structure
```
slug-store/
├── packages/
│   ├── core/          # ✅ Core encoding/decoding library
│   ├── react/         # ✅ React hooks with Zustand-like API
│   ├── server/        # 🆕 Server-side persistence & caching
│   ├── ui/            # ✅ Shared UI components
│   ├── eslint-config/ # ✅ Shared ESLint configuration
│   └── typescript-config/ # ✅ Shared TypeScript configuration
├── apps/
│   └── web/           # ✅ Full-featured Next.js demo app
├── docs/              # ✅ Comprehensive documentation
└── examples/          # 📚 Real-world usage examples
```

## 🌟 Advanced Features

### 🗜️ **Smart Compression**
Automatic LZ-String compression reduces URL size by 30-70% for large state objects.

### 🔐 **Secure Encryption**
Password-based encryption using Web Crypto API for sensitive data protection.

### ⚡ **Framework Agnostic**
Works with React, Vue, Angular, Next.js, Remix, Astro, or vanilla JavaScript.

### 🔄 **State Migration**
Handle schema changes gracefully with built-in migration support.

### 📊 **Performance Monitoring**
Built-in analytics for cache hit rates, performance metrics, and usage patterns.

### 🗄️ **Multiple Persistence Layers**
Choose from Memory, Redis, File, URL, or create custom adapters.

### 🛡️ **Error Resilience**
Graceful fallbacks, stale-while-revalidate, and automatic retry logic.

## 🚀 Migration Guide

### From v1 (Client-only) to v2 (Hybrid)

**v1: Client-side only**
```tsx
import { useSlugStore } from '@farajabien/slug-store-react'
const { state, setState } = useSlugStore({ items: [] })
```

**v2: Add server caching**
```tsx
// Keep client-side state for UI preferences
import { useSlugStore } from '@farajabien/slug-store-react'
const { state: uiState } = useSlugStore({ filters: {}, view: 'grid' })

// Add server caching for data
import { useServerSlugStore } from '@farajabien/slug-store-server'
const { data } = await useServerSlugStore(fetchItems, params, searchParams)
```

**Benefits**: 
- ✅ Zero breaking changes
- ⚡ Instant performance improvement
- 🔄 Backwards compatibility
- 📈 Scalable architecture

## 🤝 Contributing

We love contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start
```bash
git clone https://github.com/farajabien/slug-store
cd slug-store
pnpm install
pnpm build
pnpm test
```

## 🐛 Support

- **[GitHub Issues](https://github.com/farajabien/slug-store/issues)** - Bug reports & feature requests
- **[GitHub Discussions](https://github.com/farajabien/slug-store/discussions)** - Questions & ideas
- **[Documentation](https://slugstore.fbien.com)** - Complete guides & API reference

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with ❤️ for the developer community
- Inspired by the need for simple, shareable state persistence
- Made possible by modern web APIs and the open source community

---

**Made by [Faraja Bien](https://github.com/farajabien)**  
**Star us on [GitHub](https://github.com/farajabien/slug-store) ⭐**