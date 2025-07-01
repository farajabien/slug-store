# Slug Store v4.0.4: The Perfect State Management Solution for AI-Built Apps

After 3 versions and 500+ downloads, we've finally cracked the code for zero-boilerplate, full-stack state management that works seamlessly with Next.js App Router. No database configs needed - just pure, intelligent state persistence.

[![npm](https://img.shields.io/npm/v/slug-store)](https://www.npmjs.com/package/slug-store)
[![npm bundle size](https://img.shields.io/bundlephobia/min/slug-store)](https://bundlephobia.com/package/slug-store)
[![License](https://img.shields.io/npm/l/slug-store)](https://github.com/farajabien/slug-store/blob/main/LICENSE)

`slug-store` v4.0.4 provides simple, powerful state management that works everywhere. One hook, infinite possibilities with intelligent Auto Config System.

## 🧠 Auto Config System

Slug Store automatically detects your data patterns and optimizes accordingly:

```typescript
// Small, shareable data → URL persistence
const [filters, setFilters] = useSlugStore('filters', { category: 'tech', sort: 'newest' });
// ✅ Automatically persisted in URL for sharing

// Large data → Offline storage  
const [products, setProducts] = useSlugStore('products', { items: Array(1000).fill('...') });
// ✅ Automatically compressed and stored offline

// Sensitive data → Encryption
const [user, setUser] = useSlugStore('user', { email: 'user@example.com', password: 'secret' });
// ✅ Automatically encrypted for security
```

## 📦 Installation

```bash
npm install slug-store
# or
pnpm add slug-store
```

## 🎯 Quick Start

### Simple State Management (Recommended)

```typescript
import { useSlugStore } from 'slug-store/client'

function TodoApp() {
  const [todos, setTodos] = useSlugStore('todos', [], {
    url: true,        // Share via URL
    offline: true,    // Store offline
    autoConfig: true  // Auto-optimize
  })

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

That's it! Your state is now:

✅ Persisted across page refreshes  
✅ Shareable via URL  
✅ Optimized automatically  
✅ Type-safe end-to-end  

## 🚀 Advanced Examples

### E-commerce Filters

```typescript
import { useSlugStore } from 'slug-store/client'

function ProductFilters() {
  const [filters, setFilters] = useSlugStore('product-filters', {
    category: 'all',
    price: [0, 1000],
    sort: 'newest'
  }, {
    url: true,        // Shareable filters
    autoConfig: true  // Auto-optimize
  })

  return (
    <div>
      <select 
        value={filters.category} 
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="all">All Categories</option>
        <option value="tech">Tech</option>
        <option value="books">Books</option>
      </select>
    </div>
  )
}
```

### Shopping Cart

```typescript
import { useSlugStore } from 'slug-store/client'

function ShoppingCart() {
  const [cart, setCart] = useSlugStore('cart', {
    items: [],
    total: 0
  }, {
    offline: true,    // Persistent cart
    autoConfig: true  // Auto-compress large carts
  })

  const addItem = (product) => {
    setCart({
      ...cart,
      items: [...cart.items, product],
      total: cart.total + product.price
    })
  }

  return (
    <div>
      {cart.items.map(item => (
        <div key={item.id}>{item.name} - ${item.price}</div>
      ))}
      <div>Total: ${cart.total}</div>
    </div>
  )
}
```

### User Preferences

```typescript
import { useSlugStore } from 'slug-store/client'

function UserSettings() {
  const [preferences, setPreferences] = useSlugStore('user-preferences', {
    theme: 'light',
    language: 'en',
    notifications: true
  }, {
    offline: true,    // Always available
    autoConfig: true  // Auto-encrypt sensitive data
  })

  return (
    <div>
      <button onClick={() => setPreferences({ ...preferences, theme: 'dark' })}>
        Toggle Theme
      </button>
    </div>
  )
}
```

## 📚 Complete API Reference

### Core Hook

#### `useSlugStore<T>(key, initialState, options?)`

The main hook for state management with persistence.

**Parameters:**
- `key` (string): Unique identifier for the state
- `initialState` (T): Initial state value
- `options` (SlugStoreOptions): Configuration options

**Returns:** `[state, setState]` - React state tuple

**Options:**
```typescript
interface SlugStoreOptions {
  /** Persist state in the URL. */
  url?: boolean;
  /** Persist state in offline storage (localStorage or IndexedDB). */
  offline?: boolean;
  /** Automatically determine the best persistence strategy. */
  autoConfig?: boolean;
  /** Custom encryption key. If not provided, one will be generated for auto-config. */
  encryptionKey?: string;
  /** Development-only: Logs the auto-config analysis to the console. */
  debug?: boolean;
}
```

### Utility Functions

#### `getSlug(): string`

Returns the current window's URL.

```typescript
import { getSlug } from 'slug-store/client'

const currentUrl = getSlug()
console.log(currentUrl) // "https://myapp.com/dashboard?state=..."
```

#### `shareSlug(options?): Promise<void>`

Shares the current URL using the Web Share API. Falls back to copying the URL to clipboard if Web Share is not available.

```typescript
import { shareSlug } from 'slug-store/client'

// Share with default options
await shareSlug()

// Share with custom title and text
await shareSlug({
  title: 'My App',
  text: 'Check out this amazing state!'
})
```

**Options:**
```typescript
interface ShareSlugOptions {
  /** The title of the content to be shared. */
  title?: string;
  /** The text of the content to be shared. */
  text?: string;
}
```

#### `copySlug(): Promise<void>`

Copies the current URL to the clipboard.

```typescript
import { copySlug } from 'slug-store/client'

await copySlug()
// URL is now in the clipboard
```

#### `getSlugData<T>(key, options?): Promise<T | undefined>`

Retrieves and decodes state data from the URL for a specific key.

```typescript
import { getSlugData } from 'slug-store/client'

// Get data from URL
const userData = await getSlugData('user')
console.log(userData) // { name: 'John', preferences: {...} }

// Get encrypted data
const secureData = await getSlugData('secure', {
  encryptionKey: 'my-secret-key'
})
```

**Parameters:**
- `key` (string): The key for the state in the URL
- `options` (object): Optional configuration
  - `encryptionKey` (string): Encryption key if the data is encrypted

**Returns:** The decoded state object, or `undefined` if not found or on error

### Complete Import Example

```typescript
import { 
  useSlugStore, 
  getSlug, 
  shareSlug, 
  copySlug, 
  getSlugData 
} from 'slug-store/client'

// Use the hook
const [state, setState] = useSlugStore('my-key', initialState, options)

// Use utilities
const url = getSlug()
await shareSlug({ title: 'My App' })
await copySlug()
const data = await getSlugData('my-key')
```

## 🔧 Advanced Usage

### Custom Encryption

```typescript
import { useSlugStore } from 'slug-store/client'

function SecureApp() {
  const [sensitiveData, setSensitiveData] = useSlugStore('secure', {
    apiKey: 'secret-key',
    userToken: 'jwt-token'
  }, {
    encryptionKey: 'my-custom-encryption-key',
    url: true,
    offline: true
  })

  // Data is automatically encrypted before storage
}
```

### Manual State Decoding

```typescript
import { getSlugData } from 'slug-store/client'

// Decode state from a specific URL
const url = 'https://myapp.com/dashboard?user=eyJkYXRhIjoiZXhhbXBsZSJ9'
const userData = await getSlugData('user', { url })

// Decode encrypted state
const secureData = await getSlugData('secure', {
  encryptionKey: 'my-key',
  url: 'https://myapp.com/secure?secure=encrypted-data'
})
```

### Development Debugging

```typescript
import { useSlugStore } from 'slug-store/client'

function DebugApp() {
  const [state, setState] = useSlugStore('debug', initialState, {
    autoConfig: true,
    debug: true // Logs auto-config decisions to console
  })

  // Check browser console for auto-config analysis
}
```

## 🎯 Use Cases

### 1. **URL Sharing** - Share application state via URL
```typescript
const [filters, setFilters] = useSlugStore('filters', defaultFilters, { url: true })
// URL: https://myapp.com/products?filters=eyJjYXRlZ29yeSI6InRlY2gifQ==
```

### 2. **Offline Persistence** - Store data locally for offline access
```typescript
const [cart, setCart] = useSlugStore('cart', [], { offline: true })
// Data persists across browser sessions
```

### 3. **Auto-Optimization** - Let Slug Store decide the best strategy
```typescript
const [data, setData] = useSlugStore('data', largeDataset, { autoConfig: true })
// Automatically compressed, encrypted, and stored optimally
```

## 🚀 Performance

- **Bundle Size**: ~5KB gzipped
- **Zero Dependencies**: Pure TypeScript/JavaScript
- **Tree Shakeable**: Only import what you use
- **SSR Compatible**: Works with Next.js App Router

## 📄 License

MIT License - see [LICENSE](https://github.com/farajabien/slug-store/blob/main/LICENSE) for details.