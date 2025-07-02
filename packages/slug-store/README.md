# Slug Store: Universal State Management for Modern Web Apps

**A single hook that persists state in the URL, browser storage, or your database. Zero config, maximum power.**

[![npm](https://img.shields.io/npm/v/slug-store/latest.svg)](https://www.npmjs.com/package/slug-store)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/slug-store)](https://bundlephobia.com/package/slug-store)
[![License](https://img.shields.io/npm/l/slug-store)](https://github.com/farajabien/slug-store/blob/main/LICENSE)

---

Slug Store is built for state persistence in single-page applications (SPAs). Its primary job is to take your application's state (like your projects, todos, and which project you're currently viewing) and encode it into the URL. This makes it incredibly easy to create shareable links, bookmark application states, and restore sessions seamlessly.

## How It Works

Slug Store provides a `useSlugStore` hook that works just like React's `useState`, but with a superpower: it automatically saves your state to the most logical place.

- **URL Persistence**: For small, shareable state (like filters or form data).
- **Offline Persistence**: For larger state that needs to survive page refreshes (like user preferences or shopping carts).
- **Automatic Strategy**: `autoConfig` mode analyzes your data and picks the best strategy for you—balancing shareability, performance, and storage limits.
- **Security**: Data can be automatically encrypted, especially when `autoConfig` detects potentially sensitive patterns.

On initial load, Slug Store hydrates the state by checking for data in this order: **URL -> Offline Storage -> Initial State**.

## Quick Start

**1. Install**
```bash
npm install slug-store
```

**2. Use the Hook**
Import `useSlugStore` in your client components.

```jsx
// app/components/wishlist.jsx
'use client';

import { useSlugStore } from 'slug-store/client';

function Wishlist() {
  const [wishlist, setWishlist] = useSlugStore('wishlist', {
    items: ['Starship'],
    isPublic: true
  }, {
    url: true,        // Persist in the URL
    offline: true,    // Persist in browser storage (IndexedDB/LocalStorage)
  });

  return (
    <div>
      <p>Items: {wishlist.items.join(', ')}</p>
      <button onClick={() => setWishlist(w => ({ ...w, items: [...w.items, 'New Gadget'] }))}>
        Add Item
      </button>
    </div>
  );
}
```

**That's it!** The `wishlist` state is now seamlessly persisted in both the URL and browser storage, is type-safe, and automatically compressed and encrypted when beneficial.

---

## Client-Side API (`slug-store/client`)

### `useSlugStore(key, initialState, options)`

This is the primary hook for client-side state management.

#### **Parameters**

- `key` (string): A unique identifier for your state. Used as the URL parameter and storage key.
- `initialState` (T): The default state value if no persisted state is found.
- `options` (object): Configuration for persistence, security, and debugging.

#### **Options**

| Option          | Type      | Default     | Description                                                                                                                                                             |
|-----------------|-----------|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`           | `boolean` | `false`     | If `true`, the state is stored in the URL search parameters. Ideal for making state shareable.                                                                        |
| `offline`       | `boolean` | `false`     | If `true`, the state is stored in browser storage (IndexedDB for modern browsers, LocalStorage as fallback). Ensures state survives page refreshes and offline sessions. |
| `hybrid`        | `boolean` | `false`     | If `true`, the state is persisted to **both** the URL and offline storage. This provides the shareability of URL persistence with the robustness of offline storage. It overrides `url` and `offline`. |
| `autoConfig`    | `boolean` | `false`     | If `true`, Slug Store automatically decides the best persistence strategy based on data size and patterns. It will override `url` and `offline` settings.                   |
| `encryptionKey` | `string`  | `undefined` | A custom key for encryption. If not provided, a key is generated and stored in `localStorage` when `autoConfig` enables encryption.                                      |
| `debug`         | `boolean` | `true`      | In development, logs the `autoConfig` analysis to the console, explaining its decisions.                                                                                |

### `autoConfig` Explained

When you set `autoConfig: true`, Slug Store uses a set of heuristics to manage your data:
- **Small Data (<1KB)**: Persisted in the **URL** for easy sharing.
- **Large Data (>=1KB)**: Persisted **Offline** to avoid long, unwieldy URLs.
- **Sensitive Data**: Automatically **encrypted**. (Detection is pattern-based, e.g., keys named `password`, `token`).
- **Compression**: Automatically enabled for larger data payloads to save space.

### Utility Functions

#### **Sharing State**
Share the current application state (encoded in the URL) using the Web Share API or by copying it to the clipboard.

```jsx
import { shareSlug, copySlug } from 'slug-store/client';

// Opens native share dialog or copies to clipboard as a fallback
await shareSlug({ 
  title: 'Check out my wishlist!', 
  text: 'I found some great items on Slug Store.' 
});

// Silently copies the URL to the clipboard
await copySlug();
```

#### **Reading State without the Hook**
Fetch and decode state from the URL directly. Useful for scenarios where you need a one-time read outside of a React component.

```js
import { getSlugData } from 'slug-store/client';

async function getWishlist() {
  const wishlistState = await getSlugData('wishlist');
  if (wishlistState) {
    console.log('Found wishlist items:', wishlistState.items);
  }
}
```

---

## Server-Side API (`slug-store/server`)

While `useSlugStore` is for client components, Slug Store also provides server-side utilities for Next.js applications to integrate with databases or other server-side data sources.

### `createNextState` (Experimental)

This function is designed for use in Server Components to create a state manager that can load data from and save data to your backend.

```jsx
// app/states/user-state.js
import { createNextState } from 'slug-store/server';
import { getUserFromDb, saveUserToDb } from '@/app/actions';

export const UserState = createNextState({
  // A function to load data from a database or API
  loader: (userId) => getUserFromDb(userId),
  // A Server Action to update the data
  updater: (user) => saveUserToDb(user),
});
```
*Note: This server-side API is more advanced and experimental compared to the client-side hook.*

---

## Advanced Usage

For complex scenarios, you can use the underlying persistence classes directly.

### `URLPersistence` & `OfflinePersistence`

These classes handle the logic for encoding/decoding and saving/loading state from their respective storage targets.

```js
import { URLPersistence } from 'slug-store/client';

const urlPersistence = new URLPersistence({
  paramName: 'my-custom-state',
  compress: 'gzip', // Force a compression algorithm
  encrypt: true,
  encryptionKey: 'my-secret-key'
});

// Encode state into a URL
const { url } = await urlPersistence.encodeState({ value: 42 });
// -> http://localhost:3000?my-custom-state=...

// Decode state from a URL
const { state } = await urlPersistence.decodeState(url);
// -> { value: 42 }
```

---

## Technical Details

### Compression
Slug Store uses a variety of compression algorithms. In `auto` mode, it selects the best one based on the environment and data size.
- **`lz-string`**: A fast and lightweight default, especially for smaller payloads.
- **`gzip` / `brotli`**: Browser-native algorithms used for larger data when available (`CompressionStream` API).

### Encryption
Encryption is performed using the browser's native `SubtleCrypto` API (AES-GCM). When an `encryptionKey` is not provided, one is generated and stored securely in `localStorage` to persist across sessions for a given user.

---

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
*Version 4.1.1*