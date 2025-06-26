# @farajabien/slug-store

**Universal state persistence for React - URLs, databases, and offline-first apps**

[![npm version](https://badge.fury.io/js/@farajabien%2Fslug-store.svg)](https://badge.fury.io/js/@farajabien%2Fslug-store)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Slug Store revolutionizes state management by providing **three powerful use cases** in one unified package:

## 🚀 Three Use Cases, One Solution

### 1. **URL State Sharing** 📤
Share app state via URLs - perfect for dashboards, filters, and shareable configurations.

```tsx
import { useSlugStore } from '@farajabien/slug-store'

const DashboardFilters = () => {
  const { state, setState } = useSlugStore({
    dateRange: { start: '2024-01-01', end: '2024-12-31' },
    categories: ['tech', 'design'], 
    sortBy: 'date',
    view: 'grid'
  }, { 
    compress: true,    // Reduce URL size by ~60%
    debounceMs: 300   // Smooth performance
  })

  // URL automatically updates: ?state=N4IgZg9g...
  // Users can bookmark and share exact dashboard state!
}
```

### 2. **Database State Storage** 💾
Store state in any database with encryption - ideal for user preferences and private data.

```tsx
const UserPreferences = () => {
  const { state, setState } = useSlugStore({
    theme: 'dark',
    language: 'en',
    notifications: { email: true, push: false }
  }, {
    syncToUrl: false,      // Keep private  
    encrypt: true,         // Secure encryption
    password: 'user-123'   // User-specific key
  })

  // Automatically generates compressed, encrypted strings for database storage
  // Works with Supabase, Firebase, PostgreSQL, MongoDB, Redis - anything!
}
```

### 3. **Offline-First Webapps** 🌐
Transform any React app into an offline-capable application with automatic sync.

```tsx
const OfflineTodoApp = () => {
  const { state, setState, syncStatus } = useSlugStore({
    todos: [],
    filter: 'all'
  }, {
    syncToUrl: false,
    offlineSync: {
      syncEndpoint: '/api/sync/todos',
      conflictResolution: 'merge',     // Smart conflict resolution
      syncInterval: 30,               // Auto-sync every 30s when online
      onOffline: () => console.log('Working offline'),
      onOnline: () => console.log('Back online, syncing...')
    }
  })

  // ✅ Works offline automatically
  // ✅ Syncs when back online  
  // ✅ Resolves conflicts intelligently
  // ✅ No PWA complexity required!

  return (
    <div>
      <div className={`status ${syncStatus?.online ? 'online' : 'offline'}`}>
        {syncStatus?.online ? '🟢 Online' : '🔴 Offline'}
        {syncStatus?.pendingChanges > 0 && ` (${syncStatus.pendingChanges} changes pending)`}
      </div>
      {/* Your app components */}
    </div>
  )
}
```

## 🛠 Installation

```bash
npm install @farajabien/slug-store
# or
yarn add @farajabien/slug-store
# or
pnpm add @farajabien/slug-store
```

## 📖 Complete Guide

### URL State Sharing - Deep Dive

Perfect for dashboards, search interfaces, and any shareable app state.

#### Advanced Search Example
```tsx
interface SearchState {
  query: string
  filters: {
    category: string
    priceRange: [number, number]
    inStock: boolean
  }
  pagination: { page: number, size: number }
}

const SearchPage = () => {
  const { state, setState, getShareableUrl } = useSlugStore<SearchState>({
    query: '',
    filters: { category: 'all', priceRange: [0, 1000], inStock: false },
    pagination: { page: 1, size: 20 }
  }, { 
    compress: true,        // Essential for complex state
    key: 'search',        // Custom URL param name
    debounceMs: 500       // Prevent excessive URL updates
  })

  const updateQuery = (query: string) => {
    setState({
      ...state, 
      query,
      pagination: { ...state.pagination, page: 1 } // Reset to first page
    })
  }

  const shareResults = async () => {
    const url = await getShareableUrl()
    navigator.clipboard.writeText(url)
    // URL contains complete search state - perfect for sharing!
  }

  return (
    <div>
      <input 
        value={state.query}
        onChange={(e) => updateQuery(e.target.value)}
        placeholder="Search products..."
      />
      <button onClick={shareResults}>📤 Share Results</button>
      {/* Filter components, results, pagination */}
    </div>
  )
}
```

### Database Storage - Deep Dive

Store any state in your database with automatic encryption and compression.

#### E-commerce Cart Example
```tsx
import { create } from '@farajabien/slug-store'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

const cartStore = create<{
  items: CartItem[]
  total: number
}>((set, get) => ({
  items: [],
  total: 0,
  
  addItem: (item: CartItem) => {
    const { items } = get()
    const existing = items.find(i => i.id === item.id)
    
    if (existing) {
      set({
        items: items.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      })
    } else {
      set({ items: [...items, item] })
    }
    
    // Recalculate total
    const newItems = get().items
    set({ 
      total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) 
    })
  },
  
  removeItem: (id: string) => set(state => ({
    items: state.items.filter(item => item.id !== id) 
  }))
}), {
  syncToUrl: false,           // Don't expose cart in URL
  storeId: 'user-cart-123',   // User-specific storage
  compress: true,             // Optimize for database storage
  encrypt: true               // Secure user data
})

// Save to database
const saveCart = async () => {
  const cartSlug = await cartStore.getSlug() // Gets compressed, encrypted string
  
  await fetch('/api/user/cart', {
    method: 'POST',
    body: JSON.stringify({ cartData: cartSlug })
  })
}

// Load from database  
const loadCart = async () => {
  const response = await fetch('/api/user/cart')
  const { cartData } = await response.json()
  
  if (cartData) {
    await cartStore.loadFromSlug(cartData) // Decrypts and loads state
  }
}
```

### Offline-First Apps - Deep Dive

Transform any React app into an offline-capable application with zero configuration.

#### Advanced Note-Taking App
```tsx
interface Note {
  id: string
  title: string
  content: string
  lastModified: number
  tags: string[]
}

const NotesApp = () => {
  const { state, setState, syncStatus, sync, pullFromServer } = useSlugStore({
    notes: [] as Note[],
    activeNoteId: null as string | null,
    searchQuery: ''
  }, {
    syncToUrl: false,
    offlineSync: {
      syncEndpoint: '/api/sync/notes',
      encryptionKey: 'notes-user-123',  // Encrypt sensitive content
      syncInterval: 60,                 // Sync every minute when online
      retryAttempts: 5,                 // Robust error handling
      conflictResolution: (client, server) => {
        // Custom conflict resolution
        const clientNotes = client.notes
        const serverNotes = server.notes
        const merged = [...serverNotes]
        
        // Merge notes by lastModified timestamp
        clientNotes.forEach(clientNote => {
          const serverNote = serverNotes.find(n => n.id === clientNote.id)
          if (!serverNote || clientNote.lastModified > serverNote.lastModified) {
            const index = merged.findIndex(n => n.id === clientNote.id)
            if (index >= 0) {
              merged[index] = clientNote
            } else {
              merged.push(clientNote)
            }
          }
        })
        
        return { ...server, notes: merged }
      },
      onConflict: (client, server, resolved) => {
        console.log('📝 Notes conflict resolved:', {
          clientNotes: client.notes.length,
          serverNotes: server.notes.length, 
          resolvedNotes: resolved.notes.length
        })
      },
      onOffline: () => {
        showNotification('📴 Working offline - your notes are safe!', 'info')
      },
      onOnline: () => {
        showNotification('🌐 Back online - syncing your notes...', 'success')
      },
      onSyncError: (error, retryCount) => {
        showNotification(`❌ Sync failed (attempt ${retryCount})`, 'error')
      }
    }
  })

  const createNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random()}`,
      title: 'Untitled Note',
      content: '',
      lastModified: Date.now(),
      tags: []
    }
    
    setState({
      ...state,
      notes: [...state.notes, newNote],
      activeNoteId: newNote.id
    })
  }

  const updateNote = (updates: Partial<Note>) => {
    setState({
      ...state,
      notes: state.notes.map(note =>
        note.id === state.activeNoteId
          ? { ...note, ...updates, lastModified: Date.now() }
          : note
      )
    })
  }

  const activeNote = state.notes.find(n => n.id === state.activeNoteId)
  
  return (
    <div className="notes-app">
      {/* Sync Status */}
      <header className="app-header">
        <div className={`sync-status ${syncStatus?.online ? 'online' : 'offline'}`}>
          {syncStatus?.online ? '🟢 Online' : '🔴 Offline'}
          {syncStatus?.syncing && ' (Syncing...)'}
          {syncStatus?.pendingChanges > 0 && ` - ${syncStatus.pendingChanges} pending`}
          {syncStatus?.conflicts > 0 && ` - ${syncStatus.conflicts} conflicts`}
        </div>
        
        <div className="sync-actions">
          <button onClick={sync} disabled={syncStatus?.syncing}>
            🔄 Force Sync
          </button>
          <button onClick={pullFromServer}>
            ⬇️ Pull Latest
          </button>
        </div>
      </header>

      <div className="app-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="search-bar">
            <input 
              type="text"
              placeholder="🔍 Search notes..."
              value={state.searchQuery}
              onChange={(e) => setState({ ...state, searchQuery: e.target.value })}
            />
          </div>
          
          <button onClick={createNote} className="new-note-btn">
            ➕ New Note
          </button>
          
          <div className="notes-list">
            {state.notes
              .filter(note => 
                note.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(state.searchQuery.toLowerCase())
              )
              .sort((a, b) => b.lastModified - a.lastModified)
              .map(note => (
                <div 
                  key={note.id}
                  className={`note-item ${note.id === state.activeNoteId ? 'active' : ''}`}
                  onClick={() => setState({ ...state, activeNoteId: note.id })}
                >
                  <h4>{note.title || 'Untitled'}</h4>
                  <p>{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>
                  <div className="note-meta">
                    <time>{new Date(note.lastModified).toLocaleDateString()}</time>
                    {note.tags.length > 0 && (
                      <div className="tags">
                        {note.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                      </div>
                    )}
                  </div>
        </div>
      ))}
          </div>
        </aside>
        
        {/* Editor */}
        <main className="editor">
          {activeNote ? (
            <div className="note-editor">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                placeholder="Note title..."
                className="note-title-input"
              />
              <textarea 
                value={activeNote.content}
                onChange={(e) => updateNote({ content: e.target.value })}
                placeholder="Start writing your note..."
                className="note-content-textarea"
              />
              <div className="editor-footer">
                <span className="last-modified">
                  Last modified: {new Date(activeNote.lastModified).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>📝 Welcome to Notes</h3>
              <p>Select a note to edit or create a new one</p>
              <button onClick={createNote}>Create First Note</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
```

## 🖥 Server-Side Integration

Slug Store works with **any backend framework and database**. Here are universal examples:

### Next.js API Route
```typescript
// app/api/sync/[storeId]/route.ts
import { handleSyncRequest } from '@farajabien/slug-store/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  return handleSyncRequest(req, {
    async load(storeId: string) {
      const record = await prisma.appState.findUnique({
        where: { storeId },
        select: { slug: true }
      })
      return record?.slug || null
    },
    
    async save(storeId: string, slug: string, metadata: any) {
      await prisma.appState.upsert({
        where: { storeId },
        update: { slug, updatedAt: new Date(), ...metadata },
        create: { storeId, slug, ...metadata }
      })
    }
  })
}

export const POST = GET // Handle both GET and POST
```

### Supabase Integration
```typescript
import { createClient } from '@supabase/supabase-js'
import { handleSyncRequest } from '@farajabien/slug-store/server'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export function createSupabaseSyncHandler() {
  return (req: Request) => handleSyncRequest(req, {
    async load(storeId: string) {
      const { data } = await supabase
        .from('app_state')
        .select('slug')
        .eq('store_id', storeId)
        .single()
      
      return data?.slug || null
    },
    
    async save(storeId: string, slug: string, metadata: any) {
      await supabase
        .from('app_state')
        .upsert({
          store_id: storeId,
          slug,
          updated_at: new Date().toISOString(),
          user_id: metadata.userId,
          ...metadata
        })
    }
  })
}
```

### Express.js + Redis
```typescript
import express from 'express'
import Redis from 'redis'
import { handleSyncRequest } from '@farajabien/slug-store/server'

const redis = Redis.createClient()
const app = express()

app.all('/api/sync/:storeId', async (req, res) => {
  const response = await handleSyncRequest(req, {
    async load(storeId: string) {
      return await redis.get(`app_state:${storeId}`)
    },
    
    async save(storeId: string, slug: string, metadata: any) {
      // Set with 24 hour expiration
      await redis.setex(`app_state:${storeId}`, 86400, slug)
    }
  })
  
  res.status(response.status).json(await response.json())
})
```

## ⚡ Performance Optimization

### Best Practices for Large Applications

```tsx
// 1. Use compression for complex state
const { state, setState } = useSlugStore(complexState, {
  compress: true,        // Reduces URL size by ~60%
  debounceMs: 500       // Batch URL updates for performance
})

// 2. Optimize array operations
const { state, setState } = useSlugStore({
  items: new Map<string, Item>(),     // Use Map for O(1) lookups
  selectedIds: new Set<string>()      // Use Set for selections
}, {
  // Convert for serialization
  beforeEncode: (state) => ({
    items: Object.fromEntries(state.items),
    selectedIds: Array.from(state.selectedIds)
  }),
  afterDecode: (state) => ({
    items: new Map(Object.entries(state.items || {})),
    selectedIds: new Set(state.selectedIds || [])
  })
})

// 3. Efficient large dataset handling
const DataTable = () => {
  const { state, setState } = useSlugStore({
    data: [] as DataItem[],
    pagination: { page: 1, size: 50 },
    filters: {}
  }, {
    compress: true,
    debounceMs: 1000,      // Higher debounce for large data
    offlineSync: {
      syncInterval: 300,    // Sync every 5 minutes for large datasets
      conflictResolution: 'server-wins' // Server authoritative
    }
  })

  // Render only visible items for performance
  const visibleItems = useMemo(() => 
    state.data.slice(
      (state.pagination.page - 1) * state.pagination.size,
      state.pagination.page * state.pagination.size
    ), [state.data, state.pagination]
  )

  return (
    <VirtualizedList items={visibleItems} />
  )
}

// 4. Memory-efficient updates
const updateItem = useCallback((id: string, updates: Partial<Item>) => {
  setState(prev => ({
    ...prev,
    items: new Map(prev.items).set(id, { ...prev.items.get(id), ...updates })
  }))
}, [setState])
```

## 🔒 Security & Privacy

### Encryption Options
```tsx
// Automatic encryption for sensitive data
const { state, setState } = useSlugStore(sensitiveData, {
  encrypt: true,
  password: `user-${userId}-secret` // User-specific encryption
})

// Offline-sync with encryption
const { state, setState } = useSlugStore(privateNotes, {
  offlineSync: {
    syncEndpoint: '/api/sync/notes',
    encryptionKey: userEncryptionKey,    // User-provided key
    conflictResolution: 'merge'
  }
})
```

### Data Privacy
```tsx
// Keep sensitive data out of URLs
const { state, setState } = useSlugStore(userProfile, {
  syncToUrl: false,        // Never expose in URL
  encrypt: true,           // Always encrypt
  storeId: `profile-${userId}` // User-specific storage
})
```

## 🧪 Testing

Slug Store includes comprehensive testing utilities:

```tsx
import { renderHook, act } from '@testing-library/react'
import { useSlugStore } from '@farajabien/slug-store'

describe('My Component', () => {
  it('should update state correctly', () => {
    const { result } = renderHook(() => 
      useSlugStore({ count: 0 }, { syncToUrl: false })
    )

    act(() => {
      result.current.setState({ count: 5 })
    })

    expect(result.current.state.count).toBe(5)
  })

  it('should handle offline sync', async () => {
    const { result } = renderHook(() => 
      useSlugStore({ data: 'test' }, {
        offlineSync: {
          syncEndpoint: '/api/test-sync',
          conflictResolution: 'client-wins'
        }
      })
    )

    expect(result.current.syncStatus?.online).toBe(true)
    
    // Test offline functionality
    Object.defineProperty(navigator, 'onLine', { value: false })
    
    act(() => {
      result.current.setState({ data: 'offline-update' })
    })

    expect(result.current.syncStatus?.pendingChanges).toBeGreaterThan(0)
  })
})
```

## 📚 API Reference

### `useSlugStore(initialState, options)`

#### Options
```typescript
interface UseSlugStoreOptions {
  // Basic options
  key?: string                    // URL parameter name (default: 'state')
  syncToUrl?: boolean            // Sync to URL (default: true)
  debounceMs?: number            // Debounce URL updates (default: 100ms)
  
  // Encoding options
  compress?: boolean             // Enable compression (default: false)
  encrypt?: boolean              // Enable encryption (default: false)
  password?: string              // Encryption password
  
  // Error handling
  fallback?: boolean             // Graceful error handling (default: true)
  
  // Offline sync
  offlineSync?: boolean | {
    syncEndpoint?: string        // Sync URL (default: auto-detected)
    conflictResolution?: 'client-wins' | 'server-wins' | 'merge' | 'timestamp' | Function
    syncInterval?: number        // Auto-sync interval in seconds (default: 30)
    retryAttempts?: number       // Retry failed syncs (default: 3)
    encryptionKey?: string       // User-specific encryption key
    
    // Callbacks
    onSync?: (data, direction) => void
    onConflict?: (client, server, resolved) => void
    onOffline?: () => void
    onOnline?: () => void
    onSyncError?: (error, retryCount) => void
  }
}
```

#### Returns
```typescript
interface UseSlugStoreReturn<T> {
  state: T                           // Current state
  setState: (value: T | (prev: T) => T) => void  // Update state
  resetState: () => void             // Reset to initial state
  getShareableUrl: () => Promise<string>         // Get URL with current state
  hasUrlState: boolean               // Whether URL contains state
  
  // Offline sync (when enabled)
  syncStatus?: SyncStatus            // Sync status information
  sync?: () => Promise<void>         // Manual sync trigger
  pullFromServer?: () => Promise<void>   // Force pull from server
  pushToServer?: () => Promise<void>     // Force push to server
}
```

### `create(storeCreator, options)`

Create a standalone store (similar to Zustand):

```typescript
const store = create<State>((set, get) => ({
  // Initial state and actions
}), {
  // Same options as useSlugStore
})

// Usage
const state = store.getState()
store.setState({ field: 'value' })
```

### Server Functions

#### `handleSyncRequest(request, handlers)`
```typescript
handleSyncRequest(request: Request, {
  load: (storeId: string) => Promise<string | null>,
  save: (storeId: string, slug: string, metadata: any) => Promise<void>
})
```

## 🌟 Why Choose Slug Store?

### ✅ **Universal** - Works everywhere
- Any React framework (Next.js, Remix, Vite, CRA)
- Any backend (Node.js, Python, PHP, Go)  
- Any database (PostgreSQL, MongoDB, Redis, Supabase, Firebase)

### ✅ **Zero Configuration** - Start immediately
- `useSlugStore(state)` - instantly shareable via URL
- `offlineSync: true` - instantly works offline
- No complex setup, no PWA requirements

### ✅ **Type-Safe** - Full TypeScript support
- Complete type inference
- Intellisense for all options
- Compile-time error checking

### ✅ **Performance Optimized**
- Intelligent compression (60%+ size reduction)
- Efficient debouncing 
- Memory-conscious design
- Handles large datasets gracefully

### ✅ **Production Ready**
- Comprehensive error handling
- Graceful fallbacks
- Extensive test coverage
- Battle-tested in production apps

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Faraja Bien](https://github.com/farajabien)

## 🔗 Links

- [GitHub Repository](https://github.com/farajabien/slug-store)
- [NPM Package](https://www.npmjs.com/package/@farajabien/slug-store)
- [Documentation](https://github.com/farajabien/slug-store/tree/main/docs)
- [Examples](https://github.com/farajabien/slug-store/tree/main/examples)

---

**Transform your React apps today with universal state persistence!** 🚀