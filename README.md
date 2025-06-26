# Slug Store

> **Universal state persistence for modern web apps. Zero obstruction, maximum DevEx.**

**One package. Three use cases. Everything you need.**

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

## 🔥 NEW: Universal Offline-Sync

**Any webapp can now work offline. No PWA complexity. Just add `offlineSync: true`.**

```typescript
// Your app now works offline automatically
const { state, setState, syncStatus } = useSlugStore(
  { todos: [], cart: [], preferences: {} },
  { offlineSync: true } // That's it!
)

// Advanced offline-sync with custom conflict resolution
const { state, setState, sync } = useSlugStore(
  initialData,
  { 
    offlineSync: {
      conflictResolution: 'merge',  // Intelligent merging
      syncInterval: 30,             // Auto-sync every 30s
      onSync: (data, direction) => console.log(`Synced ${direction}`, data)
    }
  }
)
```

**Key Features:**
- 🔄 **Background sync** when online
- 🔀 **Smart conflict resolution** (merge, client-wins, server-wins, custom)
- 💾 **IndexedDB storage** for offline persistence
- 🔐 **Auto-encryption** for user data
- 🌐 **Universal endpoints** - works with any database
- 📱 **Works without PWA** - just regular web apps

## 📚 Complete API Reference

### **Client-Side Exports** (React Hooks)
```typescript
import { 
  useSlugStore,           // useState-like hook with URL persistence + offline-sync
  create,                 // Zustand-like store creator with URL sync + offline-sync
  
  // Offline-sync utilities
  createOfflineSync,      // Create standalone offline-sync engine
  resolveConflict         // Custom conflict resolution helpers
} from '@farajabien/slug-store'

// Types
import type {
  SlugStoreOptions,       // Options for useSlugStore
  UseSlugStoreOptions,    // Hook-specific options
  UseSlugStoreReturn,     // Return type of useSlugStore
  SlugStoreCreator,       // Type for create function
  SlugStore,              // Store instance type
  
  // Offline-sync types
  OfflineSyncOptions,     // Offline-sync configuration
  SyncStatus,             // Sync status information
  AppStateSnapshot,       // State snapshot with metadata
  OfflineSyncEngine       // Standalone sync engine type
} from '@farajabien/slug-store'
```

### **Server-Side Exports** (Universal Functions)
```typescript
import {
  // URL Sharing (Use Case 1)
  createShareableUrl,     // Create URLs with embedded state
  loadFromShareableUrl,   // Extract state from shareable URLs
  
  // Database Storage (Use Case 2)
  createUserState,        // Encode state for database storage
  loadUserState,          // Decode state from database
  saveUserState,          // Save state and return slug
  
  // Offline-Sync Server (Use Case 3)
  handleSyncRequest,      // Universal sync endpoint handler
  
  // Unified Interface (Recommended)
  persistState,           // Universal state persistence
  restoreState,           // Universal state restoration
  
  // Legacy Server Hook
  useSlugStore as useServerSlugStore,  // Server-side hook
  fromDatabase,           // Load from database with slug
  createSlugForDatabase   // Create slug for database storage
} from '@farajabien/slug-store'

// Types
import type {
  ShareableOptions,       // Options for URL sharing
  UserStateOptions,       // Options for database storage
  DatabaseStateResult,    // Result from saveUserState
  UniversalOptions,       // Options for persistState
  SyncHandlerOptions,     // Sync endpoint options
  SlugStoreServerOptions, // Server hook options
  SlugStoreServerReturn   // Server hook return type
} from '@farajabien/slug-store'
```

### **Core Exports** (Encoding/Decoding)
```typescript
import {
  encodeState,            // Convert state to compressed slug
  decodeState,            // Convert slug back to state
  validateSlug,           // Validate slug format
  getSlugInfo             // Get metadata about a slug
} from '@farajabien/slug-store'

// Types
import type {
  EncodeOptions,          // Options for encoding
  DecodeOptions,          // Options for decoding
  SlugInfo,               // Slug metadata
  SlugStoreError          // Error types
} from '@farajabien/slug-store'
```

### **Targeted Imports** (Smaller Bundles)
```typescript
// Client-only (React hooks)
import { useSlugStore, create } from '@farajabien/slug-store/client'

// Server-only (Universal functions)
import { persistState, restoreState, handleSyncRequest } from '@farajabien/slug-store/server'

// Core-only (Encoding/decoding)
import { encodeState, decodeState } from '@farajabien/slug-store-core'
```

## 🎯 The Three Use Cases

### 1. **Share State via URLs** 
```typescript
import { createShareableUrl, loadFromShareableUrl } from '@farajabien/slug-store'

// Create shareable dashboard
const shareUrl = await createShareableUrl({
  dashboard: { widgets: ['users', 'revenue'] },
  filters: { dateRange: 'last-30-days' }
})
// → https://myapp.com?state=v1.comp.eyJkYXRhIjoiSDRzSUFBQUFBQUFBQS...

// Load from any shared URL  
const state = await loadFromShareableUrl(shareUrl)
```

### 2. **Store State in Database**
```typescript
import { saveUserState, loadUserState } from '@farajabien/slug-store'

// Works with ANY database
const { slug } = await saveUserState({
  theme: 'dark',
  preferences: { notifications: true }
})

// Supabase
await supabase.from('profiles').insert({ user_id: user.id, app_state: slug })

// Firebase  
await db.collection('users').doc(userId).set({ appState: slug })

// PostgreSQL + Prisma
await prisma.user.update({ where: { id: userId }, data: { appState: slug } })

// Load from any database
const userPrefs = await loadUserState(profile.app_state)
```

### 3. **Offline-First Webapps** ⭐ NEW
```typescript
import { useSlugStore, handleSyncRequest } from '@farajabien/slug-store'

// CLIENT: Your app now works offline
const { state, setState, syncStatus } = useSlugStore(
  { todos: [], cart: [] },
  { offlineSync: true }
)

// SERVER: Auto-generated sync endpoint (Next.js example)
// app/api/sync/[storeId]/route.ts
export async function GET(request: Request, { params }: { params: { storeId: string } }) {
  return handleSyncRequest(params.storeId, request, {
    loadState: async (storeId) => {
      const result = await db.query('SELECT app_state FROM stores WHERE id = ?', [storeId])
      return result.rows[0]?.app_state
    }
  })
}

export async function POST(request: Request, { params }: { params: { storeId: string } }) {
  return handleSyncRequest(params.storeId, request, {
    saveState: async (storeId, slug, metadata) => {
      await db.query(
        'INSERT INTO stores (id, app_state, updated_at) VALUES (?, ?, ?) ON CONFLICT (id) DO UPDATE SET app_state = ?, updated_at = ?',
        [storeId, slug, metadata.timestamp, slug, metadata.timestamp]
      )
    }
  })
}
```

## 🔥 Why One Package?

**Before Slug Store:**
- ❌ Redux: Complex setup, boilerplate hell
- ❌ Multiple packages: Confusing, dependency conflicts  
- ❌ Zustand + localStorage: Browser-only, no sharing, no offline-sync
- ❌ Server state libraries: Database complexity, caching headaches
- ❌ PWA: Complex setup for offline functionality

**With Slug Store:**
- ✅ **One package** - Install once, use everywhere
- ✅ **Zero config** - Works immediately
- ✅ **Universal** - Client, server, offline, any framework
- ✅ **Automatic** - Compression, encryption, optimization, sync
- ✅ **Any database** - Supabase, Firebase, SQL, NoSQL
- ✅ **Offline-first** - No PWA required, just add one option

## 🚀 Real Examples

<details>
<summary><strong>Offline-First Todo App</strong></summary>

```typescript
// Client: Works online and offline
import { useSlugStore } from '@farajabien/slug-store'

interface TodoState {
  todos: Array<{ id: string; text: string; done: boolean }>
  filter: 'all' | 'active' | 'completed'
}

export function TodoApp() {
  const { state, setState, syncStatus } = useSlugStore<TodoState>(
    { todos: [], filter: 'all' },
    { 
      offlineSync: {
        conflictResolution: 'merge',  // Merge todos from different devices
        syncInterval: 15,             // Sync every 15 seconds when online
        onSync: (data, direction) => {
          console.log(`Synced ${direction}:`, data.todos.length, 'todos')
        }
      }
    }
  )

  const addTodo = (text: string) => {
    setState(prev => ({
      ...prev,
      todos: [...prev.todos, { id: crypto.randomUUID(), text, done: false }]
    }))
  }

  return (
    <div>
      {/* Sync status indicator */}
      {syncStatus && (
        <div className="sync-status">
          {syncStatus.online ? '🟢' : '🔴'} 
          {syncStatus.syncing && '⏳'} 
          {syncStatus.pendingChanges > 0 && `${syncStatus.pendingChanges} pending`}
        </div>
      )}
      
      {/* Your app continues to work offline */}
      <TodoList todos={state.todos} onToggle={toggleTodo} />
      <AddTodoForm onAdd={addTodo} />
    </div>
  )
}
```

</details>

<details>
<summary><strong>Next.js App with User Preferences + Offline</strong></summary>

```typescript
// app/profile/page.tsx (Server Component)
import { loadUserState } from '@farajabien/slug-store'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export default async function ProfilePage() {
  const supabase = createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Load user preferences from database
  const { data: profile } = await supabase
    .from('profiles') 
    .select('app_state')
    .eq('user_id', user.id)
    .single()
    
  const userSettings = profile?.app_state 
    ? await loadUserState(profile.app_state)
    : { theme: 'light', layout: 'grid' }

  return <Dashboard settings={userSettings} />
}

// components/settings-form.tsx (Client Component with Offline)
'use client'
import { useSlugStore, saveUserState } from '@farajabien/slug-store'

export function SettingsForm({ initialSettings }) {
  const { state, setState, syncStatus } = useSlugStore(
    initialSettings,
    { 
      offlineSync: {
        conflictResolution: 'client-wins', // User's local changes win
        encryptionKey: user.id,            // User-specific encryption
      }
    }
  )

  // Settings persist offline and sync when online
  const updateSettings = async (newSettings) => {
    setState(newSettings)
    
    // Also save to Supabase (happens automatically with offline-sync)
    const { slug } = await saveUserState(newSettings, { encryptionKey: user.id })
    await supabase.from('profiles').upsert({
      user_id: user.id,
      app_state: slug
    })
  }
  
  return (
    <form onSubmit={updateSettings}>
      {/* Settings work offline */}
      <ThemeSelector value={state.theme} onChange={updateTheme} />
      <LayoutSelector value={state.layout} onChange={updateLayout} />
      
      {/* Show sync status */}
      {syncStatus?.pendingChanges > 0 && (
        <p>💾 {syncStatus.pendingChanges} changes will sync when online</p>
      )}
    </form>
  )
}

// app/api/sync/[storeId]/route.ts (Auto-generated sync endpoint)
import { handleSyncRequest } from '@farajabien/slug-store'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(request: Request, { params }: { params: { storeId: string } }) {
  return handleSyncRequest(params.storeId, request, {
    loadState: async (storeId) => {
      const supabase = createRouteHandlerClient()
      const { data } = await supabase
        .from('profiles')
        .select('app_state')
        .eq('store_id', storeId)
        .single()
      return data?.app_state
    }
  })
}

export async function POST(request: Request, { params }: { params: { storeId: string } }) {
  return handleSyncRequest(params.storeId, request, {
    saveState: async (storeId, slug, metadata) => {
      const supabase = createRouteHandlerClient()
      await supabase.from('profiles').upsert({
        store_id: storeId,
        app_state: slug,
        updated_at: new Date(metadata.timestamp).toISOString()
      })
    }
  })
}
```

</details>

<details>
<summary><strong>E-commerce Cart with Offline Support</strong></summary>

```typescript
// Store cart with offline persistence (no more lost carts!)
import { useSlugStore, saveUserState } from '@farajabien/slug-store'

interface CartState {
  items: Array<{ id: string; name: string; price: number; quantity: number }>
  total: number
  promoCode?: string
}

export function useShoppingCart() {
  const { state, setState, syncStatus } = useSlugStore<CartState>(
    { items: [], total: 0 },
    { 
      offlineSync: {
        conflictResolution: 'merge',  // Merge cart items from different devices
        syncInterval: 30,             // Sync every 30 seconds
        onConflict: (client, server, resolved) => {
          // Notify user of merged cart items
          toast.info(`Merged ${resolved.items.length} cart items from other devices`)
        }
      }
    }
  )

  const addToCart = (item) => {
    setState(prev => {
      const existingItem = prev.items.find(i => i.id === item.id)
      const newItems = existingItem
        ? prev.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev.items, { ...item, quantity: 1 }]
      
      return {
        ...prev,
        items: newItems,
        total: newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
      }
    })
  }

  return {
    cart: state,
    addToCart,
    syncStatus,
    // Cart automatically syncs across devices and works offline
  }
}

// Server: Save cart to user profile (any database)
const { slug } = await saveUserState(cartState, { encryptionKey: userId })

// Any database works:
// Supabase
await supabase.from('users').update({ cart_state: slug }).eq('id', userId)

// MongoDB  
await User.findByIdAndUpdate(userId, { cartState: slug })

// MySQL
await db.query('UPDATE users SET cart_state = ? WHERE id = ?', [slug, userId])
```

</details>

## 📚 Package Architecture

```
@farajabien/slug-store/
├── index.js          # Everything (recommended)
├── client.js         # React-only exports  
├── server.js         # Server-only exports
├── offline-sync.js   # Standalone offline-sync engine
└── core              # Encoding/decoding (auto-included)
```

**Import styles:**
```typescript
// Recommended: Import everything
import { useSlugStore, saveUserState, createShareableUrl, handleSyncRequest } from '@farajabien/slug-store'

// Targeted imports (smaller bundles)
import { useSlugStore } from '@farajabien/slug-store/client'
import { saveUserState, handleSyncRequest } from '@farajabien/slug-store/server'
```

## 🛠️ Framework Examples

### React (Client-side + Offline)
```typescript
import { useSlugStore } from '@farajabien/slug-store'

function MyComponent() {
  const { state, setState, syncStatus } = useSlugStore(
    { view: 'grid', filters: {} },
    { offlineSync: true } // Works offline automatically
  )
  return <div>...</div>
}
```

### Next.js (Server Components + Sync Endpoints)
```typescript
import { loadFromShareableUrl, restoreState, handleSyncRequest } from '@farajabien/slug-store'

export default async function Page({ searchParams }) {
  const state = searchParams.state 
    ? await restoreState(searchParams.state)
    : defaultState
  return <Dashboard state={state} />
}

// Auto-generated sync endpoint
export async function POST(request: Request, { params }) {
  return handleSyncRequest(params.storeId, request, { saveState, loadState })
}
```

### Remix (Loaders + Offline-Sync)
```typescript
import { restoreState } from '@farajabien/slug-store'

export async function loader({ request }) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  
  return state ? await restoreState(state) : defaultState
}
```

### Node.js (Any Server + Universal Sync)
```typescript
import { persistState, restoreState, handleSyncRequest } from '@farajabien/slug-store'

// Save state
const slug = await persistState(data, 'user') // For database
const shareSlug = await persistState(data, 'share') // For URLs

// Load state  
const data = await restoreState(slug)

// Universal sync endpoint
app.post('/api/sync/:storeId', (req, res) => {
  return handleSyncRequest(req.params.storeId, req, { saveState, loadState })
})
```

## 🎁 What's Included

- **`@farajabien/slug-store`** - Main package (everything you need)
- **`@farajabien/slug-store-core`** - Auto-included (encoding/decoding)
- **`@farajabien/slug-store-ui`** - Optional UI components

## 🤝 Migration

**From any state library:**
```typescript
// Before (Redux, Zustand, etc.)
const state = useSelector(selectUserPrefs)
dispatch(updatePrefs(newPrefs))

// After (Slug Store + Offline)
const { state, setState } = useSlugStore(defaultPrefs, { offlineSync: true })
const userPrefs = await loadUserState(dbSlug) // Server
```

**From localStorage:**
```typescript
// Before
localStorage.setItem('prefs', JSON.stringify(data))
const data = JSON.parse(localStorage.getItem('prefs') || '{}')

// After (with offline-sync and server persistence)
const { state, setState } = useSlugStore(data, { offlineSync: true }) // Client
const { slug } = await saveUserState(data) // Store in database
const data = await loadUserState(slug) // Works everywhere
```

## 📄 License

MIT - Build anything, anywhere.

---

**One package. Universal state. Zero obstruction. Offline-first.**