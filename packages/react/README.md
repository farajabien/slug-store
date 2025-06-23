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
  layout: 'grid',
  widgets: ['sales', 'traffic', 'revenue'],
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  refreshInterval: 30000,
  setLayout: (layout) => set({ layout }),
  addWidget: (widget) => set(state => ({ 
    widgets: [...state.widgets, widget] 
  })),
  removeWidget: (widget) => set(state => ({ 
    widgets: state.widgets.filter(w => w !== widget) 
  }))
}), { compress: true, key: 'dashboard' })
```

### 3. Form State with Encryption

```tsx
const { state, setState } = useSlugStore({
  personalInfo: { name: '', email: '' },
  preferences: { newsletter: true, theme: 'light' },
  step: 1
}, { 
  encrypt: true, 
  password: 'user-session-key',
  key: 'form-data'
})
```

## 🎨 Advanced Features

### Sharing State via URL

```tsx
const shareCurrentState = async () => {
  const slug = await getSlug()
  const shareUrl = `${window.location.origin}${window.location.pathname}?state=${slug}`
  
  await navigator.clipboard.writeText(shareUrl)
  alert('Shareable URL copied to clipboard!')
}
```

### Loading State from External Source

```tsx
const loadSharedState = async (sharedSlug: string) => {
  try {
    await loadFromSlug(sharedSlug)
    alert('State loaded successfully!')
  } catch (error) {
    alert('Failed to load shared state')
  }
}
```

### Multiple Stores

```tsx
// Each store uses a different URL parameter
const useWishlistStore = create(/* ... */, { key: 'wishlist' })
const useFiltersStore = create(/* ... */, { key: 'filters' })
const useUIStore = create(/* ... */, { key: 'ui' })

// URL becomes: ?wishlist=...&filters=...&ui=...
```

## 🔒 Security & Privacy

### Encryption for Sensitive Data

```tsx
const useSecureStore = create((set) => ({
  userId: null,
  sessionData: {},
  preferences: {}
}), {
  encrypt: true,
  password: generateUserPassword(), // Your password generation logic
  compress: true
})
```

### Data Validation

```tsx
const useValidatedStore = create((set) => ({
  items: [],
  addItem: (item) => {
    // Validate item before adding
    if (isValidItem(item)) {
      set(state => ({ items: [...state.items, item] }))
    }
  }
}))
```

## ⚡ Performance Tips

1. **Use compression for large state**: `{ compress: true }`
2. **Debounce rapid updates**: `{ debounceMs: 300 }`
3. **Separate concerns**: Multiple small stores vs one large store
4. **Selective syncing**: `{ syncToUrl: false }` when needed

## 🔄 Migration from useState

```tsx
// Before
const [state, setState] = useState(initialState)

// After  
const { state, setState } = useSlugStore(initialState)
```

That's it! Your state is now automatically persisted in the URL.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Made with ❤️ by [Faraja Bien](https://github.com/farajabien)** 