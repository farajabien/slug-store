# Slug Store v4.0.0: The Perfect State Management Solution for AI-Built Apps

**After 3 versions and 500+ downloads, we've finally cracked the code for zero-boilerplate, full-stack state management that works seamlessly with Next.js App Router. No database configs needed - just pure, intelligent state persistence.**

[![npm](https://img.shields.io/npm/v/slug-store/latest.svg)](https://www.npmjs.com/package/slug-store)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/slug-store)](https://bundlephobia.com/package/slug-store)
[![License](https://img.shields.io/npm/l/slug-store)](https://github.com/farajabien/slug-store/blob/main/LICENSE)

---

`slug-store` v4.0.0 provides **simple, powerful state management** that works everywhere. One hook, infinite possibilities with intelligent Auto Config System.

## 🧠 Auto Config System

Slug Store automatically detects your data patterns and optimizes accordingly:

```typescript
// Small, shareable data → URL persistence
const [filters, setFilters] = useSlugStore('filters', { category: 'tech', sort: 'newest' });
// ✅ Automatically persisted in URL for sharing

// Large data → Offline storage  
const [products, setProducts] = useSlugStore('products', { items: Array(1000).fill('...') });
// ✅ Automatically compressed and stored offline

// Sensitive data → Encryption
const [user, setUser] = useSlugStore('user', { email: 'user@example.com', password: 'secret' });
// ✅ Automatically encrypted for security
```

## 📦 Installation

```bash
npm install slug-store
# or
pnpm add slug-store
```

## 🎯 Quick Start

### Simple State Management (Recommended)

```typescript
import { useSlugStore } from 'slug-store/client'

function TodoApp() {
  const [todos, setTodos] = useSlugStore('todos', [], {
    url: true,        // Share via URL
    offline: true,    // Store offline
    autoConfig: true  // Auto-optimize
  })

  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
      <button onClick={() => setTodos([...todos, { id: Date.now(), text: 'New todo' }])}>
        Add Todo
      </button>
    </div>
  )
}
```

**That's it!** Your state is now:
- ✅ **Persisted** across page refreshes
- ✅ **Shareable** via URL
- ✅ **Optimized** automatically
- ✅ **Type-safe** end-to-end

## 🚀 Advanced Examples

### E-commerce Filters

```typescript
function ProductFilters() {
  const [filters, setFilters] = useSlugStore('product-filters', {
    category: 'all',
    price: [0, 1000],
    sort: 'newest'
  }, {
    url: true,        // Shareable filters
    autoConfig: true  // Auto-optimize
  })

  return (
    <div>
      <select 
        value={filters.category} 
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      >
        <option value="all">All Categories</option>
        <option value="tech">Tech</option>
        <option value="books">Books</option>
      </select>
    </div>
  )
}
```

### Shopping Cart

```typescript
function ShoppingCart() {
  const [cart, setCart] = useSlugStore('cart', {
    items: [],
    total: 0
  }, {
    offline: true,    // Persistent cart
    autoConfig: true  // Auto-compress large carts
  })

  const addItem = (product) => {
    setCart({
      ...cart,
      items: [...cart.items, product],
      total: cart.total + product.price
    })
  }

  return (
    <div>
      {cart.items.map(item => (
        <div key={item.id}>{item.name} - ${item.price}</div>
      ))}
      <div>Total: ${cart.total}</div>
    </div>
  )
}
```

### User Preferences

```typescript
function UserSettings() {
  const [preferences, setPreferences] = useSlugStore('user-preferences', {
    theme: 'light',
    language: 'en',
    notifications: true
  }, {
    offline: true,    // Always available
    autoConfig: true  // Auto-encrypt sensitive data
  })

  return (
    <div>
      <button onClick={() => setPreferences({ ...preferences, theme: 'dark' })}>
        Toggle Theme
      </button>
    </div>
  )
}
```

## 🔧 Advanced: Server-Client Sync (Optional)

For advanced use cases with server-side data loading:

```typescript
// 1. Create state factory
import { createNextState } from 'slug-store/server'

const UserState = createNextState({
  loader: (id: string) => db.user.findUnique({ where: { id } }),
  updater: updateUserAction,
  autoConfig: true
})

// 2. Use in Server Component
<UserState.Provider id={params.id}>
  <UserProfile />
</UserState.Provider>

// 3. Use in Client Component
const [user, setUser] = UserState.use()
```

## 🎯 Perfect for AI-Built Apps

Slug Store is the perfect state management solution for AI-built applications because:

- **Simple API**: One hook, works everywhere
- **Auto-Configuration**: AI can focus on business logic, not persistence setup
- **Next.js Native**: Seamless integration with AI-generated Next.js apps
- **Zero Boilerplate**: Reduces complexity for AI-generated code
- **Intelligent Defaults**: Works optimally out of the box

## 📦 Package Details

- **Version**: `4.0.1`
- **Bundle Size**: ~6KB gzipped (72% smaller than v3.x)
- **Entry Points**: `slug-store/client` and `slug-store/server`
- **TypeScript**: Full type safety
- **Next.js**: App Router optimized

## 🤝 Contributing

This project is in active development. Contributions are welcome! Please see the [Contributing Guide](https://github.com/farajabien/slug-store/blob/main/CONTRIBUTING.md) for more details.

## 📄 License

MIT License - see [LICENSE](https://github.com/farajabien/slug-store/blob/main/LICENSE) for details.

---

**Slug Store v4.0.0**: Simple state persistence that just works.