# Slug Store

> **Universal state persistence for modern web apps. Zero obstruction, maximum DevEx.**

**One package. Two use cases. Everything you need.**

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

## 🎯 The Two Use Cases

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

## 🔥 Why One Package?

**Before Slug Store:**
- ❌ Redux: Complex setup, boilerplate hell
- ❌ Multiple packages: Confusing, dependency conflicts  
- ❌ Zustand + localStorage: Browser-only, no sharing
- ❌ Server state libraries: Database complexity, caching headaches

**With Slug Store:**
- ✅ **One package** - Install once, use everywhere
- ✅ **Zero config** - Works immediately
- ✅ **Universal** - Client, server, any framework
- ✅ **Automatic** - Compression, encryption, optimization
- ✅ **Any database** - Supabase, Firebase, SQL, NoSQL

## 🚀 Real Examples

<details>
<summary><strong>Next.js App with User Preferences</strong></summary>

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

// components/settings-form.tsx (Client Component)
'use client'
import { saveUserState } from '@farajabien/slug-store'

export function SettingsForm({ currentSettings }) {
  const updateSettings = async (newSettings) => {
    // Save to database
    const { slug } = await saveUserState(newSettings)
    await supabase.from('profiles').upsert({
      user_id: user.id,
      app_state: slug
    })
  }
  
  return <form onSubmit={updateSettings}>...</form>
}
```

</details>

<details>
<summary><strong>Analytics Dashboard Sharing</strong></summary>

```typescript
// Share dashboard configuration
import { createShareableUrl, loadFromShareableUrl } from '@farajabien/slug-store'

// Create shareable dashboard
const dashboardConfig = {
  widgets: ['revenue', 'users', 'conversion'],
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  filters: { segment: 'enterprise' }
}

const shareUrl = await createShareableUrl(dashboardConfig)
// Send to team: https://analytics.com?state=v1.comp.eyJ...

// Load shared dashboard (any team member)
const config = await loadFromShareableUrl(window.location.href)
```

</details>

<details>
<summary><strong>E-commerce Cart Persistence</strong></summary>

```typescript
// Store cart in user profile (works with any database)
import { saveUserState, loadUserState } from '@farajabien/slug-store'

// Save cart
const cart = {
  items: [{ id: '123', name: 'iPhone 15', price: 999, quantity: 1 }],
  total: 999,
  promoCode: 'SAVE10'
}

const { slug } = await saveUserState(cart)

// Any database works:
// Supabase
await supabase.from('users').update({ cart_state: slug }).eq('id', userId)

// MongoDB  
await User.findByIdAndUpdate(userId, { cartState: slug })

// MySQL
await db.query('UPDATE users SET cart_state = ? WHERE id = ?', [slug, userId])

// Load cart (from any database)
const savedCart = await loadUserState(user.cart_state)
```

</details>

## 📚 Package Architecture

```
@farajabien/slug-store/
├── index.js          # Everything (recommended)
├── client.js         # React-only exports  
├── server.js         # Server-only exports
└── core              # Encoding/decoding (auto-included)
```

**Import styles:**
```typescript
// Recommended: Import everything
import { useSlugStore, saveUserState, createShareableUrl } from '@farajabien/slug-store'

// Targeted imports (smaller bundles)
import { useSlugStore } from '@farajabien/slug-store/client'
import { saveUserState } from '@farajabien/slug-store/server'
```

## 🛠️ Framework Examples

### React (Client-side)
```typescript
import { useSlugStore } from '@farajabien/slug-store'

function MyComponent() {
  const { state, setState } = useSlugStore({ view: 'grid', filters: {} })
  return <div>...</div>
}
```

### Next.js (Server Components)
```typescript
import { loadFromShareableUrl, restoreState } from '@farajabien/slug-store'

export default async function Page({ searchParams }) {
  const state = searchParams.state 
    ? await restoreState(searchParams.state)
    : defaultState
  return <Dashboard state={state} />
}
```

### Remix (Loaders)
```typescript
import { restoreState } from '@farajabien/slug-store'

export async function loader({ request }) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  
  return state ? await restoreState(state) : defaultState
}
```

### Node.js (Any Server)
```typescript
import { persistState, restoreState } from '@farajabien/slug-store'

// Save state
const slug = await persistState(data, 'user') // For database
const shareSlug = await persistState(data, 'share') // For URLs

// Load state  
const data = await restoreState(slug)
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

// After (Slug Store)
const { state, setState } = useSlugStore(defaultPrefs) // Client
const userPrefs = await loadUserState(dbSlug) // Server
```

**From localStorage:**
```typescript
// Before
localStorage.setItem('prefs', JSON.stringify(data))
const data = JSON.parse(localStorage.getItem('prefs') || '{}')

// After
const { slug } = await saveUserState(data) // Store in database
const data = await loadUserState(slug) // Works everywhere
```

## 📄 License

MIT - Build anything, anywhere.

---

**One package. Infinite possibilities. Zero obstruction.**