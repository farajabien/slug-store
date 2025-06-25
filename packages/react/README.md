# @farajabien/slug-store

> **Universal state persistence for modern web apps. Zero obstruction, maximum DevEx.**

Two simple use cases. Everything else is noise.

## 🚀 Quick Start

```bash
npm install @farajabien/slug-store
```

## 📚 Complete API Reference

### **Everything Import** (Recommended)
```typescript
import { 
  // Client-Side (React Hooks)
  useSlugStore,           // useState-like hook with URL persistence
  create,                 // Zustand-like store creator with URL sync
  
  // Server-Side (Universal Functions)
  createShareableUrl,     // Create URLs with embedded state
  loadFromShareableUrl,   // Extract state from shareable URLs
  createUserState,        // Encode state for database storage
  loadUserState,          // Decode state from database
  saveUserState,          // Save state and return slug
  persistState,           // Universal state persistence
  restoreState,           // Universal state restoration
  
  // Core (Encoding/Decoding)
  encodeState,            // Convert state to compressed slug
  decodeState,            // Convert slug back to state
  validateSlug,           // Validate slug format
  getSlugInfo             // Get metadata about a slug
} from '@farajabien/slug-store'
```

### **Client-Side Only** (React Apps)
```typescript
import { 
  useSlugStore,           // useState-like hook with URL persistence
  create                  // Zustand-like store creator with URL sync
} from '@farajabien/slug-store/client'

// Types
import type {
  SlugStoreOptions,       // Options for useSlugStore
  UseSlugStoreOptions,    // Hook-specific options
  UseSlugStoreReturn,     // Return type of useSlugStore
  SlugStoreCreator,       // Type for create function
  SlugStore               // Store instance type
} from '@farajabien/slug-store/client'
```

### **Server-Side Only** (Node.js, Next.js, Remix)
```typescript
import {
  // URL Sharing (Use Case 1)
  createShareableUrl,     // Create URLs with embedded state
  loadFromShareableUrl,   // Extract state from shareable URLs
  
  // Database Storage (Use Case 2)
  createUserState,        // Encode state for database storage
  loadUserState,          // Decode state from database
  saveUserState,          // Save state and return slug
  
  // Unified Interface (Recommended)
  persistState,           // Universal state persistence
  restoreState,           // Universal state restoration
  
  // Legacy Server Hook
  useSlugStore as useServerSlugStore,  // Server-side hook
  fromDatabase,           // Load from database with slug
  createSlugForDatabase   // Create slug for database storage
} from '@farajabien/slug-store/server'

// Types
import type {
  ShareableOptions,       // Options for URL sharing
  UserStateOptions,       // Options for database storage
  DatabaseStateResult,    // Result from saveUserState
  UniversalOptions,       // Options for persistState
  SlugStoreServerOptions, // Server hook options
  SlugStoreServerReturn   // Server hook return type
} from '@farajabien/slug-store/server'
```

### **Core Only** (Framework-agnostic)
```typescript
import {
  encodeState,            // Convert state to compressed slug
  decodeState,            // Convert slug back to state
  validateSlug,           // Validate slug format
  getSlugInfo             // Get metadata about a slug
} from '@farajabien/slug-store-core'

// Types
import type {
  EncodeOptions,          // Options for encoding
  DecodeOptions,          // Options for decoding
  SlugInfo,               // Slug metadata
  SlugStoreError          // Error types
} from '@farajabien/slug-store-core'
```

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
// → { dashboard: { widgets: [...] }, filters: {...} }
```

### 2. **Store State in Database**
*For user preferences, private data that doesn't need sharing*

```typescript
import { saveUserState, loadUserState } from '@farajabien/slug-store'

// Save user state to database (Supabase example)
const { slug } = await saveUserState({
  theme: 'dark',
  preferences: { notifications: true },
  dashboardLayout: 'grid'
})

await supabase.from('profiles').insert({
  user_id: user.id,
  app_state: slug  // Compressed + encrypted
})

// Load user state
const { data: profile } = await supabase
  .from('profiles')
  .select('app_state')
  .single()
  
const userPreferences = await loadUserState(profile.app_state)
```

That's it. **No configuration, no setup, no learning curve.**

## 🎨 Real-World Examples

<details>
<summary><strong>Supabase User Profiles</strong></summary>

```typescript
// profiles table schema
// user_id: uuid
// app_state: text  <- This is where the magic happens

// Save user's app state
const userData = {
  theme: 'dark',
  dashboardWidgets: ['sales', 'users', 'revenue'],
  preferences: { notifications: true, autoSave: true }
}

const { slug } = await saveUserState(userData)
await supabase.from('profiles').upsert({
  user_id: session.user.id,
  app_state: slug
})

// Load user's app state (server component)
const { data: profile } = await supabase
  .from('profiles')
  .select('app_state')
  .eq('user_id', session.user.id)
  .single()

const userSettings = await loadUserState(profile.app_state)
```

</details>

<details>
<summary><strong>Analytics Dashboard Sharing</strong></summary>

```typescript
// Create shareable dashboard
const dashboardState = {
  widgets: ['revenue', 'users', 'conversion'],
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  filters: { segment: 'enterprise', region: 'us' }
}

const shareUrl = await createShareableUrl(dashboardState, 'https://analytics.com')
// Send this URL to team members

// Load shared dashboard
const sharedState = await loadFromShareableUrl(shareUrl)
```

</details>

<details>
<summary><strong>E-commerce Cart Persistence</strong></summary>

```typescript
// Store cart in user profile (no URL clutter)
const cartState = {
  items: [
    { id: '123', name: 'iPhone 15', price: 999, quantity: 1 },
    { id: '456', name: 'AirPods Pro', price: 249, quantity: 2 }
  ],
  total: 1497,
  promoCode: 'SAVE10'
}

// Save to user's profile
const { slug } = await saveUserState(cartState)
await updateUser(userId, { cart_state: slug })

// Restore cart on login
const cartData = await loadUserState(user.cart_state)
```

</details>

## 🔥 Why This Approach?

**Traditional approaches:**
- ❌ Redux: Complex setup, boilerplate hell
- ❌ Zustand + localStorage: Browser-only, no sharing
- ❌ Server state: Database complexity, caching headaches
- ❌ URL params: Limited size, ugly URLs

**Slug Store approach:**
- ✅ **Zero configuration** - Works immediately
- ✅ **Universal** - Client, server, anywhere
- ✅ **Automatic** - Compression, encryption, caching
- ✅ **Scalable** - URLs or database, your choice
- ✅ **Shareable** - Instant collaboration
- ✅ **Private** - Encrypted user data

## 📚 Advanced Features

### Automatic Compression & Encryption

```typescript
// For sharing (optimized for URLs)
const shareSlug = await persistState(data, 'share', {
  compress: true,    // Smaller URLs
  encrypt: false     // Public sharing
})

// For users (optimized for privacy)  
const userSlug = await persistState(data, 'user', {
  compress: true,    // Save database space
  encrypt: true,     // Protect user data
  password: userKey  // User-specific encryption
})
```

### Framework Integration

```typescript
// Next.js Server Components
export default async function Dashboard({ searchParams }) {
  const filters = searchParams.state 
    ? await restoreState(searchParams.state)
    : defaultFilters
    
  return <DashboardComponent filters={filters} />
}

// Remix Loaders
export async function loader({ request }) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  
  return state ? await restoreState(state) : defaultState
}
```

## 🌟 Migration Guide

### From localStorage

```typescript
// Before
localStorage.setItem('state', JSON.stringify(data))
const data = JSON.parse(localStorage.getItem('state') || '{}')

// After  
const { slug } = await saveUserState(data)  // Store in user profile
const data = await loadUserState(userSlug)  // Load from anywhere
```

### From URL params

```typescript
// Before  
const url = new URL(window.location)
url.searchParams.set('filter', 'active')
url.searchParams.set('view', 'grid')

// After
const shareUrl = await createShareableUrl({ filter: 'active', view: 'grid' })
```

## 🎁 Packages

- **`@farajabien/slug-store`** - Main package (this one)
- **`@farajabien/slug-store-core`** - Core encoding/decoding  
- **`@farajabien/slug-store-ui`** - UI components

## 🤝 Contributing

This is about **eliminating complexity**, not adding features. Every PR should make the DX simpler.

## 📄 License

MIT - Use it anywhere, build anything.

---

**Made for developers who want to build, not configure.**