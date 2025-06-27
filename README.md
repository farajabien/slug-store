# Slug Store

> **Universal state persistence for modern web apps. Zero obstruction, maximum DevEx.**

**One hook. Three use cases. Everything you need.**

## 🎯 Install Once, Use Everywhere

```bash
npm install @farajabien/slug-store
```

That's it. No other packages needed. Works everywhere:
- ✅ **React** (client-side)
- ✅ **Next.js** (server components, API routes)  
- ✅ **Remix** (loaders, actions)
- ✅ **Node.js** (any server)
- ✅ **Supabase, Firebase, PostgreSQL** (any database)
- ✅ **Offline-first webapps** (no PWA required)

## 🔥 NEW: v3.0 - Unified API

**One hook for all your state persistence needs. Zero configuration, maximum simplicity.**

```typescript
import { useSlugStore } from '@farajabien/slug-store'

// URL sharing
const [state, setState, { isLoading, error }] = useSlugStore('filters', initialState, { url: true })

// Offline storage  
const [state, setState, { isLoading, error }] = useSlugStore('todos', initialState, { offline: true })

// Database sync
const [state, setState, { isLoading, error }] = useSlugStore('prefs', initialState, { 
  db: { endpoint: '/api/sync' } 
})

// All three together
const [state, setState, { isLoading, error }] = useSlugStore('dashboard', initialState, {
  url: true,        // Share via URL
  offline: true,    // Store offline
  db: { endpoint: '/api/sync' } // Database sync
})
```

**Key Features:**
- 🎯 **Unified API** - One hook for all persistence needs
- 🚀 **Zero Configuration** - Works out of the box with sensible defaults
- 🔄 **Offline-First** - Any webapp works offline without PWA complexity
- 📦 **Tree Shaking** - Only import what you use
- 🎨 **TypeScript Native** - Full type safety with auto-completion
- ⚡ **5.5KB Gzipped** - 72% smaller than v2.x

## 📚 Complete API Reference

### **React Hook** (Client-Side)
```typescript
import { useSlugStore } from '@farajabien/slug-store'

// Basic usage
const [state, setState, { isLoading, error }] = useSlugStore(key, initialState, options?)

// Types
import type {
  UseSlugStoreOptions,    // Hook options
  UseSlugStoreReturn      // Hook return type
} from '@farajabien/slug-store'
```

### **Core Functions** (Universal)
```typescript
import {
  // Core functions
  encodeState,            // Convert state to compressed slug
  decodeState,            // Convert slug back to state
  slugStore,              // Unified persistence function
  loadSlugStore,          // Load with fallback chain
  
  // Offline functions
  saveOffline,            // Save to offline storage
  loadOffline,            // Load from offline storage
  clearOffline,           // Clear offline storage
  listOfflineKeys         // List offline keys
} from '@farajabien/slug-store'

// Types
import type {
  SlugStoreOptions,       // Options for persistence
  SlugStoreResult,        // Result from persistence
  OfflineOptions,         // Offline storage options
  SlugStoreError          // Error types
} from '@farajabien/slug-store'
```

## 🎯 The Three Use Cases

### 1. **Share State via URLs** 
```typescript
import { useSlugStore } from '@farajabien/slug-store'

function Dashboard() {
  const [state, setState, { isLoading, error }] = useSlugStore('dashboard', {
    filters: { status: 'all', category: 'electronics' },
    view: 'grid',
    sortBy: 'price'
  }, {
    url: true,        // Sync to URL
    compress: true    // Compress URL data
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  // URL updates automatically when state changes
  // Perfect for sharing dashboard configurations
  // Works with any state structure
}
```

### 2. **Store State in Database**
```typescript
import { useSlugStore } from '@farajabien/slug-store'

function UserSettings() {
  const [state, setState, { isLoading, error }] = useSlugStore('preferences', {
    theme: 'light',
    notifications: true,
    layout: 'sidebar'
  }, {
    db: { 
      endpoint: '/api/user/preferences',
      method: 'POST'
    }
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  // Automatically syncs to database!
  // Handles loading states!
  // Handles errors!
}
```

### 3. **Offline-First Webapps** ⭐ NEW
```typescript
import { useSlugStore } from '@farajabien/slug-store'

function TodoApp() {
  const [state, setState, { isLoading, error }] = useSlugStore('todos', {
    todos: [],
    filters: { status: 'all' },
    settings: { theme: 'light' }
  }, {
    offline: true,    // Store in IndexedDB
    db: { endpoint: '/api/sync' } // Optional server sync
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  const addTodo = (text) => {
    setState({
      ...state,
      todos: [...state.todos, { id: Date.now(), text, done: false }]
    })
    // Works offline automatically!
    // Syncs when online automatically!
  }
}
```

## 🚀 Quick Start

### 1. Install
```bash
npm install @farajabien/slug-store
```

### 2. Use in React
```typescript
import { useSlugStore } from '@farajabien/slug-store'

function MyApp() {
  const [state, setState, { isLoading, error }] = useSlugStore('my-app', {
    count: 0,
    theme: 'light',
    filters: { search: '', category: 'all' }
  }, {
    url: true,        // Share via URL
    offline: true     // Store offline
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => setState({ ...state, count: state.count + 1 })}>
        Increment
      </button>
    </div>
  )
}
```

### 3. Server Sync (Optional)
```typescript
// app/api/sync/route.ts (Next.js)
import { slugStore, loadSlugStore } from '@farajabien/slug-store'

export async function POST(request: Request) {
  const { key, state } = await request.json()
  
  // Save to your database
  const result = await slugStore(key, state, {
    db: { endpoint: 'your-database-endpoint' }
  })
  
  return Response.json(result)
}
```

## 🔧 Configuration Options

```