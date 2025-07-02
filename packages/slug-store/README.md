# Slug Store v4.0.13: Simple State Management for Modern Web Apps

**Universal state persistence that works everywhere. No complex setup, powerful state management that saves your data where it makes sense.**

[![npm](https://img.shields.io/npm/v/slug-store/latest.svg)](https://www.npmjs.com/package/slug-store)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/slug-store)](https://bundlephobia.com/package/slug-store)
[![License](https://img.shields.io/npm/l/slug-store)](https://github.com/farajabien/slug-store/blob/main/LICENSE)

---

## How It Works

Slug Store automatically saves your app's state in the best place possible:

- **Small data** → Saved in the URL (so you can share links with the current state)
- **Large data** → Saved in your browser's storage (so it survives page refreshes)  
- **Sensitive data** → Automatically encrypted for security

You just use it like a normal React state hook, and it handles the rest.

## Quick Start

**1. Install**
```bash
npm install slug-store
```

**2. Use it in your component**
```typescript
import { useSlugStore } from 'slug-store/client';

function MyApp() {
  const [state, setState] = useSlugStore('my-app', {
    items: [],
    filter: 'all'
  }, {
    url: true,        // Save in URL for sharing
    offline: true     // Save in browser storage
  });

  return (
    <div>
      <button onClick={() => setState({ ...state, items: [...state.items, 'new item'] })}>
        Add Item
      </button>
      <p>Items: {state.items.length}</p>
    </div>
  );
}
```

**That's it!** Your state is now:
- ✅ **Saved in the URL** - Share links with current state
- ✅ **Saved in browser storage** - Survives page refreshes
- ✅ **Automatically optimized** - Compressed when needed
- ✅ **Type-safe** - Full TypeScript support

## Examples

### Shopping Cart (URL + Browser Storage)
```typescript
const [cart, setCart] = useSlugStore('cart', {
  items: [],
  total: 0
}, {
  url: true,      // Save in URL so users can share their cart
  offline: true   // Save in browser so it survives refreshes
});
```

### User Preferences (Browser Storage Only)
```typescript
const [preferences, setPreferences] = useSlugStore('preferences', {
  theme: 'light',
  language: 'en'
}, {
  offline: true   // Just save in browser, no need for URL
});
```

### Form Data (URL Only)
```typescript
const [filters, setFilters] = useSlugStore('filters', {
  category: 'all',
  price: 'any'
}, {
  url: true       // Save in URL so users can bookmark filtered views
});
```

## Auto Configuration

Don't want to think about where to save your data? Use auto-config:

```typescript
const [state, setState] = useSlugStore('my-app', initialState, {
  autoConfig: true  // Slug Store decides the best storage strategy
});
```

Slug Store will automatically:
- Save small data in the URL for sharing
- Save large data in browser storage
- Encrypt sensitive data
- Compress data when it helps

## Sharing

Share your app's current state with a simple function:

```typescript
import { shareSlug, copySlug } from 'slug-store/client';

// Share via native share dialog (mobile) or copy to clipboard (desktop)
await shareSlug({ 
  title: 'Check out my cart!', 
  text: 'I found some great items' 
});

// Or just copy the URL to clipboard
await copySlug();
```

## Next.js Support

Slug Store works great with Next.js, but it's completely optional. You get extra benefits like:

- Server-side state loading
- Automatic revalidation
- Better performance optimizations

```typescript
// Next.js specific features (optional)
import { createNextState } from 'slug-store/server';
import { getUserFromDb, saveUserToDb } from '@/app/actions';

export const UserState = createNextState({
  // Your function to load data from a database or API
  loader: (id: string) => getUserFromDb(id),
  // Your Server Action to update the data
  updater: (user) => saveUserToDb(user),
});
```

## Package Details

- **Version**: 4.0.13
- **Size**: ~6KB gzipped
- **Works with**: Any React app (Next.js support is optional)
- **TypeScript**: Full support included

## Development

```bash
# Start all packages in watch mode
pnpm dev

# Build all packages
pnpm build

# Run all tests
pnpm test
```

---

**Simple, powerful, universal state management. Zero complexity, maximum value.**