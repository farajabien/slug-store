# @farajabien/slug-store

[![npm version](https://badge.fury.io/js/%40farajabien%2Fslug-store.svg)](https://badge.fury.io/js/%40farajabien%2Fslug-store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@farajabien/slug-store)](https://bundlephobia.com/package/@farajabien/slug-store)

> **Universal state persistence for React. Zero obstruction, maximum DevEx.**  
> One hook. Three use cases. Everything you need.

## 🚀 **v3.1 - Built-in Dev Tools**

Two powerful utilities that make URL state management effortless:

```tsx
import { slug, getSlugData, copySlug, shareSlug } from '@farajabien/slug-store'

// 🎯 Get the current shareable URL anywhere
console.log(slug()) // "https://myapp.com/dashboard?state=N4IgZg9..."

// 🎯 Get the decoded state from URL anywhere
const data = await getSlugData() // { filters: {...}, view: 'grid' }

// 🎯 Copy URL to clipboard
await copySlug()

// 🎯 Share via native share dialog
await shareSlug('My App', 'Check out this state!')
```

## 📦 **Installation**

```bash
npm install @farajabien/slug-store
```

## 🎯 **Quick Start**

### **Basic Usage - Like useState, but with persistence**

```tsx
import { useSlugStore, copySlug } from '@farajabien/slug-store'

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
      <button onClick={copySlug}>
        📋 Share Todo List
      </button>
    </div>
  )
}
```

### **URL Sharing Only**

```tsx
import { useSlugStore, copySlug } from '@farajabien/slug-store'

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
      
      <button onClick={copySlug}>
        📋 Share Filters
      </button>
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
    error: Error | null,                                  // Error state
    slug: string                                          // Current shareable URL
  }
]
```

### **Dev Tools**

```typescript
// Get current shareable URL
slug(): string

// Get decoded state from URL
getSlugData(): Promise<any | undefined>
getSlugDataSync(): any | undefined  // Client-only sync version

// Copy URL to clipboard
copySlug(): Promise<void>

// Share via native share dialog
shareSlug(title?: string, text?: string): Promise<void>
```

### **Options**

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
import { useSlugStore, copySlug } from '@farajabien/slug-store'

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
      <button onClick={copySlug}>
        📋 Share Dashboard View
      </button>
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

## �� **Migration from v3.0**

### **New Features (No Breaking Changes!)**

```tsx
// ✨ NEW: Dev tools for easier URL/data access
import { slug, getSlugData, copySlug, shareSlug } from '@farajabien/slug-store'

// ✨ NEW: Enhanced hook return value
const [state, setState, { isLoading, error, slug }] = useSlugStore(...)

// ✨ OLD: Manual clipboard handling
const shareOld = () => {
  navigator.clipboard.writeText(window.location.href)
}

// ✨ NEW: One-liner sharing
const shareNew = () => {
  copySlug()
}
```

## 🎉 **Why Slug Store?**

### **Before: Manual State Management**
```tsx
// Complex, error-prone, lots of boilerplate
const [state, setState] = useState(initialState)

// Manual URL handling
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('state')
  if (encoded) {
    try {
      const decoded = JSON.parse(atob(encoded))
      setState(decoded)
    } catch (error) {
      console.error('Failed to decode state')
    }
  }
}, [])

// Manual sharing
const share = () => {
  const encoded = btoa(JSON.stringify(state))
  const url = `${window.location.origin}${window.location.pathname}?state=${encoded}`
  navigator.clipboard.writeText(url)
}
```

### **After: Slug Store**
```tsx
// Simple, reliable, zero boilerplate
const [state, setState] = useSlugStore('my-app', initialState, { url: true })

// One-liner sharing
const share = () => copySlug()
```

### **Key Benefits**
- ✅ **Zero Configuration**: Works out of the box
- ✅ **Universal**: Client, server, anywhere
- ✅ **Type Safe**: Full TypeScript support
- ✅ **Lightweight**: 5.5KB gzipped total
- ✅ **Dev Tools**: Built-in utilities for common tasks
- ✅ **Flexible**: URL, offline, database - use what you need
- ✅ **Reliable**: Comprehensive error handling and fallbacks

## 📚 **Learn More**

- 📖 [Complete Documentation](https://github.com/farajabien/slug-store/blob/main/docs/SLUG_STORE_USAGE.md)
- 🎮 [Interactive Demo](https://slugstore.fbien.com/demo)
- 💡 [Use Cases & Examples](https://slugstore.fbien.com/faq)
- 🚀 [Core Package](https://www.npmjs.com/package/@farajabien/slug-store-core)

---

**Start building persistent, shareable applications today!** 🚀

[**View Demo**](https://slugstore.fbien.com) • [**GitHub**](https://github.com/farajabien/slug-store) • [**npm**](https://www.npmjs.com/package/@farajabien/slug-store)
