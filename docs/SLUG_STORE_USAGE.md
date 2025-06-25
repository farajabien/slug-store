# Slug Store Usage Guide

> **One package. Two use cases. Zero obstruction.**

Complete guide to using Slug Store - from simple React apps to complex full-stack systems.

## 🎯 The Revolution: One Package for Everything

```bash
npm install @farajabien/slug-store
```

**What you get:**
- ✅ **Client-side React hooks** - URL state persistence
- ✅ **Server-side functions** - Database integration with any database
- ✅ **Universal functions** - Auto-optimized for purpose
- ✅ **Core functionality** - Compression, encryption, validation (auto-included)
- ✅ **TypeScript support** - Full type safety
- ✅ **Zero additional dependencies** - Everything built-in

## 🎯 The Two Use Cases

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

## 🚀 Real-World Examples

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

### Next.js Full-Stack App

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
  const { state, setState } = useSlugStore(initialState, { compress: true })

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

### E-commerce Shopping Cart

```typescript
// Shopping cart that works everywhere
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

// Client: Save to database, share via URL
function App({ initialState }) {
  const { state } = useSlugStore(initialState)
  
  const savePersonal = async () => {
    const { slug } = await saveUserState(state)
    await saveToDatabase(slug)
  }
  
  return <div>...</div>
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
```

### Node.js (Any Server)

```typescript
import { persistState, restoreState } from '@farajabien/slug-store'

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
import { useSlugStore, saveUserState, createShareableUrl } from '@farajabien/slug-store'

// Client-only (smaller bundle for client-side apps)
import { useSlugStore, create } from '@farajabien/slug-store/client'

// Server-only (for API routes, server components)  
import { saveUserState, createShareableUrl, persistState } from '@farajabien/slug-store/server'

// Core only (if you need just encoding/decoding)
import { encodeState, decodeState } from '@farajabien/slug-store'
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
```

### Performance Optimization

```typescript
// Large datasets: Always compress
const { state } = useSlugStore(largeProjectData, {
  compress: true,    // 30-70% size reduction
  debounceMs: 500   // Less aggressive URL updates
})
```

## 🧪 Testing

```typescript
import { saveUserState, loadUserState, createShareableUrl } from '@farajabien/slug-store'

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

## 🎯 Use Case Matrix

| Use Case | Traditional Solution | Slug Store Solution |
|----------|---------------------|-------------------|
| **User Preferences** | localStorage + API | `saveUserState()` |
| **Dashboard Sharing** | Custom URL builder | `createShareableUrl()` |
| **Shopping Cart** | Session + Database | `saveUserState()` |
| **Form State** | Form libraries | `useSlugStore()` |
| **Filters/Search** | URL params manually | `useSlugStore()` |
| **Collaboration** | Complex real-time sync | URL sharing |

---

**Ready to eliminate state complexity?**

```bash
npm install @farajabien/slug-store
```

**One package. Infinite possibilities. Zero obstruction.** 