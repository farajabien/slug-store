# @farajabien/slug-store-core

[![npm version](https://badge.fury.io/js/%40farajabien%2Fslug-store-core.svg)](https://badge.fury.io/js/%40farajabien%2Fslug-store-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@farajabien/slug-store-core)](https://bundlephobia.com/package/@farajabien/slug-store-core)

> **Universal state persistence core - URLs, offline storage, and unified API**  
> The enhanced foundation that powers `@farajabien/slug-store` with zero configuration.

## 🚀 **v3.0 - Unified API**

The core package now provides a unified API that handles URL persistence, offline storage, and database synchronization through a single, simple interface.

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

// Load state with automatic fallback
const state = await loadSlugStore('user-prefs', { theme: 'light' }, {
  url: true,
  offline: true
})
```

### **Offline Storage**

```typescript
import { saveOffline, loadOffline, clearOffline } from '@farajabien/slug-store-core'

// Save state offline
await saveOffline('todos', [{ id: 1, text: 'Learn Slug Store' }], {
  storage: 'indexeddb',  // 'indexeddb' | 'localstorage' | 'memory'
  encryption: true,
  password: 'secret'
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
import { encodeState, decodeState } from '@farajabien/slug-store-core'

// Encode state for URL sharing
const encoded = await encodeState({ filters: { category: 'tech' } }, {
  compress: true,
  encrypt: true, 
  password: 'secret'
})

// Decode state from URL
const state = await decodeState(encoded, {
  password: 'secret'
})
```

## 🔧 **API Reference**

### **`slugStore(key, state, options?)`**

Unified function for saving state with multiple persistence options.

```typescript
const result = await slugStore(key, state, {
  url?: boolean | UrlOptions,      // URL persistence
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
  slug: string,           // Encoded state for URL
  state: T,              // The saved state
  shareableUrl?: string, // Full URL with state (if url: true)
  dbKey?: string         // Database key (if db: true)
}
```

### **`loadSlugStore(key, defaultState, options?)`**

Load state with automatic fallback chain: URL → Offline → Default.

```typescript
const state = await loadSlugStore(key, defaultState, {
  url?: boolean | UrlOptions,
  offline?: boolean | OfflineOptions,
  db?: DbOptions,
  password?: string
})
```

### **Offline Storage Functions**

#### **`saveOffline(key, state, options?)`**
Save state to offline storage with automatic fallback.

```typescript
await saveOffline('key', state, {
  storage?: 'indexeddb' | 'localstorage' | 'memory',
  encryption?: boolean,
  password?: string,
  ttl?: number // Time to live in seconds
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

#### **`clearOffline(key, options?)`**
Clear specific offline data.

```typescript
await clearOffline('key', {
  storage?: 'indexeddb' | 'localstorage' | 'memory'
})
```

#### **`listOfflineKeys(options?)`**
List all offline storage keys.

```typescript
const keys = await listOfflineKeys({
  storage?: 'indexeddb' | 'localstorage' | 'memory'
})
```

### **State Encoding Functions**

#### **`encodeState(state, options?)`**
Encode state for URL sharing or storage.

```typescript
const encoded = await encodeState(state, {
  compress?: boolean,
  encrypt?: boolean,
  password?: string
})
```

#### **`decodeState(encoded, options?)`**
Decode state from URL or storage.

```typescript
const state = await decodeState(encoded, {
  password?: string
})
```

## 🎯 **Use Cases**

### **Use Case 1: URL Sharing Only**
```typescript
const result = await slugStore('filters', { category: 'tech' }, {
  url: true
})
// Returns: { slug: 'abc123', state: {...}, shareableUrl: 'https://...' }
```

### **Use Case 2: Offline Storage Only**
```typescript
const result = await slugStore('todos', [], {
  offline: { storage: 'indexeddb' }
})
// Returns: { slug: 'abc123', state: [...] }
```

### **Use Case 3: Database Sync Only**
```typescript
const result = await slugStore('user-data', {}, {
  db: { endpoint: '/api/user' }
})
// Returns: { slug: 'abc123', state: {...}, dbKey: 'user-data' }
```

### **Use Case 4: Everything Combined**
```typescript
const result = await slugStore('dashboard', config, {
  url: true,
  offline: { storage: 'indexeddb' },
  db: { endpoint: '/api/dashboard' },
  compress: true,
  encrypt: true,
  password: 'secret'
})
```

## 🔒 **Security Features**

### **Encryption**
```typescript
// Save encrypted data
await saveOffline('secrets', { apiKey: 'abc123' }, {
  encryption: true,
  password: 'my-secret-password'
})

// Load encrypted data
const secrets = await loadOffline('secrets', {
  encryption: true,
  password: 'my-secret-password'
})
```

### **Compression**
```typescript
// Automatically compress large states
const encoded = await encodeState(largeState, {
  compress: true
})
```

## 🚀 **Performance**

- **Bundle Size**: ~20KB gzipped
- **Encoding**: < 1ms for typical states
- **Offline Storage**: < 5ms for save/load operations
- **Automatic Fallback**: Graceful degradation when storage unavailable

## 🔧 **Advanced Configuration**

### **Custom Storage Adapters**
```typescript
import { createStorage } from '@farajabien/slug-store-core'

const customStorage = createStorage('custom', {
  get: async (key) => { /* custom get logic */ },
  set: async (key, value) => { /* custom set logic */ },
  delete: async (key) => { /* custom delete logic */ }
})
```

### **Error Handling**
```typescript
try {
  const state = await loadSlugStore('key', defaultState)
} catch (error) {
  if (error.code === 'OFFLINE_ERROR') {
    // Handle offline storage errors
  } else if (error.code === 'ENCODING_ERROR') {
    // Handle encoding/decoding errors
  }
}
```

## 📦 **Package Exports**

```typescript
// Main functions
export { slugStore, loadSlugStore }

// Offline storage
export { saveOffline, loadOffline, clearOffline, listOfflineKeys }

// State encoding
export { encodeState, decodeState }

// Types
export type { 
  SlugStoreOptions, 
  OfflineOptions, 
  UrlOptions, 
  DbOptions 
}
```

## 🔄 **Migration from v2.x**

The core package maintains backward compatibility with v2.x APIs. The new unified API is additive and doesn't break existing code.

```typescript
// v2.x - Still works
import { encodeState, decodeState } from '@farajabien/slug-store-core'

// v3.0 - New unified API
import { slugStore, loadSlugStore } from '@farajabien/slug-store-core'
```

---

**Universal state persistence core library. Zero obstruction, maximum DevEx.** 🚀

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Live Demo**: [https://slugstore.fbien.com](https://slugstore.fbien.com)  
**Documentation**: [https://slugstore.fbien.com/docs](https://slugstore.fbien.com/docs)  
**GitHub**: [https://github.com/farajabien/slug-store](https://github.com/farajabien/slug-store)  
**Made by**: [Faraja Bien](https://github.com/farajabien) 