# @farajabien/slug-store

[![npm version](https://badge.fury.io/js/%40farajabien%2Fslug-store.svg)](https://badge.fury.io/js/%40farajabien%2Fslug-store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@farajabien/slug-store)](https://bundlephobia.com/package/@farajabien/slug-store)

> **Universal state persistence for React. Zero obstruction, maximum DevEx.**  
> One hook. Three use cases. Everything you need.

## 🚀 **v3.0 - Unified React Hook**

The React package provides a simple, `useState`-like hook that automatically handles URL persistence, offline storage, and database synchronization with zero configuration.

## 📦 **Installation**

```bash
npm install @farajabien/slug-store
```

## 🎯 **Quick Start**

### **Basic Usage - Like useState, but with persistence**

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function TodoApp() {
  const [todos, setTodos, { isLoading, error }] = useSlugStore('todos', [], {
    url: true,        // Share via URL
    offline: true,    // Store offline
    db: {             // Sync to database
      endpoint: '/api/todos',
      method: 'POST'
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
      <button onClick={() => setTodos([...todos, { id: Date.now(), text: 'New todo' }])}>
        Add Todo
      </button>
    </div>
  )
}
```

### **URL Sharing Only**

```tsx
function FilterComponent() {
  const [filters, setFilters, { isLoading }] = useSlugStore('filters', { 
    category: 'tech',
    price: [100, 500]
  }, {
    url: true  // That's it! URLs update automatically
  })

  if (isLoading) return <div>Loading filters...</div>

  return (
    <div>
      <select 
        value={filters.category} 
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="tech">Tech</option>
        <option value="books">Books</option>
      </select>
    </div>
  )
}
```

### **Offline Storage Only**

```tsx
function UserPreferences() {
  const [preferences, setPreferences, { isLoading, error }] = useSlugStore('preferences', { 
    theme: 'light',
    language: 'en'
  }, {
    url: false,                       // No URL pollution
    offline: { storage: 'indexeddb' } // Persistent storage
  })

  if (isLoading) return <div>Loading preferences...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={() => setPreferences({ ...preferences, theme: 'dark' })}>
        Toggle Theme
      </button>
    </div>
  )
}
```

### **Database Sync Only**

```tsx
function UserProfile() {
  const [profile, setProfile, { isLoading, error }] = useSlugStore('user-profile', {}, {
    url: false,
    db: { 
      endpoint: '/api/user/profile',
      method: 'PUT'
    }
  })

  if (isLoading) return <div>Loading profile...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      setProfile({ name: 'John Doe', email: 'john@example.com' })
    }}>
      {/* form fields */}
    </form>
  )
}
```

## 🔧 **API Reference**

### **`useSlugStore<T>(key, initialState, options?)`**

A React hook that provides persistent state management with automatic synchronization.

**Parameters:**
- `key` (string): Unique identifier for the state
- `initialState` (T): Initial state value  
- `options` (SlugStoreOptions): Configuration options

**Returns:**
```typescript
[
  state: T,                                               // Current state
  setState: (newState: T | (prevState: T) => T) => void, // State setter  
  { 
    isLoading: boolean,                                   // Loading state
    error: Error | null                                   // Error state
  }
]
```

**Options:**
```typescript
interface SlugStoreOptions<T> {
  // URL persistence
  url?: boolean
  
  // Offline storage
  offline?: boolean | {
    storage?: 'indexeddb' | 'localstorage' | 'memory'
    encryption?: boolean
    password?: string
    ttl?: number
  }
  
  // Database sync
  db?: {
    endpoint: string
    method?: 'POST' | 'PUT'
    headers?: Record<string, string>
  }
  
  // Global options
  compress?: boolean
  encrypt?: boolean
  password?: string
}
```

## 🎯 **Real-World Use Cases**

### **Use Case 1: Dashboard Filters (URL Sharing)**

Perfect for analytics dashboards, data tables, and any UI where users need to bookmark and share specific views.

```tsx
function Dashboard() {
  const [filters, setFilters] = useSlugStore('dashboard-filters', {
    dateRange: { start: '2025-01-01', end: '2025-12-31' },
    metrics: ['revenue', 'users'],
    view: 'grid'
  }, {
    url: true,
    compress: true  // Keeps URLs manageable
  })

  // Users can bookmark and share exact dashboard configurations
  // URL: https://app.com/dashboard?state=N4IgZg9...
  
  return (
    <div>
      <DateRangePicker 
        value={filters.dateRange}
        onChange={(range) => setFilters({ ...filters, dateRange: range })}
      />
      {/* More filter controls */}
    </div>
  )
}
```

### **Use Case 2: Shopping Cart (Offline + Database)**

Perfect for e-commerce apps where cart persistence is critical for user experience and conversion.

```tsx
function ShoppingCart() {
  const [cart, setCart] = useSlugStore('cart', [], {
    url: false,                    // Private data
    offline: { 
      storage: 'indexeddb',
      encryption: true,
      password: 'user-session-id'
    },
    db: { 
      endpoint: '/api/cart/sync',
      method: 'POST'
    }
  })

  // Cart persists offline and syncs when online
  // Works seamlessly across browser sessions
  
  const addToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }])
  }

  return (
    <div>
      {cart.map(item => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  )
}
```

### **Use Case 3: User Settings (Database Only)**

Perfect for user preferences that need to sync across devices.

```tsx
function UserSettings() {
  const [settings, setSettings] = useSlugStore('user-settings', {
    notifications: true,
    theme: 'dark',
    language: 'en'
  }, {
    url: false,
    db: { 
      endpoint: '/api/user/settings',
      method: 'PUT'
    }
  })

  // Settings automatically sync across all user devices
  
  return (
    <div>
      <Toggle 
        checked={settings.notifications}
        onChange={(checked) => setSettings({ ...settings, notifications: checked })}
      />
    </div>
  )
}
```

## 🔒 **Security & Performance**

### **Encrypted Storage**

```tsx
function SecureNotes() {
  const [notes, setNotes] = useSlugStore('secure-notes', [], {
    url: false,
    offline: {
      storage: 'indexeddb',
      encryption: true,
      password: 'my-secret-password'
    }
  })

  // Notes are encrypted before storage using Web Crypto API
}
```

### **Compression for Large States**

```tsx
function LargeDataset() {
  const [data, setData] = useSlugStore('large-dataset', [], {
    url: true,
    compress: true  // Automatically compress large states
  })

  // URLs stay manageable even with large datasets
}
```

### **Performance Metrics**

- **Bundle Size**: 5.5KB gzipped (72% smaller than v2.x)
- **Initial Load**: < 50ms for typical states
- **State Updates**: < 10ms for persistence
- **Memory Usage**: Minimal overhead over useState
- **Offline Storage**: IndexedDB with automatic fallback

## 🔄 **Migration from v2.x**

### **Before (v2.x)**
```tsx
const { state, setState, syncStatus } = useSlugStore(initialState, {
  key: 'my-store',
  syncToUrl: true,
  debounceMs: 100,
  offlineSync: {
    conflictResolution: 'merge',
    syncInterval: 30
  }
})
```

### **After (v3.0)**
```tsx
const [state, setState, { isLoading, error }] = useSlugStore('my-store', initialState, {
  url: true,
  offline: true,
  db: { endpoint: '/api/sync' }
})
```

**Key Changes:**
- ✅ **80% simpler API** - One hook for everything
- ✅ **useState-like interface** - Familiar React patterns
- ✅ **Built-in loading states** - No more manual sync status tracking
- ✅ **Automatic error handling** - Graceful degradation
- ✅ **Zero configuration** - Works out of the box

## 🎯 **Framework Compatibility**

Works with all React versions and frameworks:

| Framework | Status | Notes |
|-----------|--------|-------|
| **React 18+** | ✅ Recommended | Full support for all features |
| **React 17** | ✅ Supported | All features work |
| **Next.js** | ✅ Supported | SSR compatible |
| **Remix** | ✅ Supported | Works with loaders/actions |
| **Gatsby** | ✅ Supported | Static generation compatible |
| **Vite** | ✅ Supported | Fast dev experience |
| **Create React App** | ✅ Supported | Zero config setup |

## 🚀 **Advanced Features**

### **Custom Error Handling**

```tsx
function AppWithErrorHandling() {
  const [data, setData, { isLoading, error }] = useSlugStore('data', [])

  if (error) {
    return (
      <div className="error">
        <h3>Failed to load data</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  return <div>{/* your app */}</div>
}
```

### **Loading States**

```tsx
function AppWithLoading() {
  const [data, setData, { isLoading }] = useSlugStore('data', [])

  if (isLoading) {
    return (
      <div className="loading">
        <Spinner />
        <p>Loading your data...</p>
      </div>
    )
  }

  return <div>{/* your app */}</div>
}
```

### **Function Updates**

```tsx
function Counter() {
  const [count, setCount] = useSlugStore('counter', 0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>
        Increment
      </button>
    </div>
  )
}
```

## 📦 **What's Included**

```typescript
// Main hook
export { useSlugStore } from './useSlugStore'

// Specialized hooks (v3.1+)
export { 
  useUrlState,        // URL sharing only
  useOfflineState,    // Offline storage only  
  useDbState,         // Database sync only
  useSharedOfflineState, // Shared offline state
  useFullState        // All features enabled
} from './specialized-hooks'

// Types
export type { SlugStoreOptions, SlugStoreResult } from '@farajabien/slug-store-core'
```

## 🔧 **Development**

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build package
pnpm build

# Development mode
pnpm dev
```

## 🌟 **Why Choose Slug Store?**

- **🎯 Zero Configuration** - Works out of the box
- **🔄 Universal Persistence** - URL, offline, database in one hook
- **⚡ Lightweight** - 5.5KB gzipped total
- **🔒 Secure** - Built-in encryption and compression
- **📱 Offline-First** - Works without internet
- **🎨 Developer Experience** - TypeScript, React DevTools, great docs
- **🚀 Production Ready** - Used by teams worldwide

---

**Universal state persistence for React. Zero obstruction, maximum DevEx.** 🚀

[**View Demo**](https://slugstore.fbien.com) • [**GitHub**](https://github.com/farajabien/slug-store) • [**npm**](https://www.npmjs.com/package/@farajabien/slug-store)
