# Slug Store v3.0 Usage Guide

> **Universal state persistence for React. Zero obstruction, maximum DevEx.**  
> One hook. Three use cases. Everything you need.

Complete guide to using Slug Store v3.0 - from simple URL sharing to complex offline-first applications.

## 🎯 Installation

```bash
npm install @farajabien/slug-store
```

**What you get:**
- ✅ **React hook** - `useSlugStore` with useState-like interface
- ✅ **URL persistence** - Automatic URL synchronization
- ✅ **Offline storage** - IndexedDB with graceful fallback
- ✅ **Database sync** - Universal backend integration
- ✅ **Core functionality** - Compression, encryption, validation
- ✅ **TypeScript support** - Full type safety
- ✅ **5.5KB gzipped** - 72% smaller than v2.x

## 🎯 The Three Use Cases

### 1. **Share State via URLs**
*Perfect for dashboards, filters, configurations that need external sharing*

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function Dashboard() {
  const [filters, setFilters, { isLoading, error }] = useSlugStore('dashboard-filters', {
    dateRange: { start: '2025-01-01', end: '2025-12-31' },
    metrics: ['revenue', 'users'],
    view: 'grid'
  }, {
    url: true,        // Automatic URL sync
    compress: true    // Keep URLs manageable
  })

  if (isLoading) return <div>Loading filters...</div>
  if (error) return <div>Error: {error.message}</div>

  // State automatically syncs to URL - instantly shareable!
  // URL: https://myapp.com/dashboard?state=N4IgZg9...
  
  return (
    <div>
      <DateRangePicker 
        value={filters.dateRange}
        onChange={(range) => setFilters({ ...filters, dateRange: range })}
      />
      <button onClick={() => navigator.clipboard.writeText(window.location.href)}>
        📋 Share Dashboard
      </button>
    </div>
  )
}
```

### 2. **Store State in Database**
*Perfect for user preferences, private data that syncs across devices*

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function UserSettings() {
  const [settings, setSettings, { isLoading, error }] = useSlugStore('user-settings', {
    theme: 'dark',
    notifications: true,
    language: 'en'
  }, {
    url: false,
    db: { 
      endpoint: '/api/user/settings',
      method: 'PUT'
    }
  })

  if (isLoading) return <div>Loading settings...</div>
  if (error) return <div>Error: {error.message}</div>

  // Settings automatically sync to your database
  // Works with any backend: Supabase, Firebase, PostgreSQL, etc.
  
  return (
    <div>
      <Toggle 
        checked={settings.notifications}
        onChange={(checked) => setSettings({ ...settings, notifications: checked })}
      />
      <p>✅ Settings sync across all your devices</p>
    </div>
  )
}
```

### 3. **Offline-First Storage**
*Perfect for productivity apps, shopping carts, any app that needs to work offline*

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function TodoApp() {
  const [state, setState, { isLoading, error }] = useSlugStore('todos', {
    todos: [],
    filter: 'all'
  }, {
    url: false,
    offline: {
      storage: 'indexeddb',
      encryption: true
    },
    db: {
      endpoint: '/api/todos/sync',
      method: 'POST'
    }
  })

  if (isLoading) return <div>Loading todos...</div>
  if (error) return <div>Error: {error.message}</div>

  const addTodo = (text: string) => {
    setState({
      ...state,
      todos: [...state.todos, { 
        id: crypto.randomUUID(), 
        text, 
        completed: false,
        createdAt: new Date().toISOString()
      }]
    })
  }

  // Works offline automatically!
  // Data syncs when back online
  
  return (
    <div>
      <input 
        placeholder="Add a todo..."
        onKeyPress={(e) => {
          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            addTodo(e.currentTarget.value.trim())
            e.currentTarget.value = ''
          }
        }}
      />
      
      <ul>
        {state.todos.map(todo => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => setState({
                  ...state,
                  todos: state.todos.map(t => 
                    t.id === todo.id ? { ...t, completed: !t.completed } : t
                  )
                })}
              />
              <span className={todo.completed ? 'completed' : ''}>
                {todo.text}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 🔧 API Reference

### **`useSlugStore<T>(key, initialState, options?)`**

The main React hook that provides persistent state management.

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
interface SlugStoreOptions {
  // URL persistence
  url?: boolean
  
  // Offline storage
  offline?: boolean | {
    storage?: 'indexeddb' | 'localstorage' | 'memory'
    encryption?: boolean
    password?: string
    ttl?: number // Time to live in seconds
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

## 🚀 Real-World Examples

### E-commerce Shopping Cart

```tsx
import { useSlugStore } from '@farajabien/slug-store'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  promoCode?: string
}

function ShoppingCart() {
  const [cart, setCart, { isLoading, error }] = useSlugStore<CartState>('shopping-cart', {
    items: [],
    total: 0
  }, {
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

  if (isLoading) return <div>Loading cart...</div>
  if (error) return <div>Error: {error.message}</div>

  const addToCart = (product: Omit<CartItem, 'id'>) => {
    const existingItem = cart.items.find(i => i.productId === product.productId)
    
    if (existingItem) {
      setCart({
        ...cart,
        items: cart.items.map(i => 
          i.productId === product.productId 
            ? { ...i, quantity: i.quantity + product.quantity }
            : i
        ),
        total: cart.total + (product.price * product.quantity)
      })
    } else {
      setCart({
        ...cart,
        items: [...cart.items, { ...product, id: crypto.randomUUID() }],
        total: cart.total + (product.price * product.quantity)
      })
    }
  }

  const removeFromCart = (itemId: string) => {
    const item = cart.items.find(i => i.id === itemId)
    if (item) {
      setCart({
        ...cart,
        items: cart.items.filter(i => i.id !== itemId),
        total: cart.total - (item.price * item.quantity)
      })
    }
  }

  return (
    <div>
      <h2>Shopping Cart ({cart.items.length} items)</h2>
      
      {cart.items.map(item => (
        <div key={item.id} className="cart-item">
          <span>{item.name}</span>
          <span>${item.price} x {item.quantity}</span>
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      
      <div className="cart-total">
        <strong>Total: ${cart.total.toFixed(2)}</strong>
      </div>
      
      <button 
        onClick={() => {
          // Cart persists offline and syncs when online
          window.location.href = '/checkout'
        }}
        disabled={cart.items.length === 0}
      >
        Checkout
      </button>
    </div>
  )
}
```

### Analytics Dashboard with URL Sharing

```tsx
import { useSlugStore } from '@farajabien/slug-store'

interface DashboardState {
  dateRange: { start: string; end: string }
  metrics: string[]
  view: 'grid' | 'list'
  filters: { department: string; status: string }
}

function AnalyticsDashboard() {
  const [dashboard, setDashboard, { isLoading }] = useSlugStore<DashboardState>('analytics-dashboard', {
    dateRange: { start: '2025-01-01', end: '2025-12-31' },
    metrics: ['revenue', 'users', 'conversion'],
    view: 'grid',
    filters: { department: 'all', status: 'active' }
  }, {
    url: true,
    compress: true  // Keep URLs manageable for complex data
  })

  if (isLoading) return <div>Loading dashboard...</div>

  const shareCurrentView = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    alert('Dashboard configuration copied! Share with your team.')
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <button onClick={shareCurrentView}>
          📋 Share Current View
        </button>
      </div>
      
      <div className="dashboard-controls">
        <DateRangePicker 
          value={dashboard.dateRange}
          onChange={(range) => setDashboard({ ...dashboard, dateRange: range })}
        />
        
        <MetricSelector
          selected={dashboard.metrics}
          onChange={(metrics) => setDashboard({ ...dashboard, metrics })}
        />
        
        <ViewToggle
          view={dashboard.view}
          onChange={(view) => setDashboard({ ...dashboard, view })}
        />
      </div>
      
      <DashboardWidgets 
        config={dashboard}
        onChange={setDashboard}
      />
      
      <p className="sharing-note">
        💡 Your dashboard configuration is automatically saved in the URL. 
        Bookmark or share the link to preserve this exact view.
      </p>
    </div>
  )
}
```

### Collaborative Form Builder

```tsx
import { useSlugStore } from '@farajabien/slug-store'

interface FormField {
  id: string
  type: 'text' | 'email' | 'select' | 'textarea'
  label: string
  required: boolean
  options?: string[]
}

interface FormState {
  title: string
  description: string
  fields: FormField[]
  settings: { theme: string; submitText: string }
}

function FormBuilder() {
  const [form, setForm, { isLoading, error }] = useSlugStore<FormState>('form-builder', {
    title: 'Untitled Form',
    description: '',
    fields: [],
    settings: { theme: 'default', submitText: 'Submit' }
  }, {
    url: true,        // Share forms via URL
    compress: true,   // Forms can get large
    db: {             // Save to database
      endpoint: '/api/forms/save',
      method: 'POST'
    }
  })

  if (isLoading) return <div>Loading form builder...</div>
  if (error) return <div>Error: {error.message}</div>

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      required: false,
      ...(type === 'select' && { options: ['Option 1', 'Option 2'] })
    }
    
    setForm({
      ...form,
      fields: [...form.fields, newField]
    })
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm({
      ...form,
      fields: form.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    })
  }

  const removeField = (fieldId: string) => {
    setForm({
      ...form,
      fields: form.fields.filter(field => field.id !== fieldId)
    })
  }

  const shareForm = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    alert('Form shared! Anyone with this link can view and collaborate.')
  }

  return (
    <div className="form-builder">
      <div className="builder-header">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Form title"
          className="form-title-input"
        />
        <button onClick={shareForm}>📋 Share Form</button>
      </div>

      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Form description"
        className="form-description-input"
      />

      <div className="field-toolbar">
        <button onClick={() => addField('text')}>+ Text Field</button>
        <button onClick={() => addField('email')}>+ Email Field</button>
        <button onClick={() => addField('select')}>+ Select Field</button>
        <button onClick={() => addField('textarea')}>+ Textarea</button>
      </div>

      <div className="form-fields">
        {form.fields.map(field => (
          <div key={field.id} className="field-editor">
            <input
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              placeholder="Field label"
            />
            
            <label>
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
              />
              Required
            </label>
            
            {field.type === 'select' && (
              <div>
                {field.options?.map((option, index) => (
                  <input
                    key={index}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(field.options || [])]
                      newOptions[index] = e.target.value
                      updateField(field.id, { options: newOptions })
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
                <button onClick={() => {
                  const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                  updateField(field.id, { options: newOptions })
                }}>
                  + Add Option
                </button>
              </div>
            )}
            
            <button onClick={() => removeField(field.id)}>🗑️ Remove</button>
          </div>
        ))}
      </div>

      <div className="form-preview">
        <h3>Preview</h3>
        <FormPreview form={form} />
      </div>
      
      <p className="collaboration-note">
        💡 This form is automatically saved and shareable. Team members can 
        collaborate in real-time using the shared URL.
      </p>
    </div>
  )
}
```

## 🛠️ Framework Integration

### Next.js App Router

```tsx
// app/dashboard/page.tsx (Server Component)
import { ClientDashboard } from './client-dashboard'

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: { state?: string } 
}) {
  // Load shared state from URL if present
  let sharedState = null
  if (searchParams.state) {
    try {
      // You can decode the state server-side if needed
      // For now, we'll pass it to the client
      sharedState = searchParams.state
    } catch (error) {
      console.warn('Invalid shared state in URL')
    }
  }

  return <ClientDashboard sharedState={sharedState} />
}

// app/dashboard/client-dashboard.tsx (Client Component)
'use client'
import { useSlugStore } from '@farajabien/slug-store'
import { useEffect } from 'react'

export function ClientDashboard({ sharedState }: { sharedState?: string }) {
  const [dashboard, setDashboard, { isLoading, error }] = useSlugStore('dashboard', {
    widgets: ['users', 'revenue'],
    filters: { dateRange: 'last-30-days' },
    view: 'grid'
  }, {
    url: true,
    compress: true,
    db: {
      endpoint: '/api/dashboard/save',
      method: 'POST'
    }
  })

  // Handle shared state from URL
  useEffect(() => {
    if (sharedState && !isLoading) {
      // The hook will automatically decode the shared state
      // No manual intervention needed
    }
  }, [sharedState, isLoading])

  if (isLoading) return <div>Loading dashboard...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <DashboardControls 
        config={dashboard} 
        onChange={setDashboard} 
      />
      <DashboardWidgets config={dashboard} />
    </div>
  )
}

// app/api/dashboard/save/route.ts (API Route)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { key, state } = body
    
    // Save to your database
    await saveUserDashboard(key, state)
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: 'Failed to save dashboard' }, { status: 500 })
  }
}
```

### Remix

```tsx
// app/routes/dashboard.tsx
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useSlugStore } from '@farajabien/slug-store'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const sharedState = url.searchParams.get('state')
  
  // Optionally decode server-side or pass to client
  return json({ sharedState })
}

export default function Dashboard() {
  const { sharedState } = useLoaderData<typeof loader>()
  
  const [dashboard, setDashboard, { isLoading, error }] = useSlugStore('dashboard', {
    widgets: ['users', 'revenue'],
    view: 'grid'
  }, {
    url: true,
    compress: true
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <DashboardControls 
        config={dashboard} 
        onChange={setDashboard} 
      />
    </div>
  )
}
```

## 🔒 Security & Performance

### Encryption for Sensitive Data

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function SecureNotesApp() {
  const [notes, setNotes, { isLoading, error }] = useSlugStore('secure-notes', [], {
    url: false,                    // Never expose in URL
    offline: {
      storage: 'indexeddb',
      encryption: true,
      password: 'user-specific-key' // Use user-specific encryption
    },
    db: {
      endpoint: '/api/notes/sync',
      method: 'POST'
    }
  })

  // Notes are encrypted before storage using Web Crypto API
  // Even if someone accesses IndexedDB, data is encrypted
  
  if (isLoading) return <div>Loading secure notes...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>🔒 Secure Notes</h2>
      <p>Your notes are encrypted before storage</p>
      {/* Notes interface */}
    </div>
  )
}
```

### Performance Optimization

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function OptimizedApp() {
  const [data, setData, { isLoading }] = useSlugStore('large-dataset', [], {
    url: true,
    compress: true,    // Automatic compression for large data
    // debounceMs: 500, // Coming in v3.1 - debounce URL updates
  })

  // Compression reduces URL size by 60-80% for typical data
  // Automatic fallback if URL gets too long
  
  return <div>{/* Your app */}</div>
}
```

## 📱 Mobile & PWA

```tsx
import { useSlugStore } from '@farajabien/slug-store'

function MobileApp() {
  const [appState, setAppState, { isLoading, error }] = useSlugStore('mobile-app', {
    theme: 'light',
    preferences: {},
    offlineData: []
  }, {
    url: false,                    // No URL pollution on mobile
    offline: {
      storage: 'indexeddb',
      encryption: true,
      ttl: 86400 * 7               // 7 days cache
    },
    db: {
      endpoint: '/api/mobile/sync',
      method: 'POST'
    }
  })

  // Perfect for mobile web apps that need to work offline
  // Automatically syncs when connection is restored
  
  if (isLoading) return <div>Loading app...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="mobile-app">
      {/* Your mobile app interface */}
    </div>
  )
}
```

## 🧪 Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSlugStore } from '@farajabien/slug-store'

// Mock the hook for testing
jest.mock('@farajabien/slug-store', () => ({
  useSlugStore: jest.fn()
}))

const mockUseSlugStore = useSlugStore as jest.MockedFunction<typeof useSlugStore>

describe('TodoApp', () => {
  beforeEach(() => {
    mockUseSlugStore.mockReturnValue([
      { todos: [], filter: 'all' },
      jest.fn(),
      { isLoading: false, error: null }
    ])
  })

  it('should render todos', () => {
    render(<TodoApp />)
    expect(screen.getByText('Todo App')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    mockUseSlugStore.mockReturnValue([
      { todos: [], filter: 'all' },
      jest.fn(),
      { isLoading: true, error: null }
    ])

    render(<TodoApp />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should handle error state', () => {
    mockUseSlugStore.mockReturnValue([
      { todos: [], filter: 'all' },
      jest.fn(),
      { isLoading: false, error: new Error('Test error') }
    ])

    render(<TodoApp />)
    expect(screen.getByText('Error: Test error')).toBeInTheDocument()
  })
})
```

## 🔄 Migration from v2.x

### Before (v2.x)
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

### After (v3.0)
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
- ✅ **Built-in loading states** - No more manual sync status
- ✅ **Automatic error handling** - Graceful degradation
- ✅ **Zero configuration** - Works out of the box

## 🌟 Best Practices

### 1. **Choose the Right Persistence**
```tsx
// URL sharing - for public, shareable state
const [filters, setFilters] = useSlugStore('filters', defaultFilters, {
  url: true,
  compress: true
})

// Database storage - for private, cross-device state
const [preferences, setPreferences] = useSlugStore('preferences', defaultPrefs, {
  url: false,
  db: { endpoint: '/api/user/preferences' }
})

// Offline storage - for apps that need to work offline
const [todos, setTodos] = useSlugStore('todos', [], {
  url: false,
  offline: { storage: 'indexeddb', encryption: true },
  db: { endpoint: '/api/todos/sync' }
})
```

### 2. **Handle Loading and Error States**
```tsx
function MyComponent() {
  const [state, setState, { isLoading, error }] = useSlugStore('my-state', defaultState)

  if (isLoading) {
    return <div>Loading your data...</div>
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  return <div>{/* Your app */}</div>
}
```

### 3. **Optimize for Performance**
```tsx
// For large datasets
const [data, setData] = useSlugStore('large-data', [], {
  url: true,
  compress: true  // Essential for large data
})

// For sensitive data
const [secrets, setSecrets] = useSlugStore('secrets', {}, {
  url: false,
  offline: { 
    storage: 'indexeddb',
    encryption: true,
    password: userSpecificKey
  }
})
```

## 📊 Performance Metrics

| Feature | Bundle Impact | Performance |
|---------|---------------|-------------|
| **Core Hook** | 5.5KB gzipped | < 1ms initialization |
| **URL Sync** | +0KB | < 10ms per update |
| **Offline Storage** | +0KB | < 50ms read/write |
| **Database Sync** | +0KB | Network dependent |
| **Compression** | +0KB | 60-80% size reduction |
| **Encryption** | +0KB | < 20ms encrypt/decrypt |

## 🎯 Use Case Decision Tree

```
Need to share state externally?
├─ Yes → Use `url: true`
│   ├─ Large data? → Add `compress: true`
│   └─ Sensitive? → Add `encrypt: true`
└─ No → Use `url: false`
    ├─ Cross-device sync? → Add `db: { endpoint: '/api/sync' }`
    ├─ Offline support? → Add `offline: true`
    └─ Local only? → Use defaults
```

---

**Ready to simplify your state management?**

```bash
npm install @farajabien/slug-store
```

**Universal state persistence for React. Zero obstruction, maximum DevEx.** 🚀 