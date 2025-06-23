# @farajabien/slug-store-react

[![npm version](https://badge.fury.io/js/%40farajabien%2Fslug-store-react.svg)](https://badge.fury.io/js/%40farajabien%2Fslug-store-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React hooks for URL state persistence with **Zustand-like simplicity**. Built on top of `@farajabien/slug-store-core`.

## 🚀 Why Use This?

Instead of writing verbose URL state management code:

```tsx
// ❌ The old way - lots of boilerplate
const [state, setState] = useState(defaultState)
const [hasUrlState, setHasUrlState] = useState(false)

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const urlSlug = params.get('state')
  if (urlSlug) {
    decodeState(urlSlug).then(setState).catch(console.error)
  }
}, [])

useEffect(() => {
  encodeState(state, { compress: true }).then(slug => {
    const url = new URL(window.location)
    url.searchParams.set('state', slug)
    window.history.replaceState({}, '', url)
  })
}, [state])
```

Just use our hooks:

```tsx
// ✅ The new way - Zustand-like simplicity
const { state, setState } = useSlugStore(defaultState, { compress: true })
```

## 📦 Installation

```bash
npm install @farajabien/slug-store-react
# or
pnpm add @farajabien/slug-store-react
```

## 🎯 Quick Start

### Option 1: useSlugStore Hook (useState-like)

Perfect for component-level state that needs URL persistence:

```tsx
import { useSlugStore } from '@farajabien/slug-store-react'

function WishlistApp() {
  const { state, setState } = useSlugStore({
    items: [],
    filters: { category: 'all', price: [0, 1000] },
    view: 'grid'
  }, { 
    compress: true,
    debounceMs: 300 
  })

  const addItem = (item) => {
    setState(prev => ({
      ...prev,
      items: [...prev.items, item]
    }))
  }

  return (
    <div>
      <h1>My Wishlist ({state.items.length} items)</h1>
      {/* Your UI here */}
    </div>
  )
}
```

### Option 2: create Store (Zustand-like)

Perfect for global state management:

```tsx
import { create } from '@farajabien/slug-store-react'

interface WishlistState {
  items: Array<{ id: string; name: string; price: number }>
  addItem: (item: Omit<WishlistItem, 'id'>) => void
  removeItem: (id: string) => void
  clearAll: () => void
}

const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addItem: (item) => set(state => ({ 
    items: [...state.items, { ...item, id: Date.now().toString() }] 
  })),
  removeItem: (id) => set(state => ({ 
    items: state.items.filter(item => item.id !== id) 
  })),
  clearAll: () => set({ items: [] })
}), { 
  compress: true,
  key: 'wishlist' // Custom URL parameter name
})

// Use in any component
function WishlistComponent() {
  const { items, addItem, removeItem } = useWishlistStore()
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <button onClick={() => addItem({ name: 'New Item', price: 99 })}>
        Add Item
      </button>
    </div>
  )
}
```

## 🔧 API Reference

### `useSlugStore(initialState, options?)`

React hook that provides useState-like interface with URL persistence.

**Parameters:**
- `initialState`: Initial state value
- `options` (optional):
  - `key?: string` - URL parameter name (default: 'state')
  - `compress?: boolean` - Enable compression (default: false)
  - `encrypt?: boolean` - Enable encryption (default: false)
  - `password?: string` - Encryption password (required if encrypt: true)
  - `syncToUrl?: boolean` - Auto-sync to URL (default: true)
  - `debounceMs?: number` - Debounce URL updates (default: 0)

**Returns:**
```tsx
{
  state: T                           // Current state
  setState: (value: T | (prev: T) => T) => void  // Update state
  reset: () => void                  // Reset to initial state
  hasUrlState: boolean               // True if URL contains state
  getSlug: () => Promise<string>     // Get current state as slug
  loadFromSlug: (slug: string) => Promise<void>  // Load state from slug
  clearUrl: () => void               // Remove state from URL
}
```

### `create(creator, options?)`

Create a Zustand-like store with URL persistence.

**Parameters:**
- `creator`: `(set, get) => initialState` - State creator function
- `options`: Same as `useSlugStore` options

**Returns:**
```tsx
{
  (): T                              // Hook to use the store
  setState: (partial: T | (state: T) => T) => void
  getState: () => T
  reset: () => void
  getSlug: () => Promise<string>
  loadFromSlug: (slug: string) => Promise<void>
  clearUrl: () => void
  hasUrlState: boolean
}
```

## 💡 Use Cases

### 1. E-commerce Filters

```tsx
const useProductFilters = create((set) => ({
  category: 'all',
  priceRange: [0, 1000],
  inStock: true,
  sortBy: 'name',
  setCategory: (category) => set({ category }),
  setPriceRange: (priceRange) => set({ priceRange }),
  toggleInStock: () => set(state => ({ inStock: !state.inStock })),
  setSortBy: (sortBy) => set({ sortBy })
}), { compress: true, key: 'filters' })
```

### 2. Dashboard State

```tsx
const useDashboardStore = create((set) => ({
  widgets: ['sales', 'users', 'revenue'],
  layout: 'grid',
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  addWidget: (widget) => set(state => ({ 
    widgets: [...state.widgets, widget] 
  })),
  setLayout: (layout) => set({ layout })
}), { compress: true, key: 'dashboard' })
```

### 3. AI Chat Conversations

```tsx
const useChatStore = create((set) => ({
  messages: [],
  model: 'gpt-4',
  temperature: 0.7,
  addMessage: (message) => set(state => ({ 
    messages: [...state.messages, message] 
  })),
  setModel: (model) => set({ model }),
  setTemperature: (temp) => set({ temperature })
}), { 
  compress: true, 
  encrypt: true, 
  password: userSessionKey,
  key: 'chat' 
})
```

## 📦 Related Packages

| Package | Description | NPM |
|---------|-------------|-----|
| [@farajabien/slug-store-core](https://www.npmjs.com/package/@farajabien/slug-store-core) | Framework-agnostic core library | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-core.svg)](https://www.npmjs.com/package/@farajabien/slug-store-core) |
| [@farajabien/slug-store-ui](https://www.npmjs.com/package/@farajabien/slug-store-ui) | UI components and themes | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-ui.svg)](https://www.npmjs.com/package/@farajabien/slug-store-ui) |
| [@farajabien/slug-store-eslint-config](https://www.npmjs.com/package/@farajabien/slug-store-eslint-config) | Shared ESLint configuration | [![npm](https://img.shields.io/npm/v/@farajabien/slug-store-eslint-config.svg)](https://www.npmjs.com/package/@farajabien/slug-store-eslint-config) |

## 🎨 UI Components

Enhance your app with our UI components:

```tsx
import { Button, Card, Badge } from '@farajabien/slug-store-ui'

// Use with your slug store
const { state, setState } = useSlugStore({ theme: 'light' })

return (
  <Card>
    <Badge>{state.theme}</Badge>
    <Button onClick={() => setState({ theme: 'dark' })}>
      Toggle Theme
    </Button>
  </Card>
)
```

## 🔒 Security Features

- **Password protection** for sensitive conversations
- **Client-side encryption** using Web Crypto API
- **Tamper detection** with built-in validation
- **No server dependencies** - all processing in browser

## ⚡ Performance

- **Debounced updates** to prevent excessive URL changes
- **Compression** reduces URL size by 30-70%
- **Tree-shakeable** - only import what you use
- **Minimal bundle impact** - ~5KB additional

## 🤝 Contributing

This is part of the [Slug Store monorepo](https://github.com/farajabien/slug-store).

```bash
git clone https://github.com/farajabien/slug-store.git
cd slug-store
pnpm install
pnpm dev:react
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Live Demo**: [https://slugstore.fbien.com](https://slugstore.fbien.com)  
**Documentation**: [https://slugstore.fbien.com/docs](https://slugstore.fbien.com/docs)  
**GitHub**: [https://github.com/farajabien/slug-store](https://github.com/farajabien/slug-store)  
**Made by**: [Faraja Bien](https://github.com/farajabien) 