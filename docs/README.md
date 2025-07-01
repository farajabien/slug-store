# Slug Store v4.0.0 Documentation

**The State Management Solution for Next.js App Router**

> **Core Philosophy**: Easy state persistence across components with zero boilerplate.

## 🚀 Quick Start

### 1. Install
```bash
npm install slug-store
```

### 2. Create State
```typescript
// lib/state.ts
import { createNextState } from 'slug-store/server';
import { updateUserAction } from '@/app/actions';

export const UserState = createNextState({
  loader: (id: string) => db.user.findUnique({ where: { id } }),
  updater: updateUserAction,
  autoConfig: true  // 🎯 Automatic optimization
});
```

### 3. Use in Server Component
```typescript
// app/users/[id]/page.tsx
import { UserState } from '@/lib/state';

export default async function Page({ params }) {
  return (
    <UserState.Provider id={params.id}>
      <UserProfile />
    </UserState.Provider>
  );
}
```

### 4. Use in Client Component
```typescript
// app/users/[id]/user-profile.tsx
'use client';
import { UserState } from '@/lib/state';

export function UserProfile() {
  const [user, setUser] = UserState.use();
  
  return (
    <input
      value={user?.name || ''}
      onChange={(e) => setUser({ ...user, name: e.target.value })}
    />
  );
}
```

**That's it!** Your state is now:
- ✅ **Persisted** across page refreshes
- ✅ **Synchronized** between server and client
- ✅ **Optimized** automatically (compression, encryption, etc.)
- ✅ **Type-safe** end-to-end

## 🧠 Auto Config System

Slug Store automatically detects your data patterns and optimizes accordingly:

```typescript
// Small, shareable data → URL persistence
const [filters, setFilters] = useSlugStore({ category: 'tech', sort: 'newest' });
// ✅ Automatically persisted in URL for sharing

// Large data → Offline storage
const [products, setProducts] = useSlugStore({ items: Array(1000).fill('...') });
// ✅ Automatically compressed and stored offline

// Sensitive data → Encryption
const [user, setUser] = useSlugStore({ email: 'user@example.com', password: 'secret' });
// ✅ Automatically encrypted for security
```

## 📦 Advanced Features

### Manual Configuration (Optional)
```typescript
const ProductState = createNextState({
  loader: (id) => getProduct(id),
  updater: updateProductAction,
  persistence: {
    url: {
      enabled: true,
      compress: 'brotli',  // Manual compression
      encrypt: false
    },
    offline: {
      enabled: true,
      storage: 'indexeddb',
      ttl: 3600  // 1 hour
    }
  }
});
```

### URL Persistence
```typescript
// State automatically appears in URL
// https://yourapp.com/products?state=eyJmaWx0ZXJzIjp7ImNhdGVnb3J5IjoidGVjaCJ9fQ==

// Share the URL and state is restored
```

### Offline Storage
```typescript
// State persists even when offline
// Automatically syncs when connection returns
```

## 🔧 TypeScript Plugin

Get real-time optimization suggestions in your IDE:

```typescript
import { useSlugStore } from 'slug-store'; // ⚠️ Plugin detects this

// Plugin suggests:
// 💡 Import from 'slug-store/client' for 2KB smaller bundle
// 📊 Current bundle impact: +6KB
// 🔧 Auto-fix available: Click to optimize imports
```

## 📚 API Reference

### `createNextState(options)`

Creates a state factory with automatic optimization.

**Options:**
- `loader: (id) => Promise<T>` - Server-side data loading
- `updater: (id, data) => Promise<any>` - Server Action for updates
- `autoConfig?: boolean` - Enable automatic optimization (default: true)
- `persistence?: PersistenceOptions` - Manual configuration (optional)

### `State.Provider`

Server Component that loads initial data.

**Props:**
- `id: string` - Unique identifier for the state

### `State.use()`

Client hook that returns `[state, setState, { isLoading, error }]`.

## 🎯 Use Cases

### E-commerce Product State
```typescript
const ProductState = createNextState({
  loader: (id) => getProduct(id),
  updater: updateProductAction,
  autoConfig: true // Detects image data, enables compression
});
```

### User Authentication
```typescript
const AuthState = createNextState({
  loader: (userId) => getUserProfile(userId),
  updater: updateProfileAction,
  autoConfig: true // Detects email/password, enables encryption
});
```

### Shopping Cart
```typescript
const CartState = createNextState({
  loader: (sessionId) => getCart(sessionId),
  updater: updateCartAction,
  autoConfig: true // Small cart = URL, large cart = offline
});
```

## 🚀 Migration from v3.x

### Before (v3.x)
```typescript
const [state, setState] = useSlugStore('key', initialState, options);
```

### After (v4.0)
```typescript
// 1. Create state factory
const MyState = createNextState({
  loader: (id) => loadData(id),
  updater: updateAction,
  autoConfig: true
});

// 2. Use in components
const [state, setState] = MyState.use();
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Slug Store v4.0.0**: Easy state persistence across components with strategic obstruction of complexity. 