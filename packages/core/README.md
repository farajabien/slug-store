# @farajabien/slug-store-core

[![npm version](https://badge.fury.io/js/%40farajabien%2Fslug-store-core.svg)](https://badge.fury.io/js/%40farajabien%2Fslug-store-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@farajabien/slug-store-core)](https://bundlephobia.com/package/@farajabien/slug-store-core)

> **Universal state persistence core - URLs, offline storage, and unified API**  
> The enhanced foundation that powers `@farajabien/slug-store` with zero configuration.

## 🚀 **v3.0 - Unified API**

The core package provides universal state persistence that works everywhere - browsers, servers, edge functions, and any JavaScript environment.

## 🎯 **Perfect for React v3.1+ Dev Tools**

This core package powers the new dev tools in the React package:

```tsx
// React package uses these core functions under the hood
import { slug, getSlugData, copySlug } from '@farajabien/slug-store'

// Which internally use:
import { decodeState, encodeState } from '@farajabien/slug-store-core'
```

## 📦 **Installation**

```bash
npm install @farajabien/slug-store-core
```

## 🎯 **Quick Start**

### **Unified API - One Function for Everything**

```typescript
import { slugStore, loadSlugStore } from '@farajabien/slug-store-core'

// Save state with multiple persistence options
const result = await slugStore('user-prefs', { theme: 'dark' }, {
  url: true,        // Share via URL
  offline: true,    // Store offline
  db: {             // Sync to database
    endpoint: '/api/preferences',
    method: 'POST'
  }
})

console.log(result.shareableUrl) // "https://myapp.com?state=N4IgZg9..."

// Load state with automatic fallback: URL → Offline → Default
const state = await loadSlugStore('user-prefs', { theme: 'light' }, {
  url: true,
  offline: true
})
```

### **Server-Side Usage (Next.js, Node, Edge)**

```typescript
import { decodeState, encodeState } from '@farajabien/slug-store-core'

// API Route
export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('state')
  
  if (slug) {
    try {
      const data = await decodeState(slug)
      return Response.json({ success: true, data })
    } catch (error) {
      return Response.json({ success: false, error: 'Invalid state' })
    }
  }
  
  return Response.json({ success: false, error: 'No state provided' })
}

// Server Component
export default async function ServerPage({ searchParams }) {
  let data = null
  
  if (searchParams.state) {
    try {
      data = await decodeState(searchParams.state)
    } catch (error) {
      console.warn('Failed to decode state:', error)
    }
  }
  
  return <div>Server-rendered with: {JSON.stringify(data)}</div>
}
```

### **Edge Functions & Workers**

```typescript
import { encodeState, decodeState } from '@farajabien/slug-store-core'

// Cloudflare Worker / Vercel Edge
export default async function handler(request: Request) {
  const url = new URL(request.url)
  const data = { user: 'john', preferences: { theme: 'dark' } }

  // Encode state for URL sharing
  const encoded = await encodeState(data, { compress: true })

  // Generate shareable URL
  url.searchParams.set('state', encoded)
  
  return new Response(`Shareable URL: ${url.toString()}`)
}
```

### **Offline Storage**

```typescript
import { saveOffline, loadOffline, clearOffline } from '@farajabien/slug-store-core'

// Save state offline with automatic storage fallback
await saveOffline('todos', [{ id: 1, text: 'Learn Slug Store' }], {
  storage: 'indexeddb',  // 'indexeddb' | 'localstorage' | 'memory'
  encryption: true,
  password: 'secret',
  ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
})

// Load state from offline storage
const todos = await loadOffline('todos', {
  storage: 'indexeddb',
  encryption: true,
  password: 'secret'
})

// Clear offline data
await clearOffline('todos')
```

### **State Encoding/Decoding**

```typescript
import { encodeState, decodeState, validateSlug, getSlugInfo } from '@farajabien/slug-store-core'

// Encode state for URL sharing
const encoded = await encodeState({ filters: { category: 'tech' } }, {
  compress: true,    // Reduce URL length
  encrypt: true,     // Encrypt sensitive data
  password: 'secret'
})

// Validate before decoding
if (validateSlug(encoded)) {
  // Get metadata without decoding
  const info = getSlugInfo(encoded)
  console.log(`Size: ${info.size}, Compressed: ${info.compressed}`)
  
  // Decode state from URL
  const state = await decodeState(encoded, {
    password: 'secret'
  })
}
```

## 🔧 **API Reference**

### **`slugStore(key, state, options?)`**

Unified function for saving state with multiple persistence options.

```typescript
const result = await slugStore(key, state, {
  url?: boolean,                   // URL persistence (default: true)
  offline?: boolean | OfflineOptions, // Offline storage
  db?: DbOptions,                  // Database sync
  compress?: boolean,              // Enable compression
  encrypt?: boolean,               // Enable encryption
  password?: string                // Encryption password
})
```

**Returns:**
```typescript
{
  slug?: string,          // Encoded state for URL
  state: T,              // The saved state
  shareableUrl?: string, // Full URL with state (if url: true and browser)
  dbKey?: string,        // Database key (if db: true)
  offline?: boolean      // Offline save success (if offline: true)
}
```

### **`loadSlugStore(key, defaultState, options?)`**

Load state with automatic fallback chain: URL → Offline → Default.

```typescript
const state = await loadSlugStore(key, defaultState, {
  url?: boolean,
  offline?: boolean | OfflineOptions,
  password?: string
})
```

### **Offline Storage Functions**

#### **`saveOffline(key, state, options?)`**
Save state to offline storage with automatic fallback (IndexedDB → localStorage → memory).

```typescript
await saveOffline('key', state, {
  storage?: 'indexeddb' | 'localstorage' | 'memory',
  encryption?: boolean,
  password?: string,
  ttl?: number // Time to live in milliseconds
})
```

#### **`loadOffline(key, options?)`**
Load state from offline storage.

```typescript
const state = await loadOffline('key', {
  storage?: 'indexeddb' | 'localstorage' | 'memory',
  encryption?: boolean,
  password?: string
})
```

#### **`clearOffline(key, options?)` / `listOfflineKeys(options?)`**
Clear specific offline data or list all keys.

```typescript
await clearOffline('key', { storage?: 'indexeddb' })
const keys = await listOfflineKeys({ storage?: 'indexeddb' })
```

### **State Encoding Functions**

#### **`encodeState(state, options?)`**
Encode state for URL sharing or storage.

```typescript
const encoded = await encodeState(state, {
  compress?: boolean,    // LZ-string compression
  encrypt?: boolean,     // AES-GCM encryption
  password?: string,     // Encryption password
  version?: string       // Format version (default: '1.0')
})
```

#### **`decodeState(encoded, options?)`**
Decode state from URL or storage.

```typescript
const state = await decodeState(encoded, {
  password?: string,              // Decryption password
  validateVersion?: boolean       // Validate format version (default: true)
})
```

#### **`validateSlug(slug)` / `getSlugInfo(slug)`**
Validate and inspect encoded state.

```typescript
if (validateSlug(slug)) {
  const info = getSlugInfo(slug)
  // { version, compressed, encrypted, size, originalSize? }
}
```

## 🎯 **Use Cases**

### **Use Case 1: URL Sharing Only**
```typescript
const result = await slugStore('filters', { category: 'tech' }, {
  url: true,
  compress: true
})
// Returns: { slug: 'abc123', shareableUrl: 'https://...' }
```

### **Use Case 2: Offline Storage Only**
```typescript
await slugStore('preferences', { theme: 'dark' }, {
  url: false,
  offline: { storage: 'indexeddb', ttl: 30 * 24 * 60 * 60 * 1000 }
})
```

### **Use Case 3: Database Sync Only**
```typescript
await slugStore('user-profile', profile, {
  url: false,
  db: { 
    endpoint: '/api/user/profile',
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  }
})
```

### **Use Case 4: All Three Combined**
```typescript
await slugStore('app-state', state, {
  url: true,          // Share via URL
  offline: true,      // Store offline
  compress: true,     // Compress for efficiency
  db: {              // Sync to database
    endpoint: '/api/sync'
  }
})
```

## 🚀 **Advanced Features**

### **Encryption for Sensitive Data**

```typescript
// Encrypt sensitive data before URL sharing
const result = await slugStore('private-notes', notes, {
  url: true,
  encrypt: true,
  password: userSessionKey, // Derive from user session
  compress: true
})

// Only users with the password can decode
const notes = await decodeState(result.slug, {
  password: userSessionKey
})
```

### **Custom Storage Adapters**

```typescript
// Use specific storage types
await saveOffline('data', state, {
  storage: 'localstorage',  // Force localStorage
  ttl: 60 * 60 * 1000      // 1 hour TTL
})

// Automatic fallback: IndexedDB → localStorage → memory
await saveOffline('data', state, {
  // Will try IndexedDB first, fall back if not available
})
```

### **Performance Optimization**

```typescript
// Compress large datasets
const largeData = { /* thousands of items */ }
const result = await slugStore('dataset', largeData, {
  url: true,
  compress: true  // Can reduce size by 70%+
})

console.log(`Original: ${JSON.stringify(largeData).length} chars`)
console.log(`Compressed: ${result.slug.length} chars`)
```

### **Cross-Platform Compatibility**

```typescript
// Works in any JavaScript environment
import { encodeState, decodeState } from '@farajabien/slug-store-core'

// Browser
const encoded = await encodeState(data)

// Node.js
const state = await decodeState(encoded)

// Deno
const result = await slugStore('data', state)

// Bun
const offline = await loadOffline('cache')
```

## 🔄 **Integration with React Package**

The React package (`@farajabien/slug-store`) builds on this core:

```typescript
// Core package (this one)
import { slugStore, decodeState } from '@farajabien/slug-store-core'

// React package (uses core internally)
import { useSlugStore, slug, getSlugData } from '@farajabien/slug-store'

// The React dev tools use these core functions:
// - slug() → uses window.location.href
// - getSlugData() → uses decodeState() from core
// - useSlugStore() → uses slugStore() and loadSlugStore() from core
```

## 🎯 **Framework Examples**

### **Next.js App Router**

```typescript
// app/dashboard/page.tsx
import { decodeState } from '@farajabien/slug-store-core'

export default async function Dashboard({ searchParams }) {
  const filters = searchParams.state 
    ? await decodeState(searchParams.state).catch(() => null)
    : { category: 'all' }
    
  return <DashboardComponent initialFilters={filters} />
}

// app/api/share/route.ts
export async function POST(request) {
  const { state } = await request.json()
  const encoded = await encodeState(state, { compress: true })
  const shareUrl = `${request.nextUrl.origin}/dashboard?state=${encoded}`
  return Response.json({ shareUrl })
}
```

### **SvelteKit**

```typescript
// src/routes/+page.server.ts
import { decodeState } from '@farajabien/slug-store-core'

export async function load({ url }) {
  const stateParam = url.searchParams.get('state')
  const data = stateParam 
    ? await decodeState(stateParam).catch(() => null)
    : null
    
  return { data }
}
```

### **Astro**

```typitten
// src/pages/app.astro
---
import { decodeState } from '@farajabien/slug-store-core'

const stateParam = Astro.url.searchParams.get('state')
const initialData = stateParam 
  ? await decodeState(stateParam).catch(() => {})
  : {}
---

<div id="app" data-initial={JSON.stringify(initialData)}></div>
```

## 🎉 **Why Use the Core Package?**

### **Universal Compatibility**
- ✅ **Any JavaScript environment**: Browser, Node.js, Deno, Bun, Edge
- ✅ **Any framework**: React, Vue, Svelte, Angular, vanilla JS
- ✅ **Any platform**: Web, mobile, desktop, server

### **Zero Dependencies (except LZ-string)**
- ✅ **Lightweight**: 5.1KB gzipped
- ✅ **Tree-shakeable**: Import only what you need
- ✅ **No bloat**: Clean, focused API

### **Production Ready**
- ✅ **Type safe**: Full TypeScript support
- ✅ **Well tested**: Comprehensive test suite
- ✅ **Error handling**: Graceful fallbacks and clear error messages
- ✅ **Performance**: Optimized for speed and size

### **Flexible Architecture**
- ✅ **Composable**: Mix and match persistence strategies
- ✅ **Extensible**: Easy to add custom storage adapters
- ✅ **Future-proof**: Versioned format with migration support

## 📚 **Learn More**

- 🎮 [React Package](https://www.npmjs.com/package/@farajabien/slug-store) - React hooks and dev tools
- 📖 [Complete Documentation](https://github.com/farajabien/slug-store/blob/main/docs/SLUG_STORE_USAGE.md)
- 💡 [Interactive Demo](https://slugstore.fbien.com/demo)
- 🚀 [Use Cases & Examples](https://slugstore.fbien.com/faq)

---

**Build universal, persistent applications with confidence!** 🚀

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Live Demo**: [https://slugstore.fbien.com](https://slugstore.fbien.com)  
**Documentation**: [https://slugstore.fbien.com/docs](https://slugstore.fbien.com/docs)  
**GitHub**: [https://github.com/farajabien/slug-store](https://github.com/farajabien/slug-store)  
**Made by**: [Faraja Bien](https://github.com/farajabien) 