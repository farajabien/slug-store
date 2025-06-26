# Slug Store Usage Guide

> **Universal state persistence for modern web apps. Zero obstruction, maximum DevEx.**

Complete guide to using Slug Store - from simple React apps to complex offline-first applications.

## 🎯 The Revolution: Universal State Management

```bash
npm install @farajabien/slug-store
```

**What you get:**
- ✅ **Client-side React hooks** - URL state persistence + offline-sync
- ✅ **Server-side functions** - Database integration with any database
- ✅ **Universal functions** - Auto-optimized for purpose
- ✅ **Offline-sync engine** - Any webapp works offline without PWA complexity
- ✅ **Core functionality** - Compression, encryption, validation (auto-included)
- ✅ **TypeScript support** - Full type safety
- ✅ **Zero additional dependencies** - Everything built-in

## 🎯 The Three Use Cases

### 1. **Share State via URLs**
*For dashboards, filters, configurations that need external sharing*

```typescript
import { createShareableUrl, loadFromShareableUrl } from '@farajabien/slug-store'

// Create shareable URL
const shareUrl = await createShareableUrl({
  dashboard: { widgets: ['users', 'revenue'] },
  filters: { dateRange: 'last-30-days', status: 'active' }
})
// → https://myapp.com?state=v1.comp.eyJkYXRhIjoiSDRzSUFBQUFBQUFBQS...

// Load from shared URL  
const state = await loadFromShareableUrl(shareUrl)
```

### 2. **Store State in Database**
*For user preferences, private data that doesn't need sharing*

```typescript
import { saveUserState, loadUserState } from '@farajabien/slug-store'

// Works with ANY database
const { slug } = await saveUserState({
  theme: 'dark',
  preferences: { notifications: true },
  dashboardLayout: 'grid'
})

// Store in your database (any database works!)
await supabase.from('profiles').insert({ user_id: user.id, app_state: slug })
await db.collection('users').doc(userId).set({ appState: slug })
await prisma.user.update({ where: { id: userId }, data: { appState: slug } })

// Load from database
const userPrefs = await loadUserState(profile.app_state)
```

### 3. **🔥 NEW: Offline-First Webapps**
*Any webapp can work offline without PWA complexity*

```typescript
import { useSlugStore } from '@farajabien/slug-store'

// Simple offline-sync - just add one option!
const { state, setState, syncStatus } = useSlugStore({
  todos: [],
  cart: [],
  preferences: {}
}, {
  offlineSync: true  // That's it! Works offline now
})

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

// Features:
// 🔄 Background sync when online
// 🔀 Smart conflict resolution  
// 💾 IndexedDB storage
// 🔐 Auto-encryption
// 🌐 Universal endpoints
```

## 🚀 Real-World Examples

### Offline-First Todo App

```typescript
// src/hooks/useTodoStore.ts
import { useSlugStore } from '@farajabien/slug-store'

interface TodoState {
  todos: Todo[]
  filter: 'all' | 'active' | 'completed'
  searchQuery: string
}

export function useTodoStore() {
  const { state, setState, syncStatus, sync } = useSlugStore<TodoState>({
    todos: [],
    filter: 'all',
    searchQuery: ''
  }, {
    offlineSync: {
      conflictResolution: 'merge',  // Smart merging for todos
      syncInterval: 30,             // Auto-sync every 30s
      onSync: (data, direction) => {
        console.log(`Synced ${direction}:`, data.todos.length, 'todos')
      }
    }
  })

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

  const toggleTodo = (id: string) => {
    setState({
      ...state,
      todos: state.todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    })
  }

  return { 
    state, 
    addTodo, 
    toggleTodo, 
    syncStatus, 
    sync,
    isOnline: syncStatus?.online ?? true,
    pendingChanges: syncStatus?.pendingChanges ?? 0
  }
}

// Usage in component
function TodoApp() {
  const { state, addTodo, toggleTodo, syncStatus, sync, isOnline, pendingChanges } = useTodoStore()

  return (
    <div>
      {/* Sync Status Indicator */}
      <div className={`sync-status ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? '🟢 Online' : '🔴 Offline'}
        {pendingChanges > 0 && ` (${pendingChanges} pending changes)`}
      </div>

      {/* Todo Input */}
      <input 
        placeholder="Add a todo..."
        onKeyPress={(e) => {
          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            addTodo(e.currentTarget.value.trim())
            e.currentTarget.value = ''
          }
        }}
      />

      {/* Filter Buttons */}
      <div className="filters">
        {(['all', 'active', 'completed'] as const).map(filter => (
          <button
            key={filter}
            className={state.filter === filter ? 'active' : ''}
            onClick={() => setState({ ...state, filter })}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Todo List */}
      <ul>
        {state.todos
          .filter(todo => {
            if (state.filter === 'active') return !todo.completed
            if (state.filter === 'completed') return todo.completed
            return true
          })
          .map(todo => (
            <li key={todo.id}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className={todo.completed ? 'completed' : ''}>
                  {todo.text}
                </span>
              </label>
            </li>
          ))}
      </ul>

      {/* Manual Sync Button */}
      <button onClick={sync} disabled={syncStatus?.syncing}>
        Force Sync
      </button>
    </div>
  )
}
```

### Project Management App (Clarity Style)

```typescript
// src/hooks/useProjectStore.ts
import { useSlugStore } from '@farajabien/slug-store'

interface ProjectState {
  projects: Project[]
  filters: { type: 'all' | 'personal' | 'client'; status: string; search: string }
  view: 'grid' | 'list'
  selectedProject: string | null
}

export function useProjectStore() {
  const { state, setState, getShareableUrl } = useSlugStore<ProjectState>({
    projects: [],
    filters: { type: 'all', status: 'all', search: '' },
    view: 'grid',
    selectedProject: null
  }, {
    compress: true,    // Compress large project data
    debounceMs: 300   // Smooth URL updates
  })

  // All mutations automatically sync to URL
  const addProject = (project: Omit<Project, 'id'>) => {
    setState({
      ...state,
      projects: [...state.projects, { ...project, id: crypto.randomUUID() }]
    })
  }

  const updateFilters = (filters: Partial<ProjectState['filters']>) => {
    setState({ ...state, filters: { ...state.filters, ...filters } })
  }

  return { state, addProject, updateFilters, getShareableUrl }
}

// Usage in component
function ProjectDashboard() {
  const { state, updateFilters, getShareableUrl } = useProjectStore()

  const shareFilters = async () => {
    const url = await getShareableUrl()
    navigator.clipboard.writeText(url)
    toast.success('Filter state copied! Share with your team.')
  }

  return (
    <div>
      <input 
        placeholder="Search projects..."
        value={state.filters.search}
        onChange={(e) => updateFilters({ search: e.target.value })}
      />
      <button onClick={shareFilters}>Share Current View</button>
      
      {/* Projects automatically filter based on URL state */}
      <ProjectGrid projects={filteredProjects} />
    </div>
  )
}
```

### Offline-Sync Shopping Cart

```typescript
// Shopping cart that works offline and syncs when online
import { useSlugStore } from '@farajabien/slug-store'

interface CartState {
  items: CartItem[]
  total: number
  promoCode?: string
}

export function useCartStore() {
  const { state, setState, syncStatus } = useSlugStore<CartState>({
    items: [],
    total: 0
  }, {
    offlineSync: {
      conflictResolution: 'merge',
      syncInterval: 60, // Sync every minute
      onSync: (data, direction) => {
        console.log(`Cart synced ${direction}:`, data.items.length, 'items')
      }
    }
  })

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const existingItem = state.items.find(i => i.productId === item.productId)
    
    if (existingItem) {
      setState({
        ...state,
        items: state.items.map(i => 
          i.productId === item.productId 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
        total: state.total + (item.price * item.quantity)
      })
    } else {
      setState({
        ...state,
        items: [...state.items, { ...item, id: crypto.randomUUID() }],
        total: state.total + (item.price * item.quantity)
      })
    }
  }

  const removeItem = (itemId: string) => {
    const item = state.items.find(i => i.id === itemId)
    if (item) {
      setState({
        ...state,
        items: state.items.filter(i => i.id !== itemId),
        total: state.total - (item.price * item.quantity)
      })
    }
  }

  return { 
    state, 
    addItem, 
    removeItem, 
    syncStatus,
    isOnline: syncStatus?.online ?? true,
    pendingChanges: syncStatus?.pendingChanges ?? 0
  }
}

// Usage in component
function ShoppingCart() {
  const { state, addItem, removeItem, isOnline, pendingChanges } = useCartStore()

  return (
    <div>
      {/* Online/Offline Status */}
      <div className={`status ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? '🟢 Online' : '🔴 Offline'}
        {pendingChanges > 0 && ` - ${pendingChanges} pending changes`}
      </div>

      {/* Cart Items */}
      {state.items.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price} x {item.quantity}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}

      <div>Total: ${state.total}</div>
    </div>
  )
}
```

### User Preferences with Database Storage

```typescript
// Any database works - here's examples for all major ones

// SUPABASE
import { saveUserState, loadUserState } from '@farajabien/slug-store'

async function saveUserPreferences(userId: string, preferences: UserPrefs) {
  const { slug } = await saveUserState(preferences)
  
  await supabase.from('profiles').upsert({
    user_id: userId,
    app_state: slug,
    updated_at: new Date().toISOString()
  })
}

async function loadUserPreferences(userId: string): Promise<UserPrefs> {
  const { data } = await supabase
    .from('profiles')
    .select('app_state')
    .eq('user_id', userId)
    .single()
    
  return data?.app_state 
    ? await loadUserState(data.app_state)
    : defaultPreferences
}

// FIREBASE
async function saveToFirebase(userId: string, preferences: UserPrefs) {
  const { slug } = await saveUserState(preferences)
  await db.collection('users').doc(userId).set({ 
    appState: slug,
    updatedAt: FieldValue.serverTimestamp() 
  }, { merge: true })
}

// POSTGRESQL + PRISMA
async function saveToPrisma(userId: string, preferences: UserPrefs) {
  const { slug } = await saveUserState(preferences)
  await prisma.user.update({
    where: { id: userId },
    data: { appState: slug }
  })
}

// MONGODB + MONGOOSE  
async function saveToMongo(userId: string, preferences: UserPrefs) {
  const { slug } = await saveUserState(preferences)
  await User.findByIdAndUpdate(userId, { appState: slug })
}

// ANY SQL DATABASE
async function saveToSQL(userId: string, preferences: UserPrefs) {
  const { slug } = await saveUserState(preferences)
  await db.query('UPDATE users SET app_state = ? WHERE id = ?', [slug, userId])
}
```

### Next.js Full-Stack App with Offline-Sync

```typescript
// app/dashboard/page.tsx (Server Component)
import { loadUserState, loadFromShareableUrl } from '@farajabien/slug-store'

export default async function DashboardPage({ searchParams, user }) {
  // Load shared state from URL (if shared)
  const sharedState = searchParams.state 
    ? await loadFromShareableUrl(`${process.env.BASE_URL}?state=${searchParams.state}`)
    : null

  // Load user's personal state from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('app_state')
    .eq('user_id', user.id)
    .single()
    
  const userState = profile?.app_state
    ? await loadUserState(profile.app_state)
    : getDefaultDashboard()

  // Shared state takes precedence (for collaboration)
  const initialState = sharedState || userState

  return <DashboardComponent initialState={initialState} user={user} />
}

// components/dashboard.tsx (Client Component)
'use client'
import { useSlugStore, saveUserState, createShareableUrl } from '@farajabien/slug-store'

export function DashboardComponent({ initialState, user }) {
  const { state, setState, syncStatus } = useSlugStore(initialState, { 
    compress: true,
    offlineSync: {
      conflictResolution: 'merge',
      syncInterval: 60
    }
  })

  // Save to user's profile
  const savePersonal = async () => {
    const { slug } = await saveUserState(state)
    await supabase.from('profiles').upsert({
      user_id: user.id,
      app_state: slug
    })
    toast.success('Dashboard saved to your profile!')
  }

  // Share with team
  const shareWithTeam = async () => {
    const shareUrl = await createShareableUrl(state)
    navigator.clipboard.writeText(shareUrl)
    toast.success('Dashboard shared! Anyone with the link can view this configuration.')
  }

  return (
    <div>
      {/* Sync Status */}
      <div className={`sync-status ${syncStatus?.online ? 'online' : 'offline'}`}>
        {syncStatus?.online ? '🟢 Online' : '🔴 Offline'}
        {syncStatus?.pendingChanges > 0 && ` (${syncStatus.pendingChanges} pending)`}
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={savePersonal}>Save to My Profile</button>
        <button onClick={shareWithTeam}>Share with Team</button>
      </div>
      
      {/* Dashboard automatically syncs to URL for sharing */}
      <DashboardWidgets state={state} setState={setState} />
    </div>
  )
}
```

### E-commerce Shopping Cart with Offline-Sync

```typescript
// Shopping cart that works everywhere and syncs offline
import { saveUserState, loadUserState } from '@farajabien/slug-store'

interface CartState {
  items: CartItem[]
  total: number
  promoCode?: string
}

// Save cart for logged-in users (any database)
async function saveCartToProfile(userId: string, cart: CartState) {
  const { slug } = await saveUserState(cart)
  
  // Works with any database
  await supabase.from('users').update({ cart_state: slug }).eq('id', userId)
  // or Firebase: await db.collection('users').doc(userId).update({ cartState: slug })
  // or SQL: await db.query('UPDATE users SET cart_state = ? WHERE id = ?', [slug, userId])
}

// Save cart for guest users (localStorage)
async function saveGuestCart(cart: CartState) {
  const { slug } = await saveUserState(cart)
  localStorage.setItem('guest_cart', slug)
}

// Load cart (universal)
async function loadCart(userId?: string): Promise<CartState> {
  if (userId) {
    // Load from database
    const { data } = await supabase.from('users').select('cart_state').eq('id', userId).single()
    return data?.cart_state ? await loadUserState(data.cart_state) : { items: [], total: 0 }
  } else {
    // Load from localStorage
    const guestCart = localStorage.getItem('guest_cart')
    return guestCart ? await loadUserState(guestCart) : { items: [], total: 0 }
  }
}
```

## 🛠️ Framework Examples

### React (Client-Side Only)

```typescript
import { useSlugStore } from '@farajabien/slug-store'

function SimpleApp() {
  const { state, setState } = useSlugStore({
    todos: [],
    filter: 'all',
    theme: 'light'
  })

  // State automatically syncs to URL - instantly shareable!
  return <TodoApp state={state} setState={setState} />
}

// With offline-sync
function OfflineApp() {
  const { state, setState, syncStatus } = useSlugStore({
    todos: [],
    filter: 'all',
    theme: 'light'
  }, {
    offlineSync: true  // Works offline automatically
  })

  return (
    <div>
      <div className={`status ${syncStatus?.online ? 'online' : 'offline'}`}>
        {syncStatus?.online ? '🟢 Online' : '🔴 Offline'}
      </div>
      <TodoApp state={state} setState={setState} />
    </div>
  )
}
```

### Next.js (Full-Stack)

```typescript
// Server: Load from database or URL
export default async function Page({ searchParams, user }) {
  const state = searchParams.state 
    ? await loadFromShareableUrl(searchParams.state)
    : await loadUserState(user.appState)
    
  return <App initialState={state} />
}

// Client: Save to database, share via URL, work offline
function App({ initialState }) {
  const { state, syncStatus } = useSlugStore(initialState, {
    offlineSync: {
      conflictResolution: 'merge',
      syncInterval: 60
    }
  })
  
  const savePersonal = async () => {
    const { slug } = await saveUserState(state)
    await saveToDatabase(slug)
  }
  
  return (
    <div>
      <div className={`sync-status ${syncStatus?.online ? 'online' : 'offline'}`}>
        {syncStatus?.online ? '🟢 Online' : '🔴 Offline'}
      </div>
      <button onClick={savePersonal}>Save</button>
    </div>
  )
}
```

### Remix

```typescript
// Loader
export async function loader({ request, params }) {
  const url = new URL(request.url)
  const stateParam = url.searchParams.get('state')
  
  const state = stateParam 
    ? await restoreState(stateParam) // Auto-detects format
    : await loadUserStateFromDB(params.userId)

  return json({ state })
}

// Action  
export async function action({ request }) {
  const formData = await request.formData()
  const newState = JSON.parse(formData.get('state'))
  
  const { slug } = await saveUserState(newState)
  await saveToDatabase(slug)
  
  return redirect('/dashboard')
}

// Component with offline-sync
function RemixApp({ state }) {
  const { state: localState, syncStatus } = useSlugStore(state, {
    offlineSync: true
  })

  return (
    <div>
      <div className={`status ${syncStatus?.online ? 'online' : 'offline'}`}>
        {syncStatus?.online ? '🟢 Online' : '🔴 Offline'}
      </div>
      <Form method="post">
        <input type="hidden" name="state" value={JSON.stringify(localState)} />
        <button type="submit">Save</button>
      </Form>
    </div>
  )
}
```

### Node.js (Any Server)

```typescript
import { persistState, restoreState, handleSyncRequest } from '@farajabien/slug-store'

// Express.js
app.post('/api/save-state', async (req, res) => {
  const { data, purpose } = req.body
  
  // Auto-optimized encoding
  const slug = await persistState(data, purpose) // 'share' or 'user'
  
  if (purpose === 'user') {
    await saveToUserProfile(req.user.id, slug)
  }
  
  res.json({ slug, shareUrl: purpose === 'share' ? `/app?state=${slug}` : null })
})

// Load state
app.get('/api/load-state/:slug', async (req, res) => {
  const state = await restoreState(req.params.slug) // Auto-detects format
  res.json({ state })
})

// Universal offline-sync endpoint
app.all('/api/sync/:storeId', async (req, res) => {
  const result = await handleSyncRequest(req, {
    loadState: async (storeId) => {
      const record = await db.collection('app_state').doc(storeId).get()
      return record.exists ? record.data().state : null
    },
    saveState: async (storeId, state) => {
      await db.collection('app_state').doc(storeId).set({
        state,
        updatedAt: new Date()
      })
    }
  })
  
  res.json(result)
})
```

### Offline-Sync Server Integration

```typescript
// Universal sync endpoint for any database
// app/api/sync/[storeId]/route.ts (Next.js)
import { handleSyncRequest } from '@farajabien/slug-store'

export async function GET(request: Request, { params }: { params: { storeId: string } }) {
  return handleSyncRequest(request, {
    loadState: async (storeId) => {
      // Load from your database
      const record = await db.collection('app_state').doc(storeId).get()
      return record.exists ? record.data().state : null
    },
    saveState: async (storeId, state) => {
      // Save to your database
      await db.collection('app_state').doc(storeId).set({
        state,
        updatedAt: new Date()
      })
    }
  })
}

export async function POST(request: Request, { params }: { params: { storeId: string } }) {
  return handleSyncRequest(request, {
    loadState: async (storeId) => {
      const record = await db.collection('app_state').doc(storeId).get()
      return record.exists ? record.data().state : null
    },
    saveState: async (storeId, state) => {
      await db.collection('app_state').doc(storeId).set({
        state,
        updatedAt: new Date()
      })
    }
  })
}

// Express.js version
app.all('/api/sync/:storeId', async (req, res) => {
  const result = await handleSyncRequest(req, {
    loadState: async (storeId) => {
      const record = await db.collection('app_state').doc(storeId).get()
      return record.exists ? record.data().state : null
    },
    saveState: async (storeId, state) => {
      await db.collection('app_state').doc(storeId).set({
        state,
        updatedAt: new Date()
      })
    }
  })
  
  res.json(result)
})
```

## 🗄️ Database Schema Examples

### Supabase

```sql
-- Add to your profiles/users table
ALTER TABLE profiles ADD COLUMN app_state TEXT;

-- Or create dedicated table
CREATE TABLE user_app_states (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  app_state TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### PostgreSQL

```sql
-- Add to existing users table
ALTER TABLE users ADD COLUMN app_state TEXT;

-- Or dedicated table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY,
  app_state TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### MongoDB

```javascript
// User schema
{
  _id: ObjectId,
  email: String,
  appState: String,  // <- Slug Store data
  createdAt: Date,
  updatedAt: Date
}
```

### Firebase Firestore

```javascript
// users/{userId}
{
  email: string,
  appState: string,  // <- Slug Store data
  updatedAt: timestamp
}
```

## 🎨 Import Patterns

```typescript
// Everything (recommended - zero config)
import { useSlugStore, saveUserState, createShareableUrl, handleSyncRequest } from '@farajabien/slug-store'

// Client-only (smaller bundle for client-side apps)
import { useSlugStore, create } from '@farajabien/slug-store/client'

// Server-only (for API routes, server components)  
import { saveUserState, createShareableUrl, persistState, handleSyncRequest } from '@farajabien/slug-store/server'

// Core only (if you need just encoding/decoding)
import { encodeState, decodeState } from '@farajabien/slug-store'

// Offline-sync utilities
import { createOfflineSync, resolveConflict } from '@farajabien/slug-store'
```

## 🚀 Production Tips

### Security & Privacy

```typescript
// User data: Always encrypted
const { slug } = await saveUserState(sensitiveData, {
  encrypt: true,
  password: userSpecificKey // Different per user
})

// Sharing: Usually not encrypted (unless sensitive)
const shareUrl = await createShareableUrl(dashboardConfig, baseUrl, {
  compress: true,  // Smaller URLs
  encrypt: false   // Shareable by default
})

// Offline-sync: Auto-encrypted by default
const { state } = useSlugStore(initialData, {
  offlineSync: {
    encrypt: true,  // Automatic encryption
    password: userKey // Optional custom key
  }
})
```

### Performance Optimization

```typescript
// Large datasets: Always compress
const { state } = useSlugStore(largeProjectData, {
  compress: true,    // 30-70% size reduction
  debounceMs: 500   // Less aggressive URL updates
})

// Offline-sync: Optimize for your use case
const { state } = useSlugStore(data, {
  offlineSync: {
    syncInterval: 60,  // Sync every minute (not too aggressive)
    conflictResolution: 'merge',  // Smart merging
    compress: true,  // Compress offline data
    encrypt: true    // Encrypt sensitive data
  }
})
```

### Offline-Sync Best Practices

```typescript
// 1. Choose the right conflict resolution
const { state } = useSlugStore(data, {
  offlineSync: {
    conflictResolution: 'merge',  // For collaborative data
    // conflictResolution: 'client-wins',  // For user preferences
    // conflictResolution: 'server-wins',  // For authoritative data
    // conflictResolution: 'timestamp',    // For time-based conflicts
    // conflictResolution: (client, server) => customMerge(client, server)  // Custom logic
  }
})

// 2. Handle sync status in UI
function App() {
  const { state, syncStatus } = useSlugStore(data, { offlineSync: true })
  
  return (
    <div>
      <div className={`sync-indicator ${syncStatus?.online ? 'online' : 'offline'}`}>
        {syncStatus?.online ? '🟢 Online' : '🔴 Offline'}
        {syncStatus?.syncing && ' 🔄 Syncing...'}
        {syncStatus?.pendingChanges > 0 && ` (${syncStatus.pendingChanges} pending)`}
      </div>
      
      {syncStatus?.conflicts && (
        <div className="conflict-warning">
          ⚠️ Sync conflicts detected. Resolving automatically...
        </div>
      )}
    </div>
  )
}

// 3. Optimize sync intervals
const { state } = useSlugStore(data, {
  offlineSync: {
    syncInterval: 30,  // Frequent for real-time apps
    // syncInterval: 300,  // Less frequent for productivity apps
    // syncInterval: 0,    // Manual sync only
  }
})
```

## 🧪 Testing

```typescript
import { saveUserState, loadUserState, createShareableUrl, createOfflineSync } from '@farajabien/slug-store'

describe('User Preferences', () => {
  it('should save and load user state', async () => {
    const preferences = { theme: 'dark', notifications: true }
    
    const { slug } = await saveUserState(preferences)
    expect(slug).toBeTruthy()
    
    const loaded = await loadUserState(slug)
    expect(loaded).toEqual(preferences)
  })

  it('should create shareable URLs', async () => {
    const dashboardConfig = { widgets: ['users', 'revenue'] }
    
    const shareUrl = await createShareableUrl(dashboardConfig, 'https://app.com')
    expect(shareUrl).toContain('state=')
    
    const loaded = await loadFromShareableUrl(shareUrl)
    expect(loaded).toEqual(dashboardConfig)
  })
})

describe('Offline-Sync', () => {
  it('should create offline-sync engine', async () => {
    const engine = await createOfflineSync({
      storeId: 'test-store',
      conflictResolution: 'merge'
    })
    
    expect(engine).toBeDefined()
    expect(engine.sync).toBeDefined()
  })

  it('should handle offline state changes', async () => {
    const engine = await createOfflineSync({
      storeId: 'test-store',
      conflictResolution: 'merge'
    })
    
    // Simulate offline state changes
    await engine.saveState({ todos: [{ id: '1', text: 'Test', completed: false }] })
    
    const state = await engine.loadState()
    expect(state.todos).toHaveLength(1)
    expect(state.todos[0].text).toBe('Test')
  })

  it('should resolve conflicts intelligently', async () => {
    const engine = await createOfflineSync({
      storeId: 'test-store',
      conflictResolution: 'merge'
    })
    
    // Client state
    const clientState = { 
      todos: [
        { id: '1', text: 'Client todo', completed: false },
        { id: '2', text: 'Client todo 2', completed: true }
      ]
    }
    
    // Server state
    const serverState = {
      todos: [
        { id: '1', text: 'Server todo', completed: true },
        { id: '3', text: 'Server todo 3', completed: false }
      ]
    }
    
    const merged = await engine.resolveConflict(clientState, serverState)
    
    // Should merge both states intelligently
    expect(merged.todos).toHaveLength(3)
    expect(merged.todos.find(t => t.id === '1')?.completed).toBe(true) // Server wins for existing
    expect(merged.todos.find(t => t.id === '2')).toBeDefined() // Client todo preserved
    expect(merged.todos.find(t => t.id === '3')).toBeDefined() // Server todo preserved
  })
})
```

## 🔄 Migration Examples

### From Redux

```typescript
// Before (Redux - complex)
const state = useSelector(selectUserPrefs)
const dispatch = useDispatch()
dispatch(updateUserPrefs(newPrefs))

// After (Slug Store - simple)
const { state, setState } = useSlugStore(defaultPrefs)
setState(newPrefs) // Auto-saves to URL
```

### From localStorage

```typescript
// Before (localStorage - browser only)
localStorage.setItem('prefs', JSON.stringify(preferences))
const prefs = JSON.parse(localStorage.getItem('prefs') || '{}')

// After (Slug Store - universal)
const { slug } = await saveUserState(preferences) // Store in database
const prefs = await loadUserState(slug) // Load anywhere
```

### From PWA/Service Workers

```typescript
// Before (PWA - complex setup)
// - Service worker registration
// - Background sync API
// - IndexedDB setup
// - Conflict resolution logic
// - Network detection

// After (Slug Store - one line)
const { state, setState, syncStatus } = useSlugStore(data, {
  offlineSync: true  // That's it! Works offline now
})
```

## 📈 Performance Comparison

| Operation | Traditional | Slug Store |
|-----------|------------|------------|
| **Setup** | 30+ lines config | 1 line import |
| **Persistence** | Manual localStorage | Automatic |
| **Sharing** | Build custom URLs | Built-in |
| **Database** | Custom serialization | Auto-handled |
| **Compression** | Manual gzip | Built-in |
| **Encryption** | Custom crypto | Built-in |
| **Type Safety** | Manual types | Auto-inferred |
| **Offline-Sync** | PWA complexity | `offlineSync: true` |
| **Conflict Resolution** | Custom logic | Built-in strategies |

## 🎯 Use Case Matrix

| Use Case | Traditional Solution | Slug Store Solution |
|----------|---------------------|-------------------|
| **User Preferences** | localStorage + API | `saveUserState()` |
| **Dashboard Sharing** | Custom URL builder | `createShareableUrl()` |
| **Shopping Cart** | Session + Database | `saveUserState()` |
| **Form State** | Form libraries | `useSlugStore()` |
| **Filters/Search** | URL params manually | `useSlugStore()` |
| **Collaboration** | Complex real-time sync | URL sharing |
| **Offline Apps** | PWA + Service Workers | `offlineSync: true` |
| **Mobile Web Apps** | Native apps | Offline-sync web apps |

## 🌟 The Three Pillars

### 1. **🌐 URL Persistence**
- Instant shareability across devices
- Zero infrastructure required
- Perfect for dashboards, filters, configurations

### 2. **💾 Database Storage**  
- Universal database compatibility
- Automatic compression and encryption
- Perfect for user preferences, private data

### 3. **🔥 Offline-Sync**
- Any webapp works offline without PWA complexity
- Smart conflict resolution
- Background sync when online
- Perfect for productivity apps, shopping carts, todo apps

---

**Ready to eliminate state complexity?**

```bash
npm install @farajabien/slug-store
```

**Universal state persistence for modern web apps. Zero obstruction, maximum DevEx.** 